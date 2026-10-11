# 케어닥 앱 → 케어잡모아 공고 연동 API

케어닥 앱에 올라온 채용 공고를 케어잡모아에 자동 노출합니다(케어잡모아 공고는 케어닥 앱에 노출하지 않음).

- **URL** `POST {케어잡모아 주소}/api/integrations/caredoc/jobs`
- **인증** `Authorization: Bearer {CAREDOC_SYNC_SECRET}` — Vercel 프로젝트 환경변수에서 확인
- **방식** `external_id`(케어닥 공고 ID) 기준 upsert. 같은 ID 를 다시 보내면 수정, `closed: true` 면 마감
- 한 번에 최대 500건. 생성·수정·마감 시점마다 호출하거나 10분 주기 배치 모두 가능

## 요청
```json
{ "jobs": [
  { "external_id": "CD-10293", "org": "케어닥 방문요양 송파점", "fac": "방문요양", "job": "요양보호사",
    "sched": "오전만", "title": "요양보호사 선생님을 모십니다", "hours": "오전 9~12시 · 주 5일",
    "addr": "서울 송파구 잠실동", "pay": "시급 15,000원", "contact": "02-000-0000",
    "ins": true, "pay_open": true, "no_lic": false, "head": 2, "description": "하는 일…" },
  { "external_id": "CD-10011", "closed": true }
] }
```

| 필드 | 필수 | 허용 값 |
|---|---|---|
| fac | ○ | 방문요양·주야간보호·요양원·요양병원·재활병원·일반 병원·복지관·실버타운·간병인 협회 (방문요양센터·주간보호 등 별칭 허용) |
| job | ○ | 요양보호사·간병인·사회복지사·간호사·간호조무사·물리치료사·작업치료사·병원동행매니저·생활지원사·시설장·조리원·조리보조·운전원(송영)·사무행정 |
| sched |  | 오전만·주간·주3일·야간·입주·단기 (기본 주간) |
| org, addr, pay | ○ | 문자열. addr 에 '○○구 ○○동' 이 있으면 지역 필터에 자동 반영 |

## 응답
```json
{ "ok": true, "total": 2, "saved": 2, "results": [ { "external_id": "CD-10293", "ok": true, "id": 31 }, … ] }
```
건별로 `ok:false, error:"직종 'xx' 미지원"` 처럼 이유가 옵니다. 401 = 토큰 오류, 503 = DB 미연결(시범 운영 중).
