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
function ads(){
  const items=[
   ["상위노출","지역·직종 목록 최상단 고정 + 주황 테두리","30,000원","7일",["30일 90,000원","같은 조건 무료 공고보다 평균 3~4배 조회(가안)","케어닥 앱 노출은 포함되지 않음"],true],
   ["메인 배너","케어잡모아 첫 화면 '오늘 눈여겨볼 공고' 배너","150,000원","7일",["시설 브랜딩 · 로고·사진 노출","지역(구) 단위 타깃 선택","월 4개 시설만 판매"],false],
   ["급구 태그","빨간 '급구' 표시 + 최신순 상단","7,000원","3일",["상위노출과 함께 쓰면 할인","오늘 당장 필요할 때"],false],
   ["동네 문자 알림","근무지 반경 3km 구직자에게 공고 문자 발송","건당 90원","1회",["최소 200건 18,000원","수신 동의 구직자에게만 발송","야간 발송 없음 (08~20시)"],false],
   ["인재 제안","인재정보에서 고른 구직자에게 공고 제안 발송","건당 5,000원","1건",["10건 묶음 40,000원","구직자 수락 시 연락처 공개","미수락 건 환불"],false]];
  return `<div style="padding-block:24px" class="stack"><button class="btn out xs" style="align-self:flex-start" onclick="go('biz')">← 기업 홈</button><h1>광고 상품</h1><p class="muted">공고 등록과 지원자 열람은 언제나 무료입니다. 가격은 가안이며 확정 전입니다.</p></div>
  <div class="grid g4" style="grid-template-columns:repeat(5,1fr)">${items.map(x=>`<div class="card price${x[5]?" hot":""}">${x[5]?'<span class="tag or" style="align-self:flex-start">가장 많이 선택</span>':""}<h3>${x[0]}</h3><p class="muted small">${x[1]}</p><p class="p">${x[2]}<small> / ${x[3]}</small></p><ul>${x[4].map(l=>`<li>${l}</li>`).join("")}</ul><button class="btn ${x[5]?"pri":"out"} pill" onclick="order('${x[0]}','${x[2]}')">신청</button></div>`).join("")}</div>
  <div class="sec-t"><h2>상시 채용 시설이라면 월정액</h2></div>
  <div class="card" style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;border-color:var(--secondary)"><div><span class="tag sec">프리미엄 월정액</span><h3 style="margin-top:8px">공고 무제한 + 상위노출 2건 상시 + 문자 알림 500건 + 인재 제안 50건</h3><p class="muted">요양원·요양병원처럼 늘 사람을 뽑는 시설용. 월 190,000원(가안).</p></div><button class="btn sec pill" onclick="order('프리미엄 월정액','190,000원')">상담 신청</button></div>
  <div class="sec-t"><h2>상품 비교</h2></div>
  <div class="card tbl"><table><tr><th></th><th>무료 공고</th><th style="background:var(--primary-bg)">상위노출</th><th>메인 배너</th><th>급구</th><th>문자 알림</th><th>월정액</th></tr>
   <tr><td>목록 노출</td><td>최신순</td><td style="background:var(--primary-bg)">최상단 고정</td><td>최신순</td><td>상단</td><td>–</td><td>최상단 고정 2건</td></tr>
   <tr><td>첫 화면 노출</td><td>–</td><td style="background:var(--primary-bg)">눈여겨볼 공고</td><td>배너</td><td>–</td><td>–</td><td>눈여겨볼 공고</td></tr>
   <tr><td>강조 표시</td><td>–</td><td style="background:var(--primary-bg)">주황 테두리</td><td>로고·사진</td><td>빨간 태그</td><td>–</td><td>주황 테두리</td></tr>
   <tr><td>구직자 직접 도달</td><td>–</td><td style="background:var(--primary-bg)">–</td><td>–</td><td>–</td><td>문자</td><td>문자 500건 · 제안 50건</td></tr>
   <tr><td class="num">가격(가안)</td><td class="num">0원</td><td class="num" style="background:var(--primary-bg)">3만원/7일</td><td class="num">15만원/7일</td><td class="num">7천원/3일</td><td class="num">90원/건</td><td class="num">19만원/월</td></tr>
  </table></div>`;
}
let ORD=[0];
function order(name,price){
  if(!isBiz()){ openBizJoin(()=>order(name,price)); return; }
  closeModal(); const ov=document.createElement("div");ov.className="ov";ov.id="modal";
  ov.innerHTML=`<div class="md" role="dialog"><h2>${name} 신청</h2><p class="muted">적용할 공고를 고르고 결제하세요. (프로토타입: 실제 결제 없음)</p>
   <div class="stack" style="margin-top:16px">${["요양보호사 · 오전 9~12시","요양보호사 · 야간"].map((x,i)=>`<div class="check${ORD.includes(i)?" on":""}" onclick="(()=>{const k=ORD.indexOf(${i});k<0?ORD.push(${i}):ORD.splice(k,1);order('${name}','${price}')})()"><span class="bx">${ORD.includes(i)?I.check:""}</span>${x}</div>`).join("")}</div>
   <div class="card" style="margin-top:16px;background:var(--bg)"><div class="row" style="justify-content:space-between"><span>${name} × ${ORD.length}건</span><b>${price}${ORD.length>1?" × "+ORD.length:""}</b></div><div class="row" style="justify-content:space-between"><span class="muted small">부가세 별도 · 세금계산서 발행</span></div></div>
   <div class="two" style="margin-top:20px"><button class="btn out" onclick="closeModal()">취소</button><button class="btn pri pill" ${ORD.length?"":"disabled"} onclick="closeModal();toast('${name} ${ORD.length}건 결제 완료(목업)')">결제하기</button></div></div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();}); document.body.appendChild(ov);
}
let TALENTS=null;
function seedRand(s){return function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}}
