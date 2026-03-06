-- =============================================
-- CORE TABLES
-- =============================================

create table if not exists children (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  date_of_birth date not null,
  avatar_url   text,
  created_at   timestamptz default now()
);

create table if not exists co_parents (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references children(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  label      text not null check (label in ('Parent A', 'Parent B', 'Mom', 'Dad', 'Guardian')),
  color      text not null default '#7A9E7E',
  created_at timestamptz default now(),
  unique(child_id, user_id)
);

create table if not exists invites (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid references children(id) on delete cascade,
  created_by uuid references auth.users(id),
  token      text unique not null default encode(gen_random_bytes(24), 'hex'),
  used       boolean default false,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- =============================================
-- FEATURE TABLES
-- =============================================

create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  author_id   uuid references auth.users(id),
  storage_path text not null,
  caption     text,
  taken_at    date,
  created_at  timestamptz default now()
);

create table if not exists journal_entries (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  author_id   uuid references auth.users(id),
  title       text not null,
  body        text not null,
  mood        text,
  tags        text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists milestones (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  author_id   uuid references auth.users(id),
  title       text not null,
  description text,
  category    text not null check (category in ('Physical', 'Academic', 'Social', 'Emotional', 'Creative', 'Other')),
  icon        text,
  milestone_date date not null,
  age_label   text,
  celebrated  boolean default false,
  created_at  timestamptz default now()
);

do $$ begin
  create type health_note_type as enum ('Medication', 'Appointment', 'Allergy', 'Wellness', 'Injury', 'Dental', 'Vision');
exception when duplicate_object then null;
end $$;

create table if not exists health_notes (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  author_id   uuid references auth.users(id),
  type        health_note_type not null,
  title       text not null,
  detail      text,
  note_date   date not null,
  is_urgent   boolean default false,
  is_resolved boolean default false,
  created_at  timestamptz default now()
);

create table if not exists schedule_blocks (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid references children(id) on delete cascade,
  parent_id    uuid references auth.users(id),
  date         date not null,
  label        text,
  is_handoff   boolean default false,
  handoff_time time,
  handoff_note text,
  created_at   timestamptz default now()
);

create table if not exists child_documents (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid references children(id) on delete cascade,
  uploaded_by  uuid references auth.users(id),
  storage_path text not null,
  name         text not null,
  type         text not null check (type in ('Legal', 'Medical', 'Education', 'Insurance', 'Activities', 'Other')),
  doc_date     date,
  file_size    bigint,
  created_at   timestamptz default now()
);

-- =============================================
-- AI TABLES
-- =============================================

create table if not exists summaries (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid references children(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  content      text not null,
  created_at   timestamptz default now()
);

create table if not exists milestone_suggestions (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid references children(id) on delete cascade,
  title          text not null,
  description    text,
  category       text not null,
  suggested_date date,
  source_context text,
  status         text default 'pending' check (status in ('pending', 'accepted', 'dismissed')),
  created_at     timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table children            enable row level security;
alter table co_parents          enable row level security;
alter table photos              enable row level security;
alter table journal_entries     enable row level security;
alter table milestones          enable row level security;
alter table health_notes        enable row level security;
alter table schedule_blocks     enable row level security;
alter table child_documents     enable row level security;
alter table summaries           enable row level security;
alter table milestone_suggestions enable row level security;

-- Creates a child and links the calling user as a co-parent in one step.
-- This avoids the RLS chicken-and-egg problem where inserting a child
-- requires a co_parents row that doesn't exist yet.
create or replace function create_child(p_name text, p_date_of_birth date, p_label text default 'Parent A')
returns children
language plpgsql security definer as $$
declare
  new_child children;
begin
  insert into children (name, date_of_birth)
  values (p_name, p_date_of_birth)
  returning * into new_child;

  insert into co_parents (child_id, user_id, label)
  values (new_child.id, auth.uid(), p_label);

  return new_child;
end;
$$;

create or replace function is_co_parent(p_child_id uuid)
returns boolean
language sql security definer as $$
  select exists (
    select 1 from co_parents
    where child_id = p_child_id
    and user_id = auth.uid()
  );
$$;

-- Photos policies
drop policy if exists "co_parents_can_read_photos" on photos;
drop policy if exists "co_parents_can_insert_photos" on photos;
drop policy if exists "author_can_update_photos" on photos;
drop policy if exists "author_can_delete_photos" on photos;
create policy "co_parents_can_read_photos" on photos for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_photos" on photos for insert with check (is_co_parent(child_id) and author_id = auth.uid());
create policy "author_can_update_photos" on photos for update using (author_id = auth.uid());
create policy "author_can_delete_photos" on photos for delete using (author_id = auth.uid());

-- Journal policies
drop policy if exists "co_parents_can_read_journal" on journal_entries;
drop policy if exists "co_parents_can_insert_journal" on journal_entries;
drop policy if exists "author_can_update_journal" on journal_entries;
drop policy if exists "author_can_delete_journal" on journal_entries;
create policy "co_parents_can_read_journal" on journal_entries for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_journal" on journal_entries for insert with check (is_co_parent(child_id) and author_id = auth.uid());
create policy "author_can_update_journal" on journal_entries for update using (author_id = auth.uid());
create policy "author_can_delete_journal" on journal_entries for delete using (author_id = auth.uid());

-- Milestones policies
drop policy if exists "co_parents_can_read_milestones" on milestones;
drop policy if exists "co_parents_can_insert_milestones" on milestones;
drop policy if exists "author_can_update_milestones" on milestones;
drop policy if exists "author_can_delete_milestones" on milestones;
create policy "co_parents_can_read_milestones" on milestones for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_milestones" on milestones for insert with check (is_co_parent(child_id) and author_id = auth.uid());
create policy "author_can_update_milestones" on milestones for update using (author_id = auth.uid());
create policy "author_can_delete_milestones" on milestones for delete using (author_id = auth.uid());

-- Health notes policies
drop policy if exists "co_parents_can_read_health" on health_notes;
drop policy if exists "co_parents_can_insert_health" on health_notes;
drop policy if exists "author_can_update_health" on health_notes;
drop policy if exists "author_can_delete_health" on health_notes;
create policy "co_parents_can_read_health" on health_notes for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_health" on health_notes for insert with check (is_co_parent(child_id) and author_id = auth.uid());
create policy "author_can_update_health" on health_notes for update using (author_id = auth.uid());
create policy "author_can_delete_health" on health_notes for delete using (author_id = auth.uid());

-- Schedule policies
drop policy if exists "co_parents_can_read_schedule" on schedule_blocks;
drop policy if exists "co_parents_can_insert_schedule" on schedule_blocks;
drop policy if exists "co_parents_can_update_schedule" on schedule_blocks;
drop policy if exists "co_parents_can_delete_schedule" on schedule_blocks;
create policy "co_parents_can_read_schedule" on schedule_blocks for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_schedule" on schedule_blocks for insert with check (is_co_parent(child_id));
create policy "co_parents_can_update_schedule" on schedule_blocks for update using (is_co_parent(child_id));
create policy "co_parents_can_delete_schedule" on schedule_blocks for delete using (is_co_parent(child_id));

-- Documents policies
drop policy if exists "co_parents_can_read_documents" on child_documents;
drop policy if exists "co_parents_can_insert_documents" on child_documents;
drop policy if exists "author_can_update_documents" on child_documents;
drop policy if exists "author_can_delete_documents" on child_documents;
create policy "co_parents_can_read_documents" on child_documents for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_documents" on child_documents for insert with check (is_co_parent(child_id) and uploaded_by = auth.uid());
create policy "author_can_update_documents" on child_documents for update using (uploaded_by = auth.uid());
create policy "author_can_delete_documents" on child_documents for delete using (uploaded_by = auth.uid());

-- Children policies
drop policy if exists "co_parents_can_read_children" on children;
drop policy if exists "anyone_can_insert_children" on children;
create policy "co_parents_can_read_children" on children for select using (is_co_parent(id));
create policy "anyone_can_insert_children" on children for insert with check (true);

-- Co-parents policies
drop policy if exists "co_parents_can_read_co_parents" on co_parents;
drop policy if exists "users_can_insert_co_parents" on co_parents;
create policy "co_parents_can_read_co_parents" on co_parents for select using (is_co_parent(child_id));
create policy "users_can_insert_co_parents" on co_parents for insert with check (user_id = auth.uid());

-- Summaries policies
drop policy if exists "co_parents_can_read_summaries" on summaries;
drop policy if exists "co_parents_can_insert_summaries" on summaries;
create policy "co_parents_can_read_summaries" on summaries for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_summaries" on summaries for insert with check (is_co_parent(child_id));

-- Milestone suggestions policies
drop policy if exists "co_parents_can_read_suggestions" on milestone_suggestions;
drop policy if exists "co_parents_can_insert_suggestions" on milestone_suggestions;
drop policy if exists "co_parents_can_update_suggestions" on milestone_suggestions;
create policy "co_parents_can_read_suggestions" on milestone_suggestions for select using (is_co_parent(child_id));
create policy "co_parents_can_insert_suggestions" on milestone_suggestions for insert with check (is_co_parent(child_id));
create policy "co_parents_can_update_suggestions" on milestone_suggestions for update using (is_co_parent(child_id));

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Note: Create buckets 'photos' and 'documents' in Supabase dashboard (both private)
-- Then apply these storage policies:

-- create policy "co_parent_upload_photos" on storage.objects for insert
--   with check (bucket_id = 'photos' and auth.role() = 'authenticated' and is_co_parent((storage.foldername(name))[1]::uuid));
-- create policy "co_parent_read_photos" on storage.objects for select
--   using (bucket_id = 'photos' and auth.role() = 'authenticated' and is_co_parent((storage.foldername(name))[1]::uuid));
-- create policy "co_parent_upload_documents" on storage.objects for insert
--   with check (bucket_id = 'documents' and auth.role() = 'authenticated' and is_co_parent((storage.foldername(name))[1]::uuid));
-- create policy "co_parent_read_documents" on storage.objects for select
--   using (bucket_id = 'documents' and auth.role() = 'authenticated' and is_co_parent((storage.foldername(name))[1]::uuid));
