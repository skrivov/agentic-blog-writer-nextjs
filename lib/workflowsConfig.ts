// File: /lib/workflowsConfig.ts

import { WorkflowDefinition } from './types'
import { runBasic } from './workflows/basic'
import { runChainOfThoughts } from './workflows/chainOfThoughts'

import { runWriterCritic } from './workflows/writerCritic'
import { runDeepResearch } from './workflows/deepResearch'

//The handlers can be used only on server side

export const workflows: WorkflowDefinition[] = [
  {
    key: 'basic',
    handler: runBasic,
  },
  {
    key: 'chainOfThoughts',
    handler: runChainOfThoughts,
  },
  {
    key: 'writerCritic',
    handler: runWriterCritic,
  },
  {
    key: 'deepResearch',
    handler: runDeepResearch,
  },
]
