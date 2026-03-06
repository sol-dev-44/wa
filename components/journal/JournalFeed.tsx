'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import JournalCard from './JournalCard'
import type { Tables } from '@/types/database'

interface JournalFeedProps {
  entries: Tables<'journal_entries'>[]
  onEntryClick: (entry: Tables<'journal_entries'>) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function JournalFeed({ entries, onEntryClick }: JournalFeedProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Start your family journal"
        description="Capture everyday moments, milestones, and memories to share with your co-parent."
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {entries.map((entry) => (
        <motion.div key={entry.id} variants={itemVariants}>
          <JournalCard entry={entry} onClick={() => onEntryClick(entry)} />
        </motion.div>
      ))}
    </motion.div>
  )
}
