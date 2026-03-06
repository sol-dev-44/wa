'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

interface PhotoLightboxProps {
  photos: Tables<'photos'>[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  coParentMap?: Record<string, string>
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  coParentMap = {},
}: PhotoLightboxProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const photo = photos[currentIndex]

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  // Fetch signed URL for current photo
  useEffect(() => {
    if (!photo) return
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.storage
        .from('photos')
        .createSignedUrl(photo.storage_path, 3600)
      if (!cancelled && data) setSignedUrl(data.signedUrl)
    }
    setSignedUrl(null)
    load()
    return () => { cancelled = true }
  }, [photo])

  if (!photo) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-ink/50 p-2 text-cream transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
          aria-label="Close lightbox"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {/* Prev button */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink/50 p-2 text-cream transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
        )}

        {/* Next button */}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-ink/50 p-2 text-cream transition-colors hover:bg-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
            aria-label="Next photo"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        )}

        {/* Photo + info */}
        <div
          className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            layoutId={`photo-${photo.id}`}
            className="overflow-hidden rounded-lg"
          >
            {signedUrl ? (
              <img
                src={signedUrl}
                alt={photo.caption ?? 'Photo'}
                className="max-h-[75vh] max-w-full object-contain"
              />
            ) : (
              <div className="flex h-64 w-96 items-center justify-center rounded-lg bg-ink/30">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
              </div>
            )}
          </motion.div>

          {/* Caption & metadata */}
          <div className="mt-4 text-center">
            {photo.caption && (
              <p className="font-serif text-base italic text-cream">
                {photo.caption}
              </p>
            )}
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-cream/60">
              <span>
                {photo.taken_at
                  ? format(parseISO(photo.taken_at), 'MMMM d, yyyy')
                  : format(parseISO(photo.created_at), 'MMMM d, yyyy')}
              </span>
              {coParentMap[photo.author_id] && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{coParentMap[photo.author_id]}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
