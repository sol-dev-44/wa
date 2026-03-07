'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Camera,
  BookOpen,
  Trophy,
  Heart,
  Calendar,
  MessageCircle,
  ArrowRight,
  Shield,
  Play,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { setDemoMode } from '@/lib/demo/mode'
import { setDemoMode as setDemoModeAction, setActiveChildId } from '@/lib/store/appSlice'
import { useAppDispatch } from '@/lib/store/store'
import { DEMO_CHILD_ID } from '@/lib/demo/data'
import type { Variants } from 'framer-motion'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
}

const features = [
  {
    icon: Camera,
    title: 'Shared Photos',
    desc: 'Capture and share moments across households seamlessly.',
  },
  {
    icon: BookOpen,
    title: 'Journal',
    desc: 'Document your child\'s story together, from either home.',
  },
  {
    icon: Trophy,
    title: 'Milestones',
    desc: 'Never miss a first step, first word, or first day of school.',
  },
  {
    icon: Heart,
    title: 'Health Tracking',
    desc: 'Keep medications, appointments, and allergies in sync.',
  },
  {
    icon: Calendar,
    title: 'Schedule',
    desc: 'Coordinate custody schedules and handoffs with clarity.',
  },
  {
    icon: MessageCircle,
    title: 'Messaging',
    desc: 'Communicate with your co-parent in a focused, child-centered space.',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  function enterDemo() {
    setDemoMode(true)
    dispatch(setDemoModeAction(true))
    dispatch(setActiveChildId(DEMO_CHILD_ID))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl italic text-ink">Wa</span>
          <span className="text-lg text-ink/20">|</span>
          <span className="text-sm text-ink/40 font-medium">和</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center px-6 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background kanji */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        >
          <span className="font-serif text-[28rem] leading-none text-ink md:text-[36rem]">
            和
          </span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.span
            custom={0}
            variants={fadeUp}
            className="text-6xl leading-none md:text-7xl"
          >
            和
          </motion.span>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mt-6 font-serif text-6xl italic text-ink md:text-8xl"
          >
            Wa
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-4 text-lg font-medium tracking-wide text-clay md:text-xl"
          >
            Harmony in co-parenting
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            className="mt-6 max-w-lg text-base leading-relaxed text-ink/50 md:text-lg"
          >
            Two homes, one shared story. Wa brings co-parents together around what
            matters most&mdash;your child&rsquo;s wellbeing, growth, and happiness.
          </motion.p>

          <motion.div custom={4} variants={fadeUp} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-sage-deep px-7 py-3.5 text-base font-medium text-white transition-all hover:bg-sage-deep/90 hover:shadow-lg hover:shadow-sage/20"
            >
              Get started
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <button
              onClick={enterDemo}
              className="group inline-flex items-center gap-2 rounded-xl border border-mist bg-white px-7 py-3.5 text-base font-medium text-ink transition-all hover:border-sage hover:shadow-sm"
            >
              <Play size={16} className="text-sage-deep" />
              Try the demo
            </button>
          </motion.div>

          <motion.div
            custom={5}
            variants={fadeUp}
            className="mt-6 flex items-center gap-2 text-sm text-ink/30"
          >
            <Shield size={14} />
            <span>Free, private, and secure</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="h-px flex-1 max-w-32 bg-mist" />
        <span className="text-2xl text-mist">和</span>
        <div className="h-px flex-1 max-w-32 bg-mist" />
      </div>

      {/* Features */}
      <section className="px-6 py-20 md:px-12 md:py-28 lg:px-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-5xl"
        >
          <motion.h2
            custom={0}
            variants={fadeUp}
            className="text-center font-serif text-3xl text-ink md:text-4xl"
          >
            Everything in one place
          </motion.h2>
          <motion.p
            custom={1}
            variants={fadeUp}
            className="mx-auto mt-3 max-w-md text-center text-base text-ink/40"
          >
            Built for parents who co-parent across two homes with grace and intention.
          </motion.p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i + 2}
                variants={fadeUp}
                className="group rounded-2xl border border-mist bg-white p-6 transition-all hover:border-clay/30 hover:shadow-md hover:shadow-clay/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage transition-colors group-hover:bg-sage group-hover:text-white">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/45">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="bg-ink px-6 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span custom={0} variants={fadeUp} className="text-5xl">
            和
          </motion.span>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="mt-6 font-serif text-3xl text-cream md:text-4xl"
          >
            The meaning of Wa
          </motion.h2>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-6 text-base leading-relaxed text-cream/50 md:text-lg"
          >
            In Japanese, <span className="text-clay font-medium">和 (wa)</span> means
            harmony, peace, and togetherness. It represents the belief that even when
            apart, we can create something beautiful together. Wa is built on this
            philosophy&mdash;that co-parenting works best when grounded in mutual
            respect, shared purpose, and the wellbeing of your child above all.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-cream/20 px-7 py-3.5 text-base font-medium text-cream transition-all hover:bg-cream/10"
            >
              Start your journey
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3 px-6 py-10">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl italic text-ink">Wa</span>
          <span className="text-sm text-ink/20">和</span>
        </div>
        <p className="text-xs text-ink/30">For parents who put their child first.</p>
      </footer>
    </div>
  )
}
