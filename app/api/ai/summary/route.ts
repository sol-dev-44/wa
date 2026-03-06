import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { subDays, format } from 'date-fns'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { childId } = await req.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const weekAgo = subDays(now, 7)
    const startDate = format(weekAgo, 'yyyy-MM-dd')
    const endDate = format(now, 'yyyy-MM-dd')

    const [child, journal, milestones, health, photos] = await Promise.all([
      supabase.from('children').select('name, date_of_birth').eq('id', childId).single(),
      supabase.from('journal_entries').select('title, body, mood, created_at').eq('child_id', childId).gte('created_at', weekAgo.toISOString()).order('created_at'),
      supabase.from('milestones').select('title, category, milestone_date').eq('child_id', childId).gte('created_at', weekAgo.toISOString()),
      supabase.from('health_notes').select('title, type, detail, is_urgent').eq('child_id', childId).gte('created_at', weekAgo.toISOString()),
      supabase.from('photos').select('caption, created_at').eq('child_id', childId).gte('created_at', weekAgo.toISOString()),
    ])

    if (!child.data) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

    const context = `
Child: ${child.data.name} (born ${child.data.date_of_birth})
Period: ${startDate} to ${endDate}

Journal entries (${journal.data?.length ?? 0}):
${journal.data?.map(j => `- "${j.title}": ${j.body.slice(0, 200)}${j.mood ? ` (mood: ${j.mood})` : ''}`).join('\n') || 'None this week'}

Milestones (${milestones.data?.length ?? 0}):
${milestones.data?.map(m => `- ${m.title} (${m.category}, ${m.milestone_date})`).join('\n') || 'None this week'}

Health notes (${health.data?.length ?? 0}):
${health.data?.map(h => `- ${h.title} (${h.type})${h.is_urgent ? ' [URGENT]' : ''}: ${h.detail || ''}`).join('\n') || 'None this week'}

Photos uploaded: ${photos.data?.length ?? 0}
${photos.data?.filter(p => p.caption).map(p => `- "${p.caption}"`).join('\n') || ''}
`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a warm, caring family journal assistant for a co-parenting app called Wa. Write a brief, heartfelt weekly summary for the parents about their child's week. Use an editorial, magazine-like tone — warm but not saccharine. Keep it to 3-4 short paragraphs. Reference specific events from the data. If there are urgent health items, mention them gently but clearly. If there's little data, keep it shorter and encouraging.

${context}`
      }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Cache the summary
    await supabase.from('summaries').insert({
      child_id: childId,
      period_start: startDate,
      period_end: endDate,
      content,
    })

    return NextResponse.json({ content, period_start: startDate, period_end: endDate })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
