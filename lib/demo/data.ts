import type { Tables } from '@/types/database'
import type { ActivityFeedItem } from '@/types/app'

// ── Fixed IDs ──
export const DEMO_CHILD_ID = 'demo-child-001'
export const DEMO_PARENT_A_ID = 'demo-parent-a'
export const DEMO_PARENT_B_ID = 'demo-parent-b'

// ── Child ──
export const DEMO_CHILD: Tables<'children'> = {
  id: DEMO_CHILD_ID,
  name: 'Olivia',
  date_of_birth: '2024-01-15',
  avatar_url: null,
  created_at: '2024-01-20T00:00:00Z',
}

// ── Co-Parents ──
export const DEMO_CO_PARENTS: Tables<'co_parents'>[] = [
  {
    id: 'demo-cp-a',
    child_id: DEMO_CHILD_ID,
    user_id: DEMO_PARENT_A_ID,
    label: 'Sarah',
    color: 'sage',
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'demo-cp-b',
    child_id: DEMO_CHILD_ID,
    user_id: DEMO_PARENT_B_ID,
    label: 'James',
    color: 'clay',
    created_at: '2024-01-20T00:00:00Z',
  },
]

// ── Journal Entries ──
export const DEMO_JOURNAL: Tables<'journal_entries'>[] = [
  {
    id: 'demo-j-1',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    title: 'First words at the park',
    body: 'Olivia said "duck!" today while we were feeding the ducks at Elm Park. She was so excited, pointing and repeating it over and over. She also tried to say "bread" but it came out as "beh." Such a wonderful morning together.',
    entry_date: '2026-03-05',
    mood: 'joyful',
    tags: ['language', 'outdoors', 'milestone'],
    created_at: '2026-03-05T10:30:00Z',
    updated_at: '2026-03-05T10:30:00Z',
  },
  {
    id: 'demo-j-2',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    title: 'Bedtime routine getting easier',
    body: 'She actually asked for her toothbrush tonight and brushed (mostly chewed) by herself for a solid minute. Then we read "Goodnight Moon" twice. She fell asleep within 10 minutes of lights out. The consistent routine is really paying off.',
    entry_date: '2026-03-03',
    mood: 'calm',
    tags: ['routine', 'sleep', 'independence'],
    created_at: '2026-03-03T20:45:00Z',
    updated_at: '2026-03-03T20:45:00Z',
  },
  {
    id: 'demo-j-3',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    title: 'Playdate with cousin Maya',
    body: 'Olivia and Maya played together so well today. They were sharing blocks and even took turns on the slide. Olivia gave Maya a hug when she was leaving. Really proud of how her social skills are developing.',
    entry_date: '2026-03-01',
    mood: 'proud',
    tags: ['social', 'family', 'sharing'],
    created_at: '2026-03-01T15:00:00Z',
    updated_at: '2026-03-01T15:00:00Z',
  },
  {
    id: 'demo-j-4',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    title: 'Trying new foods',
    body: 'Made sweet potato pancakes for breakfast and she loved them! Also tried avocado toast for the first time and ate the whole piece. Still not a fan of broccoli though. Progress!',
    entry_date: '2026-02-27',
    mood: 'happy',
    tags: ['food', 'nutrition'],
    created_at: '2026-02-27T09:15:00Z',
    updated_at: '2026-02-27T09:15:00Z',
  },
  {
    id: 'demo-j-5',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    title: 'Rainy day crafts',
    body: 'We did finger painting today since it was raining. She mixed blue and yellow and was amazed when it turned green. She kept saying "more more!" Used up an entire pad of paper. The kitchen was a mess but totally worth it.',
    entry_date: '2026-02-24',
    mood: 'creative',
    tags: ['art', 'learning', 'indoor'],
    created_at: '2026-02-24T14:00:00Z',
    updated_at: '2026-02-24T14:00:00Z',
  },
]

