'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useGetCurrentCoParentQuery, useUpdateCoParentLabelMutation } from '@/lib/store/api'
import { useAppSelector } from '@/lib/store/store'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

const profileSchema = z.object({
  label: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
})

type ProfileForm = z.infer<typeof profileSchema>

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const router = useRouter()
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const { data: currentCoParent } = useGetCurrentCoParentQuery(activeChildId ?? '', {
    skip: !activeChildId,
  })
  const [updateLabel, { isLoading }] = useUpdateCoParentLabelMutation()
  const [email, setEmail] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (currentCoParent) {
      reset({ label: currentCoParent.label })
    }
  }, [currentCoParent, reset])

  useEffect(() => {
    if (isOpen) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null)
      })
    }
  }, [isOpen])

  const onSubmit = async (values: ProfileForm) => {
    if (!currentCoParent) return
    try {
      await updateLabel({ id: currentCoParent.id, label: values.label }).unwrap()
      toast.success('Name updated')
      onClose()
    } catch {
      toast.error('Failed to update name')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/70">Email</label>
          <p className="text-base text-ink">{email ?? '...'}</p>
        </div>

        <div>
          <label htmlFor="profile-label" className="mb-1 block text-sm font-medium text-ink/70">
            Display name
          </label>
          <input
            id="profile-label"
            {...register('label')}
            className="w-full rounded-lg border border-mist bg-white px-3 py-2.5 text-base text-ink transition-colors focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            placeholder="e.g. Mom, Dad, Parent A"
          />
          {errors.label && (
            <p className="mt-1 text-sm text-terracotta">{errors.label.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-terracotta"
          >
            <LogOut size={14} />
            Sign out
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isLoading}>Save</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
