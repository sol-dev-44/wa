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

    const [child, recentJournal, recentHealth, existingMilestones] = await Promise.all([
      supabase.from('children').select('name, date_of_birth').eq('id', childId).single(),
      supabase.from('journal_entries').select('title, body, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(20),
      supabase.from('health_notes').select('title, type, detail').eq('child_id', childId).order('created_at', { ascending: false }).limit(10),
      supabase.from('milestones').select('title, category').eq('child_id', childId),
    ])

    if (!child.data) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

    const context = `
Child: ${child.data.name} (born ${child.data.date_of_birth})

Recent journal entries:
${recentJournal.data?.map(j => `- "${j.title}": ${j.body.slice(0, 150)}`).join('\n') || 'None'}

Recent health notes:
${recentHealth.data?.map(h => `- ${h.title} (${h.type})`).join('\n') || 'None'}

Already recorded milestones:
${existingMilestones.data?.map(m => `- ${m.title} (${m.category})`).join('\n') || 'None yet'}
`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are a milestone tracker for a co-parenting app. Based on the child's age and recent activity, suggest 2-4 milestones the parents might want to record. Only suggest milestones that seem evidenced by the journal/health data — don't make things up. Don't duplicate existing milestones.

Return JSON only, no other text:
[{"title": "...", "description": "...", "category": "Physical|Academic|Social|Emotional|Creative|Other", "suggested_date": "YYYY-MM-DD"}]

${context}`
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
    let suggestions
    try {
      suggestions = JSON.parse(text)
    } catch {
      const match = text.match(/\[[\s\S]*\]/)
      suggestions = match ? JSON.parse(match[0]) : []
    }

    // Save suggestions to DB
    if (suggestions.length > 0) {
      await supabase.from('milestone_suggestions').insert(
        suggestions.map((s: { title: string; description: string; category: string; suggested_date: string }) => ({
          child_id: childId,
          title: s.title,
          description: s.description,
          category: s.category,
          suggested_date: s.suggested_date,
          source_context: 'AI analysis of recent entries',
          status: 'pending',
        }))
      )
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Milestone suggestion error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
