'use client'

import { useMemo } from 'react'
import { format, eachDayOfInterval, endOfWeek, isToday, isSameDay, parseISO } from 'date-fns'
import { ArrowLeftRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

interface WeekGridProps {
  blocks: Tables<'schedule_blocks'>[]
  coParents: Tables<'co_parents'>[]
  weekStart: Date
  onDayClick: (dateStr: string) => void
}

export default function WeekGrid({
  blocks,
  coParents,
  weekStart,
  onDayClick,
}: WeekGridProps) {
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      }),
    [weekStart]
  )

  const blocksByDate = useMemo(() => {
    const map = new Map<string, Tables<'schedule_blocks'>>()
    for (const block of blocks) {
      map.set(block.date, block)
    }
    return map
  }, [blocks])

  const parentColors = useMemo(() => {
    const map = new Map<string, { color: string; label: string }>()
    for (const cp of coParents) {
      map.set(cp.id, { color: cp.color, label: cp.label })
    }
    return map
  }, [coParents])

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const block = blocksByDate.get(dateStr)
        const parent = block ? parentColors.get(block.parent_id) : undefined
        const today = isToday(day)

        return (
          <motion.button
            key={dateStr}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDayClick(dateStr)}
            className={cn(
              'relative flex min-h-[120px] flex-col rounded-xl border p-3 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
              today ? 'ring-2 ring-sage' : 'border-mist',
              parent ? 'bg-white' : 'bg-sand/40'
            )}
          >
            {/* Colored top bar for assigned parent */}
            {parent && (
              <div
                className="absolute inset-x-0 top-0 h-1.5 rounded-t-xl"
                style={{ backgroundColor: parent.color }}
              />
            )}

            {/* Day header */}
            <div className="mb-2 mt-0.5">
              <p className="text-sm font-medium uppercase text-ink/50">
                {format(day, 'EEE')}
              </p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  today ? 'text-sage-deep' : 'text-ink'
                )}
              >
                {format(day, 'd')}
              </p>
            </div>

            {/* Parent label */}
            {parent && (
              <span
                className="mb-1 inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: parent.color }}
              >
                {parent.label}
              </span>
            )}

            {/* Block label */}
            {block?.label && (
              <p className="mt-auto text-sm text-ink/60 line-clamp-2">
                {block.label}
              </p>
            )}

            {/* Handoff indicator */}
            {block?.is_handoff && (
              <div className="mt-auto flex items-center gap-1 pt-1">
                <ArrowLeftRight size={12} className="text-clay" aria-hidden="true" />
                <span className="text-[10px] font-medium text-clay">
                  {block.handoff_time ?? 'Handoff'}
                </span>
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
