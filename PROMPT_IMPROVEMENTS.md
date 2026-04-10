# Prompt Engineering Improvements for Deterministic AI

This document outlines improvements to make AI prompts more deterministic, reliable, and consistent.

---

## Key Principles for Deterministic AI

1. **Few-Shot Examples**: Show 2-3 examples of input → output
2. **Structured Output**: Use JSON mode instead of regex parsing
3. **Explicit Criteria**: Define exactly what makes confidence high vs low
4. **Negative Examples**: Show what NOT to do
5. **Low Temperature**: Set temperature to 0.1-0.3 for consistency
6. **Validation Rules**: Post-process and validate outputs

---

## Improved Clustering Prompt

### Current Issues
- No examples of what each cluster looks like
- Vague confidence scoring
- Fragile JSON parsing

### Improved Version

```typescript
const prompt = `You are a lead segmentation expert. Classify leads into use case clusters.

Available clusters: ${COMMON_CLUSTERS.join(", ")}

EXAMPLES:
Input: "I need to manage my online store orders"
Output: {"useCaseCluster": "E-commerce", "confidence": 0.9}

Input: "Looking for CRM for my agency clients"
Output: {"useCaseCluster": "Agency", "confidence": 0.85}

Input: "I'm a freelance designer"
Output: {"useCaseCluster": "Freelancer", "confidence": 0.9}

Input: "Just exploring options"
Output: {"useCaseCluster": "Other", "confidence": 0.3}

CONFIDENCE CRITERIA:
- 0.9-1.0: Clear, specific keywords match (e.g., "online store", "agency", "freelance")
- 0.7-0.8: Strong contextual clues but not explicit
- 0.5-0.6: Some indication but could be multiple clusters
- 0.3-0.4: Vague or no clear indicators
- 0.0-0.2: Insufficient information

Current lead:
- Email: ${email}
- Name: ${name || "N/A"}
- Company: ${company || "N/A"}
- Signup note: ${signupNote || "N/A"}

Return ONLY valid JSON matching this schema:
{"useCaseCluster": string, "confidence": number}`;
```

### Implementation

```typescript
const result = await model.generateContent(prompt, {
  generationConfig: {
    temperature: 0.1, // Low temperature for consistency
    responseMimeType: "application/json", // Force JSON output
  },
});
```

---

## Improved Feature Mapping Prompt

### Current Issues
- "Choose 2-3 features" - arbitrary number
- No examples of feature mapping
- Vague prioritization

### Improved Version

```typescript
const prompt = `You are a product expert. Map lead needs to product features.

Available features: ${COMMON_FEATURES.join(", ")}

EXAMPLES:
Input: "Need to track sales data and generate reports"
Output: {"featurePriority": "Dashboard & Analytics, Reporting", "confidence": 0.9}

Input: "Manage my team and collaborate on projects"
Output: {"featurePriority": "User Management, Collaboration", "confidence": 0.85}

Input: "Connect with our existing tools and automate workflows"
Output: {"featurePriority": "Integrations, Automation", "confidence": 0.9}

Input: "Just looking around"
Output: {"featurePriority": "Dashboard & Analytics", "confidence": 0.3}

CONFIDENCE CRITERIA:
- 0.9-1.0: Explicit feature requests with specific keywords
- 0.7-0.8: Clear problem statements that map to features
- 0.5-0.6: General business needs that could apply to multiple features
- 0.3-0.4: Vague or exploratory
- 0.0-0.2: No clear feature needs

