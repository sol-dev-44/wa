'use client'

import { Info, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useGetHealthInsightsQuery } from '@/lib/store/aiApi'
import { cn } from '@/lib/utils'
import type { AIHealthInsight } from '@/types/app'

interface HealthInsightsProps {
  childId: string
}

const severityConfig: Record<
  AIHealthInsight['severity'],
  { icon: typeof Info; bg: string; border: string; iconColor: string }
> = {
  info: {
    icon: Info,
    bg: 'bg-sky/10',
    border: 'border-l-sky',
    iconColor: 'text-sky',
  },
  notice: {
    icon: AlertTriangle,
    bg: 'bg-clay/10',
    border: 'border-l-clay',
    iconColor: 'text-clay',
  },
  alert: {
    icon: AlertCircle,
    bg: 'bg-terracotta/10',
    border: 'border-l-terracotta',
    iconColor: 'text-terracotta',
  },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, x: 8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

export default function HealthInsights({ childId }: HealthInsightsProps) {
  const { data: insights = [], isLoading } = useGetHealthInsightsQuery({ childId })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sage-deep">
          <Sparkles size={16} aria-hidden="true" />
          <span className="text-sm font-medium uppercase tracking-wide">
            AI Insights
          </span>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" count={2} />
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sage-deep">
          <Sparkles size={16} aria-hidden="true" />
          <span className="text-sm font-medium uppercase tracking-wide">
            AI Insights
          </span>
        </div>
        <div className="rounded-xl border border-dashed border-clay/30 bg-sand/30 px-5 py-10 text-center">
          <p className="font-serif text-base italic text-ink/50">
            Add more health notes to see AI insights
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sage-deep">
        <Sparkles size={16} aria-hidden="true" />
        <span className="text-sm font-medium uppercase tracking-wide">
          AI Insights
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {insights.map((insight) => {
          const config = severityConfig[insight.severity]
          const Icon = config.icon

          return (
            <motion.div key={insight.id} variants={item}>
              <Card
                className={cn(
                  'border-l-4 p-4',
                  config.border,
                  config.bg
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={16} className={config.iconColor} aria-hidden="true" />
                  <h4 className="text-base font-semibold text-ink">
                    {insight.pattern}
                  </h4>
                </div>
                <p className="text-sm leading-relaxed text-ink/70">
                  {insight.detail}
                </p>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <p className="px-1 text-[11px] italic text-ink/40">
        AI observations — not medical advice
      </p>
    </div>
  )
}
