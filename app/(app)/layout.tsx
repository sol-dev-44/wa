'use client'

import { useAppSelector } from '@/lib/store/store'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((state) => state.app.sidebarCollapsed)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className={cn('flex flex-1 flex-col transition-all duration-300', collapsed ? 'ml-16' : 'ml-60')}>
        <TopBar />

        <main className="flex-1 overflow-y-auto bg-cream px-6">
          <div className="mx-auto w-full max-w-[960px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
