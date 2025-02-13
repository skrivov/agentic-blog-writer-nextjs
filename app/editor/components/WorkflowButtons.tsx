// File: /app/editor/components/WorkflowButtons.tsx
'use client'

import React from 'react'

interface Workflow {
  key: string
  title: string
}

interface WorkflowButtonsProps {
  workflows: Workflow[]
  selectedWorkflow: string
  onSelectWorkflow: (workflowKey: string) => void
  isLoading: boolean
}

export default function WorkflowButtons({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  isLoading,
}: WorkflowButtonsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {workflows.map((wf) => {
        const isSelected = wf.key === selectedWorkflow
        return (
          <button
            key={wf.key}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectWorkflow(wf.key)}
            className={[
              'rounded px-4 py-2 font-medium shadow transition-colors',
              isSelected
                ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white',
              isLoading ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            {wf.title}
          </button>
        )
      })}
    </div>
  )
}
