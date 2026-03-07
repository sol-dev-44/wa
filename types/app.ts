import type { Tables } from './database'

export type Child = Tables<'children'>
export type CoParent = Tables<'co_parents'>
export type Photo = Tables<'photos'>
export type JournalEntry = Tables<'journal_entries'>
export type Milestone = Tables<'milestones'>
export type HealthNote = Tables<'health_notes'>
export type ScheduleBlock = Tables<'schedule_blocks'>
export type Document = Tables<'child_documents'>
export type Summary = Tables<'summaries'>
export type Message = Tables<'messages'>
export type MilestoneSuggestion = Tables<'milestone_suggestions'>

export type CoParentWithUser = CoParent & {
  email?: string
  display_name?: string
}

export type ChildWithParents = Child & {
  co_parents: CoParent[]
}

export type ActivityFeedItem = {
  id: string
  type: 'photo' | 'journal' | 'milestone' | 'health'
  title: string
  preview?: string
  author_id: string
  author_label?: string
  created_at: string
}

export type AISummary = {
  content: string
  period_start: string
  period_end: string
  generated_at: string
}

export type AIHealthInsight = {
  id: string
  pattern: string
  detail: string
  severity: 'info' | 'notice' | 'alert'
  related_note_ids: string[]
}

export type AIJournalPrompt = {
  id: string
  prompt: string
  context: string
}
