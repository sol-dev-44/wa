'use client'

import { Bell, ChevronDown, Plus } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/lib/store/store'
import { setActiveChildId } from '@/lib/store/appSlice'
import { useGetChildrenQuery, useGetCoParentsQuery } from '@/lib/store/api'
import Avatar from '@/components/ui/Avatar'
import AddChildForm from '@/components/children/AddChildForm'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export default function TopBar() {
  const dispatch = useAppDispatch()
  const activeChildId = useAppSelector((state) => state.app.activeChildId)

  const { data: children } = useGetChildrenQuery()
  const activeChild = children?.find((c) => c.id === activeChildId)

  const { data: coParents } = useGetCoParentsQuery(activeChildId ?? '', {
    skip: !activeChildId,
  })

  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [addChildOpen, setAddChildOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  // Auto-select first child if none selected
  useEffect(() => {
    if (!activeChildId && children && children.length > 0) {
      dispatch(setActiveChildId(children[0].id))
    }
  }, [activeChildId, children, dispatch])

  // Close switcher on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
  <>
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-mist bg-cream px-6">
      {/* Left: Child name switcher */}
      <div className="relative" ref={switcherRef}>
        <button
          onClick={() => setSwitcherOpen(!switcherOpen)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink transition-colors hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          aria-label="Switch child"
          aria-expanded={switcherOpen}
          aria-haspopup="listbox"
        >
          <span className="font-serif text-xl font-semibold text-ink">
            {activeChild?.name ?? 'Select child'}
          </span>
          <ChevronDown size={16} className="text-clay" aria-hidden="true" />
        </button>

        {switcherOpen && (
          <div
            className="absolute left-0 top-full mt-1 min-w-[180px] rounded-lg border border-mist bg-white py-1 shadow-md"
          >
            {children && children.length > 1 && (
              <ul role="listbox" aria-label="Children">
                {children.map((child) => (
                  <li key={child.id} role="option" aria-selected={child.id === activeChildId}>
                    <button
                      onClick={() => {
                        dispatch(setActiveChildId(child.id))
                        setSwitcherOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2.5 text-base transition-colors',
                        child.id === activeChildId
                          ? 'bg-sage/10 font-medium text-sage-deep'
                          : 'text-ink hover:bg-mist/50'
                      )}
                    >
                      {child.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => {
                setSwitcherOpen(false)
                setAddChildOpen(true)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2.5 text-base text-sage-deep transition-colors hover:bg-mist/50',
                children && children.length > 1 && 'border-t border-mist'
              )}
            >
              <Plus size={14} />
              Add child
            </button>
          </div>
        )}
      </div>

      {/* Right: Parent avatars + notification bell */}
      <div className="flex items-center gap-3">
        {coParents?.map((parent) => (
          <Avatar
            key={parent.id}
            name={parent.label}
            size="sm"
            color="clay"
          />
        ))}

        <button
          className="relative rounded-md p-2 text-ink/60 transition-colors hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          aria-label="Notifications"
        >
          <Bell size={20} aria-hidden="true" />
        </button>
      </div>
    </header>

    <AddChildForm isOpen={addChildOpen} onClose={() => setAddChildOpen(false)} />
  </>
  )
}
