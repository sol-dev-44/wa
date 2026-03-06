'use client'

import { useCallback } from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { Sparkles, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useGetLatestSummaryQuery } from '@/lib/store/api'
import { useGenerateSummaryMutation } from '@/lib/store/aiApi'

interface SmartSummaryProps {
  childId: string
}

export default function SmartSummary({ childId }: SmartSummaryProps) {
  const { data: summary, isLoading } = useGetLatestSummaryQuery(childId)
  const [generateSummary, { isLoading: isGenerating }] = useGenerateSummaryMutation()

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const dateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`

  const handleRefresh = useCallback(async () => {
    try {
      await generateSummary({ childId }).unwrap()
      toast.success('Summary refreshed')
    } catch {
      toast.error('Failed to generate summary')
    }
  }, [generateSummary, childId])

  if (isLoading) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" count={3} />
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute left-0 top-0 h-full w-1 bg-sage" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-sage-deep">
            <Sparkles size={18} aria-hidden="true" />
            <span className="text-sm font-medium uppercase tracking-wide">
              This week
            </span>
          </div>
          <span className="text-sm text-clay">{dateRange}</span>
        </div>

        {summary ? (
          <p className="mt-4 font-serif text-base italic leading-relaxed text-ink/80">
            {summary.content}
          </p>
        ) : (
          <div className="mt-4 text-center">
            <p className="font-serif text-base italic text-ink/50">
              Generate your first weekly summary
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            loading={isGenerating}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh summary
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
