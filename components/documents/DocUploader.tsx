'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, File, X } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { documentSchema } from '@/lib/validations/schemas'
import { useAddDocumentMutation } from '@/lib/store/api'
import { createClient } from '@/lib/supabase/client'
import { cn, formatFileSize } from '@/lib/utils'
import type { z } from 'zod'

type FormValues = z.infer<typeof documentSchema>

const DOC_TYPES = ['Legal', 'Medical', 'Education', 'Insurance', 'Activities', 'Other'] as const

interface DocUploaderProps {
  isOpen: boolean
  onClose: () => void
  childId: string
}

export default function DocUploader({ isOpen, onClose, childId }: DocUploaderProps) {
  const [addDocument] = useAddDocumentMutation()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: '',
      type: 'Other',
      doc_date: new Date().toISOString().slice(0, 10),
    },
  })

  const handleFile = useCallback(
    (f: File) => {
      setFile(f)
      const nameWithoutExt = f.name.replace(/\.[^.]+$/, '')
      setValue('name', nameWithoutExt, { shouldDirty: true, shouldValidate: true })
    },
    [setValue]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  function removeFile() {
    setFile(null)
    setValue('name', '')
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClose() {
    setFile(null)
    setDragOver(false)
    reset()
    onClose()
  }

  async function onSubmit(values: FormValues) {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const uuid = crypto.randomUUID()
      const storagePath = `${childId}/documents/${values.type}/${uuid}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file)
      if (uploadError) throw uploadError

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      await addDocument({
        child_id: childId,
        uploaded_by: userData.user.id,
        storage_path: storagePath,
        name: values.name,
        type: values.type,
        doc_date: values.doc_date || null,
        file_size: file.size,
      }).unwrap()

      toast.success('Document uploaded')
      handleClose()
    } catch {
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-mist bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30'
  const labelClass = 'mb-1.5 block text-base font-medium text-ink'
  const errorClass = 'mt-1 text-sm text-terracotta'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Drop zone */}
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
              dragOver
                ? 'border-sage bg-sage/5'
                : 'border-clay/30 bg-sand/30 hover:border-sage hover:bg-sand/50'
            )}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mist">
              <Upload size={20} className="text-clay" aria-hidden="true" />
            </div>
            <p className="text-base font-medium text-ink">
              Drag and drop or click to select
            </p>
            <p className="mt-1 text-sm text-ink/50">PDF, images, or documents</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-xl border border-mist bg-sand/40 px-4 py-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist">
              <File size={18} className="text-clay" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-ink">{file.name}</p>
              <p className="text-sm text-ink/50">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="rounded-md p-1 text-ink/40 hover:bg-mist hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {/* Name */}
        <div>
          <label className={labelClass}>Name</label>
          <input
            {...register('name')}
            className={inputClass}
            placeholder="Document name"
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>Type</label>
          <select {...register('type')} className={inputClass}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <p className={errorClass}>{errors.type.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" {...register('doc_date')} className={inputClass} />
          {errors.doc_date && (
            <p className={errorClass}>{errors.doc_date.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={uploading} disabled={!file}>
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  )
}
