-- LIEN HOA WORK MANAGER - database foundation
create extension if not exists "pgcrypto";
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin','director','manager','staff')),
  department text, created_at timestamptz default now()
);
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  department text not null, assignee_id uuid references profiles(id), creator_id uuid references profiles(id),
  priority text not null default 'Trung bình' check (priority in ('Cao','Trung bình','Thấp')),
  status text not null default 'Chưa làm' check (status in ('Chưa làm','Đang làm','Hoàn thành')),
  progress integer not null default 0 check (progress between 0 and 100),
  start_date date, due_date date, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid references profiles(id), content text not null, created_at timestamptz default now()
);
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table task_comments enable row level security;
create policy "profiles_read_authenticated" on profiles for select to authenticated using (true);
create policy "tasks_read_authenticated" on tasks for select to authenticated using (true);
create policy "tasks_insert_authenticated" on tasks for insert to authenticated with check (creator_id = auth.uid());
create policy "tasks_update_authenticated" on tasks for update to authenticated using (true) with check (true);
create policy "comments_read_authenticated" on task_comments for select to authenticated using (true);
create policy "comments_insert_authenticated" on task_comments for insert to authenticated with check (user_id = auth.uid());
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
 insert into public.profiles (id, full_name, role)
 values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'staff');
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();