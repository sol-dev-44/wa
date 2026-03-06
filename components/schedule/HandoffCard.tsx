'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { scheduleBlockSchema } from '@/lib/validations/schemas'
import { useUpsertScheduleBlockMutation } from '@/lib/store/api'
import type { z } from 'zod'
import type { Tables } from '@/types/database'

type FormValues = z.infer<typeof scheduleBlockSchema>

interface HandoffCardProps {
  isOpen: boolean
  onClose: () => void
  date: string
  existingBlock?: Tables<'schedule_blocks'>
  coParents: Tables<'co_parents'>[]
  childId: string
}

export default function HandoffCard({
  isOpen,
  onClose,
  date,
  existingBlock,
  coParents,
  childId,
}: HandoffCardProps) {
  const [upsertBlock, { isLoading }] = useUpsertScheduleBlockMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(scheduleBlockSchema),
    defaultValues: {
      parent_id: '',
      date: '',
      label: '',
      is_handoff: false,
      handoff_time: '',
      handoff_note: '',
    },
  })

  const isHandoff = watch('is_handoff')

  useEffect(() => {
    if (isOpen) {
      if (existingBlock) {
        reset({
          parent_id: existingBlock.parent_id,
          date: existingBlock.date,
          label: existingBlock.label ?? '',
          is_handoff: existingBlock.is_handoff,
          handoff_time: existingBlock.handoff_time ?? '',
          handoff_note: existingBlock.handoff_note ?? '',
        })
      } else {
        reset({
          parent_id: coParents[0]?.user_id ?? '',
          date,
          label: '',
          is_handoff: false,
          handoff_time: '',
          handoff_note: '',
        })
      }
    }
  }, [isOpen, existingBlock, date, coParents, reset])

  async function onSubmit(values: FormValues) {
    try {
      await upsertBlock({
        ...(existingBlock ? { id: existingBlock.id } : {}),
        child_id: childId,
        parent_id: values.parent_id,
        date: values.date,
        label: values.label || null,
        is_handoff: values.is_handoff,
        handoff_time: values.is_handoff && values.handoff_time ? values.handoff_time : null,
        handoff_note: values.is_handoff && values.handoff_note ? values.handoff_note : null,
      }).unwrap()
      toast.success('Schedule updated')
      onClose()
    } catch {
      toast.error('Failed to update schedule')
    }
  }

  const inputClass =
    'w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30'
  const labelClass = 'mb-1.5 block text-base font-medium text-ink'
  const errorClass = 'mt-1 text-sm text-terracotta'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Day">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Parent select */}
        <div>
          <label className={labelClass}>Custody</label>
          <select {...register('parent_id')} className={inputClass}>
            <option value="" disabled>
              Select parent
            </option>
            {coParents.map((cp) => (
              <option key={cp.user_id} value={cp.user_id}>
                {cp.label}
              </option>
            ))}
          </select>
          {errors.parent_id && (
            <p className={errorClass}>{errors.parent_id.message}</p>
          )}
        </div>

        {/* Label */}
        <div>
          <label className={labelClass}>Label (optional)</label>
          <input
            {...register('label')}
            className={inputClass}
            placeholder="e.g. Soccer practice, School day"
          />
        </div>

        {/* Handoff toggle */}
        <div className="flex items-center justify-between rounded-lg border border-mist bg-sand/40 px-4 py-3">
          <div>
            <p className="text-base font-medium text-ink">Handoff day</p>
            <p className="text-sm text-ink/50">Child transitions between parents</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isHandoff}
            onClick={() => setValue('is_handoff', !isHandoff, { shouldDirty: true })}
            className={
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ' +
              (isHandoff ? 'bg-clay' : 'bg-mist')
            }
          >
            <span
              className={
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ' +
                (isHandoff ? 'translate-x-5' : 'translate-x-0')
              }
            />
          </button>
        </div>

        {/* Handoff fields */}
        {isHandoff && (
          <div className="space-y-4 rounded-lg border border-mist bg-sand/20 p-4">
            <div>
              <label className={labelClass}>Handoff time</label>
              <input
                type="time"
                {...register('handoff_time')}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Handoff note</label>
              <textarea
                {...register('handoff_note')}
                className={inputClass + ' min-h-[60px] resize-y'}
                placeholder="e.g. Pick up from school at 3pm"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Hidden date field */}
        <input type="hidden" {...register('date')} />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
