-- Allow anyone to read store information from seller profiles
-- This is safe because store names, logos, and slugs are public information

create policy "Anyone can view seller store information"
  on public.profiles for select
  using (role = 'seller');
