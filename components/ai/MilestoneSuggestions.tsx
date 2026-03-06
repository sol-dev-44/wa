'use client'

import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Sparkles, X, Plus, Loader2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import {
  useGetMilestoneSuggestionsQuery,
  useUpdateMilestoneSuggestionMutation,
  useAddMilestoneMutation,
} from '@/lib/store/api'
import { useGenerateMilestoneSuggestionsMutation } from '@/lib/store/aiApi'
import { createClient } from '@/lib/supabase/client'
import { formatAge } from '@/lib/utils'
import type { Tables } from '@/types/database'

interface MilestoneSuggestionsProps {
  childId: string
  childDob: string
}

const categoryBadgeVariant: Record<string, 'sage' | 'terracotta' | 'sky' | 'clay' | 'mist'> = {
  Physical: 'sage',
  Academic: 'sky',
  Social: 'clay',
  Emotional: 'terracotta',
  Creative: 'mist',
  Other: 'mist',
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
}

export default function MilestoneSuggestions({ childId, childDob }: MilestoneSuggestionsProps) {
  const { data: suggestions, isLoading } = useGetMilestoneSuggestionsQuery(childId)
  const [updateSuggestion] = useUpdateMilestoneSuggestionMutation()
  const [addMilestone] = useAddMilestoneMutation()
  const [generateSuggestions, { isLoading: isGenerating }] =
    useGenerateMilestoneSuggestionsMutation()

  async function handleGenerate() {
    try {
      await generateSuggestions({ childId }).unwrap()
      toast.success('New suggestions generated')
    } catch {
      toast.error('Failed to generate suggestions')
    }
  }

  async function handleAccept(suggestion: Tables<'milestone_suggestions'>) {
    try {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const milestoneDate = suggestion.suggested_date ?? new Date().toISOString().split('T')[0]
      const ageLabel = childDob ? formatAge(childDob, milestoneDate) : null

      await addMilestone({
        child_id: childId,
        author_id: userData.user.id,
        title: suggestion.title,
        description: suggestion.description || null,
        category: (suggestion.category as Tables<'milestones'>['category']) || 'Other',
        milestone_date: milestoneDate,
        age_label: ageLabel,
        celebrated: false,
      }).unwrap()

      await updateSuggestion({ id: suggestion.id, status: 'accepted' }).unwrap()
      toast.success('Milestone added from suggestion')
    } catch {
      toast.error('Failed to accept suggestion')
    }
  }

  async function handleDismiss(id: string) {
    try {
      await updateSuggestion({ id, status: 'dismissed' }).unwrap()
    } catch {
      toast.error('Failed to dismiss suggestion')
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-sage-deep" aria-hidden="true" />
          <h2 className="font-serif text-xl font-semibold text-ink">AI Suggestions</h2>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          loading={isGenerating}
        >
          Generate suggestions
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" count={2} />
      ) : suggestions && suggestions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {suggestions.map((suggestion, i) => (
            <motion.div
              key={suggestion.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="relative rounded-xl border border-mist bg-blush/30 p-4"
            >
              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="absolute right-2 top-2 rounded-md p-1 text-ink/30 transition-colors hover:bg-mist hover:text-ink"
                aria-label="Dismiss suggestion"
              >
                <X size={14} aria-hidden="true" />
              </button>

              <Badge variant={categoryBadgeVariant[suggestion.category] ?? 'mist'} className="mb-2">
                {suggestion.category}
              </Badge>

              <h3 className="font-serif text-lg font-semibold text-ink pr-6">
                {suggestion.title}
              </h3>

              {suggestion.description && (
                <p className="mt-1 text-base text-ink/60">{suggestion.description}</p>
              )}

              <div className="mt-3">
                <button
                  onClick={() => handleAccept(suggestion)}
                  className="inline-flex items-center gap-1 rounded-lg bg-sage-deep px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sage-deep/90"
                >
                  <Plus size={12} aria-hidden="true" />
                  Add this milestone
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-clay/30 bg-sand/30 px-8 py-10 text-center">
          <p className="text-base text-ink/50">
            No suggestions right now. Generate some based on your child's age and activity.
          </p>
        </div>
      )}
    </div>
  )
}
