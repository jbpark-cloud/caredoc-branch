# 케어잡모아 실서비스 전환 — 대표님 할 일만

코드·배포·사업자 표시·운영 자동화는 끝났습니다. 아래는 **대표님 명의 계정이 필요한 일**만 남긴 목록입니다. 값이 들어가는 순간 시범 운영 띠가 사라지고 실서비스로 바뀝니다.

| 순서 | 할 일 | 걸리는 시간 | 끝나면 |
|---|---|---|---|
| 1 | Supabase 프로젝트 생성 + SQL 1회 실행 | 15분 | 회원·공고·지원이 실제로 저장 |
| 2 | 솔라피 가입 + 발신번호 등록 | 가입 10분, 발신번호 승인 1~2영업일 | 인증번호·지원 알림·새 공고 문자 발송 |
| 3 | 카카오 디벨로퍼스 앱 등록(선택) | 20분 | 카카오 로그인 |
| 4 | 도메인 연결(예: carejobmoa.kr) | 10분 + DNS 반영 | 검색 노출 시작 |
| 5 | 직업정보제공사업 신고·약관 법무 검토 | 외부 일정 | 신고번호 푸터 표시 |

## 1. Supabase
1. supabase.com → New project. Region **Northeast Asia (Seoul)**
2. SQL Editor → `supabase/migrations/0001_init.sql` 전체 붙여넣기 → Run
3. Authentication → Providers: **Phone** 켜기, **Email** 켜기(Confirm email 권장)
4. Authentication → URL Configuration: Site URL = 서비스 주소, Redirect URLs 에 `{서비스 주소}/auth/callback`
5. Project Settings → API 의 URL·anon·service_role 값을 Vercel(carejob-moa-web → Settings → Environment Variables, Production)에 입력:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`(운영자 이메일)

## 2. 솔라피 (국내 문자)
1. solapi.com 가입 → 발신번호 등록(1833-9119 등, 통신서비스 이용증명원 필요) → API Key 발급
2. Vercel 에 `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SMS_SENDER` 입력
3. Supabase → Authentication → **Hooks → Send SMS → HTTPS**, URL `{서비스 주소}/api/hooks/send-sms` → 생성된 시크릿을 Vercel `SEND_SMS_HOOK_SECRET` 에 입력
   → 인증번호 문자가 Twilio 등 해외 업체 없이 솔라피로 나갑니다

## 3. 카카오 로그인(선택)
developers.kakao.com → 앱 생성 → 카카오 로그인 활성화 → Redirect URI 에 Supabase 콜백(`https://{프로젝트}.supabase.co/auth/v1/callback`) → REST API 키·Client Secret 을 Supabase Providers → Kakao 에 입력
→ 마지막으로 Vercel 환경변수 `NEXT_PUBLIC_KAKAO_LOGIN=1` 추가 후 재배포(이 값이 없으면 카카오 버튼은 숨겨집니다)

## 4. 도메인
Vercel 프로젝트 → Domains 에 추가 → `NEXT_PUBLIC_SITE_URL`=도메인, `NEXT_PUBLIC_INDEXABLE=1` → Redeploy

## 환경변수 입력 후
Vercel → Deployments → 최신 배포 ⋯ → **Redeploy**. 그다음 `/admin` 에서 운영자 이메일로 로그인.

> **운영자 계정은 반드시 먼저 만들어 두세요.** Supabase Authentication → Users → Add user 에서 `ADMIN_EMAILS` 의 주소로 계정을 만들고 **Auto Confirm User** 를 켭니다. 이메일 확인이 끝난 계정만 운영자로 인정됩니다. 운영자 계정을 만들기 전에는 Supabase 의 "Confirm email" 을 끄지 마세요(끄면 누구나 그 주소로 가입을 시도할 수 있습니다).

## 이미 해 둔 것
- 사업자 표시(대표·사업자번호·주소·전화·이메일·개인정보 보호책임자) — caredoc.kr 공시 정보 기준
- 매일 09:00 크론: 미인증 7일 리마인드 문자, 보관기간 지난 개인정보 파기, 새 공고 문자 알림 (`CRON_SECRET` 설정 완료)
- 케어닥 앱 공고 연동 API + 토큰(`CAREDOC_SYNC_SECRET` 설정 완료) → `docs/CAREDOC_SYNC_API.md` 를 케어닥 개발팀에 전달
- 운영자 콘솔 `/admin` → '공고 일괄 등록' 에서 엑셀(CSV) 업로드로 첫 공고 채우기

## 공개 전 마지막 체크
- [ ] 실제 공고 30건 이상(케어닥 직영 + 초기 제휴 시설) — 0건으로 열지 않기
- [ ] 휴대폰으로 지원 1건 → 기업 홈에서 지원자 확인 → 문자 수신까지 직접 확인
