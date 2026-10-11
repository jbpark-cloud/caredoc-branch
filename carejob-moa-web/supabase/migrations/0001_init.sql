-- 케어잡모아 초기 스키마 (Supabase Postgres)
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run. 여러 번 실행해도 안전(if not exists).
-- 서버는 service_role 키로만 접근하고, 브라우저(anon)는 인증에만 쓴다 → 모든 테이블 RLS ON, anon 정책 없음.

create extension if not exists pgcrypto;

do $$ begin create type biz_status as enum ('none','pending','verified'); exception when duplicate_object then null; end $$;

-- 구직자: 전화번호 = 아이디(auth.users.phone). 비밀번호 없음. 카카오 로그인 사용자는 phone 이 비어 있을 수 있음
create table if not exists seekers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '회원',
  phone text,
  lic text[] not null default '{}',
  want_job text, gu text, dong text, sched text, age int, memo text,
  caredoc_linked boolean not null default false,   -- 케어닥 앱 회원 연동(2단계)
  caredoc_member_id text,
  open_to_offers boolean not null default false,   -- 인재정보 노출 동의
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists seekers_phone_uq on seekers (phone) where phone is not null and phone <> '';

-- 기업회원 (시설·병원)
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references auth.users(id) on delete set null,
  org text not null,
  fac text not null,
  manager_name text not null,
  manager_phone text not null default '',
  email text,
  bizno text,           -- 사업자등록번호
  ltc_code text,        -- 장기요양기관 코드
  status biz_status not null default 'none',
  verify_requested_at timestamptz,
  verified_at timestamptz,
  grade text,           -- 건강보험공단 평가등급(운영자 확인 후 입력)
  created_at timestamptz not null default now()
);
create index if not exists businesses_status_idx on businesses (status, verify_requested_at desc);

-- 공고
create table if not exists jobs (
  id bigserial primary key,
  business_id uuid references businesses(id) on delete cascade,
  org text not null, fac text not null, job text not null, sched text not null,
  title text, hours text, addr text, gu text, dong text, pay text, contact text,
  ins boolean default true, pay_open boolean default true, no_lic boolean default false,
  urgent boolean default false, top boolean default false, caredoc boolean default false,
  description text default '', head int default 1, benefits text[] default '{}', views int default 0,
  published boolean not null default false,   -- 시설 인증 완료 후 true
  source text not null default 'web',         -- web | caredoc_app
  external_id text,                           -- 케어닥 앱 공고 id (2단계 연동)
  created_at timestamptz not null default now(),
  closed_at timestamptz
);
create index if not exists jobs_pub_idx on jobs (published, closed_at, created_at desc);
create index if not exists jobs_biz_idx on jobs (business_id);
create unique index if not exists jobs_external_uq on jobs (source, external_id) where external_id is not null;

-- 지원
create table if not exists applications (
  id bigserial primary key,
  job_id bigint not null references jobs(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,
  job_org text,
  seeker_id uuid references seekers(id) on delete set null,
  name text not null, phone text not null, proxy_phone text,
  lic text[] default '{}', open_to_offers boolean default false,
  consent_at timestamptz not null default now(),   -- 개인정보 수집·이용·제3자(시설) 제공 동의 시각
  source text default 'web', status text default 'sent',
  created_at timestamptz not null default now()
);
create unique index if not exists applications_dup_uq on applications (job_id, phone);
create index if not exists applications_biz_idx on applications (business_id, created_at desc);

-- 광고 신청 · 인재 제안 · 교육 상담 · 운영 로그
create table if not exists orders ( id bigserial primary key, business_id uuid references businesses(id) on delete set null, job_id bigint references jobs(id) on delete set null, product text not null, count int not null default 1, amount int not null, status text default 'pending', created_at timestamptz default now() );
create table if not exists proposals ( id bigserial primary key, business_id uuid references businesses(id) on delete set null, talent_id bigint, seeker_id uuid references seekers(id) on delete set null, job_id bigint, count int default 1, amount int, status text default 'requested', accepted_at timestamptz, created_at timestamptz default now() );
create table if not exists consults ( id bigserial primary key, type text, phone text, name text, source text, created_at timestamptz default now() );
create table if not exists admin_logs ( id bigserial primary key, admin_email text, action text, target_id text, value text, created_at timestamptz default now() );

-- RLS: 전부 켜고 anon/authenticated 정책은 두지 않는다(서버 service_role 만 접근)
alter table seekers enable row level security;
alter table businesses enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table orders enable row level security;
alter table proposals enable row level security;
alter table consults enable row level security;
alter table admin_logs enable row level security;

-- 개인정보 보관기간(개인정보처리방침과 일치): 지원 1년, 상담 6개월 경과 시 파기
-- Supabase → Database → Cron(pg_cron) 에서 매일 실행하도록 등록 권장:
--   delete from applications where created_at < now() - interval '1 year';
--   delete from consults where created_at < now() - interval '6 months';
