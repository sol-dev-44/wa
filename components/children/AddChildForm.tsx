'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useAddChildMutation } from '@/lib/store/api'
import { useAppDispatch } from '@/lib/store/store'
import { setActiveChildId } from '@/lib/store/appSlice'

const addChildSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
})

type FormValues = z.infer<typeof addChildSchema>

interface AddChildFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddChildForm({ isOpen, onClose }: AddChildFormProps) {
  const dispatch = useAppDispatch()
  const [addChild] = useAddChildMutation()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(addChildSchema),
    defaultValues: {
      name: '',
      date_of_birth: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      const child = await addChild({
        name: values.name,
        date_of_birth: values.date_of_birth,
      }).unwrap()

      dispatch(setActiveChildId(child.id))
      toast.success(`${child.name} added!`)
      reset()
      onClose()
    } catch {
      toast.error('Failed to add child.')
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Child">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/60">
            Name
          </label>
          <input
            {...register('name')}
            placeholder="Child's name"
            autoFocus
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-terracotta">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink/60">
            Date of birth
          </label>
          <input
            type="date"
            {...register('date_of_birth')}
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.date_of_birth && (
            <p className="mt-1 text-sm text-terracotta">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-mist pt-4">
          <Button variant="ghost" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Add Child
          </Button>
        </div>
      </form>
    </Modal>
  )
}
