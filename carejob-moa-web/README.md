# 케어잡모아 (carejob-moa-web)

요양·돌봄 일자리 포털 — Next.js 14 App Router · TypeScript · Supabase.

## 실행
```
npm i && npm run dev     # http://localhost:3000
npm run build && npm start
```
`.env.example` 을 `.env.local` 로 복사. Supabase 값이 비어 있으면 목업 인증(아무 6자리 코드 통과, 010-xxxx-0101 = 케어닥 회원)과 콘솔 로그 DB 로 동작한다.

## 구조
- `src/app` — 라우트. `/` 홈, `/jobs/[[...segments]]` 목록(/jobs/{구}/{직종}/자격무관)과 상세(/jobs/{id}-{slug}), `/facility/{id}-{slug}`, `/guide[/slug]`, `/start`, `/me`, `/biz/*`, `/api/*`, `sitemap.ts`, `robots.ts`
- `src/lib/repo.ts` — 데이터 접근 계층(현재 시드). Supabase 로 교체 지점.
- `src/lib/data` — 시드 240건(프로토타입과 같은 id), 인재 72명, 가이드 4편
- `src/lib/seo.ts` — slug·canonical·JobPosting/Organization/Breadcrumb JSON-LD
- `src/lib/auth/client.ts` — 전화 OTP·카카오(Supabase) / 목업
- `src/components` — 헤더·푸터·탭바, 공고 카드·행, 모달(로그인·기업가입·간편지원·주문·제안)
- `supabase/migrations/0001_init.sql` — 스키마(RLS 포함)

## 배포
Vercel · Root Directory `carejob-moa-web`. 환경변수는 `.env.example` 참고. 실도메인 연결 전까지 `NEXT_PUBLIC_INDEXABLE=0`.
