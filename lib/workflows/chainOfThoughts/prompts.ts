// File: /lib/workflows/chainOfThoughts/prompts.ts

import { mdxFormattingInstructionsV1 } from '../../prompts/mdxFormatting'

/**
 * extractUserIntentionsPromptV1:
 * Returns a prompt that instructs the LLM to extract a clear, unambiguous statement of user intentions
 * from the input. (For new blog creation.)
 */
export const extractUserIntentionsPromptV1 = (input: string): string =>
  `Analyze the following input and extract a clear, concise statement of user intentions.
Output only the extracted intention, with no additional commentary or explanation.
Input: ${input}`

/**
 * modificationReasoningPromptV1:
 * Given the user's modification suggestions, returns a prompt that asks the LLM to analyze
 * and explain the intended changes.
 */
export const modificationIntentionsPromptV1 = (changes: string): string =>
  `Please analyze the following modification suggestions and explain in detail what changes are intended.
Modifications: ${changes}`

/**
 * blogPromptV1:
 * Given an extracted intention, returns a prompt to generate a complete blog post in MDX format.
 */
export const blogPromptV1 = (intention: string): string =>
  `Using the following extracted intention:
  
${intention}

Generate a comprehensive blog post in MDX format.
${mdxFormattingInstructionsV1()}`
