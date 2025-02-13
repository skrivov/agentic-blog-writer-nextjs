// File: /lib/workflowsMetadata.ts

export type WorkflowMetadata = {
  key: string
  title: string
  promptInstruction: string
  applicability: 'new' | 'modification' | 'both'
}

//As the handlers can be used only on server side, we need to put metadata for the client
//in a special config file.

export const workflowsMetadata: WorkflowMetadata[] = [
  {
    key: 'basic',
    title: 'Basic',
    promptInstruction:
      'Enter your prompt for the LLM to generate a complete blog post in MDX format.',
    applicability: 'both',
  },
  {
    key: 'chainOfThoughts',
    title: 'Chain of Thoughts',
    promptInstruction:
      'Provide a topic to generate a detailed outline and a complete MDX blog post.',
    applicability: 'both',
  },
  {
    key: 'writerCritic',
    title: 'Writer-Critic',
    promptInstruction:
      'Enter a topic to generate a new blog post using an iterative writer and critic approach.',
    applicability: 'new',
  },
  {
    key: 'deepResearch',
    title: 'Deep Research',
    promptInstruction:
      'Enter a topic to generate a new, comprehensive blog post with deep research.',
    applicability: 'new',
  },
]
