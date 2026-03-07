import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode } from '@/lib/demo/mode'
import {
  DEMO_CHILD,
  DEMO_CHILD_ID,
  DEMO_CO_PARENTS,
  DEMO_PHOTOS,
  DEMO_JOURNAL,
  DEMO_MILESTONES,
  DEMO_HEALTH_NOTES,
  DEMO_SCHEDULE_BLOCKS,
  DEMO_DOCUMENTS,
  DEMO_ACTIVITY,
  DEMO_SUMMARY,
  DEMO_MILESTONE_SUGGESTIONS,
  DEMO_MESSAGES,
  DEMO_PARENT_A_ID,
} from '@/lib/demo/data'
import type { Tables, InsertTables, UpdateTables } from '@/types/database'
import type { ActivityFeedItem } from '@/types/app'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Children', 'CoParents', 'Photos', 'Journal', 'Milestones',
    'Health', 'Schedule', 'Documents', 'Activity', 'Summaries', 'MilestoneSuggestions', 'Messages',
  ],
  endpoints: (builder) => ({
    // ── Children ──
    getChildren: builder.query<Tables<'children'>[], void>({
      queryFn: async () => {
        if (isDemoMode()) return { data: [DEMO_CHILD] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .order('created_at')
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: ['Children'],
    }),

    getChild: builder.query<Tables<'children'>, string>({
      queryFn: async (id) => {
        if (isDemoMode()) return { data: DEMO_CHILD }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('id', id)
          .single()
        if (error) return { error }
        return { data }
      },
      providesTags: (_r, _e, id) => [{ type: 'Children', id }],
    }),

    addChild: builder.mutation<Tables<'children'>, { name: string; date_of_birth: string; label?: string }>({
      queryFn: async ({ name, date_of_birth, label }) => {
        if (isDemoMode()) return { data: DEMO_CHILD }
        const supabase = createClient()
        const { data, error } = await supabase.rpc('create_child', {
          p_name: name,
          p_date_of_birth: date_of_birth,
          p_label: label ?? 'Parent A',
        })
        if (error) return { error }
        // rpc returns the new child row
        return { data: data as Tables<'children'> }
      },
      invalidatesTags: ['Children'],
    }),

    // ── Co-Parents ──
    getCoParents: builder.query<Tables<'co_parents'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_CO_PARENTS }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('co_parents')
          .select('*')
          .eq('child_id', childId)
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'CoParents', id: childId }],
    }),

    // ── Photos ──
    getPhotos: builder.query<Tables<'photos'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_PHOTOS }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'Photos', id: childId }],
    }),

    addPhoto: builder.mutation<Tables<'photos'>, InsertTables<'photos'>>({
      queryFn: async (photo) => {
        if (isDemoMode()) return { data: DEMO_PHOTOS[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('photos')
          .insert(photo)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Photos', id: arg.child_id },
        'Activity',
      ],
    }),

    updatePhoto: builder.mutation<Tables<'photos'>, { id: string; changes: UpdateTables<'photos'> }>({
      queryFn: async ({ id, changes }) => {
        if (isDemoMode()) return { data: DEMO_PHOTOS[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('photos')
          .update(changes)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Photos' }],
    }),

    deletePhoto: builder.mutation<void, { id: string; storagePath: string }>({
      queryFn: async ({ id, storagePath }) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        await supabase.storage.from('photos').remove([storagePath])
        const { error } = await supabase.from('photos').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Photos', 'Activity'],
    }),

    // ── Journal ──
    getJournalEntries: builder.query<Tables<'journal_entries'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_JOURNAL }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'Journal', id: childId }],
    }),

    addJournalEntry: builder.mutation<Tables<'journal_entries'>, InsertTables<'journal_entries'>>({
      queryFn: async (entry) => {
        if (isDemoMode()) return { data: DEMO_JOURNAL[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entry)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Journal', id: arg.child_id },
        'Activity', 'MilestoneSuggestions',
      ],
    }),

    updateJournalEntry: builder.mutation<Tables<'journal_entries'>, { id: string; changes: UpdateTables<'journal_entries'> }>({
      queryFn: async ({ id, changes }) => {
        if (isDemoMode()) return { data: DEMO_JOURNAL[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('journal_entries')
          .update({ ...changes, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Journal'],
    }),

    deleteJournalEntry: builder.mutation<void, string>({
      queryFn: async (id) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        const { error } = await supabase.from('journal_entries').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Journal', 'Activity'],
    }),

    // ── Milestones ──
    getMilestones: builder.query<Tables<'milestones'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_MILESTONES }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('milestones')
          .select('*')
          .eq('child_id', childId)
          .order('milestone_date', { ascending: false })
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'Milestones', id: childId }],
    }),

    addMilestone: builder.mutation<Tables<'milestones'>, InsertTables<'milestones'>>({
      queryFn: async (milestone) => {
        if (isDemoMode()) return { data: DEMO_MILESTONES[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('milestones')
          .insert(milestone)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Milestones', id: arg.child_id },
        'Activity',
      ],
    }),

    updateMilestone: builder.mutation<Tables<'milestones'>, { id: string; changes: UpdateTables<'milestones'> }>({
      queryFn: async ({ id, changes }) => {
        if (isDemoMode()) return { data: DEMO_MILESTONES[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('milestones')
          .update(changes)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Milestones'],
    }),

    deleteMilestone: builder.mutation<void, string>({
      queryFn: async (id) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        const { error } = await supabase.from('milestones').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Milestones', 'Activity'],
    }),

    // ── Health Notes ──
    getHealthNotes: builder.query<Tables<'health_notes'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_HEALTH_NOTES }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('health_notes')
          .select('*')
          .eq('child_id', childId)
          .order('note_date', { ascending: false })
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'Health', id: childId }],
    }),

    addHealthNote: builder.mutation<Tables<'health_notes'>, InsertTables<'health_notes'>>({
      queryFn: async (note) => {
        if (isDemoMode()) return { data: DEMO_HEALTH_NOTES[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('health_notes')
          .insert(note)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Health', id: arg.child_id },
        'Activity',
      ],
    }),

    updateHealthNote: builder.mutation<Tables<'health_notes'>, { id: string; changes: UpdateTables<'health_notes'> }>({
      queryFn: async ({ id, changes }) => {
        if (isDemoMode()) return { data: DEMO_HEALTH_NOTES[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('health_notes')
          .update(changes)
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Health'],
    }),

    deleteHealthNote: builder.mutation<void, string>({
      queryFn: async (id) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        const { error } = await supabase.from('health_notes').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Health', 'Activity'],
    }),

    // ── Schedule ──
    getScheduleBlocks: builder.query<Tables<'schedule_blocks'>[], { childId: string; startDate: string; endDate: string }>({
      queryFn: async ({ childId, startDate, endDate }) => {
        if (isDemoMode()) {
          const filtered = DEMO_SCHEDULE_BLOCKS.filter(
            (b) => b.date >= startDate && b.date <= endDate
          )
          return { data: filtered }
        }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('schedule_blocks')
          .select('*')
          .eq('child_id', childId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date')
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: ['Schedule'],
    }),

    upsertScheduleBlock: builder.mutation<Tables<'schedule_blocks'>, InsertTables<'schedule_blocks'>>({
      queryFn: async (block) => {
        if (isDemoMode()) return { data: DEMO_SCHEDULE_BLOCKS[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('schedule_blocks')
          .upsert(block, { onConflict: 'id' })
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['Schedule'],
    }),

    deleteScheduleBlock: builder.mutation<void, string>({
      queryFn: async (id) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        const { error } = await supabase.from('schedule_blocks').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Schedule'],
    }),

    // ── Documents ──
    getDocuments: builder.query<Tables<'child_documents'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_DOCUMENTS }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('child_documents')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'Documents', id: childId }],
    }),

    addDocument: builder.mutation<Tables<'child_documents'>, InsertTables<'child_documents'>>({
      queryFn: async (doc) => {
        if (isDemoMode()) return { data: DEMO_DOCUMENTS[0] }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('child_documents')
          .insert(doc)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Documents', id: arg.child_id }],
    }),

    deleteDocument: builder.mutation<void, { id: string; storagePath: string }>({
      queryFn: async ({ id, storagePath }) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        await supabase.storage.from('documents').remove([storagePath])
        const { error } = await supabase.from('child_documents').delete().eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['Documents'],
    }),

    getDocumentUrl: builder.query<string, string>({
      queryFn: async (storagePath) => {
        if (isDemoMode()) return { data: '#' }
        const supabase = createClient()
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(storagePath, 3600)
        if (error) return { error }
        return { data: data.signedUrl }
      },
    }),

    // ── Activity Feed ──
    getActivityFeed: builder.query<ActivityFeedItem[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_ACTIVITY }
        const supabase = createClient()
        const [photos, journal, milestones, health] = await Promise.all([
          supabase.from('photos').select('id, author_id, caption, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(10),
          supabase.from('journal_entries').select('id, author_id, title, body, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(10),
          supabase.from('milestones').select('id, author_id, title, description, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(10),
          supabase.from('health_notes').select('id, author_id, title, detail, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(10),
        ])

        const items: ActivityFeedItem[] = [
          ...(photos.data ?? []).map((p) => ({
            id: p.id, type: 'photo' as const, title: p.caption || 'New photo',
            author_id: p.author_id, created_at: p.created_at,
          })),
          ...(journal.data ?? []).map((j) => ({
            id: j.id, type: 'journal' as const, title: j.title,
            preview: j.body.slice(0, 100), author_id: j.author_id, created_at: j.created_at,
          })),
          ...(milestones.data ?? []).map((m) => ({
            id: m.id, type: 'milestone' as const, title: m.title,
            preview: m.description ?? undefined, author_id: m.author_id, created_at: m.created_at,
          })),
          ...(health.data ?? []).map((h) => ({
            id: h.id, type: 'health' as const, title: h.title,
            preview: h.detail ?? undefined, author_id: h.author_id, created_at: h.created_at,
          })),
        ]

        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        return { data: items.slice(0, 10) }
      },
      providesTags: ['Activity'],
    }),

    // ── Summaries ──
    getLatestSummary: builder.query<Tables<'summaries'> | null, string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_SUMMARY }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('summaries')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (error) return { error }
        return { data }
      },
      providesTags: ['Summaries'],
    }),

    // ── Milestone Suggestions ──
    getMilestoneSuggestions: builder.query<Tables<'milestone_suggestions'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_MILESTONE_SUGGESTIONS }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('milestone_suggestions')
          .select('*')
          .eq('child_id', childId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'MilestoneSuggestions', id: childId }],
    }),

    updateMilestoneSuggestion: builder.mutation<void, { id: string; status: 'accepted' | 'dismissed' }>({
      queryFn: async ({ id, status }) => {
        if (isDemoMode()) return { data: undefined }
        const supabase = createClient()
        const { error } = await supabase
          .from('milestone_suggestions')
          .update({ status })
          .eq('id', id)
        if (error) return { error }
        return { data: undefined }
      },
      invalidatesTags: ['MilestoneSuggestions'],
    }),

    // ── Profile ──
    getCurrentCoParent: builder.query<Tables<'co_parents'> | null, string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_CO_PARENTS[0] }
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: { message: 'Not authenticated' } }
        const { data, error } = await supabase
          .from('co_parents')
          .select('*')
          .eq('child_id', childId)
          .eq('user_id', user.id)
          .maybeSingle()
        if (error) return { error }
        return { data }
      },
      providesTags: (_r, _e, childId) => [{ type: 'CoParents', id: childId }],
    }),

    updateCoParentLabel: builder.mutation<Tables<'co_parents'>, { id: string; label: string }>({
      queryFn: async ({ id, label }) => {
        if (isDemoMode()) return { data: { ...DEMO_CO_PARENTS[0], label } }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('co_parents')
          .update({ label })
          .eq('id', id)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: ['CoParents'],
    }),

    // ── Messages ──
    getMessages: builder.query<Tables<'messages'>[], string>({
      queryFn: async (childId) => {
        if (isDemoMode()) return { data: DEMO_MESSAGES }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: true })
          .limit(100)
        if (error) return { error }
        return { data: data ?? [] }
      },
      providesTags: (_r, _e, childId) => [{ type: 'Messages', id: childId }],
    }),

    sendMessage: builder.mutation<Tables<'messages'>, { child_id: string; sender_id: string; body: string }>({
      queryFn: async (msg) => {
        if (isDemoMode()) return { data: { id: 'demo-new', child_id: msg.child_id, sender_id: msg.sender_id, body: msg.body, created_at: new Date().toISOString() } }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('messages')
          .insert(msg)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_r, _e, arg) => [{ type: 'Messages', id: arg.child_id }],
    }),

    // ── Invites ──
    createInvite: builder.mutation<Tables<'invites'>, { child_id: string; created_by: string }>({
      queryFn: async (invite) => {
        if (isDemoMode()) return { data: { id: 'demo-invite', child_id: invite.child_id, created_by: invite.created_by, token: 'demo-token', used: false, expires_at: new Date().toISOString(), created_at: new Date().toISOString() } }
        const supabase = createClient()
        const { data, error } = await supabase
          .from('invites')
          .insert(invite)
          .select()
          .single()
        if (error) return { error }
        return { data }
      },
    }),
  }),
})

export const {
  useGetChildrenQuery,
  useGetChildQuery,
  useAddChildMutation,
  useGetCoParentsQuery,
  useGetPhotosQuery,
  useAddPhotoMutation,
  useUpdatePhotoMutation,
  useDeletePhotoMutation,
  useGetJournalEntriesQuery,
  useAddJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation,
  useGetMilestonesQuery,
  useAddMilestoneMutation,
  useUpdateMilestoneMutation,
  useDeleteMilestoneMutation,
  useGetHealthNotesQuery,
  useAddHealthNoteMutation,
  useUpdateHealthNoteMutation,
  useDeleteHealthNoteMutation,
  useGetScheduleBlocksQuery,
  useUpsertScheduleBlockMutation,
  useDeleteScheduleBlockMutation,
  useGetDocumentsQuery,
  useAddDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentUrlQuery,
  useGetActivityFeedQuery,
  useGetLatestSummaryQuery,
  useGetMilestoneSuggestionsQuery,
  useUpdateMilestoneSuggestionMutation,
  useCreateInviteMutation,
  useGetCurrentCoParentQuery,
  useUpdateCoParentLabelMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} = api
