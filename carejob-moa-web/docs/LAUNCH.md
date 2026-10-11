# 케어잡모아 실서비스 전환 가이드

현재 배포본은 **시범 운영 모드**(예시 공고, 지원 미전달)입니다. 아래 순서대로 하면 코드 수정 없이 실서비스로 바뀝니다.

## 1. Supabase (약 15분)
1. supabase.com 에서 프로젝트 생성 — Region: **Northeast Asia (Seoul)** 권장
2. SQL Editor → `supabase/migrations/0001_init.sql` 전체 붙여넣기 → Run
3. Authentication → Providers
   - **Phone**: 켜기 + 문자 발송사 연결(Twilio 등). 한국 번호 발송 가능 여부·단가 확인
   - **Email**: 켜기 (기업회원). 'Confirm email' 은 켜 두는 것을 권장
   - **Kakao**: developers.kakao.com 에서 앱 생성 → REST API 키·Client Secret 입력, Redirect URI 에 Supabase 콜백 주소 등록
4. Authentication → URL Configuration → Site URL 과 Redirect URLs 에 서비스 주소 + `/auth/callback` 추가
5. Project Settings → API 에서 URL·anon·service_role 키 복사

## 2. Vercel 환경변수 (carejob-moa-web 프로젝트 → Settings → Environment Variables)
`.env.example` 의 항목을 Production 에 입력 → Deployments → Redeploy.
- `ADMIN_EMAILS` 에 운영자 이메일, 그 이메일로 /admin 에서 로그인(기업 가입과 같은 이메일/비밀번호 계정 사용)

## 3. 공개 전 체크
- [ ] 사업자 정보·직업정보제공사업 신고번호·개인정보 보호책임자 입력
- [ ] 개인정보처리방침·이용약관 법무 검토(보관기간 1년/6개월, 국외이전 리전 기재)
- [ ] 실제 공고 확보(케어닥 직영 공고 우선 등록) — 공고 0건으로 열지 않기
- [ ] 도메인 연결 후 `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INDEXABLE=1`
- [ ] Supabase Database → Cron 에 개인정보 파기 쿼리 등록(마이그레이션 파일 하단)

## 운영 흐름
기업 가입 → 공고 작성(미노출) → 사업자번호/기관코드 인증 요청 → **/admin 에서 승인(공단 등급 입력)** → 공고 자동 노출 → 구직자 지원(문자 인증) → 기업 홈 '지원자 보기'.
광고 신청은 /admin '광고 신청' 탭에서 입금 확인 후 공고에 상위노출·급구를 켭니다.
