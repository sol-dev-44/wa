'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { Upload, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useAddPhotoMutation } from '@/lib/store/api'
import { useCaptionPhotoMutation } from '@/lib/store/aiApi'
import { useGetChildQuery } from '@/lib/store/api'
import { photoSchema } from '@/lib/validations/schemas'
import type { z } from 'zod'

type PhotoFormValues = z.infer<typeof photoSchema>

interface PhotoUploaderProps {
  isOpen: boolean
  onClose: () => void
  childId: string
}

export default function PhotoUploader({ isOpen, onClose, childId }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: child } = useGetChildQuery(childId)
  const [addPhoto] = useAddPhotoMutation()
  const [captionPhoto, { isLoading: isCaptioning }] = useCaptionPhotoMutation()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      caption: '',
      taken_at: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const caption = watch('caption')

  const cleanup = useCallback(() => {
    setFile(null)
    setPreview(null)
    setUploading(false)
    setUploadProgress(0)
    reset()
  }, [reset])

  const handleClose = useCallback(() => {
    cleanup()
    onClose()
  }, [cleanup, onClose])

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setFile(selectedFile)

      // Create local preview
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)

      // Upload to get a URL for AI captioning
      try {
        const supabase = createClient()
        const now = new Date()
        const ext = selectedFile.name.split('.').pop() ?? 'jpg'
        const path = `${childId}/${format(now, 'yyyy')}/${format(now, 'MM')}/${uuidv4()}.${ext}`

        setUploading(true)
        setUploadProgress(30)

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, selectedFile, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          toast.error('Upload failed')
          setUploading(false)
          return
        }

        setUploadProgress(70)

        setUploadProgress(100)
        setUploading(false)

        // Store path for later use
        setFile(Object.assign(selectedFile, { _storagePath: path }))

        // Auto-caption with AI using base64
        if (child?.name) {
          try {
            const base64 = await new Promise<string>((resolve) => {
              const r = new FileReader()
              r.onload = () => {
                const result = r.result as string
                resolve(result.split(',')[1]) // strip data:image/...;base64, prefix
              }
              r.readAsDataURL(selectedFile)
            })

            const mediaType = selectedFile.type || 'image/jpeg'
            const result = await captionPhoto({
              imageBase64: base64,
              mediaType,
              childName: child.name,
            }).unwrap()
            setValue('caption', result.caption)
          } catch {
            // AI caption failed silently; user can still type manually
          }
        }
      } catch {
        toast.error('Something went wrong during upload')
        setUploading(false)
      }
    },
    [childId, child, captionPhoto, setValue]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragActive(false)
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    const storagePath = (file as any)?._storagePath
    if (!storagePath) {
      toast.error('No file uploaded')
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Not authenticated')
        return
      }

      await addPhoto({
        child_id: childId,
        author_id: user.id,
        storage_path: storagePath,
        caption: values.caption || null,
        taken_at: values.taken_at || null,
      }).unwrap()

      toast.success('Photo added')
      handleClose()
    } catch {
      toast.error('Failed to save photo')
    }
  })

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Photo">
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Drop zone / preview */}
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors ${
              dragActive
                ? 'border-sage bg-sage/5'
                : 'border-clay/30 bg-sand/30 hover:border-sage/50'
            }`}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mist">
              <Upload size={22} className="text-clay" aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-ink">
              Drop an image here or click to browse
            </p>
            <p className="mt-1 text-sm text-ink/50">
              JPG, PNG, WebP up to 10 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelect(f)
              }}
            />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-full object-contain rounded-xl bg-sand"
            />
            {(uploading || isCaptioning) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/40 backdrop-blur-sm rounded-xl">
                <Loader2 size={24} className="animate-spin text-cream" />
                <p className="mt-2 text-sm text-cream">
                  {uploading
                    ? `Uploading... ${uploadProgress}%`
                    : 'Generating caption...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload progress bar */}
        {uploading && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-sage transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Caption field */}
        <div>
          <label
            htmlFor="caption"
            className="mb-1 block text-sm font-medium text-clay"
          >
            Caption
          </label>
          <textarea
            id="caption"
            {...register('caption')}
            rows={2}
            placeholder="Describe this moment..."
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink placeholder:text-ink/30 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.caption && (
            <p className="mt-1 text-sm text-terracotta">{errors.caption.message}</p>
          )}
        </div>

        {/* Date field */}
        <div>
          <label
            htmlFor="taken_at"
            className="mb-1 block text-sm font-medium text-clay"
          >
            Date taken
          </label>
          <input
            id="taken_at"
            type="date"
            {...register('taken_at')}
            className="w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          />
          {errors.taken_at && (
            <p className="mt-1 text-sm text-terracotta">{errors.taken_at.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!file || uploading || isCaptioning}
          >
            <ImageIcon size={16} aria-hidden="true" />
            Save Photo
          </Button>
        </div>
      </form>
    </Modal>
  )
}
