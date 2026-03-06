'use client'

import { useState, useMemo, useCallback } from 'react'
import { Camera, Plus } from 'lucide-react'
import PageShell from '@/components/layout/PageShell'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import PhotoGrid from '@/components/photos/PhotoGrid'
import PhotoLightbox from '@/components/photos/PhotoLightbox'
import PhotoUploader from '@/components/photos/PhotoUploader'
import { useAppSelector } from '@/lib/store/store'
import { useGetPhotosQuery, useGetCoParentsQuery } from '@/lib/store/api'
import { cn } from '@/lib/utils'

export default function PhotosPage() {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [filterParent, setFilterParent] = useState<string | null>(null)

  const { data: photos, isLoading } = useGetPhotosQuery(activeChildId!, {
    skip: !activeChildId,
  })
  const { data: coParents } = useGetCoParentsQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const filteredPhotos = useMemo(() => {
    if (!photos) return []
    if (!filterParent) return photos
    return photos.filter((p) => p.author_id === filterParent)
  }, [photos, filterParent])

  const coParentMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(coParents ?? []).forEach((p) => {
      map[p.user_id] = p.label
    })
    return map
  }, [coParents])

  const handlePhotoClick = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const handleNavigate = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  if (!activeChildId) {
    return (
      <PageShell title="Photos">
        <EmptyState
          icon={Camera}
          title="No child selected"
          description="Select or add a child from the sidebar to view photos."
        />
      </PageShell>
    )
  }

  return (
    <PageShell title="Photos">
      {/* Toolbar: filter bar + upload button */}
      <div className="mb-6 flex items-center justify-between">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-sand/60 p-1">
          <button
            onClick={() => setFilterParent(null)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              !filterParent
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink/50 hover:text-ink'
            )}
          >
            All
          </button>
          {(coParents ?? []).map((parent) => (
            <button
              key={parent.id}
              onClick={() => setFilterParent(parent.user_id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filterParent === parent.user_id
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/50 hover:text-ink'
              )}
            >
              {parent.label}
            </button>
          ))}
        </div>

        <Button variant="primary" size="sm" onClick={() => setUploaderOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Upload
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No photos yet"
          description="Capture and share moments. Upload your first photo to get started."
          action={{ label: 'Upload Photo', onClick: () => setUploaderOpen(true) }}
        />
      ) : (
        <PhotoGrid photos={filteredPhotos} onPhotoClick={handlePhotoClick} />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigate}
          coParentMap={coParentMap}
        />
      )}

      {/* Upload modal */}
      <PhotoUploader
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        childId={activeChildId}
      />
    </PageShell>
  )
}
