'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Users, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type EmailForm = z.infer<typeof emailSchema>

type InviteDetails = {
  child_name: string
  inviter_name: string
}

type InviteState =
  | { status: 'loading' }
  | { status: 'valid'; details: InviteDetails }
  | { status: 'invalid'; message: string }

export default function InvitePage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [invite, setInvite] = useState<InviteState>({ status: 'loading' })
  const [userId, setUserId] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  })

  // Check auth state and fetch invite details
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      try {
        const res = await fetch(`/api/invite?token=${params.token}`)
        const data = await res.json()

        if (!res.ok) {
          setInvite({ status: 'invalid', message: data.error || 'This invite is no longer valid.' })
          return
        }

        setInvite({ status: 'valid', details: data })
      } catch {
        setInvite({ status: 'invalid', message: 'Unable to load invite details.' })
      }
    }

    init()
  }, [params.token, supabase.auth])

  async function sendMagicLink(data: EmailForm) {
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: window.location.origin + `/invite/${params.token}`,
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setEmailSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function acceptInvite() {
    setAccepting(true)
    try {
      const { data: inviteRow, error: lookupError } = await supabase
        .from('invites')
        .select('*')
        .eq('token', params.token)
        .single()

      if (lookupError || !inviteRow) {
        toast.error('Invite not found.')
        setAccepting(false)
        return
      }

      if (inviteRow.used) {
        toast.error('This invite has already been used.')
        setAccepting(false)
        return
      }

      if (inviteRow.expires_at && new Date(inviteRow.expires_at) < new Date()) {
        toast.error('This invite has expired.')
        setAccepting(false)
        return
      }

      // Create the co_parents record linking the user to the child
      const { error: linkError } = await supabase
        .from('co_parents')
        .insert({ user_id: userId!, child_id: inviteRow.child_id, label: 'Parent B' })

      if (linkError) {
        toast.error('Unable to accept invite. You may already be linked to this child.')
        setAccepting(false)
        return
      }

      // Mark the invite as used
      await supabase
        .from('invites')
        .update({ used: true })
        .eq('id', inviteRow.id)

      toast.success('Invite accepted! Redirecting...')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setAccepting(false)
    }
  }

  // Loading state
  if (invite.status === 'loading') {
    return (
      <div className="flex items-center gap-3 text-[#2C2C2C]/60">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-sans text-sm">Loading invite...</span>
      </div>
    )
  }

  // Invalid invite
  if (invite.status === 'invalid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6"
      >
        <div className="rounded-2xl border border-[#EAE4DC] bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="mt-4 font-serif text-xl text-[#2C2C2C]">
            Invite unavailable
          </h2>
          <p className="mt-2 font-sans text-sm text-[#2C2C2C]/60">
            {invite.message}
          </p>
          <a
            href="/login"
            className="mt-6 inline-block font-sans text-sm font-medium text-[#4A7050] hover:underline"
          >
            Go to login
          </a>
        </div>
      </motion.div>
    )
  }

  // Valid invite
  const { details } = invite

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md px-6"
    >
      <div className="text-center">
        <h1 className="font-serif text-5xl italic text-[#2C2C2C]">Wa</h1>
      </div>

      <div className="mt-10 rounded-2xl border border-[#EAE4DC] bg-white p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A882]/15">
          <Users className="h-6 w-6 text-[#C9A882]" />
        </div>

        <h2 className="mt-4 text-center font-serif text-xl text-[#2C2C2C]">
          You&apos;ve been invited to co-parent on Wa
        </h2>
        <p className="mt-2 text-center font-sans text-sm text-[#2C2C2C]/60">
          <span className="font-medium text-[#2C2C2C]">{details.inviter_name}</span>{' '}
          invited you to co-parent{' '}
          <span className="font-medium text-[#2C2C2C]">{details.child_name}</span>.
        </p>

        {userId ? (
          // Logged in: show accept button
          <button
            onClick={acceptInvite}
            disabled={accepting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A7050] py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {accepting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                Accept invite
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        ) : emailSent ? (
          // Magic link sent
          <div className="mt-6 rounded-xl bg-[#4A7050]/5 p-4 text-center">
            <p className="font-sans text-sm text-[#4A7050]">
              Check your email for a magic link, then return here to accept.
            </p>
          </div>
        ) : (
          // Not logged in: show email form
          <form onSubmit={handleSubmit(sendMagicLink)} className="mt-6">
            <label
              htmlFor="invite-email"
              className="block font-sans text-sm font-medium text-[#2C2C2C]"
            >
              Enter your email to get started
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A882]" />
              <input
                id="invite-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full rounded-xl border border-[#EAE4DC] bg-[#FDFAF6] py-3 pl-10 pr-4 font-sans text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/30 focus:border-[#4A7050] focus:outline-none focus:ring-1 focus:ring-[#4A7050] transition-colors"
              />
            </div>
            {errors.email && (
              <p className="mt-2 font-sans text-xs text-red-500">
                {errors.email.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A7050] py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  Send magic link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  )
}
