import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

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
