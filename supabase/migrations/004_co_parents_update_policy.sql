-- Allow co-parents to update their own label
create policy "users_can_update_own_co_parent"
  on co_parents for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Remove the restrictive check constraint on label so users can set any name
alter table co_parents drop constraint if exists co_parents_label_check;
alter table co_parents add constraint co_parents_label_check check (char_length(label) between 1 and 50);
