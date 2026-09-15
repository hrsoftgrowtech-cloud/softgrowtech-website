-- SoftGrowTech Final Portal Setup
-- Run in Supabase SQL Editor after reviewing your existing schema.
-- This adds new portal/admin tables and does not delete legacy verification data.

create extension if not exists pgcrypto;

create table if not exists public.sgt_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  student_id text unique not null,
  name text not null,
  email text unique not null,
  phone text not null,
  domain text not null,
  registration_date timestamptz not null default now(),
  batch_start date,
  status text not null default 'Applicant' check (status in ('Applicant','Active','Completed','Closed')),
  payment_status text not null default 'Pending' check (payment_status in ('Pending','Under Verification','Verified','Invalid','Refund Pending','Refunded')),
  assessment_status text not null default 'Not Started' check (assessment_status in ('Not Started','In Progress','Complete')),
  selection_status text not null default 'Pending' check (selection_status in ('Pending','Selected','Not Selected')),
  review_status text not null default 'Pending' check (review_status in ('Pending','Under Review','Complete')),
  offer_letter_url text,
  certificate_url text,
  certificate_id text unique,
  whatsapp_group_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sgt_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sgt_domains (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sgt_batches (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  whatsapp_group_url text,
  orientation_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.sgt_tasks (
  id uuid primary key default gen_random_uuid(),
  task_key text not null,
  title text not null,
  domain text,
  description text,
  project_url text,
  submission_url text,
  opens_on date,
  submission_live_on date,
  deadline_on date,
  presentation_start date,
  presentation_end date,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sgt_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  question_set text not null default 'primary',
  question_no int not null,
  question text not null,
  options jsonb,
  answer_type text not null default 'text' check (answer_type in ('text','single','multi')),
  enabled boolean not null default true,
  unique(domain, question_set, question_no)
);

create table if not exists public.sgt_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_no int not null default 1,
  question_set text not null default 'primary',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'In Progress' check (status in ('In Progress','Complete')),
  unique(student_id, attempt_no)
);

create table if not exists public.sgt_assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.sgt_assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.sgt_assessment_questions(id) on delete cascade,
  answer text,
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create table if not exists public.sgt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  method text not null,
  transaction_id text,
  receipt_path text,
  amount text,
  submitted_at timestamptz not null default now(),
  status text not null default 'Under Verification' check (status in ('Under Verification','Verified','Invalid','Refund Pending','Refunded')),
  admin_note text
);

