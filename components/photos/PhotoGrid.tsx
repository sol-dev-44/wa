'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode } from '@/lib/demo/mode'
import AuthorByline from '@/components/ui/AuthorByline'
import type { Tables } from '@/types/database'

interface PhotoGridProps {
  photos: Tables<'photos'>[]
  onPhotoClick: (index: number) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
}

const breakpointColumns = {
  default: 3,
  1280: 3,
  1024: 2,
  640: 1,
}

export default function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isDemoMode()) {
      const map: Record<string, string> = {}
      photos.forEach((p) => { map[p.id] = p.storage_path })
      setSignedUrls(map)
      return
    }
    let cancelled = false
    async function loadUrls() {
      const supabase = createClient()
      const paths = photos.map((p) => p.storage_path)
      if (paths.length === 0) return

      const { data, error } = await supabase.storage
        .from('photos')
        .createSignedUrls(paths, 3600)

      if (!cancelled && data && !error) {
        const map: Record<string, string> = {}
        data.forEach((item, i) => {
          if (item.signedUrl) {
            map[photos[i].id] = item.signedUrl
          }
        })
        setSignedUrls(map)
      }
    }
    loadUrls()
    return () => { cancelled = true }
  }, [photos])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => {
          const url = signedUrls[photo.id]
          return (
            <motion.div
              key={photo.id}
              variants={itemVariants}
              layoutId={`photo-${photo.id}`}
              className="mb-4 cursor-pointer"
              onClick={() => onPhotoClick(index)}
            >
              <div className="group relative overflow-hidden rounded-lg bg-sand">
                {url ? (
                  <img
                    src={url}
                    alt={photo.caption ?? 'Photo'}
                    className="block w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-square w-full animate-pulse bg-mist" />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/60 via-ink/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="p-4">
                    {photo.caption && (
                      <p className="text-base font-medium text-cream line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-sm text-cream/70">
                      <span>
                        {photo.taken_at
                          ? format(parseISO(photo.taken_at), 'MMM d, yyyy')
                          : format(parseISO(photo.created_at), 'MMM d, yyyy')}
                      </span>
                      {photo.author_id && (
                        <AuthorByline authorId={photo.author_id} className="[&_span]:text-cream/70" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </Masonry>
    </motion.div>
  )
}
