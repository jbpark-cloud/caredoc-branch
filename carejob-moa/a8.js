function biz(){
  const b=S.auth.biz;
  const stat={org:[...new Set(JOBS.map(j=>j.org))].length,today:JOBS.filter(j=>j.days===0).length,apply:1284,talent:72};
  return `<section class="bhero" style="margin-inline:-16px;padding-inline:16px"><div class="bhero-in">
    <div class="bhero-copy">
      <span class="bhero-eyebrow">케어잡모아 기업회원</span>
      <h1>요양·돌봄 인력,<br>우리 동네 구직자에게<br><em>바로</em> 닿습니다</h1>
      <p>공고 등록 0원 · 지원자 열람 0원. 필요할 때만 상위노출·급구·문자 알림을 더하세요.<br>5060 요양보호사·간병인이 매일 들어오는 곳에 공고를 올립니다.</p>
      <div class="bhero-cta"><button class="btn pri pill xl" onclick="requireBiz(()=>go('post'))">${b?"무료로 공고 올리기":"1분 가입하고 공고 올리기"}</button><button class="btn ghost pill xl" onclick="go('ads')">광고 상품 보기</button></div>
      <ul class="bhero-check"><li>${I.chk}가입 즉시 공고 작성</li><li>${I.chk}사업자번호 또는 기관코드 인증 후 노출</li><li>${I.chk}공단 평가등급 자동 표시</li></ul>
    </div>
    <div class="bhero-side">
      <div class="bhero-stats">
        <div><b>${stat.org.toLocaleString()}</b><span>등록 시설·병원</span></div>
        <div><b>${stat.today}</b><span>오늘 올라온 공고</span></div>
        <div><b>${stat.apply.toLocaleString()}</b><span>이번 주 지원</span></div>
        <div><b>${stat.talent}</b><span>연락 가능한 구직자</span></div>
      </div>
      <div class="bhero-card">
        <div class="row" style="justify-content:space-between"><b>방금 들어온 지원</b><span class="cap">실시간</span></div>
        ${JOBS.filter(j=>j.days===0).slice(0,3).map((j,i)=>`<div class="bhero-row"><span class="av">${["김","박","이"][i]}</span><div><b>${["김OO","박OO","이OO"][i]} · ${[58,52,61][i]}세</b><span>${esc(j.job)} 지원 · ${j.area.split(" ")[0]} · ${["방금","3분 전","12분 전"][i]}</span></div><span class="tag gr">${["자격 보유","케어닥 인증","자격 보유"][i]}</span></div>`).join("")}
      </div>
    </div>
  </div>
  <div class="bhero-logos"><span>함께하는 시설</span>${["케어닥 너싱홈","해피케어 방문요양","늘푸른요양원","연세재활병원","송파실버타운","한마음데이케어","서울간병인협회"].map(n=>`<b>${n}</b>`).join("")}</div>
  </section>
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
function post(){
  if(!isBiz()){ setTimeout(()=>openBizJoin(()=>go('post')),0); return biz(); }
  const opt=(arr,v)=>arr.map(x=>`<option${x===v?" selected":""}>${x}</option>`).join("");
  const ck=(k,label,help)=>`<div class="check${P[k]?" on":""}" onclick="P.${k}=!P.${k};render()"><span class="bx">${P[k]?I.check:""}</span><span>${label}<br><span class="cap">${help}</span></span></div>`;
  return `<div style="padding-block:24px" class="stack"><button class="btn out xs" style="align-self:flex-start" onclick="go('biz')">← 기업 홈</button><h1>공고 등록 <span class="tag gr" style="vertical-align:middle">무료</span></h1><p class="muted">5분이면 끝납니다. 구직자가 가장 먼저 보는 것은 시간·거리·급여입니다.</p></div>
  ${S.auth.biz.status!=="verified"?`<div class="vbanner ${S.auth.biz.status==="pending"?"pend":"none"}" style="margin-bottom:16px"><div><b>${S.auth.biz.status==="pending"?"인증 검수 중 · 등록해 두면 검수 완료와 함께 자동 노출됩니다":"미인증 · 등록은 되지만 인증 전엔 구직자에게 보이지 않습니다"}</b></div>${S.auth.biz.status==="pending"?"":`<button class="btn sec sm pill" onclick="go('bizme')">지금 인증하기</button>`}</div>`:""}
  <div class="grid" style="grid-template-columns:1fr 380px">
  <form class="form card" onsubmit="event.preventDefault();toast(S.auth.biz.status==='verified'?'공고가 등록되어 노출 중입니다 (무료)':'공고가 등록되었습니다 · 인증 완료 후 노출');go('biz')">
    <div class="field"><label>시설 이름</label><input value="${esc(P.org=(P.orgSet?P.org:S.auth.biz.org))}" oninput="P.org=this.value;P.orgSet=true;postPreview()"></div>
    <div class="field"><label>시설 종류</label><select onchange="P.fac=this.value;render()">${opt(FACS,P.fac)}</select></div>
    <div class="field"><label>모집 직종</label><select onchange="P.job=this.value;render()">${opt(JOB_TYPES,P.job)}</select></div>
    <div class="field"><label>근무 형태</label><select onchange="P.sched=this.value;render()">${opt(SCHEDS,P.sched)}</select></div>
    <div class="field"><label>근무 시간·요일</label><input value="${esc(P.hours)}" oninput="P.hours=this.value;postPreview()" placeholder="예: 오전 9~12시 · 주 5일"><span class="help">구직자 화면에 그대로 보입니다. 짧고 정확하게.</span></div>
    <div class="field"><label>근무지 주소</label><input value="${esc(P.addr)}" oninput="P.addr=this.value;postPreview()"><span class="help">동 단위로 노출 · 도보·버스 거리 자동 계산</span></div>
    <div class="field"><label>급여</label><input placeholder="예: 시급 14,500원 / 월 235만원" value="${esc(P.pay)}" oninput="P.pay=this.value;postPreview()"></div>
    <div class="field"><label>담당자 연락처</label><input value="02-555-0123"></div>
    <div class="full grid g2">${ck("payOpen","급여 금액 공개","공개 시 지원율 상승 · '급여 공개' 표시")}${ck("ins","4대보험 가입","공고에 표시됩니다")}${ck("noLic","자격증 없어도 지원 가능","'자격증 없어도 가능' 표시 · 무자격자 진입 페이지에 노출")}${ck("urgent","급구 (유료 옵션)","'급구' 빨간 태그 · 3일 7,000원")}</div>
    <div class="field full"><label>상세 내용</label><textarea placeholder="하는 일, 우대 사항, 식사·주차 제공 여부 등" oninput="P.desc=this.value">${esc(P.desc)}</textarea></div>
    <div class="full card" style="background:var(--info-bg);border-color:transparent"><b>자동으로 붙는 시설 정보</b><p class="small">건강보험공단 평가등급 <b>A</b>(2024) · 시설 후기 18건 · 사업자 인증 완료. 수정이 필요하면 고객센터로 알려주세요.</p></div>
    <div class="full two"><button class="btn out" type="button" onclick="toast('임시 저장')">임시 저장</button><button class="btn pri pill" type="submit">무료로 등록하기</button></div>
  </form>
  <aside class="stack"><h3>구직자에게 이렇게 보입니다</h3>
    <div id="post-preview">${postPreviewCard()}</div>
    <div class="card stack"><h3>더 많이 보이게 하려면</h3><p class="muted small">등록 후 상위노출(7일 3만원)을 붙이면 목록 최상단에 고정됩니다.</p><button class="btn out sm" type="button" onclick="go('ads')">광고 상품 보기</button></div>
  </aside></div>`;
}
