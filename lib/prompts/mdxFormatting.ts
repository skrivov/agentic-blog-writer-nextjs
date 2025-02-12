// File: /lib/prompts/mdxFormatting.ts

export function mdxFormattingInstructionsV1(): string {
    const currentDate = new Date().toISOString().slice(0, 10);
    return `Ensure the final output is a well-formatted MDX file.
It must begin with a YAML frontmatter block containing **only** the following fields:
- title: A catchy, SEO-optimized title.
- date: "${currentDate}" (this specific date must be used).
- tags: An array of relevant tags.
- draft: false.
- description: A concise, SEO-friendly description.

Do not include any additional fields 

Example frontmatter:
---
title: "Markdown Guide"
date: "${currentDate}"
tags: ["github", "guide"]
draft: false
description: "Markdown cheatsheet for all your blogging needs - headers, lists, images, tables and more!"
---

**Important:**
- Do not include a Markdown H1 title (e.g., "# Title") in the main content; the title should only appear in the frontmatter.
- The date must be exactly as provided above.

After the frontmatter, output the main blog content in Markdown.`;
}
