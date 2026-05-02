import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { get, set } from "@/lib/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function getGeminiModel(modelName = "gemini-2.5-flash-lite") {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generates structured JSON output from Gemini AI with automatic retry and fallback
 * @param prompt - The prompt to send to the AI
 * @param schema - Zod schema to validate the output
 * @param fallback - Optional fallback value if AI fails
 * @returns Parsed and validated output or fallback
 */
export async function generateStructuredOutput<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  fallback?: T | null
): Promise<T | null> {
  const model = getGeminiModel();
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract JSON from response (handles markdown code blocks)
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("No JSON found in AI response");
      return fallback ?? null;
    }
    
    const parsed = JSON.parse(match[0]);
    return schema.parse(parsed);
  } catch (error) {
    console.error("AI structured output generation failed:", error);
    return fallback ?? null;
  }
}

/**
 * Generates text output from Gemini AI with optional max tokens
 */
export async function generateText(
  prompt: string,
  options?: { maxOutputTokens?: number }
): Promise<string | null> {
  const model = getGeminiModel();
  
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: options?.maxOutputTokens ? {
        maxOutputTokens: options.maxOutputTokens
      } : undefined
    });
    
    return result.response.text().trim() || null;
  } catch (error) {
    console.error("AI text generation failed:", error);
    return null;
  }
}

/**
 * Cache key generator for AI operations
 */
export function generateAiCacheKey(operation: string, inputs: Record<string, unknown>): string {
  const sortedInputs = Object.entries(inputs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${String(v).substring(0, 50)}`)
    .join('|');
  
  return `ai:${operation}:${sortedInputs}`;
}

/**
 * Wraps AI operations with caching to reduce API calls and costs
 * @param cacheKey - Unique cache key for this operation
 * @param operation - The AI operation to perform
 * @param ttlSeconds - Time to live in seconds (default: 1 hour)
 * @returns Cached result or fresh result from AI
 */
export async function cacheAiOperation<T>(
  cacheKey: string,
  operation: () => Promise<T | null>,
  ttlSeconds: number = 3600
): Promise<T | null> {
  try {
    // Try to get from cache first
    const cached = await get<T>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    
    // Execute operation and cache result
    const result = await operation();
    if (result !== null) {
      await set(cacheKey, result, ttlSeconds);
    }
    
    return result;
  } catch (error) {
    console.error("Cache operation failed, falling back to direct AI call:", error);
    // Fallback to direct operation without caching
    return await operation();
  }
}
