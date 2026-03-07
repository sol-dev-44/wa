'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/store/api'
import { useAppDispatch } from '@/lib/store/store'

export function useRealtimeMessages(childId: string | null) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!childId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${childId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `child_id=eq.${childId}`,
        },
        () => {
          // Invalidate the messages cache so RTK Query refetches
          dispatch(api.util.invalidateTags([{ type: 'Messages', id: childId }]))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [childId, dispatch])
}
