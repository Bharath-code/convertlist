import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

const PLAN_LEAD_LIMITS: Record<string, number> = {
  FREE: 25,
  PRO: 500,
  PRO_PLUS: 5000,
  LAUNCH: 5000,
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 uploads per minute per user
    const rateLimitResult = rateLimit(`upload:${userId}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many upload requests",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const mode = formData.get("mode") as string;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Waitlist name required" }, { status: 400 });
    }

    const [db, inngest] = await Promise.all([
      import("@/lib/db").then(m => m.db),
      import("@/lib/inngest/client").then(m => m.inngest),
    ]);

    let user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: `${userId}@placeholder.com`,
        },
      });
    }

    const limit = PLAN_LEAD_LIMITS[user.plan] ?? 25;
    const currentUsedPromise = db.lead.count({ where: { waitlist: { userId } } });

    if (mode === "csv") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "CSV file required" }, { status: 400 });
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 2MB." },
          { status: 400 }
        );
      }

      const text = await file.text();
      const leads = parseCSV(text);

      if (leads.length === 0) {
        return NextResponse.json({ error: "No valid leads found" }, { status: 400 });
      }

      const currentUsed = await currentUsedPromise;

      if (limit !== Infinity && currentUsed + leads.length > limit) {
        return NextResponse.json(
          {
            error: "Lead limit exceeded",
            used: currentUsed,
            limit,
            incoming: leads.length,
            upgradeRequired: true,
            message: `This batch has ${leads.length} leads. You have ${currentUsed}/${limit} used. Upgrade to continue.`,
          },
          { status: 403 }
        );
      }

      const waitlist = await db.waitlist.create({
        data: {
          userId: user.id,
          name: name.trim(),
          status: "PENDING",
        },
      });

      await db.lead.createMany({
        data: leads.map((lead) => ({
          waitlistId: waitlist.id,
          email: lead.email.toLowerCase().trim(),
          name: lead.name ?? null,
          company: lead.company ?? null,
          signupNote: lead.signupNote ?? null,
          source: lead.source ?? "imported",
          createdAt: lead.createdAt ? new Date(lead.createdAt) : null,
        })),
      });

      // Use actual lead count instead of querying again
      const leadCount = leads.length;
      await db.waitlist.update({
        where: { id: waitlist.id },
        data: { totalLeads: leadCount },
      });

      await inngest.send({
        name: "waitlist/created",
        data: { waitlistId: waitlist.id },
      }).catch((error) => {
        console.error("Failed to send inngest event:", error);
      });

      return NextResponse.json({ waitlistId: waitlist.id, leadCount });
    }

    if (mode === "paste") {
      const pasteData = formData.get("pasteData") as string;
      if (!pasteData?.trim()) {
        return NextResponse.json({ error: "Email list required" }, { status: 400 });
      }

      const emails = parsePasteList(pasteData);

      if (emails.length === 0) {
        return NextResponse.json({ error: "No valid emails found" }, { status: 400 });
      }

      const currentUsed = await currentUsedPromise;

      if (limit !== Infinity && currentUsed + emails.length > limit) {
        return NextResponse.json(
          {
            error: "Lead limit exceeded",
            used: currentUsed,
            limit,
            incoming: emails.length,
            upgradeRequired: true,
            message: `This batch has ${emails.length} leads. You have ${currentUsed}/${limit} used. Upgrade to continue.`,
          },
          { status: 403 }
        );
      }

      const waitlist = await db.waitlist.create({
        data: {
          userId: user.id,
          name: name.trim(),
          status: "PENDING",
        },
      });

      await db.lead.createMany({
        data: emails.map((email) => ({
          waitlistId: waitlist.id,
          email: email.toLowerCase().trim(),
          source: "imported",
        })),
      });

      // Use actual lead count instead of querying again
      const leadCount = emails.length;
      await db.waitlist.update({
        where: { id: waitlist.id },
        data: { totalLeads: leadCount },
      });

      await inngest.send({
        name: "waitlist/created",
        data: { waitlistId: waitlist.id },
      }).catch((error) => {
        console.error("Failed to send inngest event:", error);
      });

      return NextResponse.json({ waitlistId: waitlist.id, leadCount });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

interface CSVLead {
  email: string;
  name?: string;
  company?: string;
  signupNote?: string;
  source?: string;
  createdAt?: string;
}

function parseCSV(text: string): CSVLead[] {
  // Proper CSV parser that handles quoted strings and escaped quotes
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted string
        currentLine += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        currentLine += '"';
      }
    } else if (char === '\n' && !inQuotes) {
      // End of line
      lines.push(currentLine.trim());
      currentLine = '';
    } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
      // Windows line ending
      lines.push(currentLine.trim());
      currentLine = '';
      i++; // Skip \n
    } else {
      currentLine += char;
    }
  }
  
  // Add last line if exists
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  if (lines.length < 2) return [];

  // Parse header line
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const emailIdx = headers.findIndex((h) => h === "email");
  if (emailIdx === -1) return [];

  const leads: CSVLead[] = [];
  const seenEmails = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const email = values[emailIdx]?.toLowerCase().trim();

    if (!email || !email.includes("@")) continue;
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);

    leads.push({
      email,
      name: values[headers.findIndex((h) => h === "name")]?.trim() || undefined,
      company: values[headers.findIndex((h) => h === "company")]?.trim() || undefined,
      signupNote: values[headers.findIndex((h) => h === "signup_note" || h === "note")]?.trim() || undefined,
      source: values[headers.findIndex((h) => h === "source")]?.trim() || undefined,
      createdAt: values[headers.findIndex((h) => h === "created_at" || h === "createdat")]?.trim() || undefined,
    });
  }

  return leads;
}

/**
 * Parse a single CSV line, handling quoted fields and escaped quotes
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote inside quoted string
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add last field
  fields.push(currentField);
  
  return fields;
}

function parsePasteList(text: string): string[] {
  const emails: string[] = [];
  const seen = new Set<string>();
  const parts = text.split(/[\n,;]+/);
  for (const part of parts) {
    const email = part.trim().toLowerCase();
    if (email && email.includes("@") && !seen.has(email)) {
      seen.add(email);
      emails.push(email);
    }
  }
  return emails;
}
