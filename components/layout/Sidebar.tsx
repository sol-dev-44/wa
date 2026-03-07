'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Camera,
  BookOpen,
  Trophy,
  Heart,
  Calendar,
  FolderOpen,
  X,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/lib/store/store'
import { toggleSidebar } from '@/lib/store/appSlice'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/photos', label: 'Photos', icon: Camera },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/milestones', label: 'Milestones', icon: Trophy },
  { href: '/health', label: 'Health', icon: Heart },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
]

export default function Sidebar() {
  const pathname = usePathname()
  const collapsed = useAppSelector((state) => state.app.sidebarCollapsed)
  const dispatch = useAppDispatch()

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col bg-ink text-cream transition-transform duration-300',
          'w-60',
          // Mobile: slide in/out
          collapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0',
          // Desktop collapsed
          !collapsed ? 'md:w-60' : 'md:w-16'
        )}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5">
          {(!collapsed || typeof window !== 'undefined') && (
            <div className={cn(collapsed && 'hidden md:block md:invisible')}>
              <h1 className="font-serif text-2xl italic text-cream">Wa</h1>
              <p className="mt-0.5 text-xs text-clay">Together, apart</p>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-md p-1.5 text-cream/70 hover:bg-white/10 hover:text-cream md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-2" role="navigation" aria-label="App sections">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 768) dispatch(toggleSidebar())
                }}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
                  isActive
                    ? 'bg-white/10 text-cream'
                    : 'text-cream/60 hover:bg-white/5 hover:text-cream/90'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-r bg-sage" aria-hidden="true" />
                )}
                <Icon
                  size={20}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-sage' : 'text-cream/50 group-hover:text-cream/80'
                  )}
                  aria-hidden="true"
                />
                <span className={cn(collapsed && 'md:hidden')}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={cn('px-4 py-4', collapsed && 'md:hidden')}>
          <p className="text-[10px] text-cream/30">For parents who put their child first.</p>
        </div>
      </aside>
    </>
  )
}
