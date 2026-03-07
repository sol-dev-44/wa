'use client'

import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import type { Tables } from '@/types/database'

interface MessageBubbleProps {
  message: Tables<'messages'>
  isOwn: boolean
  senderLabel?: string
}

export default function MessageBubble({ message, isOwn, senderLabel }: MessageBubbleProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
      {!isOwn && senderLabel && (
        <span className="px-1 text-xs font-medium text-ink/40">{senderLabel}</span>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-base leading-relaxed',
          isOwn
            ? 'rounded-br-md bg-sage-deep text-white'
            : 'rounded-bl-md bg-mist text-ink'
        )}
      >
        {message.body}
      </div>
      <span className="px-1 text-[11px] text-ink/30">
        {format(parseISO(message.created_at), 'h:mm a')}
      </span>
    </div>
  )
}
