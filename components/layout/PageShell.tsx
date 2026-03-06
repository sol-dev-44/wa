'use client'

import { motion } from 'framer-motion'

interface PageShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="py-8"
    >
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-base text-clay">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}
