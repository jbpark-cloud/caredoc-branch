-- 케어잡모아 초기 스키마 (Supabase Postgres). 부록 D 회원 체계 · 기능 정의 반영.
create extension if not exists pgcrypto;

-- 구직자: 전화번호 = 아이디(auth.users.phone). 비밀번호 없음.
create table if not exists seekers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '회원',
  phone text unique not null,
  lic text[] not null default '{}',
  caredoc_linked boolean not null default false,   -- 케어닥 앱 회원 연동
  caredoc_member_id text,
  open_to_offers boolean not null default false,   -- 인재정보 노출 동의
  created_at timestamptz not null default now()
);

-- 기업회원 (시설·병원)
create type biz_status as enum ('none','pending','verified');
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  org text not null,
  fac text not null,
  manager_name text not null,
  manager_phone text not null,
  email text unique,
  bizno text,           -- 사업자등록번호
  ltc_code text,        -- 장기요양기관 코드
  status biz_status not null default 'none',
  verify_requested_at timestamptz,
  verified_at timestamptz,
  grade text,           -- 공단 평가등급 (자동 연결)
  created_at timestamptz not null default now()
);

-- 공고
create table if not exists jobs (
  id bigserial primary key,
  business_id uuid references businesses(id) on delete cascade,
  org text not null, fac text not null, job text not null, sched text not null,
  title text, hours text, addr text, gu text, dong text, pay text, contact text,
  ins boolean default true, pay_open boolean default true, no_lic boolean default false,
  urgent boolean default false, top boolean default false, caredoc boolean default false,
  description text default '',
  published boolean not null default false,   -- 인증 완료 후 true
  source text not null default 'web',         -- web | caredoc_app
  external_id text,                           -- 케어닥 앱 공고 id (양방향 연동)
  created_at timestamptz not null default now(), closed_at timestamptz
);
create index if not exists jobs_pub_idx on jobs (published, gu, job, created_at desc);

-- 지원
create table if not exists applications (
  id bigserial primary key,
  job_id bigint not null, job_org text,
  seeker_id uuid references seekers(id) on delete set null,
  name text not null, phone text not null, proxy_phone text,
  lic text[] default '{}', open_to_offers boolean default false,
  source text default 'web', status text default 'sent',
  created_at timestamptz not null default now()
);

-- 광고 주문 · 인재 제안 · 상담
create table if not exists orders ( id bigserial primary key, business_id uuid references businesses(id), product text not null, count int not null default 1, amount int not null, status text default 'pending', created_at timestamptz default now() );
create table if not exists proposals ( id bigserial primary key, business_id uuid references businesses(id), talent_id bigint not null, job_id bigint, count int default 1, amount int, status text default 'sent', accepted_at timestamptz, created_at timestamptz default now() );
create table if not exists consults ( id bigserial primary key, type text, phone text, source text, created_at timestamptz default now() );

-- 공개 읽기: 노출된 공고만
alter table jobs enable row level security;
create policy jobs_public_read on jobs for select using (published = true);
alter table seekers enable row level security;
create policy seekers_self on seekers for all using (auth.uid() = id);
alter table businesses enable row level security;
create policy biz_owner on businesses for all using (auth.uid() = owner_id);
alter table applications enable row level security;
create policy app_self on applications for select using (auth.uid() = seeker_id);
