// File: /lib/workflows/basic/index.ts

import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { HandlerParams } from '../../types'
import { basicCreationPromptV1 } from './prompts'
import { modificationPromptV1 } from '../../prompts/changes'

/**
 * runBasic: Uses the provided prompt to generate a complete blog post in MDX format.
 * If rawMdx is provided, the common modification prompt is used.
 */
export async function runBasic({ prompt, rawMdx }: HandlerParams): Promise<string> {
  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    apiKey: process.env.OPENAI_API_KEY,
  })

  const chain = RunnableSequence.from([
    async () => {
      const compositePrompt = rawMdx
        ? modificationPromptV1(rawMdx, prompt)
        : basicCreationPromptV1(prompt)
      const response = await model.invoke([new HumanMessage(compositePrompt)])
      return { mdx: response.content }
    },
    (output: { mdx: string }) => output.mdx,
    new StringOutputParser(),
  ])

  return chain.invoke({})
}
