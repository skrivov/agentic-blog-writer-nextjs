// File: lib/judgesConfig.ts

import { runRelevanceJudge } from './workbench/judges/relevanceChecker'
import { runFactCheckJudge } from './workbench/judges/factChecker'

export type JudgeDefinition = {
  key: string
  handler: (args: { topic: string; generatedContent: string }) => Promise<any>
}

export const judges: JudgeDefinition[] = [
  {
    key: 'relevance',
    handler: runRelevanceJudge,
  },
  {
    key: 'fact',
    handler: runFactCheckJudge,
  },
]
