'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X, Wand2, Sparkles, Heart } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { journalEntrySchema } from '@/lib/validations/schemas'
import { useAppSelector } from '@/lib/store/store'
import {
  useAddJournalEntryMutation,
  useUpdateJournalEntryMutation,
} from '@/lib/store/api'
import { useAssistJournalWritingMutation } from '@/lib/store/aiApi'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { z } from 'zod'
import type { Tables } from '@/types/database'

type FormValues = z.infer<typeof journalEntrySchema>

interface JournalEditorProps {
  isOpen: boolean
  onClose: () => void
  entry?: Tables<'journal_entries'>
}

const MOOD_EMOJIS = [
  { emoji: '\u{1F60A}', label: 'happy' },
  { emoji: '\u{1F622}', label: 'sad' },
  { emoji: '\u{1F929}', label: 'excited' },
  { emoji: '\u{1F60C}', label: 'calm' },
  { emoji: '\u{1F61F}', label: 'worried' },
  { emoji: '\u{1F64F}', label: 'grateful' },
  { emoji: '\u{1F634}', label: 'tired' },
  { emoji: '\u{1F60E}', label: 'proud' },
]

export default function JournalEditor({ isOpen, onClose, entry }: JournalEditorProps) {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const [addEntry, { isLoading: isAdding }] = useAddJournalEntryMutation()
  const [updateEntry, { isLoading: isUpdating }] = useUpdateJournalEntryMutation()
  const [assistWriting, { isLoading: isAssisting }] = useAssistJournalWritingMutation()

  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const isEditing = !!entry

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: '',
      body: '',
      entry_date: new Date().toISOString().split('T')[0],
      mood: '',
      tags: [],
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (entry) {
      reset({
        title: entry.title,
        body: entry.body,
        entry_date: entry.entry_date ?? entry.created_at.split('T')[0],
        mood: entry.mood ?? '',
        tags: entry.tags,
      })
      setSelectedMood(entry.mood)
      setTags(entry.tags)
    } else {
      reset({ title: '', body: '', entry_date: new Date().toISOString().split('T')[0], mood: '', tags: [] })
      setSelectedMood(null)
      setTags([])
    }
  }, [entry, reset, isOpen])

  function handleMoodSelect(emoji: string) {
    const next = selectedMood === emoji ? null : emoji
    setSelectedMood(next)
    setValue('mood', next ?? '')
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
        const next = [...tags, trimmed]
        setTags(next)
        setValue('tags', next)
        setTagInput('')
      }
    }
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    setValue('tags', next)
  }

  const handleAiAssist = useCallback(
    async (action: 'expand' | 'refine' | 'soften') => {
      if (!activeChildId) return
      const input = getValues('body')
      if (!input.trim()) {
        toast.error('Write some text first')
        return
      }
      try {
        const result = await assistWriting({
          childId: activeChildId,
          input,
          action,
        }).unwrap()
        setValue('body', result.text)
        toast.success(`Text ${action === 'expand' ? 'expanded' : action === 'refine' ? 'refined' : 'softened'}`)
      } catch {
        toast.error('AI assist failed. Try again.')
      }
    },
    [activeChildId, assistWriting, getValues, setValue]
  )

  async function onSubmit(values: FormValues) {
    if (!activeChildId) return

    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      if (isEditing) {
        await updateEntry({
          id: entry.id,
          changes: {
            title: values.title,
            body: values.body,
            entry_date: values.entry_date || null,
            mood: values.mood || null,
            tags: values.tags,
          },
        }).unwrap()
        toast.success('Entry updated')
      } else {
        await addEntry({
          child_id: activeChildId,
          author_id: userData.user.id,
          title: values.title,
          body: values.body,
          entry_date: values.entry_date || null,
          mood: values.mood || null,
          tags: values.tags,
        }).unwrap()
        toast.success('Entry saved')
      }

      onClose()
    } catch {
      toast.error('Failed to save entry')
    }
  }

  const isSaving = isAdding || isUpdating

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Entry' : 'New Journal Entry'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <input
            {...register('title')}
            placeholder="Title"
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 font-serif text-xl font-semibold text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-terracotta">{errors.title.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink/60">Date</label>
          <input
            type="date"
            {...register('entry_date')}
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.entry_date && (
            <p className="mt-1 text-sm text-terracotta">{errors.entry_date.message}</p>
          )}
        </div>

        {/* Body */}
        <div>
          <textarea
            {...register('body')}
            placeholder="Write about your day, a moment, a feeling..."
            rows={8}
            className="w-full resize-none rounded-lg border border-mist bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.body && (
            <p className="mt-1 text-sm text-terracotta">{errors.body.message}</p>
          )}
        </div>

        {/* AI assist toolbar */}
        <div className="flex items-center gap-3 rounded-lg border border-mist bg-sand/40 px-4 py-3">
          <span className="text-sm font-medium text-ink/50">AI Assist:</span>
          <button
            type="button"
            onClick={() => handleAiAssist('expand')}
            disabled={isAssisting}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-sage-deep transition-colors hover:bg-sage/10 disabled:opacity-50"
          >
            <Wand2 size={14} aria-hidden="true" />
            Expand
          </button>
          <button
            type="button"
            onClick={() => handleAiAssist('refine')}
            disabled={isAssisting}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-sage-deep transition-colors hover:bg-sage/10 disabled:opacity-50"
          >
            <Sparkles size={14} aria-hidden="true" />
            Refine
          </button>
          <button
            type="button"
            onClick={() => handleAiAssist('soften')}
            disabled={isAssisting}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-sage-deep transition-colors hover:bg-sage/10 disabled:opacity-50"
          >
            <Heart size={14} aria-hidden="true" />
            Soften
          </button>
          {isAssisting && (
            <span className="ml-auto text-sm text-ink/40">Working...</span>
          )}
        </div>

        {/* Mood picker */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink/60">Mood</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_EMOJIS.map(({ emoji, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleMoodSelect(emoji)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-all',
                  selectedMood === emoji
                    ? 'border-sage bg-sage/15 scale-110'
                    : 'border-mist bg-white hover:border-clay hover:bg-sand/40'
                )}
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink/60">Tags</label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="sage" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag}
                <X size={12} className="ml-1" aria-hidden="true" />
              </Badge>
            ))}
            {tags.length < 8 && (
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag..."
                className="min-w-[100px] flex-1 border-none bg-transparent text-base text-ink outline-none placeholder:text-ink/30"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-mist pt-5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {isEditing ? 'Save Changes' : 'Publish'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
