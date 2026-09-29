function tl(o){const l=S.appl.lic;const i=l.indexOf(o);if(o==="아직 없어요"){S.appl.lic=i<0?[o]:[];}else{if(i<0)l.push(o);else l.splice(i,1);S.appl.lic=l.filter(x=>x!=="아직 없어요");}renderModal();}
function start(){
  const now=JOBS.filter(j=>j.noLic);
  return `<div style="padding-block:24px" class="stack">
    <span class="tag gr" style="align-self:flex-start">자격증이 없어도 괜찮습니다</span>
    <h1>오늘 시작할 수 있는 일부터,<br>요양보호사가 되는 길까지</h1>
    <p class="muted" style="max-width:640px">자격증이 없어도 바로 할 수 있는 일이 있습니다. 일하면서 자격을 따면 급여와 선택지가 넓어집니다.</p>
  </div>
  <div class="sec-t"><h2>지금 바로 가능한 일 <span class="muted" style="font-size:18px">${now.length}건</span></h2><button onclick="S.f.noLic=true;go('search')">전체 보기 →</button></div>
  <div class="grid g3">${now.slice(0,6).map(jobCard).join("")}</div>
  <div class="sec-t"><h2>요양보호사 자격, 이렇게 4단계</h2><span class="small muted">교육 240시간 기준 · 세부 내용은 교육원 확인</span></div>
  <div class="road">
    <div class="now"><b>1</b><h3>지금 가능한 일로 시작</h3><p>병원동행·생활지원·조리보조·간병인 협회 등록. 현장을 먼저 경험합니다.</p></div>
    <div><b>2</b><h3>교육원 등록 (240시간)</h3><p>이론·실기·현장실습. 야간·주말반이 있어 일과 병행 가능. 케어닥 제휴 교육원 할인.</p></div>
    <div><b>3</b><h3>국가시험 응시</h3><p>연 3회 이상 시행. 합격률 90% 안팎(미확인). 시험 대비 문제집은 케어닥이 무료 제공.</p></div>
    <div><b>4</b><h3>자격증으로 재지원</h3><p>요양보호사 공고 전체가 열립니다. 시급 13,800~15,000원, 월 235~290만원대(샘플 공고 기준).</p></div>
  </div>
  <div class="card" style="margin-top:24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center">
    <div><h3>케어닥 교육원 상담 받기</h3><p class="muted">내 동네 교육원과 야간반 일정을 전화로 안내해 드립니다. 상담 무료.</p></div>
    <button class="btn pri pill" onclick="toast('상담 신청이 접수되었습니다')">상담 신청</button>
  </div>
  <div class="sec-t"><h2>자격이 필요한 일과 필요 없는 일</h2></div>
  <div class="card tbl"><table><tr><th>직종</th><th>필요 자격</th><th>준비 기간</th><th class="num">샘플 급여</th></tr>
    <tr><td>병원동행매니저</td><td>없음 (케어닥 교육 8시간)</td><td>1주</td><td class="num">건당 3~3.5만원</td></tr>
    <tr><td>생활지원사</td><td>없음</td><td>바로</td><td class="num">월 118만원</td></tr>
    <tr><td>조리원·조리보조</td><td>없음 (보건증)</td><td>1주</td><td class="num">월 205만원</td></tr>
    <tr><td>간병인</td><td>없음 (협회 교육 권장)</td><td>1~2주</td><td class="num">일 13~15만원</td></tr>
    <tr><td style="background:var(--primary-bg)">요양보호사</td><td style="background:var(--primary-bg)">국가자격 (교육 240시간 + 시험)</td><td style="background:var(--primary-bg)">3~4개월</td><td class="num" style="background:var(--primary-bg)">월 235~290만원</td></tr>
    <tr><td>사회복지사</td><td>2급 이상 (학점 이수)</td><td>1~2년</td><td class="num">월 268만원</td></tr>
  </table></div>`;
}
function biz(){
  const b=S.auth.biz;
  return `<section class="biz-hero" style="margin-inline:-16px;padding-inline:16px"><div style="max-width:1280px;margin:0 auto">
    <h1>요양·돌봄 인력, 우리 동네 구직자에게 바로 닿습니다</h1>
    <p style="opacity:.9;margin-top:8px;max-width:640px">공고 등록은 무료. 필요할 때만 상위노출·배너·급구·문자 알림을 더하세요.</p>
    <div class="kpi"><div><b>0원</b><span>공고 등록 · 지원자 열람</span></div><div><b>5060 여성</b><span>핵심 구직자층 · 지역 기반</span></div><div><b>케어닥 연동</b><span>케어닥 앱 구직 회원 이력 공유</span></div></div>
    <div class="row" style="margin-top:24px"><button class="btn pill" style="background:#fff;color:var(--secondary)" onclick="requireBiz(()=>go('post'))">${b?"무료로 공고 올리기":"1분 가입하고 공고 올리기"}</button><button class="btn out pill" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.5)" onclick="go('ads')">광고 상품 보기</button></div>
  </div></section>
  <div style="margin-top:20px">${bizVerifyBanner()}</div>
  ${b?`<div class="sec-t"><h2>우리 시설 채용 현황</h2><span class="small muted">${esc(b.org)}</span></div>`:`<div class="sec-t"><h2>가입하면 이렇게 보입니다 <span class="cap">샘플</span></h2><span class="small muted">해피케어 방문요양센터</span></div>`}
  <div class="dash"><div class="card hi"><b>27</b><span>이번 주 지원자</span></div><div class="card"><b>3</b><span>진행 중 공고</span></div><div class="card"><b>412</b><span>공고 조회</span></div><div class="card" style="cursor:pointer" onclick="go('talent')"><b>41</b><span>우리 동네 구직자 · 인재정보 보기 →</span></div></div>
  <div class="sec-t"><h2>진행 중 공고</h2><button onclick="requireBiz(()=>go('post'))">+ 새 공고</button></div>
  <div class="card tbl"><table><tr><th>공고</th><th>상품</th><th>상태</th><th class="num">조회</th><th class="num">지원</th><th></th></tr>
    <tr><td>요양보호사 · 오전 9~12시</td><td><span class="tag or">상위노출 7일</span></td><td><span class="tag gr">노출 중</span></td><td class="num">312</td><td class="num">19</td><td><button class="btn out xs" onclick="toast('지원자 목록(목업)')">지원자 보기</button></td></tr>
    <tr><td>요양보호사 · 야간</td><td><span class="tag gy">무료</span></td><td><span class="tag gr">노출 중</span></td><td class="num">64</td><td class="num">5</td><td><button class="btn out xs" onclick="go('ads')">상위노출 추가</button></td></tr>
    <tr><td>사무행정</td><td><span class="tag gy">무료</span></td><td><span class="tag gy">마감</span></td><td class="num">36</td><td class="num">3</td><td></td></tr>
  </table></div>
  <div class="sec-t"><h2>왜 케어잡모아에 올리나요</h2></div>
  <div class="grid g3">
    <div class="card stack"><h3>맞는 사람만 봅니다</h3><p class="muted">요양·돌봄 직종만 다루는 포탈입니다. 일반 잡포탈처럼 무관한 지원이 섞이지 않습니다.</p></div>
    <div class="card stack"><h3>동네 단위로 도달</h3><p class="muted">시설 반경 기준으로 노출되고, 문자 알림은 해당 동 구직자에게만 갑니다.</p></div>
    <div class="card stack"><h3>시설 신뢰 정보가 곧 광고</h3><p class="muted">평가등급·4대보험·급여 공개를 표시하면 지원율이 올라갑니다. 등급이 좋은 시설일수록 유리합니다.</p></div>
  </div>`;
}
let P={fac:"방문요양",job:"요양보호사",sched:"오전만",pay:"",ins:true,payOpen:true,noLic:false,urgent:false,addr:"강남구 대치동",org:"해피케어 방문요양센터",hours:"오전 9~12시 · 주 5일",desc:""};
function postPreviewCard(){return jobCard({id:0,top:false,urgent:P.urgent,caredoc:false,noLic:P.noLic,org:P.org||"시설 이름",fac:P.fac,title:`${P.job} 모집 · ${(P.hours||"").split(" ·")[0]}`,area:P.addr,dist:"도보 12분",hours:(P.hours||"").split(" · "),pay:P.pay||"급여 미입력",grade:"A",days:0,reviews:18}).replace(/onclick="[^"]*"/,"").replace(/onkeydown="[^"]*"/,"");}
function postPreview(){const el=$("post-preview");if(el)el.innerHTML=postPreviewCard();}
