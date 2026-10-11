export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://carejobmoa.kr";
export const SITE_NAME = "케어잡모아";

export const JOB_TYPES = ["요양보호사","간병인","사회복지사","간호사","간호조무사","물리치료사","작업치료사","병원동행매니저","생활지원사","시설장","조리원·조리보조","운전원(송영)","사무행정"] as const;
export const SCHEDS = ["오전만","주간","주3일","야간","입주","단기"] as const;
export const FACS = ["방문요양","주야간보호","요양원","요양병원","재활병원","일반 병원","복지관","실버타운","간병인 협회"] as const;
export const GU_LIST = ["강남구","서초구","송파구","강동구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구","노원구","은평구","서대문구","마포구","양천구","강서구","구로구","금천구","영등포구","동작구","관악구","용산구","중구","종로구"] as const;

export const NOLIC_JOBS = new Set(["간병인","병원동행매니저","생활지원사","조리원·조리보조","운전원(송영)","사무행정"]);

export const BIZ_STATUS_LABEL: Record<string, string> = { none: "미인증", pending: "검수 중", verified: "인증 완료" };

export const LIC_OPTIONS = ["요양보호사 자격증","간병인 교육 이수","사회복지사 자격증","간호조무사 자격증","운전면허(송영)","아직 없어요"];

/** 광고 상품 (가안) */
export const AD_PRODUCTS = [
  { key: "top", name: "상위노출", desc: "지역·직종 목록 최상단 고정 + 주황 테두리", price: 30000, priceLabel: "30,000원", period: "7일", notes: ["30일 90,000원","지역·직종 목록에서 무료 공고보다 위에 고정","케어닥 앱 노출은 포함되지 않음"], hot: true },
  { key: "banner", name: "메인 배너", desc: "케어잡모아 첫 화면 '오늘 눈여겨볼 공고' 배너", price: 150000, priceLabel: "150,000원", period: "7일", notes: ["시설 브랜딩 · 로고·사진 노출","지역(구) 단위 타깃 선택","월 4개 시설만 판매"], hot: false },
  { key: "urgent", name: "급구 태그", desc: "빨간 '급구' 표시 + 최신순 상단", price: 7000, priceLabel: "7,000원", period: "3일", notes: ["상위노출과 함께 쓰면 할인","오늘 당장 필요할 때"], hot: false },
  { key: "sms", name: "동네 문자 알림", desc: "근무지 반경 3km 구직자에게 공고 문자 발송", price: 90, priceLabel: "건당 90원", period: "1회", notes: ["최소 200건 18,000원","수신 동의 구직자에게만 발송","야간 발송 없음 (08~20시)"], hot: false },
  { key: "propose", name: "인재 제안", desc: "인재정보에서 고른 구직자에게 공고 제안 발송", price: 5000, priceLabel: "건당 5,000원", period: "1건", notes: ["10건 묶음 40,000원","구직자 수락 시 연락처 공개","미수락 건 환불"], hot: false },
];

/** 홈 링크 허브 · sitemap 대상 */
export const HUB_GU = ["강남구","서초구","송파구","강동구","성동구","마포구","노원구","강서구"];
export const HUB_JOBS = ["요양보호사","간병인","사회복지사","간호조무사","병원동행매니저"];

export const FAC_INTRO: Record<string, string> = {
  "방문요양": "어르신 가정을 방문해 신체활동·가사 지원을 제공하는 재가 장기요양기관입니다.",
  "주야간보호": "낮 시간 동안 어르신을 모시고 식사·프로그램·재활을 제공하는 데이케어 시설입니다.",
  "요양원": "입소 어르신께 24시간 요양·돌봄을 제공하는 노인의료복지시설입니다.",
  "요양병원": "만성질환 어르신의 입원 치료와 간병을 함께 제공하는 의료기관입니다.",
  "재활병원": "재활의학 전문의와 치료사가 운동·작업치료를 제공하는 병원입니다.",
  "일반 병원": "외래·입원 진료를 제공하는 의료기관입니다.",
  "복지관": "지역 어르신 대상 노인맞춤돌봄·여가·교육 프로그램을 운영하는 복지시설입니다.",
  "실버타운": "자립 생활이 가능한 어르신을 위한 노인복지주택입니다.",
  "간병인 협회": "병원 간병 인력을 교육·등록·배정하는 협회입니다.",
};

/** 사업자 표시 정보 — 빈 값은 화면에서 생략. 공개 전 실제 값으로 채울 것(전자상거래법·직업안정법 표시 의무) */
export const COMPANY = {
  name: "(주)케어닥",
  ceo: process.env.NEXT_PUBLIC_COMPANY_CEO || "",
  bizNo: process.env.NEXT_PUBLIC_COMPANY_BIZNO || "",              // 사업자등록번호
  mailOrderNo: process.env.NEXT_PUBLIC_COMPANY_MAILORDER || "",    // 통신판매업 신고번호
  jobInfoNo: process.env.NEXT_PUBLIC_COMPANY_JOBINFO || "",        // 직업정보제공사업 신고번호
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "",
  tel: process.env.NEXT_PUBLIC_COMPANY_TEL || "",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "",
  privacyOfficer: process.env.NEXT_PUBLIC_PRIVACY_OFFICER || "",   // 개인정보 보호책임자 성명·직책
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "",
};