create table if not exists public.sgt_support_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  student_id text,
  name text,
  email text,
  category text not null,
  query_text text not null,
  status text not null default 'New' check (status in ('New','In Progress','Resolved','Closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.sgt_client_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  service text,
  requirement text not null,
  status text not null default 'New' check (status in ('New','Contacted','Discussion','Proposal','Won','Closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.sgt_admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_user uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.sgt_is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.sgt_admin_audit a where a.admin_user = auth.uid()
  ) or coalesce((select (raw_user_meta_data->>'role') = 'admin' from auth.users where id = auth.uid()), false);
$$;

-- Additional registration details requested for student onboarding.
alter table public.sgt_profiles add column if not exists country text;
alter table public.sgt_profiles add column if not exists study_year text;
alter table public.sgt_profiles add column if not exists gender text;

alter table public.sgt_profiles enable row level security;
alter table public.sgt_settings enable row level security;
alter table public.sgt_domains enable row level security;
alter table public.sgt_batches enable row level security;
alter table public.sgt_tasks enable row level security;
alter table public.sgt_assessment_questions enable row level security;
alter table public.sgt_assessment_attempts enable row level security;
alter table public.sgt_assessment_answers enable row level security;
alter table public.sgt_payments enable row level security;
alter table public.sgt_support_queries enable row level security;
alter table public.sgt_client_enquiries enable row level security;
alter table public.sgt_admin_audit enable row level security;

-- Own student data.
drop policy if exists sgt_profiles_self_select on public.sgt_profiles;
create policy sgt_profiles_self_select on public.sgt_profiles for select using (id = auth.uid() or public.sgt_is_admin() );
drop policy if exists sgt_profiles_self_update on public.sgt_profiles;
create policy sgt_profiles_self_update on public.sgt_profiles for update using (id = auth.uid() or public.sgt_is_admin()) with check (id = auth.uid() or public.sgt_is_admin() );
drop policy if exists sgt_profiles_admin_insert on public.sgt_profiles;
create policy sgt_profiles_admin_insert on public.sgt_profiles for insert with check (id = auth.uid() or public.sgt_is_admin() );

drop policy if exists sgt_settings_public_select on public.sgt_settings;
create policy sgt_settings_public_select on public.sgt_settings for select using (true );
drop policy if exists sgt_settings_admin_write on public.sgt_settings;
create policy sgt_settings_admin_write on public.sgt_settings for all using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_domains_public_select on public.sgt_domains;
create policy sgt_domains_public_select on public.sgt_domains for select using (enabled = true or public.sgt_is_admin() );
drop policy if exists sgt_domains_admin_write on public.sgt_domains;
create policy sgt_domains_admin_write on public.sgt_domains for all using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_batches_self_select on public.sgt_batches;
create policy sgt_batches_self_select on public.sgt_batches for select using (public.sgt_is_admin() or exists(select 1 from public.sgt_profiles p where p.id=auth.uid() and p.batch_start=start_date) );
drop policy if exists sgt_batches_admin_write on public.sgt_batches;
create policy sgt_batches_admin_write on public.sgt_batches for all using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_tasks_public_select on public.sgt_tasks;
create policy sgt_tasks_public_select on public.sgt_tasks for select using (enabled = true or public.sgt_is_admin() );
drop policy if exists sgt_tasks_admin_write on public.sgt_tasks;
create policy sgt_tasks_admin_write on public.sgt_tasks for all using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_questions_auth_select on public.sgt_assessment_questions;
create policy sgt_questions_auth_select on public.sgt_assessment_questions for select using (auth.uid() is not null and enabled = true or public.sgt_is_admin() );
drop policy if exists sgt_questions_admin_write on public.sgt_assessment_questions;
create policy sgt_questions_admin_write on public.sgt_assessment_questions for all using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_attempt_self on public.sgt_assessment_attempts;
create policy sgt_attempt_self on public.sgt_assessment_attempts for all using (user_id=auth.uid() or public.sgt_is_admin()) with check (user_id=auth.uid() or public.sgt_is_admin() );
drop policy if exists sgt_answers_self on public.sgt_assessment_answers;
create policy sgt_answers_self on public.sgt_assessment_answers for all using (exists(select 1 from public.sgt_assessment_attempts a where a.id=attempt_id and a.user_id=auth.uid()) or public.sgt_is_admin()) with check (exists(select 1 from public.sgt_assessment_attempts a where a.id=attempt_id and a.user_id=auth.uid()) or public.sgt_is_admin() );
drop policy if exists sgt_payments_self on public.sgt_payments;
create policy sgt_payments_self on public.sgt_payments for all using (user_id=auth.uid() or public.sgt_is_admin()) with check (user_id=auth.uid() or public.sgt_is_admin() );
drop policy if exists sgt_support_self_insert on public.sgt_support_queries;
create policy sgt_support_self_insert on public.sgt_support_queries for insert with check (user_id=auth.uid() or user_id is null );
drop policy if exists sgt_support_self_select on public.sgt_support_queries;
create policy sgt_support_self_select on public.sgt_support_queries for select using (user_id=auth.uid() or public.sgt_is_admin() );
drop policy if exists sgt_support_admin_update on public.sgt_support_queries;
create policy sgt_support_admin_update on public.sgt_support_queries for update using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_client_public_insert on public.sgt_client_enquiries;
create policy sgt_client_public_insert on public.sgt_client_enquiries for insert with check (true );
drop policy if exists sgt_client_admin_select on public.sgt_client_enquiries;
create policy sgt_client_admin_select on public.sgt_client_enquiries for select using (public.sgt_is_admin() );
drop policy if exists sgt_client_admin_update on public.sgt_client_enquiries;
create policy sgt_client_admin_update on public.sgt_client_enquiries for update using (public.sgt_is_admin()) with check (public.sgt_is_admin() );
drop policy if exists sgt_audit_admin on public.sgt_admin_audit;
create policy sgt_audit_admin on public.sgt_admin_audit for all using (public.sgt_is_admin()) with check (public.sgt_is_admin() );

-- Seed editable defaults.
insert into public.sgt_settings(key,value) values
('student_id', '{"prefix":"SGT","year_code":"26","last_used":3475}'::jsonb),
('registration', '{"enabled":true,"whatsapp_group_url":"","welcome_message":"Welcome to SoftGrowTech. Your Student ID is permanent throughout your journey."}'::jsonb),
('payment', '{"india":{"enabled":true,"fee":"149","currency":"INR","method":"UPI","details":"info.softgrowtech@oksbi","qr_url":""},"pakistan":{"enabled":true,"fee":"499","currency":"PKR","method":"JazzCash / Easypaisa","details":"Fatima Akbar • +92 321 2880115","qr_url":""},"international":{"enabled":true,"fee":"5","currency":"USD","methods":["Binance","PayPal","Wise"],"details":"Configure payment details in Admin Panel."}}'::jsonb),
('task_forms', '{"task1":"","task2":"","final":""}'::jsonb),
('support', '{"whatsapp":"https://wa.me/917839686310","email":"info.softgrowtech@gmail.com"}'::jsonb)
on conflict(key) do nothing;

insert into public.sgt_domains(name,description) values
('Web Development','Responsive websites and practical web development.'),('Android App Development','Practical Android application development.'),('Java Programming','Java programming and application development.'),('Python Programming','Python programming and practical development.'),('Artificial Intelligence','AI concepts and project-based learning.'),('Machine Learning','Machine learning concepts and practical projects.'),('Data Science','Data handling, analysis and practical data science.'),('C++ Programming','Programming logic and C++ development.'),('C Programming','Programming fundamentals and computational thinking.'),('Internet of Things','Connected devices, sensors and IoT concepts.'),('Graphic Designing','Visual communication and practical design work.'),('UI/UX Design','User interface and user experience design.'),('Data Analysis','Data analysis, visualization and practical reporting.'),('Frontend Developer','Frontend interfaces and responsive development.'),('Backend Developer','Backend development, APIs and data workflows.'),('Flutter Development','Cross-platform application development with Flutter.')
on conflict(name) do nothing;

-- Storage bucket for receipts. If your project already has one, this is harmless.
insert into storage.buckets(id,name,public) values ('payment-receipts','payment-receipts',false) on conflict(id) do nothing;

drop policy if exists sgt_receipt_upload on storage.objects;
create policy sgt_receipt_upload on storage.objects for insert to authenticated with check (bucket_id='payment-receipts' and (storage.foldername(name))[1]=auth.uid()::text );
drop policy if exists sgt_receipt_read on storage.objects;
create policy sgt_receipt_read on storage.objects for select to authenticated using (bucket_id='payment-receipts' and ((storage.foldername(name))[1]=auth.uid()::text or public.sgt_is_admin()) );

-- IMPORTANT: set the first admin manually after creating their Supabase Auth user:
-- update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"role":"admin"}'::jsonb where email='YOUR_ADMIN_EMAIL';

-- Atomic Student ID generation + profile creation after Supabase Auth signup.
create or replace function public.sgt_after_auth_signup()
returns trigger
language plpgsql security definer set search_path=public
as $$
declare cfg jsonb; next_no bigint; sid text;
begin
  select value into cfg from public.sgt_settings where key='student_id' for update;
  if cfg is null then cfg := jsonb_build_object('prefix','SGT','year_code',right(extract(year from now())::text,2),'last_used',0); end if;
  next_no := coalesce((cfg->>'last_used')::bigint,0)+1;
  sid := coalesce(cfg->>'prefix','SGT')||'-'||coalesce(cfg->>'year_code',right(extract(year from now())::text,2))||'S-'||next_no;
  insert into public.sgt_profiles(id,student_id,name,email,phone,domain)
  values(new.id,sid,coalesce(new.raw_user_meta_data->>'full_name','Student'),lower(new.email),coalesce(new.raw_user_meta_data->>'phone',''),coalesce(new.raw_user_meta_data->>'domain','General'))
  on conflict(id) do nothing;
  insert into public.sgt_settings(key,value) values('student_id',jsonb_set(cfg,'{last_used}',to_jsonb(next_no),true))
  on conflict(key) do update set value=excluded.value,updated_at=now();
  return new;
end;
$$;

drop trigger if exists sgt_auth_signup_profile on auth.users;
create trigger sgt_auth_signup_profile after insert on auth.users for each row execute function public.sgt_after_auth_signup();


-- Atomic Student ID generation + profile creation after Supabase Auth signup.
create or replace function public.sgt_after_auth_signup()
returns trigger
language plpgsql security definer set search_path=public
as $$
declare cfg jsonb; next_no bigint; sid text;
begin
  select value into cfg from public.sgt_settings where key='student_id' for update;
  if cfg is null then cfg := jsonb_build_object('prefix','SGT','year_code',right(extract(year from now())::text,2),'last_used',0); end if;
  next_no := coalesce((cfg->>'last_used')::bigint,0)+1;
  sid := coalesce(cfg->>'prefix','SGT')||'-'||coalesce(cfg->>'year_code',right(extract(year from now())::text,2))||'S-'||next_no;
  insert into public.sgt_profiles(id,student_id,name,email,phone,domain)
  values(new.id,sid,coalesce(new.raw_user_meta_data->>'full_name','Student'),lower(new.email),coalesce(new.raw_user_meta_data->>'phone',''),coalesce(new.raw_user_meta_data->>'domain','General'))
  on conflict(id) do nothing;
  insert into public.sgt_settings(key,value) values('student_id',jsonb_set(cfg,'{last_used}',to_jsonb(next_no),true))
  on conflict(key) do update set value=excluded.value,updated_at=now();
  return new;
end;
$$;

drop trigger if exists sgt_auth_signup_profile on auth.users;
create trigger sgt_auth_signup_profile after insert on auth.users for each row execute function public.sgt_after_auth_signup();

-- Atomic Student ID generation + profile creation after Supabase Auth signup.
create or replace function public.sgt_after_auth_signup()
returns trigger language plpgsql security definer set search_path=public as $$
declare cfg jsonb; next_no bigint; sid text;
begin
  select value into cfg from public.sgt_settings where key='student_id' for update;
  if cfg is null then cfg=jsonb_build_object('prefix','SGT','year_code',right(extract(year from now())::text,2),'last_used',0); end if;
  next_no=coalesce((cfg->>'last_used')::bigint,0)+1;
  sid=coalesce(cfg->>'prefix','SGT')||'-'||coalesce(cfg->>'year_code',right(extract(year from now())::text,2))||'S-'||next_no;
  insert into public.sgt_profiles(id,student_id,name,email,phone,domain)
  values(new.id,sid,coalesce(new.raw_user_meta_data->>'full_name','Student'),lower(new.email),coalesce(new.raw_user_meta_data->>'phone',''),coalesce(new.raw_user_meta_data->>'domain','General'))
  on conflict(id) do nothing;
  update public.sgt_settings set value=jsonb_set(cfg,'{last_used}',to_jsonb(next_no),true),updated_at=now() where key='student_id';
  return new;
end; $$;
drop trigger if exists sgt_auth_signup_profile on auth.users;
create trigger sgt_auth_signup_profile after insert on auth.users for each row execute function public.sgt_after_auth_signup();


-- Final signup trigger definition: stores country, current study year and gender from registration metadata.
create or replace function public.sgt_after_auth_signup()
returns trigger language plpgsql security definer set search_path=public as $$
declare cfg jsonb; next_no bigint; sid text;
begin
  select value into cfg from public.sgt_settings where key='student_id' for update;
  if cfg is null then cfg=jsonb_build_object('prefix','SGT','year_code',right(extract(year from now())::text,2),'last_used',0); end if;
  next_no=coalesce((cfg->>'last_used')::bigint,0)+1;
  sid=coalesce(cfg->>'prefix','SGT')||'-'||coalesce(cfg->>'year_code',right(extract(year from now())::text,2))||'S-'||next_no;
  insert into public.sgt_profiles(id,student_id,name,email,phone,domain,country,study_year,gender)
  values(new.id,sid,coalesce(new.raw_user_meta_data->>'full_name','Student'),lower(new.email),coalesce(new.raw_user_meta_data->>'phone',''),coalesce(new.raw_user_meta_data->>'domain','General'),coalesce(new.raw_user_meta_data->>'country',''),coalesce(new.raw_user_meta_data->>'study_year',''),coalesce(new.raw_user_meta_data->>'gender',''))
  on conflict(id) do nothing;
  update public.sgt_settings set value=jsonb_set(cfg,'{last_used}',to_jsonb(next_no),true),updated_at=now() where key='student_id';
  return new;
end; $$;
drop trigger if exists sgt_auth_signup_profile on auth.users;
create trigger sgt_auth_signup_profile after insert on auth.users for each row execute function public.sgt_after_auth_signup();
