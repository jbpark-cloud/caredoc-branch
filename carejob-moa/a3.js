function renderModal(){
  closeModal(); const a=S.appl; const j=S.job;
  const st=`<div class="steps">${[1,2,3].map(n=>`<i class="${a.step>=n?"on":""}"></i>`).join("")}</div>`;
  let body="";
  if(a.step===1) body=`<h2>이름과 전화번호를 알려주세요</h2><p class="muted">시설에서 이 번호로 연락드립니다.</p>${st}
    <div class="stack big" style="gap:14px"><div class="field"><label for="a-name">이름</label><input id="a-name" placeholder="홍길동" value="${esc(a.name)}" oninput="S.appl.name=this.value"></div>
    <div class="field"><label for="a-phone">휴대전화</label><input id="a-phone" inputmode="numeric" placeholder="010-0000-0000" value="${esc(a.phone)}" oninput="S.appl.phone=this.value"></div></div>
    <button class="btn pri pill wide" style="margin-top:20px;height:56px;font-size:18px" onclick="if(!S.appl.name||S.appl.phone.replace(/\\D/g,'').length<10){toast('이름과 전화번호를 확인해 주세요');return}S.appl.step=2;renderModal()">다음</button>`;
  if(a.step===2) body=`<h2>본인 확인</h2><p class="muted">한 가지만 고르세요. 카카오톡이 더 편합니다.</p>${st}
    <div class="cert"><button class="${a.via==="kakao"?"on":""}" onclick="S.appl.via='kakao';renderModal()">카카오톡 인증</button><button class="${a.via==="sms"?"on":""}" onclick="S.appl.via='sms';renderModal()">문자 인증</button></div>
    ${a.via==="kakao"?`<div class="card" style="margin-top:16px;background:var(--bg)"><p><b>${esc(a.phone)}</b> 카카오톡으로 인증 요청을 보냈습니다.</p><p class="muted small">카카오톡 알림에서 [인증하기]를 누르시면 자동으로 확인됩니다. (프로토타입: 아래 버튼으로 대신)</p><button class="btn sec sm" style="margin-top:10px" onclick="S.appl.ok=true;renderModal()">인증 완료로 처리</button></div>`
      :`<div class="field big" style="margin-top:16px"><label for="a-code">문자로 받은 숫자 6자리</label><input id="a-code" inputmode="numeric" placeholder="000000" maxlength="6" oninput="S.appl.code=this.value;S.appl.ok=this.value.length===6"><span class="help">${esc(a.phone)}로 보냈습니다. 안 오면 <a href="#" onclick="toast('다시 보냈습니다');return false" style="color:var(--info)">다시 받기</a></span></div>`}
    <div class="two" style="margin-top:20px"><button class="btn out" onclick="S.appl.step=1;renderModal()">이전</button><button class="btn pri pill" ${a.ok?"":"disabled"} onclick="S.appl.step=3;renderModal()">확인됐어요, 다음</button></div>`;
  if(a.step===3){ const opts=["요양보호사 자격증","간병인 교육 이수","사회복지사 자격증","간호조무사 자격증","운전면허(송영)","아직 없어요"];
    body=`<h2>가지고 계신 자격을 눌러주세요</h2><p class="muted">여러 개 골라도 됩니다. 없으면 '아직 없어요'.</p>${st}
    <div class="stack">${opts.map(o=>`<div class="check${a.lic.includes(o)?" on":""}" onclick="tl('${o}')"><span class="bx">${a.lic.includes(o)?I.check:""}</span>${o}</div>`).join("")}</div>
    <div class="two" style="margin-top:20px"><button class="btn out" onclick="S.appl.step=2;renderModal()">이전</button><button class="btn pri pill" ${a.lic.length?"":"disabled"} onclick="S.appl.step=4;renderModal()">지원 완료</button></div>`; }
  if(a.step===4) body=`<div class="done"><span class="ok"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></span>
    <h2>지원이 끝났습니다</h2><p class="muted" style="margin-top:8px"><b>${esc(j.org)}</b>에서 <b>${esc(a.phone)}</b>로 보통 1~2일 안에 연락드립니다.</p>
    <div class="card" style="text-align:left;margin-top:20px;background:var(--bg)"><b>카카오톡으로 3가지만 더 여쭤볼게요</b><p class="muted small">경력 기간 · 가능한 요일 · 이동 수단. 답하시면 시설에서 더 빨리 연락합니다. (선택)</p></div>
    <div class="check${a.open?" on":""}" style="margin-top:10px;text-align:left" onclick="S.appl.open=!S.appl.open;renderModal()"><span class="bx">${a.open?I.check:""}</span><span>다른 시설에서도 연락받을게요<br><span class="cap">이름은 가리고(김O숙) 지역·자격·희망 시간만 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></span></div>
    <div class="two" style="margin-top:20px"><button class="btn out" onclick="closeModal()">닫기</button><button class="btn pri pill" onclick="closeModal();go('search')">비슷한 공고 더 보기</button></div></div>`;
  const ov=document.createElement("div");ov.className="ov";ov.id="modal";ov.innerHTML=`<div class="md" role="dialog" aria-modal="true">${body}</div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();}); document.body.appendChild(ov);
  const f=ov.querySelector("input");if(f&&a.step<4)f.focus();
}
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
