'use client'

import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (body: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-mist bg-white px-4 py-3">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className={cn(
          'flex-1 resize-none rounded-xl border border-mist bg-cream/50 px-4 py-2.5 text-base text-ink',
          'placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30',
          'max-h-32'
        )}
        style={{ fieldSizing: 'content' } as React.CSSProperties}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
          text.trim()
            ? 'bg-sage-deep text-white hover:bg-sage-deep/90'
            : 'bg-mist text-ink/30'
        )}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  )
}
