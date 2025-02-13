// File: /lib/types.ts

/**
 * Defines the shape of a workflow object.
 */
export type WorkflowDefinition = {
  key: string
  handler: (params: HandlerParams) => Promise<string>
}

/**
 * Parameters passed to every workflow handler.
 */
export type HandlerParams = {
  prompt: string // The user’s text (either for creation or modification)
  rawMdx?: string // Optional: if provided, indicates modification mode
}
