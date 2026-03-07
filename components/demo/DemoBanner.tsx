'use client'

import { useRouter } from 'next/navigation'
import { Eye, X } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/lib/store/store'
import { setDemoMode as setDemoModeAction } from '@/lib/store/appSlice'
import { setDemoMode } from '@/lib/demo/mode'

export default function DemoBanner() {
  const demoMode = useAppSelector((state) => state.app.demoMode)
  const dispatch = useAppDispatch()
  const router = useRouter()

  if (!demoMode) return null

  function exitDemo() {
    setDemoMode(false)
    dispatch(setDemoModeAction(false))
    router.replace('/login')
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-clay/30 bg-ink px-5 py-2.5 shadow-lg">
        <Eye size={16} className="shrink-0 text-clay" />
        <p className="text-sm font-medium text-cream">
          You&apos;re viewing a demo
        </p>
        <button
          onClick={exitDemo}
          className="ml-1 flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cream transition-colors hover:bg-white/20"
        >
          Exit
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
