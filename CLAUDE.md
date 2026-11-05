# caredoc-branch — Claude Code 작업 가이드

## 프로젝트 개요
요양·돌봄 일자리 포털 "케어잡모아" 저장소. 기본 브랜치는 `carejob-moa`.
정적 프로토타입(`carejob-moa/`)과 실서비스용 Next.js 14 앱(`carejob-moa-web/`)으로 구성된다.
웹 앱은 App Router · TypeScript · Tailwind · Supabase 기반이며 Vercel 에 배포한다.
내부 결정사항·진행 상황은 공개 저장소이므로 여기 적지 않는다 (비공개 문서에 보관).

## 구조
| 경로 | 내용 |
|---|---|
| `carejob-moa/` | 정적 프로토타입(HTML·JS·CSS, 빌드 없음). `vercel.json` 리라이트로 SPA 라우팅 |
| `carejob-moa-web/` | Next.js 14 앱. 세부 가이드는 `carejob-moa-web/CLAUDE.md`, `README.md` |
| `carejob-moa-web/src/app` | 라우트(`/jobs`, `/facility`, `/guide`, `/biz/*`, `/admin`, `/api/*` 등) |
| `carejob-moa-web/src/lib` | 데이터 계층(`repo.ts`), SEO, 인증, DB 클라이언트, 시드 데이터 |
| `carejob-moa-web/supabase/migrations` | DB 스키마 SQL |
| `carejob-moa-web/docs` | 운영 전환·연동 API 문서 |
| `.claude/` | 클라우드 세션 SessionStart 훅(의존성 자동 설치) |

## 실행·테스트·린트
`carejob-moa-web/` (Node · npm):
- 설치 `npm install` · 개발 서버 `npm run dev` (http://localhost:3000)
- 빌드 `npm run build` (타입체크·린트 포함, 커밋 전 통과 필요) · 실행 `npm start`
- 린트 `npm run lint` (단일 파일: `npx next lint --file <경로>`) · 타입체크 `npx tsc --noEmit`
- 별도 테스트 스크립트는 없음.

`carejob-moa/`: 빌드·의존성 없음. `index.html` 을 정적 서버로 띄워 확인한다.

## 환경 변수 (이름만, 값은 저장소에 두지 않음)
`carejob-moa-web/.env.example` 을 `.env.local` 로 복사해 사용. Supabase 값이 비면 목업 모드로 동작한다.
- 사이트: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INDEXABLE`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- 운영·연동: `ADMIN_EMAILS`, `CRON_SECRET`, `CAREDOC_SYNC_SECRET`
- 문자: `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SMS_SENDER`, `SEND_SMS_HOOK_SECRET`
- 사업자 표기: `NEXT_PUBLIC_COMPANY_*`, `NEXT_PUBLIC_PRIVACY_OFFICER`, `NEXT_PUBLIC_PRIVACY_EMAIL`

## 작업 규칙
- 작업은 Claude Code 클라우드 세션에서만 진행한다. 세션 시작 시 훅이 의존성을 설치한다.
- 작은 단위로 자주 커밋하고 바로 push 한다(세션 종료 시 로컬 변경은 사라진다).
- 공개 저장소다. 비밀 키·토큰·`.env.local`·개인정보·내부 수치를 커밋하지 않는다.
