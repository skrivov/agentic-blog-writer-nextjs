// File: /lib/workflows/basic/prompts.ts

import { mdxFormattingInstructionsV1 } from '../../prompts/mdxFormatting'

/**
 * basicCreationPromptV1:
 * Given the user input, returns a prompt to generate a new blog post in MDX format.
 */
export const basicCreationPromptV1 = (input: string): string => {
  return `Using the input below, generate a complete blog post in MDX format.
${mdxFormattingInstructionsV1()}

Input: ${input}`
}
