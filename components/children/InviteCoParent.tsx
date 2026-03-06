'use client'

import { useState, useCallback } from 'react'
import { UserPlus, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useGetCoParentsQuery } from '@/lib/store/api'
import { createClient } from '@/lib/supabase/client'

interface InviteCoParentProps {
  childId: string
}

export default function InviteCoParent({ childId }: InviteCoParentProps) {
  const { data: coParents } = useGetCoParentsQuery(childId)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Only show if there's just one parent
  if (coParents && coParents.length >= 2) return null

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to create invite')
        return
      }
      const link = `${window.location.origin}/invite/${data.token}`
      setInviteLink(link)
    } catch {
      toast.error('Failed to create invite')
    } finally {
      setGenerating(false)
    }
  }, [childId])

  const handleCopy = useCallback(async () => {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }, [inviteLink])

  return (
    <Card className="border-dashed border-clay/40 bg-sand/30">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-clay/15">
          <UserPlus size={22} className="text-clay" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-ink">Invite your co-parent</h3>
          <p className="mt-1 text-base text-ink/50">
            Share an invite link so they can see and contribute to everything here.
          </p>

          {inviteLink ? (
            <div className="mt-4 flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="min-w-0 flex-1 rounded-lg border border-mist bg-white px-4 py-3 text-sm text-ink"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button onClick={handleCopy} variant="secondary">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button onClick={handleGenerate} loading={generating}>
                <UserPlus size={16} />
                Generate invite link
              </Button>
            </div>
          )}

          <p className="mt-3 text-sm text-ink/40">
            Link expires in 7 days. Only one co-parent can use it.
          </p>
        </div>
      </div>
    </Card>
  )
}
