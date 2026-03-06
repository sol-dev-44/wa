'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { Trophy, Star, ChevronDown, ChevronUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import AuthorByline from '@/components/ui/AuthorByline'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

interface MilestoneTimelineProps {
  milestones: Tables<'milestones'>[]
  onEdit: (milestone: Tables<'milestones'>) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const categoryBadgeVariant: Record<string, 'sage' | 'terracotta' | 'sky' | 'clay' | 'mist'> = {
  Physical: 'sage',
  Academic: 'sky',
  Social: 'clay',
  Emotional: 'terracotta',
  Creative: 'mist',
  Other: 'mist',
}

export default function MilestoneTimeline({ milestones, onEdit }: MilestoneTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (milestones.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No milestones yet"
        description="Record your child's first steps, first words, and every achievement worth remembering."
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative pl-8"
    >
      {/* Vertical timeline line */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-mist" aria-hidden="true" />

      {milestones.map((milestone) => {
        const isExpanded = expandedId === milestone.id

        return (
          <motion.div
            key={milestone.id}
            variants={itemVariants}
            className="relative mb-6 last:mb-0"
          >
            {/* Timeline dot */}
            <div className="absolute -left-8 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-mist bg-white text-sm">
              {milestone.icon || '\u2B50'}
            </div>

            {/* Card */}
            <div
              className={cn(
                'rounded-xl border border-mist bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
                milestone.celebrated && 'ring-1 ring-sage/30'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={categoryBadgeVariant[milestone.category] ?? 'mist'}>
                      {milestone.category}
                    </Badge>
                    {milestone.celebrated && (
                      <Star size={14} className="fill-sage text-sage" aria-label="Celebrated" />
                    )}
                  </div>

                  <h3 className="font-serif text-base font-semibold text-ink">
                    {milestone.title}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-xs text-ink/50">
                    <span>{format(parseISO(milestone.milestone_date), 'MMM d, yyyy')}</span>
                    {milestone.age_label && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span>{milestone.age_label}</span>
                      </>
                    )}
                    {milestone.author_id && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <AuthorByline authorId={milestone.author_id} />
                      </>
                    )}
                  </div>
                </div>

                {/* Expand / Edit */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(milestone)}
                    className="rounded-md px-2 py-1 text-xs text-clay transition-colors hover:bg-mist hover:text-ink"
                  >
                    Edit
                  </button>
                  {milestone.description && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                      className="rounded-md p-1 text-ink/40 transition-colors hover:bg-mist hover:text-ink"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={16} aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded description */}
              {isExpanded && milestone.description && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 border-t border-mist pt-3"
                >
                  <p className="text-sm text-ink/70">{milestone.description}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