RULES:
- Select 1-3 features (only what's explicitly needed)
- Order by relevance (most important first)
- If no specific needs mentioned, default to "Dashboard & Analytics"

Current lead:
- Signup note: "${signupNote}"
- Company: ${company || "N/A"}
- Lead score: ${score || "N/A"}

Return ONLY valid JSON matching this schema:
{"featurePriority": string, "confidence": number}`;
```

---

## Improved Demo Script Prompt

### Current Issues
- Very open-ended ("conversational", "specific")
- No examples of good scripts
- Word limit arbitrary (400 words)

### Improved Version

```typescript
const prompt = `You are an expert sales trainer. Generate a demo script.

Lead Information:
- Name: ${name || "there"}
- Company: ${company || "N/A"}
- Signup note: "${signupNote || "N/A"}"
- Feature priority: ${featureMapping?.featurePriority || "Dashboard & Analytics"}
- Objection handling: ${objectionHandling?.objectionHandling || "Focus on ROI"}
- Timeline: ${timelinePrediction?.timelinePrediction || "1 week"}

EXAMPLE OF GOOD SCRIPT:
Opening: "Hi Alex! Thanks for joining. I'm excited to show you how our dashboard can help MarketingPro track campaign performance."

Discovery: "Before we dive in, what's your biggest challenge with tracking marketing metrics right now?"

Demo Flow: "Let me show you three key features:
1. Dashboard - See all your campaigns at a glance
2. Analytics - Deep dive into performance data
3. Reports - Export monthly reports for stakeholders"

Objection Handling: "I understand budget is a concern. Our customers typically see 3x ROI within 3 months through improved campaign optimization."

Closing: "Based on your needs, I'd recommend starting with our Starter plan. Would you like me to send over a trial link?"

EXAMPLE OF BAD SCRIPT:
❌ "Hey there! Welcome to our product. It's great and has many features. You should buy it."
❌ Too generic, not personalized, no specific talking points

REQUIREMENTS:
- Personalize the opening with their name/company
- Include 1-2 discovery questions relevant to their stated needs
- Show exactly 2-3 features in priority order
- Address 1 likely objection based on their segment
- Specific next step with timeline
- Keep between 200-500 words
- Use professional but conversational tone

Return ONLY the demo script text (no JSON).`;
```

---

## Implementation Checklist

### 1. Add Temperature Control
```typescript
const result = await model.generateContent(prompt, {
  generationConfig: {
    temperature: 0.1, // Low for deterministic results
    topP: 0.9,
    topK: 40,
  },
});
```

### 2. Use JSON Mode (Gemini 2.5+)
```typescript
const result = await model.generateContent(prompt, {
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        useCaseCluster: { type: "string" },
        confidence: { type: "number" },
      },
      required: ["useCaseCluster", "confidence"],
    },
  },
});
```

### 3. Add Output Validation
```typescript
function validateClusterResult(result: any): ClusterResult | null {
  if (!result || typeof result !== 'object') return null;
  if (!COMMON_CLUSTERS.includes(result.useCaseCluster)) return null;
  if (typeof result.confidence !== 'number') return null;
  if (result.confidence < 0 || result.confidence > 1) return null;
  
  return {
    useCaseCluster: result.useCaseCluster,
    confidence: result.confidence,
  };
}
```

### 4. Add Consistency Testing
```typescript
// Test same input 5 times, should get same result
async function testConsistency(input: string) {
  const results = await Promise.all([
    clusterLead(...input),
    clusterLead(...input),
    clusterLead(...input),
    clusterLead(...input),
    clusterLead(...input),
  ]);
  
  const clusters = results.map(r => r?.useCaseCluster);
  const uniqueClusters = new Set(clusters);
  
  console.log(`Consistency: ${uniqueClusters.size === 1 ? 'PASS' : 'FAIL'}`);
}
```

---

## Migration Path

### Phase 1: Add Few-Shot Examples (Quick Win)
- Add 2-3 examples to each prompt
- No code changes needed
- Immediate improvement in consistency

### Phase 2: Add Temperature Control
- Set temperature to 0.1 for all AI calls
- One-line change per service
- Significant consistency improvement

### Phase 3: Use JSON Mode
- Requires Gemini 2.5+ or switch to model with JSON mode
- Replace regex parsing with structured output
- Eliminates parsing errors

### Phase 4: Add Validation
- Post-process all AI outputs
- Validate against schema
- Fallback to heuristic if validation fails

---

## Recommended Priority

1. **Immediate**: Add few-shot examples to all prompts (1-2 hours)
2. **This Week**: Set temperature to 0.1 (30 minutes)
3. **Next Sprint**: Implement JSON mode and validation (2-3 hours)

These changes will make your AI outputs significantly more deterministic and reliable.
