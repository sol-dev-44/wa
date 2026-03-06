-- Add entry_date to journal_entries so parents can pick a date for their entry
alter table journal_entries add column if not exists entry_date date;
