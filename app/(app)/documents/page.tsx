'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import PageShell from '@/components/layout/PageShell'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import DocVault from '@/components/documents/DocVault'
import DocUploader from '@/components/documents/DocUploader'
import { useAppSelector } from '@/lib/store/store'
import { useGetDocumentsQuery } from '@/lib/store/api'

export default function DocumentsPage() {
  const activeChildId = useAppSelector((s) => s.app.activeChildId)
  const { data: documents = [], isLoading } = useGetDocumentsQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const [uploaderOpen, setUploaderOpen] = useState(false)

  if (!activeChildId) {
    return (
      <PageShell title="Documents">
        <p className="text-base text-ink/60">Select a child to view documents.</p>
      </PageShell>
    )
  }

  return (
    <PageShell title="Documents">
      {/* Header */}
      <div className="mb-6 flex items-center justify-end">
        <Button onClick={() => setUploaderOpen(true)}>
          <Upload size={16} aria-hidden="true" />
          Upload
        </Button>
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" count={4} />
        </div>
      ) : (
        <DocVault documents={documents} />
      )}

      {/* Upload modal */}
      <DocUploader
        isOpen={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        childId={activeChildId}
      />
    </PageShell>
  )
}
