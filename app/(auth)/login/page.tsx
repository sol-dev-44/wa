'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle, Play } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setDemoMode } from '@/lib/demo/mode'
import { setDemoMode as setDemoModeAction, setActiveChildId } from '@/lib/store/appSlice'
import { useAppDispatch } from '@/lib/store/store'
import { DEMO_CHILD_ID } from '@/lib/demo/data'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const dispatch = useAppDispatch()

  function enterDemo() {
    setDemoMode(true)
    dispatch(setDemoModeAction(true))
    dispatch(setActiveChildId(DEMO_CHILD_ID))
    router.push('/dashboard')
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md px-6"
    >
      <div className="text-center">
        <Link href="/" className="inline-block">
          <span className="text-4xl leading-none">和</span>
          <h1 className="mt-2 font-serif text-5xl italic text-ink">Wa</h1>
        </Link>
        <p className="mt-3 font-sans text-base text-ink/50">
          Harmony in co-parenting
        </p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-10 rounded-2xl border border-mist bg-white p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/10">
            <CheckCircle className="h-6 w-6 text-sage-deep" />
          </div>
          <h2 className="mt-4 font-serif text-xl text-ink">
            Check your email
          </h2>
          <p className="mt-2 font-sans text-sm text-ink/50">
            We sent a magic link to{' '}
            <span className="font-medium text-ink">
              {getValues('email')}
            </span>
            . Click the link to sign in.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className="rounded-2xl border border-mist bg-white p-8">
            <label
              htmlFor="email"
              className="block font-sans text-sm font-medium text-ink/70"
            >
              Email address
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clay" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full rounded-xl border border-mist bg-cream py-3 pl-10 pr-4 font-sans text-sm text-ink placeholder:text-ink/25 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="mt-2 font-sans text-xs text-terracotta">
                {errors.email.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sage-deep py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={enterDemo}
          className="inline-flex items-center gap-2 rounded-xl border border-mist bg-white px-6 py-3 font-sans text-sm font-medium text-ink transition-all hover:border-sage hover:shadow-sm"
        >
          <Play className="h-4 w-4 text-sage-deep" />
          Try the demo
        </button>
        <p className="mt-2 font-sans text-xs text-ink/40">
          No sign-up required
        </p>
      </div>

      <p className="mt-6 text-center font-sans text-xs text-ink/30">
        By continuing, you agree to our terms of service and privacy policy.
      </p>
    </motion.div>
  )
}