// ── Milestones ──
export const DEMO_MILESTONES: Tables<'milestones'>[] = [
  {
    id: 'demo-m-1',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    title: 'Said first two-word sentence',
    description: 'Said "more milk" clearly at breakfast. Both words together!',
    category: 'Language',
    icon: null,
    milestone_date: '2026-03-04',
    age_label: '2 years, 1 month',
    celebrated: true,
    created_at: '2026-03-04T08:30:00Z',
  },
  {
    id: 'demo-m-2',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    title: 'Climbed playground ladder solo',
    description: 'Made it all the way up the 5-rung ladder at the park without help and went down the slide by herself.',
    category: 'Physical',
    icon: null,
    milestone_date: '2026-02-20',
    age_label: '2 years, 1 month',
    celebrated: true,
    created_at: '2026-02-20T11:00:00Z',
  },
  {
    id: 'demo-m-3',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    title: 'Started using a spoon independently',
    description: 'Ate an entire bowl of yogurt with a spoon by herself. Only minor spills!',
    category: 'Self-care',
    icon: null,
    milestone_date: '2026-02-10',
    age_label: '2 years',
    celebrated: true,
    created_at: '2026-02-10T12:30:00Z',
  },
  {
    id: 'demo-m-4',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    title: 'Recognized own name in writing',
    description: 'Pointed at her name tag at daycare and said "Livia!" Getting closer to the full name.',
    category: 'Cognitive',
    icon: null,
    milestone_date: '2026-01-28',
    age_label: '2 years',
    celebrated: false,
    created_at: '2026-01-28T16:00:00Z',
  },
  {
    id: 'demo-m-5',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    title: 'First time saying "I love you"',
    description: 'Said "luh you mama" at bedtime. Heart completely melted.',
    category: 'Language',
    icon: null,
    milestone_date: '2026-01-15',
    age_label: '2 years',
    celebrated: true,
    created_at: '2026-01-15T20:00:00Z',
  },
]

// ── Health Notes ──
export const DEMO_HEALTH_NOTES: Tables<'health_notes'>[] = [
  {
    id: 'demo-h-1',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    type: 'Appointment',
    title: '2-year well-child checkup',
    detail: 'Dr. Patel says everything looks great. Height 34", weight 27 lbs (both 60th percentile). Next visit at 2.5 years. Recommended starting fluoride toothpaste.',
    note_date: '2026-02-15',
    is_urgent: false,
    is_resolved: true,
    created_at: '2026-02-15T14:00:00Z',
  },
  {
    id: 'demo-h-2',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    type: 'Allergy',
    title: 'Possible dairy sensitivity',
    detail: 'Noticed she gets a bit of a rash after having too much cheese. Going to monitor and discuss with pediatrician. No issues with yogurt or milk so far.',
    note_date: '2026-03-01',
    is_urgent: true,
    is_resolved: false,
    created_at: '2026-03-01T18:00:00Z',
  },
  {
    id: 'demo-h-3',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    type: 'Dental',
    title: 'First dentist visit',
    detail: 'All 20 baby teeth are in. No cavities. Dentist recommended brushing twice daily with a rice-grain amount of fluoride toothpaste. Next visit in 6 months.',
    note_date: '2026-01-20',
    is_urgent: false,
    is_resolved: true,
    created_at: '2026-01-20T10:30:00Z',
  },
  {
    id: 'demo-h-4',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    type: 'Wellness',
    title: 'Sleep schedule update',
    detail: 'Transitioned from two naps to one. Now napping 12:30-2:30pm and sleeping 7:30pm-6:30am. Much smoother bedtimes at both houses since the switch.',
    note_date: '2026-02-01',
    is_urgent: false,
    is_resolved: true,
    created_at: '2026-02-01T08:00:00Z',
  },
]

// ── Messages ──
export const DEMO_MESSAGES: Tables<'messages'>[] = [
  {
    id: 'demo-msg-1',
    child_id: DEMO_CHILD_ID,
    sender_id: DEMO_PARENT_A_ID,
    body: 'Hey! Olivia had a great day at the park. She said "duck" for the first time!',
    created_at: '2026-03-05T17:00:00Z',
  },
  {
    id: 'demo-msg-2',
    child_id: DEMO_CHILD_ID,
    sender_id: DEMO_PARENT_B_ID,
    body: "That's amazing! She's been pointing at the duck book a lot here too. Must be her new favorite animal.",
    created_at: '2026-03-05T17:05:00Z',
  },
  {
    id: 'demo-msg-3',
    child_id: DEMO_CHILD_ID,
    sender_id: DEMO_PARENT_A_ID,
    body: "Quick heads up - she barely touched lunch today. Had a big snack around 3pm though so she might not be super hungry at dinner.",
    created_at: '2026-03-05T17:10:00Z',
  },
  {
    id: 'demo-msg-4',
    child_id: DEMO_CHILD_ID,
    sender_id: DEMO_PARENT_B_ID,
    body: 'Good to know, thanks. I\'ll do something light. Also, can we talk about the schedule for next week? My mom wants to visit Thursday.',
    created_at: '2026-03-05T17:15:00Z',
  },
  {
    id: 'demo-msg-5',
    child_id: DEMO_CHILD_ID,
    sender_id: DEMO_PARENT_A_ID,
    body: "Thursday works! That's your day anyway. Olivia loves seeing grandma. Maybe we can swap Friday to Saturday for the handoff?",
    created_at: '2026-03-05T17:22:00Z',
  },
  {
    id: 'demo-msg-6',
    child_id: DEMO_CHILD_ID,
    sender_id: DEMO_PARENT_B_ID,
    body: 'Saturday morning works perfectly. I\'ll update the schedule. Thanks for being flexible!',
    created_at: '2026-03-05T17:25:00Z',
  },
]

