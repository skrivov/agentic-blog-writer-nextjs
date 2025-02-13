// File: /app/editor/components/TopBar.tsx
'use client'

import React from 'react'

interface ButtonConfig {
  text: string
  onClick: () => void
  className?: string
}

interface TopBarProps {
  leftButtonText: string
  onLeftButtonClick: () => void
  rightButtons: ButtonConfig[]
}

export default function TopBar({ leftButtonText, onLeftButtonClick, rightButtons }: TopBarProps) {
  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 dark:bg-gray-800">
      <button
        onClick={onLeftButtonClick}
        className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        {leftButtonText}
      </button>
      <div className="space-x-2">
        {rightButtons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className={`rounded px-4 py-2 text-white ${btn.className ? btn.className : ''}`}
          >
            {btn.text}
          </button>
        ))}
      </div>
    </div>
  )
}
