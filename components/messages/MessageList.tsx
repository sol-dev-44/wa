'use client'

import { useEffect, useRef } from 'react'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import type { Tables } from '@/types/database'
import MessageBubble from './MessageBubble'
import { MessageCircle } from 'lucide-react'

interface MessageListProps {
  messages: Tables<'messages'>[]
  currentUserId: string
  coParents: Tables<'co_parents'>[]
}

function formatDateDivider(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export default function MessageList({ messages, currentUserId, coParents }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-ink/30">
        <MessageCircle size={40} strokeWidth={1.5} />
        <p className="text-base">No messages yet</p>
        <p className="text-sm">Send a message to start the conversation</p>
      </div>
    )
  }

  const labelMap = new Map(coParents.map((cp) => [cp.user_id, cp.label]))

  let lastDate = ''

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
      {messages.map((msg) => {
        const msgDate = msg.created_at.slice(0, 10)
        let showDivider = false
        if (msgDate !== lastDate) {
          showDivider = true
          lastDate = msgDate
        }

        return (
          <div key={msg.id}>
            {showDivider && (
              <div className="my-3 flex items-center gap-3">
                <div className="flex-1 border-t border-mist" />
                <span className="text-xs font-medium text-ink/30">
                  {formatDateDivider(msg.created_at)}
                </span>
                <div className="flex-1 border-t border-mist" />
              </div>
            )}
            <MessageBubble
              message={msg}
              isOwn={msg.sender_id === currentUserId}
              senderLabel={labelMap.get(msg.sender_id)}
            />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
