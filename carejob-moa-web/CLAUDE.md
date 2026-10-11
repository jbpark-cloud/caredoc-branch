# 케어잡모아 — Claude Code 작업 가이드

케어닥 서브 브랜드 요양·돌봄 일자리 포털. 타깃 5060 여성 구직자 + 시설·병원(B2B 광고료 모델).

## 명령
- `npm run dev` — http://localhost:3000
- `npm run build` — 타입체크·린트 포함. 커밋 전 반드시 통과
- `npx tsc --noEmit`

## 구조
- `src/app` 라우트: `/`, `/jobs/[[...segments]]`(목록 /jobs/{구}/{직종}/자격무관 + 상세 /jobs/{id}-{slug}), `/facility/[slug]`, `/guide[/slug]`, `/start`, `/me`, `/biz`, `/biz/{post,talent,ads,me}`, `/api/*`, `sitemap.ts`, `robots.ts`
- `src/lib/repo.ts` 데이터 접근 계층(현재 시드). Supabase 전환 시 이 파일만 교체
- `src/lib/data/*` 시드(공고 240·인재 72·가이드 4). 프로토타입과 같은 id
- `src/lib/seo.ts` slug·canonical·JSON-LD. URL은 한글 경로, 헤더·canonical에는 `encodeURI` 필수
- `src/lib/auth/client.ts` 전화 OTP·카카오. env 없으면 목업(6자리 아무거나, 끝자리 0101 = 케어닥 회원)
- `src/components/providers.tsx` 인증 상태·모달·토스트(localStorage 유지)
- `supabase/migrations/0001_init.sql` 스키마

## 확정 정책 (바꾸지 말 것)
- 구직자: 전화번호=아이디, 비밀번호 없음, 행동 시점에만 로그인, 첫 지원=가입, 보호자 대리 지원
- 기업: 5항목 1분 가입 → 즉시 공고 작성 → 사업자번호/기관코드 인증(24h 검수) 후 노출. 상태 none/pending/verified. 미인증 7일 리마인드 후 비공개
- 인재정보: 이름 "김OO" 마스킹, 연락처는 구직자 수락 후 공개, 제안 미수락 환불
- 케어닥 앱 공고 → 케어잡모아 자동 노출, 케어닥 앱에는 케어닥 공고만
- 광고 가격은 모두 가안

## 디자인 (케어닥 가이드 · 시니어 변형 A)
- Primary #FF6737 (구 #FF8450 금지), Secondary #483D8B, Pretendard, 자간 -3%
- 본문 18px, 카드 8px·1px #E5E5E5·그림자 없음, 버튼 lg 52/r10, 메인 CTA 알약형
- 오렌지는 한 화면 강조 1~2곳. 이모지·밑줄·이탤릭 금지. 아이콘 라인 1.5px
- 스타일은 `src/app/globals.css`의 토큰·클래스를 재사용(프로토타입 CSS 이식본)

## 작업 방식
- 새 기능은 착수 전 요구사항 인터뷰(한 번에 하나, 3~5개) → 요약 승인 → 자율 실행
- 완료 보고: 결과 / 가정 / 검증 / 다음 판단거리 (각 1~3줄)
- 미확인 수치는 "미확인" 표기
