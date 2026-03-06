import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { childId } = await req.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [child, healthNotes] = await Promise.all([
      supabase.from('children').select('name, date_of_birth').eq('id', childId).single(),
      supabase.from('health_notes').select('*').eq('child_id', childId).order('note_date', { ascending: false }).limit(50),
    ])

    if (!child.data) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

    if (!healthNotes.data || healthNotes.data.length < 2) {
      return NextResponse.json([])
    }

    const context = `
Child: ${child.data.name} (born ${child.data.date_of_birth})

Health notes history (newest first):
${healthNotes.data.map(h => `- [${h.note_date}] ${h.title} (${h.type}) ${h.is_urgent ? '[URGENT]' : ''} ${h.is_resolved ? '[RESOLVED]' : '[ACTIVE]'}: ${h.detail || 'no detail'}`).join('\n')}
`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a health pattern analyzer for a co-parenting app. Review this child's health notes and identify any meaningful patterns, recurring issues, or things parents should be aware of. Be helpful but not alarmist. You are NOT a doctor — frame insights as observations, not diagnoses.

Return JSON only, no other text:
[{"id": "unique-id", "pattern": "Brief title", "detail": "1-2 sentence explanation", "severity": "info|notice|alert", "related_note_ids": []}]

Return empty array [] if no meaningful patterns found.

${context}`
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    let insights
    try {
      insights = JSON.parse(text)
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      insights = match ? JSON.parse(match[0]) : []
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Health insights error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
