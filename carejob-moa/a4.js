function bizVerifyBanner(){
  const b=S.auth.biz; if(!b) return `<div class="vbanner none"><div><b>아직 로그인 전입니다</b><p>가입은 1분, 공고 등록은 무료. 인증이 끝나면 구직자에게 노출됩니다.</p></div><div class="row"><button class="btn out sm" onclick="openLogin('biz')">로그인</button><button class="btn sec sm pill" onclick="openBizJoin()">기업회원 1분 가입</button></div></div>`;
  if(b.status==="verified") return `<div class="vbanner ok"><div><b>${esc(b.org)} · 인증 완료</b><p>공고가 구직자에게 노출되고 있습니다. 공단 평가등급이 공고에 자동 표시됩니다.</p></div><span class="tag gr">인증 완료</span></div>`;
  if(b.status==="pending") return `<div class="vbanner pend"><div><b>${esc(b.org)} · 인증 검수 중</b><p>운영팀이 24시간 안에 확인합니다. 그동안 공고를 미리 작성해 두세요. 검수가 끝나면 자동 노출됩니다.</p></div><button class="btn out sm" onclick="S.auth.biz.status='verified';toast('인증이 완료되었습니다 (프로토타입)');render()">검수 완료로 처리(목업)</button></div>`;
  return `<div class="vbanner none"><div><b>${esc(b.org)} · 시설 인증이 필요합니다</b><p>공고는 작성할 수 있지만 인증 전엔 구직자에게 보이지 않습니다. 사업자번호 또는 장기요양기관 코드 하나면 됩니다.</p></div><button class="btn sec sm pill" onclick="B={step:2,org:S.auth.biz.org,fac:S.auth.biz.fac,name:S.auth.biz.name,phone:S.auth.biz.phone||'',email:S.auth.biz.email,verify:'biz',bizno:'',ltc:'',then:null};renderBizJoin()">지금 인증하기</button></div>`;
}
function me(){
  const u=S.auth.user; if(!u){setTimeout(()=>openLogin("user",()=>go('me')),0);return home();}
  return `<div style="padding-block:24px" class="stack"><h1>내 정보</h1></div>
  <div class="grid g2">
    <div class="card stack"><h3>${esc(u.name)}님</h3><dl class="kv"><dt>전화번호</dt><dd>${String(u.phone).replace(/(\d{3})(\d{4})(\d{4})/,"$1-$2-$3")} <span class="tag gr">인증됨</span></dd><dt>자격</dt><dd>${u.lic.length?u.lic.join(" · "):`아직 없음 · <a href="#" onclick="go('start');return false" style="color:var(--info)">자격 취득 경로 보기</a>`}</dd><dt>케어닥 앱</dt><dd>${u.caredoc?'<span class="tag bl">연결됨</span> 케어닥 근무 이력이 인증 경력으로 표시됩니다':"연결 안 됨 · 같은 번호로 케어닥 앱에 가입하면 자동 연결"}</dd></dl>
      <div class="hr"></div><div class="check${u.open?" on":""}" onclick="S.auth.user.open=!S.auth.user.open;render()"><span class="bx">${u.open?I.check:""}</span><span>다른 시설에서도 연락받을게요<br><span class="cap">이름은 가리고 지역·자격·희망 시간만 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></span></div></div>
    <div class="card stack"><h3>내 지원 내역</h3>${(S.applied||[]).length?"":'<p class="muted">아직 지원한 공고가 없어요.</p>'}${(S.applied||[]).map(id=>{const j=JOBS.find(x=>x.id===id);return `<article class="mini-job" onclick="go('detail',${j.id})"><span class="tag or">지원함</span><div><b>${esc(j.org)}</b><span>${esc(j.job)} · ${j.pay}</span></div><span class="cap">연락 대기</span></article>`}).join("")}
      <div class="hr"></div><h3>새 공고 문자 알림</h3><p class="muted small">${S.alert?`${esc(S.alert)} 조건으로 새 공고가 오면 문자로 알려드립니다.`:"탐색 화면에서 조건을 고르고 '새 공고 문자 받기'를 누르세요."}</p>
      <button class="btn out sm" style="align-self:flex-start;margin-top:8px" onclick="logout()">로그아웃</button></div>
  </div>`;
}
function bizme(){
  const b=S.auth.biz; if(!b){setTimeout(()=>openLogin("biz",()=>go('bizme')),0);return biz();}
  return `<div style="padding-block:24px" class="stack"><h1>기업회원 정보</h1></div>${bizVerifyBanner()}
  <div class="grid g2" style="margin-top:16px"><div class="card stack"><h3>${esc(b.org)}</h3><dl class="kv"><dt>시설 유형</dt><dd>${b.fac}</dd><dt>담당자</dt><dd>${esc(b.name)}</dd><dt>아이디</dt><dd>${b.email==="kakao"?"카카오 연동":esc(b.email)}</dd><dt>인증</dt><dd>${b.status==="verified"?"인증 완료 · 공단 평가 A등급 연결":BSTAT[b.status]}</dd></dl></div>
  <div class="card stack"><h3>이용 중인 상품</h3><p class="muted small">상위노출 7일 (요양보호사 · 오전) · 잔여 4일</p><p class="muted small">인재 제안 잔여 0건</p><button class="btn out sm" style="align-self:flex-start" onclick="go('ads')">광고 상품 보기</button><div class="hr"></div><button class="btn out sm" style="align-self:flex-start" onclick="logout()">로그아웃</button></div></div>`;
}
function openApply(){ const u=S.auth.user; S.appl={step:1,name:u?u.name:"",phone:u?u.phone:"",via:"kakao",code:"",lic:u?u.lic.slice():[],ok:!!u,proxy:false,cphone:"",open:u?u.open:false}; if(u&&u.lic.length){S.appl.step=3;} renderModal(); }
function closeModal(){const m=$("modal");if(m)m.remove();}
function renderModal(){
  closeModal(); const a=S.appl; const j=S.job;
  const st=`<div class="steps">${[1,2,3].map(n=>`<i class="${a.step>=n?"on":""}"></i>`).join("")}</div>`;
  let body="";
  if(a.step===1) body=`<h2>이름과 전화번호를 알려주세요</h2><p class="muted">시설에서 이 번호로 연락드립니다.</p>${st}
    <div class="stack big" style="gap:14px"><div class="field"><label for="a-name">이름</label><input id="a-name" placeholder="홍길동" value="${esc(a.name)}" oninput="S.appl.name=this.value"></div>
    <div class="field"><label for="a-phone">휴대전화</label><input id="a-phone" inputmode="numeric" placeholder="010-0000-0000" value="${esc(a.phone)}" oninput="S.appl.phone=this.value"></div>
    <div class="check${a.proxy?" on":""}" onclick="S.appl.proxy=!S.appl.proxy;renderModal()"><span class="bx">${a.proxy?I.check:""}</span><span>가족 대신 지원해요<br><span class="cap">일하실 분의 이름·번호를 위에, 연락받을 내 번호를 아래에</span></span></div>
    ${a.proxy?`<div class="field"><label for="a-cphone">연락받을 보호자 번호</label><input id="a-cphone" inputmode="numeric" placeholder="010-0000-0000" value="${esc(a.cphone)}" oninput="S.appl.cphone=this.value"></div>`:""}</div>
    <p class="cap" style="margin-top:12px">${isUser()?"로그인된 번호로 지원합니다.":"처음이시면 이 절차가 곧 회원가입입니다. 비밀번호는 없어요."}</p>
    <button class="btn pri pill wide" style="margin-top:12px;height:56px;font-size:18px" onclick="if(!S.appl.name||S.appl.phone.replace(/\\D/g,'').length<10){toast('이름과 전화번호를 확인해 주세요');return}S.appl.step=isUser()?3:2;renderModal()">다음</button>`;
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
    <h2>지원이 끝났습니다</h2><p class="muted" style="margin-top:8px"><b>${esc(j.org)}</b>에서 <b>${esc(a.proxy&&a.cphone?a.cphone:a.phone)}</b>로 보통 1~2일 안에 연락드립니다.</p>
    ${(()=>{const isNew=!S.auth.user;if(isNew){S.auth.user={name:a.name,phone:a.phone.replace(/\D/g,""),lic:a.lic.filter(x=>x!=="아직 없어요"),caredoc:false,open:!!a.open};a.joined=true;authSlot();}S.applied=S.applied||[];if(!S.applied.includes(j.id))S.applied.push(j.id);return ""})()}
    ${a.joined?`<div class="card" style="text-align:left;margin-top:16px;background:var(--green-bg);border-color:transparent"><b>회원가입도 함께 끝났습니다</b><p class="small">다음부터는 전화번호만 누르면 바로 지원돼요. 상단 이름을 누르면 내 지원 내역을 볼 수 있습니다.</p></div>`:""}
    <div class="card" style="text-align:left;margin-top:20px;background:var(--bg)"><b>카카오톡으로 3가지만 더 여쭤볼게요</b><p class="muted small">경력 기간 · 가능한 요일 · 이동 수단. 답하시면 시설에서 더 빨리 연락합니다. (선택)</p></div>
    <div class="check${a.open?" on":""}" style="margin-top:10px;text-align:left" onclick="S.appl.open=!S.appl.open;if(S.auth.user)S.auth.user.open=S.appl.open;renderModal()"><span class="bx">${a.open?I.check:""}</span><span>다른 시설에서도 연락받을게요<br><span class="cap">이름은 가리고(김O숙) 지역·자격·희망 시간만 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></span></div>
    <div class="two" style="margin-top:20px"><button class="btn out" onclick="closeModal()">닫기</button><button class="btn pri pill" onclick="closeModal();go('search')">비슷한 공고 더 보기</button></div></div>`;
  const ov=document.createElement("div");ov.className="ov";ov.id="modal";ov.innerHTML=`<div class="md" role="dialog" aria-modal="true">${body}</div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();}); document.body.appendChild(ov);
  const f=ov.querySelector("input");if(f&&a.step<4)f.focus();
}
