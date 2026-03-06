import { z } from 'zod'

export const childSchema = z.object({
  name: z.string().min(1).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const photoSchema = z.object({
  caption: z.string().max(500).optional(),
  taken_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export const journalEntrySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: z.string().optional(),
  tags: z.array(z.string()).max(8),
})

export const milestoneSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  category: z.enum(['Physical', 'Academic', 'Social', 'Emotional', 'Creative', 'Other']),
  icon: z.string().optional(),
  milestone_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  celebrated: z.boolean(),
})

export const healthNoteSchema = z.object({
  type: z.enum(['Medication', 'Appointment', 'Allergy', 'Wellness', 'Injury', 'Dental', 'Vision']),
  title: z.string().min(1).max(120),
  detail: z.string().max(1000).optional(),
  note_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_urgent: z.boolean(),
})

export const scheduleBlockSchema = z.object({
  parent_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  label: z.string().max(200).optional(),
  is_handoff: z.boolean(),
  handoff_time: z.string().optional(),
  handoff_note: z.string().max(500).optional(),
})

export const documentSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['Legal', 'Medical', 'Education', 'Insurance', 'Activities', 'Other']),
  doc_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
