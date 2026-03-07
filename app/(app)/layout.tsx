'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/store/store'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode } from '@/lib/demo/mode'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import DemoBanner from '@/components/demo/DemoBanner'
import Skeleton from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((state) => state.app.sidebarCollapsed)
  const demoMode = useAppSelector((state) => state.app.demoMode)
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (isDemoMode()) {
      setChecked(true)
      return
    }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      } else {
        setChecked(true)
      }
    })
  }, [router])

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className={cn(
        'flex flex-1 flex-col transition-all duration-300',
        // No margin on mobile (sidebar is overlay), margin on desktop
        collapsed ? 'md:ml-16' : 'md:ml-60'
      )}>
        <TopBar />

        <main className="flex-1 overflow-y-auto bg-cream px-4 md:px-6">
          <div className="mx-auto w-full max-w-[960px]">
            {children}
          </div>
        </main>
      </div>

      <DemoBanner />
    </div>
  )
}
