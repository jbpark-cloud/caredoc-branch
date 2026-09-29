function bizVerifyBanner(){
  const b=S.auth.biz; if(!b) return `<div class="vbanner none"><div><b>아직 로그인 전입니다</b><p>가입은 1분, 공고 등록은 무료. 인증이 끝나면 구직자에게 노출됩니다.</p></div><div class="row"><button class="btn out sm" onclick="openLogin('biz')">로그인</button><button class="btn sec sm pill" onclick="openBizJoin()">기업회원 1분 가입</button></div></div>`;
  if(b.status==="verified") return `<div class="vbanner ok"><div><b>${esc(b.org)} · 인증 완료</b><p>공고가 구직자에게 노출되고 있습니다. 공단 평가등급이 공고에 자동 표시됩니다.</p></div><span class="tag gr">인증 완료</span></div>`;
  if(b.status==="pending") return `<div class="vbanner pend"><div><b>${esc(b.org)} · 인증 검수 중</b><p>운영팀이 24시간 안에 확인합니다. 그동안 공고를 미리 작성해 두세요. 검수가 끝나면 자동 노출됩니다.</p></div><button class="btn out sm" onclick="S.auth.biz.status='verified';toast('인증이 완료되었습니다 (프로토타입)');render()">검수 완료로 처리(목업)</button></div>`;
  return `<div class="vbanner none"><div><b>${esc(b.org)} · 시설 인증이 필요합니다</b><p>공고는 작성할 수 있지만 인증 전엔 구직자에게 보이지 않습니다. 사업자번호 또는 장기요양기관 코드 하나면 됩니다. 7일 안에 인증하지 않으면 리마인드 후 작성한 공고가 비공개로 유지됩니다.</p></div><button class="btn sec sm pill" onclick="B={step:2,org:S.auth.biz.org,fac:S.auth.biz.fac,name:S.auth.biz.name,phone:S.auth.biz.phone||'',email:S.auth.biz.email,verify:'biz',bizno:'',ltc:'',then:null};renderBizJoin()">지금 인증하기</button></div>`;
}
function me(){
  const u=S.auth.user; if(!u){setTimeout(()=>openLogin("user",()=>go('me')),0);return home();}
  return `<div style="padding-block:24px" class="stack"><h1>내 정보</h1></div>
  <div class="grid g2">
    <div class="card stack"><h3>${esc(u.name)}님</h3><dl class="kv"><dt>전화번호</dt><dd>${String(u.phone).replace(/(\d{3})(\d{4})(\d{4})/,"$1-$2-$3")} <span class="tag gr">인증됨</span></dd><dt>자격</dt><dd>${u.lic.length?u.lic.join(" · "):`아직 없음 · <a href="#" onclick="go('start');return false" style="color:var(--info)">자격 취득 경로 보기</a>`}</dd><dt>케어닥 앱</dt><dd>${u.caredoc?'<span class="tag bl">연결됨</span> 케어닥 근무 이력이 인증 경력으로 표시됩니다':"연결 안 됨 · 같은 번호로 케어닥 앱에 가입하면 자동 연결"}</dd></dl>
      <div class="hr"></div><div class="check${u.open?" on":""}" onclick="S.auth.user.open=!S.auth.user.open;render()"><span class="bx">${u.open?I.check:""}</span><span>다른 시설에서도 연락받을게요<br><span class="cap">이름은 성만 남기고(김OO) 지역·자격·희망 시간만 시설에 보입니다. 연락처는 내가 수락해야 공개.</span></span></div></div>
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
