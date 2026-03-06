'use client'

import { useState, useMemo, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import {
  FolderOpen,
  FileText,
  Download,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useDeleteDocumentMutation } from '@/lib/store/api'
import AuthorByline from '@/components/ui/AuthorByline'
import { createClient } from '@/lib/supabase/client'
import { cn, formatFileSize } from '@/lib/utils'
import type { Tables } from '@/types/database'

const DOC_TYPES = ['Legal', 'Medical', 'Education', 'Insurance', 'Activities', 'Other'] as const

const typeBadgeVariant: Record<string, 'sage' | 'terracotta' | 'sky' | 'clay' | 'mist'> = {
  Legal: 'clay',
  Medical: 'terracotta',
  Education: 'sky',
  Insurance: 'sage',
  Activities: 'sage',
  Other: 'mist',
}

interface DocVaultProps {
  documents: Tables<'child_documents'>[]
}

export default function DocVault({ documents }: DocVaultProps) {
  const [deleteDocument] = useDeleteDocumentMutation()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(DOC_TYPES)
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Tables<'child_documents'>[]>()
    for (const type of DOC_TYPES) {
      const docs = documents.filter((d) => d.type === type)
      if (docs.length > 0) map.set(type, docs)
    }
    return map
  }, [documents])

  const toggleGroup = useCallback((type: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const handleDownload = useCallback(async (storagePath: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(storagePath, 3600)
      if (error) throw error
      window.open(data.signedUrl, '_blank')
    } catch {
      toast.error('Failed to generate download link')
    }
  }, [])

  const handleDelete = useCallback(
    async (id: string, storagePath: string) => {
      try {
        await deleteDocument({ id, storagePath }).unwrap()
        toast.success('Document deleted')
      } catch {
        toast.error('Failed to delete document')
      }
    },
    [deleteDocument]
  )

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents yet"
        description="Upload important documents to keep them organized and accessible."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {DOC_TYPES.map((type) => {
        const docs = grouped.get(type)
        if (!docs) return null
        const isExpanded = expandedGroups.has(type)

        return (
          <div key={type}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(type)}
              className="mb-3 flex w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-md px-1"
            >
              <ChevronDown
                size={16}
                className={cn(
                  'text-ink/40 transition-transform duration-200',
                  !isExpanded && '-rotate-90'
                )}
                aria-hidden="true"
              />
              <h3 className="font-serif text-lg font-semibold text-ink">
                {type}
              </h3>
              <Badge variant={typeBadgeVariant[type] ?? 'mist'}>{docs.length}</Badge>
            </button>

            {/* Group content */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2">
                    {docs.map((doc) => (
                      <Card key={doc.id} className="flex items-center gap-4 p-4">
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sand">
                          <FileText
                            size={18}
                            className="text-clay"
                            aria-hidden="true"
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink">
                            {doc.name}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-ink/50">
                            {doc.doc_date && (
                              <span>
                                {format(parseISO(doc.doc_date), 'MMM d, yyyy')}
                              </span>
                            )}
                            {doc.file_size != null && (
                              <>
                                <span aria-hidden="true">&middot;</span>
                                <span>{formatFileSize(doc.file_size)}</span>
                              </>
                            )}
                            {doc.uploaded_by && (
                              <>
                                <span aria-hidden="true">&middot;</span>
                                <AuthorByline authorId={doc.uploaded_by} />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Type badge */}
                        <Badge variant={typeBadgeVariant[doc.type] ?? 'mist'}>
                          {doc.type}
                        </Badge>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.storage_path)}
                          >
                            <Download size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(doc.id, doc.storage_path)
                            }
                          >
                            <Trash2
                              size={14}
                              className="text-terracotta"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