// ── Schedule Blocks (this week) ──
function getScheduleBlocks(): Tables<'schedule_blocks'>[] {
  const today = new Date()
  const blocks: Tables<'schedule_blocks'>[] = []

  for (let i = -3; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const isEvenDay = date.getDate() % 2 === 0
    const parentId = isEvenDay ? DEMO_PARENT_A_ID : DEMO_PARENT_B_ID
    const dayOfWeek = date.getDay()
    const isHandoff = dayOfWeek === 0 || dayOfWeek === 3

    blocks.push({
      id: `demo-sched-${dateStr}`,
      child_id: DEMO_CHILD_ID,
      parent_id: parentId,
      date: dateStr,
      label: isHandoff ? 'Handoff day' : null,
      is_handoff: isHandoff,
      handoff_time: isHandoff ? '10:00' : null,
      handoff_note: isHandoff ? 'Meet at usual spot' : null,
      created_at: '2026-01-01T00:00:00Z',
    })
  }

  return blocks
}

export const DEMO_SCHEDULE_BLOCKS = getScheduleBlocks()

// ── Photos ──
// storage_path doubles as direct URL in demo mode (Unsplash free images)
export const DEMO_PHOTOS: Tables<'photos'>[] = [
  {
    id: 'demo-photo-1',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    storage_path: 'data:image/jpeg;base64,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',
    caption: 'Feeding the ducks at Elm Park',
    taken_at: '2026-03-05',
    created_at: '2026-03-05T10:30:00Z',
  },
  {
    id: 'demo-photo-2',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    storage_path: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&fit=crop',
    caption: 'Finger painting masterpiece',
    taken_at: '2026-02-24',
    created_at: '2026-02-24T14:30:00Z',
  },
  {
    id: 'demo-photo-3',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    storage_path: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&q=80&fit=crop',
    caption: 'Conquered the big slide!',
    taken_at: '2026-02-20',
    created_at: '2026-02-20T11:15:00Z',
  },
  {
    id: 'demo-photo-4',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    storage_path: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80&fit=crop',
    caption: 'Goodnight Moon for the 100th time',
    taken_at: '2026-03-03',
    created_at: '2026-03-03T19:45:00Z',
  },
  {
    id: 'demo-photo-5',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_A_ID,
    storage_path: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80&fit=crop',
    caption: 'Morning giggles before daycare',
    taken_at: '2026-02-18',
    created_at: '2026-02-18T08:00:00Z',
  },
  {
    id: 'demo-photo-6',
    child_id: DEMO_CHILD_ID,
    author_id: DEMO_PARENT_B_ID,
    storage_path: 'data:image/jpeg;base64,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',
    caption: 'Baking cookies with daddy',
    taken_at: '2026-02-14',
    created_at: '2026-02-14T16:00:00Z',
  },
]

// ── Documents ──
export const DEMO_DOCUMENTS: Tables<'child_documents'>[] = [
  {
    id: 'demo-doc-1',
    child_id: DEMO_CHILD_ID,
    uploaded_by: DEMO_PARENT_A_ID,
    storage_path: 'demo/well-child-checkup.pdf',
    name: '2-Year Well-Child Checkup Summary',
    type: 'Medical',
    doc_date: '2026-02-15',
    file_size: 245000,
    created_at: '2026-02-15T15:00:00Z',
  },
  {
    id: 'demo-doc-2',
    child_id: DEMO_CHILD_ID,
    uploaded_by: DEMO_PARENT_B_ID,
    storage_path: 'demo/custody-agreement.pdf',
    name: 'Parenting Plan Agreement',
    type: 'Legal',
    doc_date: '2024-03-01',
    file_size: 890000,
    created_at: '2024-03-01T12:00:00Z',
  },
  {
    id: 'demo-doc-3',
    child_id: DEMO_CHILD_ID,
    uploaded_by: DEMO_PARENT_A_ID,
    storage_path: 'demo/immunization-record.pdf',
    name: 'Immunization Record',
    type: 'Medical',
    doc_date: '2026-02-15',
    file_size: 150000,
    created_at: '2026-02-15T15:30:00Z',
  },
]

