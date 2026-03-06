import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AIHealthInsight, AIJournalPrompt } from '@/types/app'

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/ai' }),
  tagTypes: ['Summary', 'MilestoneSuggestions', 'HealthInsights', 'JournalPrompts'],
  endpoints: (builder) => ({
    // Generate weekly smart summary
    generateSummary: builder.mutation<{ content: string }, { childId: string }>({
      query: ({ childId }) => ({
        url: '/summary',
        method: 'POST',
        body: { childId },
      }),
      invalidatesTags: ['Summary'],
    }),

    // Get milestone suggestions from AI
    generateMilestoneSuggestions: builder.mutation<
      { suggestions: { title: string; description: string; category: string; suggested_date: string }[] },
      { childId: string }
    >({
      query: ({ childId }) => ({
        url: '/milestone-suggestions',
        method: 'POST',
        body: { childId },
      }),
      invalidatesTags: ['MilestoneSuggestions'],
    }),

    // Get health insights from AI
    getHealthInsights: builder.query<AIHealthInsight[], { childId: string }>({
      query: ({ childId }) => ({
        url: '/health-insights',
        method: 'POST',
        body: { childId },
      }),
      providesTags: ['HealthInsights'],
    }),

    // Caption a photo using vision
    captionPhoto: builder.mutation<
      { caption: string; tags: string[] },
      { imageBase64: string; mediaType: string; childName: string }
    >({
      query: (body) => ({
        url: '/photo-caption',
        method: 'POST',
        body,
      }),
    }),

    // Get journal writing prompts
    getJournalPrompts: builder.query<AIJournalPrompt[], { childId: string }>({
      query: ({ childId }) => ({
        url: '/journal-assist',
        method: 'POST',
        body: { childId, action: 'prompts' },
      }),
      providesTags: ['JournalPrompts'],
    }),

    // Journal writing assistant — expand/refine text
    assistJournalWriting: builder.mutation<
      { text: string },
      { childId: string; input: string; action: 'expand' | 'refine' | 'soften' }
    >({
      query: (body) => ({
        url: '/journal-assist',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGenerateSummaryMutation,
  useGenerateMilestoneSuggestionsMutation,
  useGetHealthInsightsQuery,
  useCaptionPhotoMutation,
  useGetJournalPromptsQuery,
  useAssistJournalWritingMutation,
} = aiApi
