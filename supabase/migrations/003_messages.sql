-- Messages table for co-parent messaging (scoped per child)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  sender_id uuid not null,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

-- Index for fast lookups by child
create index messages_child_id_created_at_idx on public.messages(child_id, created_at desc);

-- RLS
alter table public.messages enable row level security;

create policy "Co-parents can view messages for their children"
  on public.messages for select
  using (public.is_co_parent(child_id));

create policy "Co-parents can send messages for their children"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and public.is_co_parent(child_id)
  );

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
