'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

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
        <h1 className="font-serif text-5xl italic text-[#2C2C2C]">Wa</h1>
        <p className="mt-3 font-sans text-base text-[#2C2C2C]/60">
          For parents who put their child first.
        </p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-10 rounded-2xl border border-[#EAE4DC] bg-white p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4A7050]/10">
            <CheckCircle className="h-6 w-6 text-[#4A7050]" />
          </div>
          <h2 className="mt-4 font-serif text-xl text-[#2C2C2C]">
            Check your email
          </h2>
          <p className="mt-2 font-sans text-sm text-[#2C2C2C]/60">
            We sent a magic link to{' '}
            <span className="font-medium text-[#2C2C2C]">
              {getValues('email')}
            </span>
            . Click the link to sign in.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className="rounded-2xl border border-[#EAE4DC] bg-white p-8">
            <label
              htmlFor="email"
              className="block font-sans text-sm font-medium text-[#2C2C2C]"
            >
              Email address
            </label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A882]" />
              <input
                id="email"
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
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A7050] py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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

      <p className="mt-8 text-center font-sans text-xs text-[#2C2C2C]/40">
        By continuing, you agree to our terms of service and privacy policy.
      </p>
    </motion.div>
  )
}
