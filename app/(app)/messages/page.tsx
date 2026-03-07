'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAppSelector } from '@/lib/store/store'
import { useGetMessagesQuery, useSendMessageMutation, useGetCoParentsQuery } from '@/lib/store/api'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { createClient } from '@/lib/supabase/client'
import MessageList from '@/components/messages/MessageList'
import MessageInput from '@/components/messages/MessageInput'
import Skeleton from '@/components/ui/Skeleton'

export default function MessagesPage() {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  const { data: messages, isLoading } = useGetMessagesQuery(activeChildId ?? '', {
    skip: !activeChildId,
  })

  const { data: coParents } = useGetCoParentsQuery(activeChildId ?? '', {
    skip: !activeChildId,
  })

  const [sendMessage] = useSendMessageMutation()

  // Subscribe to realtime updates
  useRealtimeMessages(activeChildId)

  const handleSend = async (body: string) => {
    if (!activeChildId || !userId) return
    try {
      await sendMessage({ child_id: activeChildId, sender_id: userId, body }).unwrap()
    } catch {
      toast.error('Failed to send message')
    }
  }

  if (!activeChildId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-ink/40">
        Select a child to view messages
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-[calc(100vh-4.5rem)]">
      {/* Header */}
      <div className="border-b border-mist px-4 py-3">
        <h1 className="font-serif text-xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-ink/40">Chat with your co-parent</p>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex flex-1 flex-col gap-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-12 w-48 rounded-2xl ${i % 2 === 0 ? 'self-start' : 'self-end'}`}
            />
          ))}
        </div>
      ) : (
        <MessageList
          messages={messages ?? []}
          currentUserId={userId ?? ''}
          coParents={coParents ?? []}
        />
      )}

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={!userId} />
    </div>
  )
}
