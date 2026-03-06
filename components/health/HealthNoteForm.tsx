'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { healthNoteSchema } from '@/lib/validations/schemas'
import { useAddHealthNoteMutation, useUpdateHealthNoteMutation } from '@/lib/store/api'
import { createClient } from '@/lib/supabase/client'
import type { z } from 'zod'
import type { Tables } from '@/types/database'

type FormValues = z.infer<typeof healthNoteSchema>

const NOTE_TYPES = [
  'Medication',
  'Appointment',
  'Allergy',
  'Wellness',
  'Injury',
  'Dental',
  'Vision',
] as const

interface HealthNoteFormProps {
  isOpen: boolean
  onClose: () => void
  note?: Tables<'health_notes'>
  childId: string
}

export default function HealthNoteForm({
  isOpen,
  onClose,
  note,
  childId,
}: HealthNoteFormProps) {
  const isEditing = !!note

  const [addNote, { isLoading: isAdding }] = useAddHealthNoteMutation()
  const [updateNote, { isLoading: isUpdating }] = useUpdateHealthNoteMutation()
  const isSaving = isAdding || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(healthNoteSchema),
    defaultValues: {
      type: 'Wellness',
      title: '',
      detail: '',
      note_date: new Date().toISOString().slice(0, 10),
      is_urgent: false,
    },
  })

  const isUrgent = watch('is_urgent')

  useEffect(() => {
    if (isOpen) {
      if (note) {
        reset({
          type: note.type as 'Medication' | 'Appointment' | 'Allergy' | 'Wellness' | 'Injury' | 'Dental' | 'Vision',
          title: note.title,
          detail: note.detail ?? '',
          note_date: note.note_date,
          is_urgent: note.is_urgent,
        })
      } else {
        reset({
          type: 'Wellness',
          title: '',
          detail: '',
          note_date: new Date().toISOString().slice(0, 10),
          is_urgent: false,
        })
      }
    }
  }, [isOpen, note, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && note) {
        await updateNote({
          id: note.id,
          changes: {
            type: values.type,
            title: values.title,
            detail: values.detail || null,
            note_date: values.note_date,
            is_urgent: values.is_urgent,
          },
        }).unwrap()
        toast.success('Health note updated')
      } else {
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('Not authenticated')

        await addNote({
          child_id: childId,
          author_id: userData.user.id,
          type: values.type,
          title: values.title,
          detail: values.detail || null,
          note_date: values.note_date,
          is_urgent: values.is_urgent,
        }).unwrap()
        toast.success('Health note added')
      }
      onClose()
    } catch {
      toast.error('Failed to save health note')
    }
  }

  const inputClass =
    'w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30'
  const labelClass = 'mb-1.5 block text-base font-medium text-ink'
  const errorClass = 'mt-1 text-sm text-terracotta'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Health Note' : 'Add Health Note'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Type */}
        <div>
          <label className={labelClass}>Type</label>
          <select {...register('type')} className={inputClass}>
            {NOTE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <p className={errorClass}>{errors.type.message}</p>}
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>Title</label>
          <input
            {...register('title')}
            className={inputClass}
            placeholder="e.g. Pediatrician check-up"
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Detail */}
        <div>
          <label className={labelClass}>Detail</label>
          <textarea
            {...register('detail')}
            className={inputClass + ' min-h-[80px] resize-y'}
            placeholder="Additional details..."
            rows={3}
          />
          {errors.detail && <p className={errorClass}>{errors.detail.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" {...register('note_date')} className={inputClass} />
          {errors.note_date && (
            <p className={errorClass}>{errors.note_date.message}</p>
          )}
        </div>

        {/* Urgency toggle */}
        <div className="flex items-center justify-between rounded-lg border border-mist bg-sand/40 px-4 py-3">
          <div>
            <p className="text-base font-medium text-ink">Mark as urgent</p>
            <p className="text-sm text-ink/50">Highlights this note for attention</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isUrgent}
            onClick={() => setValue('is_urgent', !isUrgent, { shouldDirty: true })}
            className={
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ' +
              (isUrgent ? 'bg-terracotta' : 'bg-mist')
            }
          >
            <span
              className={
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ' +
                (isUrgent ? 'translate-x-5' : 'translate-x-0')
              }
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {isEditing ? 'Save Changes' : 'Add Note'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
