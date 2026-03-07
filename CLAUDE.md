# Wa - Development Guide

## Project Overview
Wa (和 - harmony) is a co-parenting app built with Next.js 15 (App Router), Supabase, Redux Toolkit, and Tailwind CSS 4. It helps separated parents coordinate around their child's life.

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npx tsc --noEmit` - Type-check without emitting

## Architecture

### Stack
- **Framework**: Next.js 15.5 with App Router, TypeScript
- **Auth & DB**: Supabase (magic link OTP, RLS, Realtime)
- **State**: Redux Toolkit + RTK Query (`lib/store/`)
- **Styling**: Tailwind CSS 4 with inline `@theme` (see `globals.css`)
- **Forms**: react-hook-form + zod (`lib/validations/schemas.ts`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Toasts**: Sonner

### Directory Structure
```
app/
  (auth)/          # Login, invite acceptance (no sidebar)
  (app)/           # Authenticated pages (sidebar + topbar layout)
  api/             # API routes (AI endpoints, invite)
components/
  ui/              # Reusable primitives (Button, Modal, Avatar, Card, Badge, etc.)
  layout/          # Sidebar, TopBar, PageShell
  [feature]/       # Feature-specific components (photos, journal, messages, etc.)
hooks/             # Custom hooks (useRealtimeMessages)
lib/
  store/           # Redux store, RTK Query API, app slice
  supabase/        # Supabase client/server helpers
  validations/     # Zod schemas
  utils.ts         # Shared helpers (cn, formatAge, getInitials, etc.)
types/
  database.ts      # Supabase-generated types (Tables, InsertTables, UpdateTables)
  app.ts           # App-level type aliases
supabase/
  migrations/      # Sequential SQL migrations (001_, 002_, etc.)
```

### Key Patterns
- **Data fetching**: RTK Query with `fakeBaseQuery` + Supabase client. Tag-based cache invalidation.
- **Auth guard**: Client-side in `app/(app)/layout.tsx`. Redirects to `/login` if no session.
- **RLS**: All tables have row-level security. `is_co_parent(child_id)` function gates access.
- **Child scoping**: Most data is scoped per child via `child_id`. Active child stored in Redux (`activeChildId`).
- **Realtime**: Supabase Realtime postgres_changes -> invalidate RTK Query tags. See `hooks/useRealtimeMessages.ts`.

### Design System
- **Colors**: cream (bg), ink (text), sage/sage-deep (primary), clay (accent), terracotta (danger), mist (borders), sand, blush, sky
- **Fonts**: Lora (serif, headings), DM Sans (sans, body)
- **Components**: Use existing `components/ui/` primitives. Follow established patterns.

### Adding a New Feature
1. Add migration in `supabase/migrations/` (next sequential number)
2. Add types in `types/database.ts` (Row/Insert/Update)
3. Add type alias in `types/app.ts`
4. Add RTK Query endpoints in `lib/store/api.ts` (with tags)
5. Add validation schema in `lib/validations/schemas.ts` if needed
6. Create components in `components/[feature]/`
7. Create page in `app/(app)/[feature]/page.tsx`
8. Add nav item in `components/layout/Sidebar.tsx`

### Database Conventions
- All tables have `id uuid primary key default gen_random_uuid()`
- All tables have `created_at timestamptz default now()`
- Content tables have `child_id` FK and `author_id` referencing `auth.users(id)`
- RLS enabled on all tables. Use `is_co_parent()` for access control.
- User display name stored in `co_parents.label` (not a separate users table)
