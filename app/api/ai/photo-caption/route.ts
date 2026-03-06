import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType, childName } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType || 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `You are a photo captioning assistant for a family co-parenting app. The child's name is ${childName}. Write a warm, natural caption for this photo (1-2 sentences). Also suggest 3-5 descriptive tags.

Return JSON only: {"caption": "...", "tags": ["tag1", "tag2"]}`,
          },
        ],
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    let result
    try {
      result = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      result = match ? JSON.parse(match[0]) : { caption: '', tags: [] }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Photo caption error:', error)
    return NextResponse.json({ error: 'Failed to caption photo' }, { status: 500 })
  }
}
