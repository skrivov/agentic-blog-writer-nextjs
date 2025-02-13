// File: /app/editor/components/PromptArea.tsx
'use client'

import React from 'react'
import ArrowUpIcon from './ArrowUpIcon'

interface PromptAreaProps {
  prompt: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
  label?: string // New optional label prop
}

export default function PromptArea({
  prompt,
  onPromptChange,
  onSubmit,
  onKeyDown,
  isLoading,
  label, // Destructure the label prop
}: PromptAreaProps) {
  return (
    <div className="mb-6">
      <label
        htmlFor="prompt"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200"
      >
        {label || 'Describe your Blog'}
      </label>
      <div className="flex items-start gap-2">
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g., A tutorial on how to make perfect coffee..."
          rows={4}
          className="block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="mt-1 inline-flex h-10 items-center justify-center self-end rounded bg-blue-600 px-3 py-2 font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-500"
          title="Submit (Ctrl+Enter)"
        >
          <ArrowUpIcon />
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Press{' '}
        <kbd className="rounded bg-gray-200 px-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-100">
          Enter
        </kbd>{' '}
        to submit. Hold{' '}
        <kbd className="rounded bg-gray-200 px-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-100">
          Shift
        </kbd>{' '}
        +{' '}
        <kbd className="rounded bg-gray-200 px-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-100">
          Enter
        </kbd>{' '}
        to add a new line.
      </p>
    </div>
  )
}
