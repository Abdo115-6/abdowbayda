-- Create contact_messages table
create table contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  contact_reason text not null,
  message text not null,
  file_url text,
  file_name text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table contact_messages enable row level security;

-- Only admins can read contact messages
create policy "Only admins can read contact messages" on contact_messages
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Anyone can insert contact messages (for the public form)
create policy "Anyone can insert contact messages" on contact_messages
  for insert with check (true);

-- Only admins can update contact messages (mark as read)
create policy "Only admins can update contact messages" on contact_messages
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );
