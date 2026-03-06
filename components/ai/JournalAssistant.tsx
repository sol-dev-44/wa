'use client'

import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useGetJournalPromptsQuery } from '@/lib/store/aiApi'

interface JournalAssistantProps {
  childId: string
  onPromptSelect: (prompt: string) => void
}

const cardVariants = {
  hidden: { opacity: 0, x: 12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' as const },
  }),
}

export default function JournalAssistant({ childId, onPromptSelect }: JournalAssistantProps) {
  const { data: prompts, isLoading, refetch, isFetching } = useGetJournalPromptsQuery({
    childId,
  })

  return (
    <div className="rounded-xl border border-mist bg-sand/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-ink">Writing Prompts</h3>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md p-1 text-ink/40 transition-colors hover:bg-mist hover:text-ink disabled:opacity-50"
          aria-label="Refresh prompts"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg" count={3} />
        </div>
      ) : prompts && prompts.length > 0 ? (
        <div className="space-y-3">
          {prompts.slice(0, 3).map((prompt, i) => (
            <motion.button
              key={prompt.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              onClick={() => onPromptSelect(prompt.prompt)}
              className="w-full rounded-lg border border-mist bg-white p-3 text-left transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              <p className="text-base font-medium text-ink">{prompt.prompt}</p>
              <p className="mt-1 text-sm text-ink/50">{prompt.context}</p>
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-ink/40">
          No prompts available. Try refreshing.
        </p>
      )}

      <p className="mt-4 text-center text-[10px] text-ink/30">
        Powered by AI based on recent activity
      </p>
    </div>
  )
}
