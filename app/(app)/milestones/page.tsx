'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import MilestoneTimeline from '@/components/milestones/MilestoneTimeline'
import MilestoneForm from '@/components/milestones/MilestoneForm'
import MilestoneSuggestions from '@/components/ai/MilestoneSuggestions'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useAppSelector } from '@/lib/store/store'
import { useGetMilestonesQuery, useGetChildQuery } from '@/lib/store/api'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

const CATEGORIES = ['All', 'Physical', 'Academic', 'Social', 'Emotional', 'Creative', 'Other'] as const
type Category = (typeof CATEGORIES)[number]

export default function MilestonesPage() {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const { data: milestones, isLoading } = useGetMilestonesQuery(activeChildId!, {
    skip: !activeChildId,
  })
  const { data: child } = useGetChildQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Tables<'milestones'> | undefined>()
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filteredMilestones =
    activeCategory === 'All'
      ? milestones
      : milestones?.filter((m) => m.category === activeCategory)

  function handleAdd() {
    setEditingMilestone(undefined)
    setFormOpen(true)
  }

  function handleEdit(milestone: Tables<'milestones'>) {
    setEditingMilestone(milestone)
    setFormOpen(true)
  }

  return (
    <PageShell title="Milestones">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-ink/50">
          Track and celebrate every step forward
        </p>
        <Button onClick={handleAdd}>
          <Plus size={16} aria-hidden="true" />
          Add Milestone
        </Button>
      </div>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-1.5 sm:gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeCategory === cat
                ? 'bg-sage-deep text-white'
                : 'bg-mist text-ink/60 hover:bg-clay/15 hover:text-ink'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" count={4} />
        </div>
      ) : (
        <MilestoneTimeline
          milestones={filteredMilestones ?? []}
          onEdit={handleEdit}
        />
      )}

      {/* AI suggestions */}
      {activeChildId && child && (
        <div className="mt-12">
          <MilestoneSuggestions childId={activeChildId} childDob={child.date_of_birth} />
        </div>
      )}

      <MilestoneForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        milestone={editingMilestone}
        childDob={child?.date_of_birth ?? ''}
      />
    </PageShell>
  )
}
