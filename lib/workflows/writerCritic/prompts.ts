// File: /lib/workflows/writerCritic/prompts.ts

import { mdxFormattingInstructionsV1 } from '../../prompts/mdxFormatting';

/**
 * writerInitialPrompt:
 * Given a topic, returns a prompt to write an engaging blog post.
 */
export const writerInitialPromptV1 = (topic: string): string =>
    `Write an engaging, informative, and creative blog post on the topic "${topic}".
Ensure the post is well-structured with clear section headings and engaging content.
Output only the blog post content without any additional commentary.`;

/**
 * writerRevisionPrompt:
 * Given the current blog post and the critic's suggestions, returns a prompt to revise the blog post.
 */
export const writerRevisionPromptV1 = (blog: string, suggestions: string): string =>
    `Revise the following blog post by incorporating the improvement suggestions provided.
  
Blog Post:
${blog}

Suggestions for Improvement:
${suggestions}

Output the revised blog post ensuring enhanced clarity, improved structure, and greater engagement.`;

/**
 * criticPrompt:
 * Given a blog post, returns a prompt for a critic to review it and provide constructive feedback.
 */
export const criticPromptV1 = (blog: string): string =>
    `You are a seasoned blog critic. Review the following blog post and provide detailed, constructive feedback focused on clarity, structure, engagement, and depth.
  
Blog Post:
${blog}

Output only the constructive feedback with specific suggestions for improvement.`;
