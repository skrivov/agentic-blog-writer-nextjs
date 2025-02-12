// File: /lib/workflows/chainOfThoughts/index.ts

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { HandlerParams } from "../../types";
import { extractUserIntentionsPromptV1, blogPromptV1, modificationIntentionsPromptV1 } from "./prompts";
import { modificationPromptV1 } from "../../prompts/changes";

/**
 * runChainOfThoughts:
 * Runs a two-stage process that:
 * 1. Extracts clear user intentions from the raw input.
 * 2. Executes the desired action based on the mode:
 *    - In creation mode (rawMdx not provided), generates a new blog post.
 *    - In modification mode (rawMdx provided), updates the existing blog post.
 *
 * Decision logic is centralized here.
 *
 * @param params - Object containing:
 *   - prompt: The raw user input (topic or modification suggestions).
 *   - rawMdx (optional): Existing MDX content (for modification mode).
 * @returns A promise resolving to the final MDX output as a string.
 */
export async function runChainOfThoughts({ prompt, rawMdx }: HandlerParams): Promise<string> {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Decide mode: "modification" if rawMdx exists; otherwise "creation".
  const mode: "creation" | "modification" = rawMdx ? "modification" : "creation";

  if (mode === "modification" && rawMdx) {
    // Modification mode: two-stage RunnableSequence.
    const chain = RunnableSequence.from([
      async () => {
        // Stage 1: Process the user's modification instructions.
            const reasoningPrompt = modificationIntentionsPromptV1(prompt);
        const reasoningResponse = await model.invoke([new HumanMessage(reasoningPrompt)]);
        console.log("Extracted Reasoning:", reasoningResponse.content);
        return { reasoning: reasoningResponse.content };
      },
      async (input: { reasoning: string }) => {
        // Stage 2: Use the common modification prompt to update the blog post.
        const compositePrompt = modificationPromptV1(rawMdx, input.reasoning);
        const response = await model.invoke([new HumanMessage(compositePrompt)]);
        console.log("Modification Response:", response.content);
        return { mdx: response.content };
      },
      (input: { mdx: string }) => input.mdx,
      new StringOutputParser(),
    ]);
    return chain.invoke({});
  } else {
    // Creation mode: two-stage RunnableSequence.
    const chain = RunnableSequence.from([
      async (input: { topic: string }) => {
        // Stage 1: Extract clear user intentions from the topic.
        const extractionPrompt = extractUserIntentionsPromptV1(input.topic);
        const extractionResponse = await model.invoke([new HumanMessage(extractionPrompt)]);
        console.log("Extracted Intention:", extractionResponse.content);
        return { intention: extractionResponse.content };
      },
      async (input: { intention: string }) => {
        // Stage 2: Use the extracted intention to generate a new blog post.
        const compositePrompt = blogPromptV1(input.intention);
        const response = await model.invoke([new HumanMessage(compositePrompt)]);
        console.log("Creation Response:", response.content);
        return { mdx: response.content };
      },
      (input: { mdx: string }) => input.mdx,
      new StringOutputParser(),
    ]);
    return chain.invoke({ topic: prompt });
  }
}