// ── Summary ──
export const DEMO_SUMMARY: Tables<'summaries'> = {
  id: 'demo-summary-1',
  child_id: DEMO_CHILD_ID,
  period_start: '2026-02-28',
  period_end: '2026-03-07',
  content: "Olivia had an exciting week with several language breakthroughs. She said her first two-word sentence (\"more milk\") and named a duck at the park. She's eating well with new foods like sweet potato pancakes, though a possible dairy sensitivity is being monitored. Her sleep schedule is stable with the one-nap transition. Both parents note she's becoming more independent and social, sharing well during a playdate with cousin Maya.",
  created_at: '2026-03-07T06:00:00Z',
}

// ── Milestone Suggestions ──
export const DEMO_MILESTONE_SUGGESTIONS: Tables<'milestone_suggestions'>[] = [
  {
    id: 'demo-ms-1',
    child_id: DEMO_CHILD_ID,
    title: 'Counts to five',
    description: 'Based on recent journal entries about her learning progress, she may be ready for this milestone soon.',
    category: 'Cognitive',
    suggested_date: '2026-03-10',
    source_context: 'Journal entries mention counting blocks during play',
    status: 'pending',
    created_at: '2026-03-06T00:00:00Z',
  },
  {
    id: 'demo-ms-2',
    child_id: DEMO_CHILD_ID,
    title: 'Draws a circle',
    description: 'Her finger painting sessions suggest developing fine motor control.',
    category: 'Physical',
    suggested_date: '2026-03-15',
    source_context: 'Multiple art-related journal entries',
    status: 'pending',
    created_at: '2026-03-06T00:00:00Z',
  },
]

// ── Activity Feed ──
export const DEMO_ACTIVITY: ActivityFeedItem[] = [
  {
    id: 'demo-j-1',
    type: 'journal',
    title: 'First words at the park',
    preview: 'Olivia said "duck!" today while we were feeding the ducks at Elm Park...',
    author_id: DEMO_PARENT_A_ID,
    created_at: '2026-03-05T10:30:00Z',
  },
  {
    id: 'demo-m-1',
    type: 'milestone',
    title: 'Said first two-word sentence',
    preview: 'Said "more milk" clearly at breakfast.',
    author_id: DEMO_PARENT_A_ID,
    created_at: '2026-03-04T08:30:00Z',
  },
  {
    id: 'demo-j-2',
    type: 'journal',
    title: 'Bedtime routine getting easier',
    preview: 'She actually asked for her toothbrush tonight...',
    author_id: DEMO_PARENT_B_ID,
    created_at: '2026-03-03T20:45:00Z',
  },
  {
    id: 'demo-photo-1',
    type: 'photo',
    title: 'Feeding the ducks at Elm Park',
    author_id: DEMO_PARENT_A_ID,
    created_at: '2026-03-05T10:30:00Z',
  },
  {
    id: 'demo-h-2',
    type: 'health',
    title: 'Possible dairy sensitivity',
    preview: 'Noticed she gets a bit of a rash after having too much cheese...',
    author_id: DEMO_PARENT_B_ID,
    created_at: '2026-03-01T18:00:00Z',
  },
  {
    id: 'demo-j-3',
    type: 'journal',
    title: 'Playdate with cousin Maya',
    preview: 'Olivia and Maya played together so well today...',
    author_id: DEMO_PARENT_A_ID,
    created_at: '2026-03-01T15:00:00Z',
  },
  {
    id: 'demo-photo-3',
    type: 'photo',
    title: 'Conquered the big slide!',
    author_id: DEMO_PARENT_A_ID,
    created_at: '2026-02-20T11:15:00Z',
  },
  {
    id: 'demo-m-2',
    type: 'milestone',
    title: 'Climbed playground ladder solo',
    preview: 'Made it all the way up the 5-rung ladder at the park...',
    author_id: DEMO_PARENT_B_ID,
    created_at: '2026-02-20T11:00:00Z',
  },
]
