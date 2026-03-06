'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { milestoneSchema } from '@/lib/validations/schemas'
import { useAppSelector } from '@/lib/store/store'
import { useAddMilestoneMutation, useUpdateMilestoneMutation } from '@/lib/store/api'
import { createClient } from '@/lib/supabase/client'
import { formatAge, cn } from '@/lib/utils'
import type { z } from 'zod'
import type { Tables } from '@/types/database'

type FormValues = z.infer<typeof milestoneSchema>

interface MilestoneFormProps {
  isOpen: boolean
  onClose: () => void
  milestone?: Tables<'milestones'>
  childDob: string
}

const CATEGORIES = ['Physical', 'Academic', 'Social', 'Emotional', 'Creative', 'Other'] as const

const ICON_CHOICES = [
  '\u{1F476}', '\u{1F6B6}', '\u{1F3C3}', '\u{1F6B2}', '\u{1F3CA}',
  '\u{1F4DA}', '\u{270D}\uFE0F', '\u{1F3A8}', '\u{1F3B5}', '\u{1F3AD}',
  '\u{1F9E9}', '\u{2B50}', '\u{1F31F}', '\u{1F3C6}', '\u{1F947}',
  '\u{2764}\uFE0F', '\u{1F91D}', '\u{1F4AC}', '\u{1F9D1}\u200D\u{1F393}', '\u{1F680}',
]

export default function MilestoneForm({ isOpen, onClose, milestone, childDob }: MilestoneFormProps) {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const [addMilestone, { isLoading: isAdding }] = useAddMilestoneMutation()
  const [updateMilestone, { isLoading: isUpdating }] = useUpdateMilestoneMutation()
  const [selectedIcon, setSelectedIcon] = useState<string>('\u2B50')

  const isEditing = !!milestone

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Other',
      icon: '\u2B50',
      milestone_date: new Date().toISOString().split('T')[0],
      celebrated: false,
    },
  })

  const milestoneDate = watch('milestone_date')
  const ageLabel = childDob && milestoneDate ? formatAge(childDob, milestoneDate) : ''

  // Populate form when editing
  useEffect(() => {
    if (milestone) {
      reset({
        title: milestone.title,
        description: milestone.description ?? '',
        category: milestone.category as 'Physical' | 'Academic' | 'Social' | 'Emotional' | 'Creative' | 'Other',
        icon: milestone.icon ?? '\u2B50',
        milestone_date: milestone.milestone_date,
        celebrated: milestone.celebrated,
      })
      setSelectedIcon(milestone.icon ?? '\u2B50')
    } else {
      reset({
        title: '',
        description: '',
        category: 'Other',
        icon: '\u2B50',
        milestone_date: new Date().toISOString().split('T')[0],
        celebrated: false,
      })
      setSelectedIcon('\u2B50')
    }
  }, [milestone, reset, isOpen])

  function handleIconSelect(icon: string) {
    setSelectedIcon(icon)
    setValue('icon', icon)
  }

  async function onSubmit(values: FormValues) {
    if (!activeChildId) return

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const computedAgeLabel = childDob ? formatAge(childDob, values.milestone_date) : null

      if (isEditing) {
        await updateMilestone({
          id: milestone.id,
          changes: {
            title: values.title,
            description: values.description || null,
            category: values.category,
            icon: values.icon || null,
            milestone_date: values.milestone_date,
            age_label: computedAgeLabel,
            celebrated: values.celebrated,
          },
        }).unwrap()
        toast.success('Milestone updated')
      } else {
        await addMilestone({
          child_id: activeChildId,
          author_id: userData.user.id,
          title: values.title,
          description: values.description || null,
          category: values.category,
          icon: values.icon || null,
          milestone_date: values.milestone_date,
          age_label: computedAgeLabel,
          celebrated: values.celebrated,
        }).unwrap()
        toast.success('Milestone added')
      }

      onClose()
    } catch {
      toast.error('Failed to save milestone')
    }
  }

  const isSaving = isAdding || isUpdating

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Milestone' : 'Add Milestone'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/60">Title</label>
          <input
            {...register('title')}
            placeholder="First steps, first word..."
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 font-serif text-base font-semibold text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-terracotta">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/60">Category</label>
          <select
            {...register('category')}
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date + Age label */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-ink/60">Date</label>
            <input
              type="date"
              {...register('milestone_date')}
              className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
            {errors.milestone_date && (
              <p className="mt-1 text-sm text-terracotta">{errors.milestone_date.message}</p>
            )}
          </div>
          {ageLabel && (
            <div className="pb-2 text-base font-medium text-sage-deep">
              Age: {ageLabel}
            </div>
          )}
        </div>

        {/* Icon picker */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink/60">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_CHOICES.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => handleIconSelect(icon)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all',
                  selectedIcon === icon
                    ? 'border-sage bg-sage/15 scale-110'
                    : 'border-mist bg-white hover:border-clay hover:bg-sand/40'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink/60">Description (optional)</label>
          <textarea
            {...register('description')}
            placeholder="Tell the story behind this moment..."
            rows={3}
            className="w-full resize-none rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
        </div>

        {/* Celebrated toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            {...register('celebrated')}
            className="h-4 w-4 rounded border-mist text-sage-deep focus:ring-sage"
          />
          <span className="text-base text-ink">Mark as celebrated</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-mist pt-4">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {isEditing ? 'Save Changes' : 'Add Milestone'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
