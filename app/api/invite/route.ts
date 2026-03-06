import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required.' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: invite, error } = await supabase
    .from('invites')
    .select('id, used, expires_at, child_id')
    .eq('token', token)
    .single()

  if (error || !invite) {
    return NextResponse.json({ error: 'Invite not found.' }, { status: 404 })
  }

  if (invite.used) {
    return NextResponse.json({ error: 'This invite has already been used.' }, { status: 410 })
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite has expired.' }, { status: 410 })
  }

  const { data: child } = await supabase
    .from('children')
    .select('name')
    .eq('id', invite.child_id)
    .single()

  return NextResponse.json({
    child_name: child?.name ?? 'your child',
    inviter_name: 'A co-parent',
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: { child_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { child_id } = body

  if (!child_id) {
    return NextResponse.json({ error: 'child_id is required.' }, { status: 400 })
  }

  const { data: coParent, error: coParentError } = await supabase
    .from('co_parents')
    .select('id')
    .eq('user_id', user.id)
    .eq('child_id', child_id)
    .single()

  if (coParentError || !coParent) {
    return NextResponse.json({ error: 'You are not a co-parent of this child.' }, { status: 403 })
  }

  const { data: invite, error: insertError } = await supabase
    .from('invites')
    .insert({
      child_id,
      created_by: user.id,
    })
    .select('token')
    .single()

  if (insertError || !invite) {
    return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 })
  }

  return NextResponse.json({ token: invite.token })
}
