"use client";

import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";

interface AdvocateOutreachTemplatesProps {
  advocateName: string;
  advocateCompany: string | null;
  advocateScore: number;
}

export default function AdvocateOutreachTemplates({
  advocateName,
  advocateCompany,
  advocateScore,
}: AdvocateOutreachTemplatesProps) {
  const [copied, setCopied] = useState(false);

  const generateTemplate = (type: "testimonial" | "social" | "beta"): string => {
    const name = advocateName.split(" ")[0] || advocateName;
    const company = advocateCompany || "your company";

    switch (type) {
      case "testimonial":
        return `Hi ${name},

I noticed you're building something amazing at ${company}. I'd love to get your feedback on our product and potentially feature your testimonial on our launch page.

Would you be open to trying it out and sharing your thoughts? As an early supporter, I'd be happy to offer you exclusive access and a lifetime discount.

Best regards,
[Your Name]`;

      case "social":
        return `Hey ${name}! 👋

I'm launching [Product Name] soon and thought you might be interested given your work at ${company}. It's [brief description of what it does].

Would love your feedback! If you like it, a shoutout would mean the world to us.

🚀 [Link to product]

Thanks!`;

      case "beta":
        return `Hi ${name},

Based on your experience at ${company}, I think you'd be a perfect fit for our beta program. We're looking for early adopters who can help shape the product.

As a beta tester, you'll get:
- Early access before public launch
- Free lifetime usage
- Direct influence on product features
- Priority support

Interested in joining? Let me know and I'll set you up!

Best,
[Your Name]`;

      default:
        return "";
    }
  };

  const templates = [
    { id: "testimonial", name: "Testimonial Request", icon: Mail },
    { id: "social", name: "Social Share Request", icon: Mail },
    { id: "beta", name: "Beta Program Invite", icon: Mail },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Advocate Outreach Templates</h3>
      
      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <template.icon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900">{template.name}</span>
              </div>
              <button
                onClick={() => copyToClipboard(generateTemplate(template.id as any))}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={generateTemplate(template.id as any)}
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 resize-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Personalize these templates with specific details about the advocate's interests or company for better response rates.
        </p>
      </div>
    </div>
  );
}
