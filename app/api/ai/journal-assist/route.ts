import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { childId, action } = body
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Generate writing prompts
    if (action === 'prompts') {
      const [child, recentJournal, recentMilestones, schedule] = await Promise.all([
        supabase.from('children').select('name, date_of_birth').eq('id', childId).single(),
        supabase.from('journal_entries').select('title, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
        supabase.from('milestones').select('title, category').eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
        supabase.from('schedule_blocks').select('label, date').eq('child_id', childId).order('date', { ascending: false }).limit(5),
      ])

      if (!child.data) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

      const context = `
Child: ${child.data.name} (born ${child.data.date_of_birth})
Recent journal titles: ${recentJournal.data?.map(j => j.title).join(', ') || 'None yet'}
Recent milestones: ${recentMilestones.data?.map(m => m.title).join(', ') || 'None yet'}
Recent schedule: ${schedule.data?.map(s => `${s.date}: ${s.label}`).join(', ') || 'None'}
`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are a gentle journal prompt generator for a co-parenting app. Generate 3 thoughtful, specific writing prompts for a parent to journal about their child. Base prompts on the child's age and recent activity. Prompts should feel warm and personal, not clinical.

Return JSON only:
[{"id": "1", "prompt": "The prompt question", "context": "Why this prompt is relevant"}]

${context}`,
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
      let prompts
      try {
        prompts = JSON.parse(text)
      } catch {
        const match = text.match(/\[[\s\S]*\]/)
        prompts = match ? JSON.parse(match[0]) : []
      }

      return NextResponse.json(prompts)
    }

    // Writing assistant — expand, refine, or soften text
    const { input } = body as { input: string; action: 'expand' | 'refine' | 'soften' }

    const instructions: Record<string, string> = {
      expand: 'Expand this brief note into a warm, descriptive journal paragraph. Keep the parent\'s voice and perspective. Add sensory details and emotional texture. Keep it to 1-2 paragraphs.',
      refine: 'Clean up this journal text — fix grammar, improve flow, but preserve the parent\'s authentic voice. Don\'t make it sound artificial or overly polished.',
      soften: 'Rewrite this text with a softer, more reflective tone. Remove any frustration or negativity while keeping the core observation honest. This journal is shared with a co-parent.',
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `${instructions[action]}\n\nOriginal text:\n${input}\n\nReturn only the rewritten text, no JSON, no explanation.`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : input

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Journal assist error:', error)
    return NextResponse.json({ error: 'Failed to assist' }, { status: 500 })
  }
}
