// File: /app/editor/components/ProcessingModal.tsx
'use client'

import React from 'react'

interface ProcessingModalProps {
  workflowTitle: string
  prompt: string
}

export default function ProcessingModal({ workflowTitle, prompt }: ProcessingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded bg-white p-6 text-center dark:bg-gray-800">
        <div className="mb-4 flex justify-center">
          {/* A simple spinner icon */}
          <svg
            className="h-8 w-8 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold">Processing your request...</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          The LLM is working on your prompt using <span className="font-bold">{workflowTitle}</span>
          .
          <br />
          This may take up to a minute.
        </p>
      </div>
    </div>
  )
}
