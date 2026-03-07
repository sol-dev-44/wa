'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  Camera,
  BookOpen,
  Trophy,
  Heart,
  AlertTriangle,
  ImageIcon,
  NotebookPen,
  Milestone,
  Stethoscope,
  Users,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import SmartSummary from '@/components/ai/SmartSummary'
import InviteCoParent from '@/components/children/InviteCoParent'
import { useAppSelector } from '@/lib/store/store'
import {
  useGetChildQuery,
  useGetCoParentsQuery,
  useGetActivityFeedQuery,
  useGetHealthNotesQuery,
  useGetPhotosQuery,
  useGetJournalEntriesQuery,
  useGetMilestonesQuery,
  useGetScheduleBlocksQuery,
} from '@/lib/store/api'
import { cn, formatAge, formatRelativeDate } from '@/lib/utils'
import type { ActivityFeedItem } from '@/types/app'

const activityIcons: Record<ActivityFeedItem['type'], typeof Camera> = {
  photo: Camera,
  journal: BookOpen,
  milestone: Trophy,
  health: Heart,
}

const activityColors: Record<ActivityFeedItem['type'], string> = {
  photo: 'bg-sage/15 text-sage-deep',
  journal: 'bg-clay/15 text-clay',
  milestone: 'bg-terracotta/15 text-terracotta',
  health: 'bg-sky/20 text-ink',
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)

  if (!activeChildId) {
    return (
      <div className="py-16">
        <EmptyState
          icon={Users}
          title="No child selected"
          description="Select or add a child from the sidebar to get started."
        />
      </div>
    )
  }

  return <DashboardContent childId={activeChildId} />
}

function DashboardContent({ childId }: { childId: string }) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: child, isLoading: childLoading } = useGetChildQuery(childId)
  const { data: coParents } = useGetCoParentsQuery(childId)
  const { data: activity, isLoading: activityLoading } = useGetActivityFeedQuery(childId)
  const { data: healthNotes } = useGetHealthNotesQuery(childId)
  const { data: photos } = useGetPhotosQuery(childId)
  const { data: journal } = useGetJournalEntriesQuery(childId)
  const { data: milestones } = useGetMilestonesQuery(childId)
  const { data: scheduleBlocks } = useGetScheduleBlocksQuery({
    childId,
    startDate: today,
    endDate: today,
  })

  const urgentFlags = useMemo(
    () => (healthNotes ?? []).filter((n) => n.is_urgent && !n.is_resolved),
    [healthNotes]
  )

  const todayBlock = scheduleBlocks?.[0] ?? null
  const todayParent = useMemo(() => {
    if (!todayBlock || !coParents) return null
    return coParents.find((p) => p.user_id === todayBlock.parent_id) ?? null
  }, [todayBlock, coParents])

  const coParentMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(coParents ?? []).forEach((p) => {
      map[p.user_id] = p.label
    })
    return map
  }, [coParents])

  // --- Loading state ---
  if (childLoading) {
    return (
      <div className="space-y-6 py-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!child) return null

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 py-8"
    >
      {/* ── Hero ── */}
      <motion.div variants={itemVariants}>
        <div className="overflow-hidden rounded-xl bg-ink px-5 py-8 text-cream md:px-8 md:py-10">
          <p className="text-sm font-medium uppercase tracking-widest text-cream/50">
            Dashboard
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold italic md:text-4xl">
            {child.name}
          </h1>
          <p className="mt-1 text-base text-cream/70">
            {formatAge(child.date_of_birth)} old
          </p>
        </div>
      </motion.div>

      {/* ── Smart Summary ── */}
      <motion.div variants={itemVariants}>
        <SmartSummary childId={childId} />
      </motion.div>

      {/* ── Invite Co-Parent ── */}
      <motion.div variants={itemVariants}>
        <InviteCoParent childId={childId} />
      </motion.div>

      {/* ── Today's custody + Urgent flags row ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Custody block */}
        <Card>
          <p className="text-sm font-medium uppercase tracking-wide text-clay">
            Today
          </p>
          {todayParent ? (
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={todayParent.label} size="sm" color="sage" />
              <div>
                <p className="text-base font-medium text-ink">{todayParent.label}</p>
                {todayBlock?.label && (
                  <p className="text-sm text-ink/50">{todayBlock.label}</p>
                )}
                {todayBlock?.is_handoff && todayBlock.handoff_time && (
                  <Badge variant="mist" className="mt-1">
                    Handoff at {todayBlock.handoff_time}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-base italic text-ink/40">
              No custody block set for today
            </p>
          )}
        </Card>

        {/* Urgent flags */}
        <div className="space-y-3">
          {urgentFlags.length > 0 ? (
            urgentFlags.slice(0, 2).map((flag) => (
              <Card
                key={flag.id}
                className="border-terracotta/40 bg-terracotta/5"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-terracotta"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-base font-medium text-ink">{flag.title}</p>
                    {flag.detail && (
                      <p className="mt-0.5 text-sm text-ink/60 line-clamp-2">
                        {flag.detail}
                      </p>
                    )}
                    <Badge variant="terracotta" className="mt-1">
                      {flag.type}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="flex h-full items-center justify-center">
              <p className="text-base text-ink/40">No urgent health flags</p>
            </Card>
          )}
        </div>
      </motion.div>

      {/* ── Quick stat cards ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          {
            label: 'Photos',
            count: photos?.length ?? 0,
            icon: ImageIcon,
          },
          {
            label: 'Journal',
            count: journal?.length ?? 0,
            icon: NotebookPen,
          },
          {
            label: 'Milestones',
            count: milestones?.length ?? 0,
            icon: Milestone,
          },
          {
            label: 'Health',
            count: healthNotes?.length ?? 0,
            icon: Stethoscope,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/15">
                <stat.icon size={20} className="text-sage-deep" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink">{stat.count}</p>
                <p className="text-sm text-clay">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* ── Activity Feed ── */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="font-serif text-xl font-semibold text-ink">
            Recent Activity
          </h2>

          {activityLoading ? (
            <div className="mt-4 space-y-4">
              <Skeleton className="h-12 w-full" count={4} />
            </div>
          ) : !activity || activity.length === 0 ? (
            <p className="mt-4 text-base italic text-ink/40">
              No activity yet. Start by adding a photo or journal entry.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-mist">
              {activity.map((item) => {
                const Icon = activityIcons[item.type]
                const colorClass = activityColors[item.type]
                return (
                  <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        colorClass
                      )}
                    >
                      <Icon size={14} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium text-ink truncate">
                        {item.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-sm text-ink/50">
                        <span>{formatRelativeDate(item.created_at)}</span>
                        {coParentMap[item.author_id] && (
                          <>
                            <span aria-hidden="true">&middot;</span>
                            <span>{coParentMap[item.author_id]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
