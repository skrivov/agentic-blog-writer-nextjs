// File: /app/editor/components/FrontmatterPreview.tsx
'use client'

import React from 'react'

interface FrontmatterPreviewProps {
  frontmatter: Record<string, any>
}

export default function FrontmatterPreview({ frontmatter }: FrontmatterPreviewProps) {
  if (!frontmatter || Object.keys(frontmatter).length === 0) return null

  return (
    <div className="mb-6 rounded border bg-gray-50 p-3 dark:bg-gray-800">
      <h3 className="mb-2 font-bold">Front Matter</h3>
      <div className="space-y-2">
        {Object.entries(frontmatter).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{key}:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
