// File: lib/workbench/judges/relevanceChecker/prompts.ts

/**
 * Generates a structured prompt to evaluate whether an AI-generated blog post aligns with the original topic.
 *
 * @param topic - The original user-provided topic.
 * @param generatedContent - The LLM-generated blog post.
 * @returns A structured evaluation prompt.
 */
export const relevanceJudgePromptV1 = (topic: string, generatedContent: string): string =>
  `You are an expert evaluator assessing whether an AI-generated blog post aligns with the intended topic.
  
  - **Topic:** "${topic}"
  - **Generated Blog Post:**
  ${generatedContent}

  Evaluate the **relevance and intent alignment** of the generated blog post:
  - Does it directly address the topic?
  - Does it stay focused without unnecessary tangents?
  - Does it provide useful, specific information related to the topic?

  Assign a **score from 0 to 10**, where:
  - **0-3**: Completely off-topic or misleading.
  - **4-6**: Partially relevant but contains some off-topic sections.
  - **7-9**: Highly relevant with minor deviations.
  - **10**: Perfectly aligned with the topic.

  Output a JSON object matching this format:
  {
    "score": (number, from 0 to 10),
    "explanation": (string, a brief justification for the score)
  }`;
