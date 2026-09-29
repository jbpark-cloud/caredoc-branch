function maskPhone(p){return String(p).replace(/\D/g,"").replace(/(\d{3})(\d{4})(\d{4})/,"$1-****-$3");}
function authSlot(){
  const el=$("auth-slot"); if(!el)return;
  if(S.mode==="biz"){ el.innerHTML=isBiz()?`<button class="uchip" onclick="go('bizme')"><b>${esc(S.auth.biz.org)}</b><span class="tag ${S.auth.biz.status==="verified"?"gr":S.auth.biz.status==="pending"?"bl":"gy"}">${BSTAT[S.auth.biz.status]}</span></button>`:`<button class="btn out sm pill" onclick="openLogin('biz')">로그인</button><button class="btn sec sm pill" onclick="openBizJoin()">1분 가입</button>`; }
  else { el.innerHTML=isUser()?`<button class="uchip" onclick="go('me')"><b>${esc(S.auth.user.name)}님</b><span class="cap">${maskPhone(S.auth.user.phone)}</span></button>`:`<button class="btn out sm pill" onclick="openLogin()">로그인</button>`; }
}
function logout(){S.auth.user=null;S.auth.biz=null;toast("로그아웃했습니다");go(S.mode==="biz"?"biz":"home");}
let L={};
function openLogin(kind,then){ L={kind:kind||null,step:kind?1:0,phone:"",code:"",via:"sms",ok:false,then:then||null,email:"",pw:""}; renderLogin(); }
function renderLogin(){
  closeModal(); let body="";
  if(L.step===0) body=`<h2>어떻게 오셨어요?</h2><p class="muted">한 번만 고르시면 됩니다.</p>
    <div class="stack" style="margin-top:16px">
      <button class="pick" onclick="L.kind='user';L.step=1;renderLogin()"><b>일자리를 찾고 있어요</b><span>전화번호만 있으면 됩니다. 비밀번호 없음.</span></button>
      <button class="pick" onclick="L.kind='biz';L.step=1;renderLogin()"><b>시설·병원 담당자예요</b><span>이메일로 로그인 · 처음이면 1분 가입</span></button></div>`;
  else if(L.kind==="user"){
    if(L.step===1) body=`<h2>전화번호를 눌러주세요</h2><p class="muted">비밀번호는 없습니다. 문자로 오는 숫자 6자리만 넣으면 끝.</p>
      <div class="field big" style="margin-top:16px"><label for="l-phone">휴대전화</label><input id="l-phone" inputmode="numeric" placeholder="010-0000-0000" value="${esc(L.phone)}" oninput="L.phone=this.value"></div>
      <button class="btn pri pill wide" style="margin-top:16px;height:56px;font-size:18px" onclick="if(L.phone.replace(/\\D/g,'').length<10){toast('전화번호를 확인해 주세요');return}L.step=2;L.via='sms';renderLogin()">문자로 인증번호 받기</button>
      <div class="or"><span>또는</span></div>
      <button class="btn kakao wide" onclick="L.step=2;L.via='kakao';renderLogin()">${I.kakao}카카오로 3초 로그인</button>
      <p class="cap" style="margin-top:14px;text-align:center">처음 오셨어도 이 절차가 곧 가입입니다. 케어닥 앱 회원은 같은 번호로 자동 연결돼요.</p>`;
    if(L.step===2) body=`<h2>${L.via==="kakao"?"카카오톡을 확인해 주세요":"문자를 확인해 주세요"}</h2>
      ${L.via==="kakao"?`<div class="card" style="margin-top:16px;background:var(--bg)"><p>카카오톡 알림에서 <b>[확인]</b>을 누르시면 자동으로 로그인됩니다.</p><p class="cap">프로토타입: 아래 버튼으로 대신합니다</p><button class="btn sec sm" style="margin-top:10px" onclick="L.ok=true;L.phone=L.phone||'01055550101';renderLogin()">카카오 확인 완료로 처리</button></div>`
        :`<div class="field big" style="margin-top:16px"><label for="l-code">문자로 받은 숫자 6자리</label><input id="l-code" inputmode="numeric" maxlength="6" placeholder="000000" oninput="L.code=this.value;L.ok=this.value.length===6;$('l-next').disabled=!L.ok"><span class="help">${esc(L.phone)}로 보냈습니다. 안 오면 <a href="#" onclick="toast('다시 보냈습니다');return false" style="color:var(--info)">다시 받기</a> · <a href="#" onclick="L.via='kakao';renderLogin();return false" style="color:var(--info)">카카오로 대신하기</a></span></div>`}
      <div class="two" style="margin-top:20px"><button class="btn out" onclick="L.step=1;renderLogin()">이전</button><button id="l-next" class="btn pri pill" ${L.ok?"":"disabled"} onclick="finishUserLogin()">로그인</button></div>`;
  } else {
    body=`<h2>기업회원 로그인</h2><p class="muted">처음이시면 아래 '1분 가입'으로.</p>
      <div class="stack" style="margin-top:16px;gap:12px"><div class="field"><label for="l-email">이메일(아이디)</label><input id="l-email" type="email" placeholder="manager@facility.kr" value="${esc(L.email)}" oninput="L.email=this.value"></div>
      <div class="field"><label for="l-pw">비밀번호</label><input id="l-pw" type="password" placeholder="8자 이상" oninput="L.pw=this.value"><span class="help"><a href="#" onclick="toast('비밀번호 재설정 링크를 이메일로 보냈습니다');return false" style="color:var(--info)">비밀번호를 잊으셨나요?</a></span></div></div>
      <button class="btn sec pill wide" style="margin-top:16px" onclick="if(!L.email.includes('@')||L.pw.length<8){toast('이메일과 비밀번호(8자 이상)를 확인해 주세요');return}finishBizLogin(L.email)">로그인</button>
      <div class="or"><span>또는</span></div>
      <button class="btn kakao wide" onclick="finishBizLogin('kakao')">${I.kakao}카카오로 로그인</button>
      <button class="btn out wide" style="margin-top:10px" onclick="openBizJoin(L.then)">기업회원 1분 가입</button>`;
  }
  const ov=document.createElement("div");ov.className="ov";ov.id="modal";ov.innerHTML=`<div class="md" role="dialog" aria-modal="true">${body}</div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();});document.body.appendChild(ov);
  const f=ov.querySelector("input");if(f)f.focus();
}
function finishUserLogin(){
  const known=L.phone.replace(/\D/g,"").endsWith("0101");
  S.auth.user={name:known?"김영숙":"회원",phone:L.phone.replace(/\D/g,""),lic:known?["요양보호사 자격증"]:[],caredoc:known,open:false};
  closeModal(); toast(known?"김영숙님, 다시 오셨네요":"가입과 로그인이 끝났습니다"); const t=L.then; render(); if(t)t();
}
function finishBizLogin(email){ S.auth.biz={org:"해피케어 방문요양센터",fac:"방문요양",email,status:"verified",name:"김담당",phone:"02-555-0123"}; closeModal(); toast(email==="kakao"?"카카오로 로그인했습니다":"로그인했습니다"); const t=L.then; setMode("biz"); if(t)t(); }
let B={};
function openBizJoin(then){ B={step:1,org:"",fac:"방문요양",name:"",phone:"",email:"",pw:"",then:then||null,verify:"biz",bizno:"",ltc:""}; renderBizJoin(); }
function renderBizJoin(){
  closeModal(); const st=`<div class="steps">${[1,2].map(n=>`<i class="${B.step>=n?"on":""}"></i>`).join("")}</div>`; let body="";
  if(B.step===1) body=`<span class="tag sec">기업회원 가입 · 1분</span><h2 style="margin-top:8px">시설 정보와 담당자</h2><p class="muted">공고 등록은 가입 즉시 가능합니다. 인증은 다음 단계에서.</p>${st}
    <div class="form" style="gap:12px"><div class="field full"><label>시설·병원 이름</label><input placeholder="예: 해피케어 방문요양센터" value="${esc(B.org)}" oninput="B.org=this.value"></div>
    <div class="field"><label>시설 유형</label><select onchange="B.fac=this.value">${FACS.map(f=>`<option${B.fac===f?" selected":""}>${f}</option>`).join("")}</select></div>
    <div class="field"><label>담당자 이름</label><input placeholder="홍길동" value="${esc(B.name)}" oninput="B.name=this.value"></div>
    <div class="field"><label>담당자 휴대전화</label><input inputmode="numeric" placeholder="010-0000-0000" value="${esc(B.phone)}" oninput="B.phone=this.value"></div>
    <div class="field"><label>이메일 (아이디)</label><input type="email" placeholder="manager@facility.kr" value="${esc(B.email)}" oninput="B.email=this.value"></div>
    <div class="field full"><label>비밀번호</label><input type="password" placeholder="8자 이상" oninput="B.pw=this.value"></div></div>
    <button class="btn sec pill wide" style="margin-top:16px" onclick="if(!B.org||!B.name||B.phone.replace(/\\D/g,'').length<10||!B.email.includes('@')||B.pw.length<8){toast('빈칸과 비밀번호(8자 이상)를 확인해 주세요');return}B.step=2;renderBizJoin()">가입하고 인증 단계로</button>
    <div class="or"><span>또는</span></div><button class="btn kakao wide" onclick="B.org=B.org||'우리요양원';B.name=B.name||'김담당';B.email='kakao';B.step=2;renderBizJoin()">${I.kakao}카카오로 빠르게 가입</button>
    <p class="cap" style="margin-top:12px">가입 즉시 공고 작성이 가능하고, 인증이 끝나면 구직자에게 노출됩니다. 이미 회원이면 <a href="#" onclick="openLogin('biz',B.then);return false" style="color:var(--info)">로그인</a></p>`;
  if(B.step===2) body=`<span class="tag sec">가입 완료</span><h2 style="margin-top:8px">시설 인증</h2><p class="muted">둘 중 하나만 입력하세요. 운영팀이 24시간 안에 확인합니다. 지금 건너뛰어도 됩니다.</p>${st}
    <div class="cert" style="margin-top:8px"><button class="${B.verify==="biz"?"on":""}" onclick="B.verify='biz';renderBizJoin()">사업자등록번호</button><button class="${B.verify==="ltc"?"on":""}" onclick="B.verify='ltc';renderBizJoin()">장기요양기관 코드</button></div>
    ${B.verify==="biz"?`<div class="field big" style="margin-top:14px"><label>사업자등록번호</label><input inputmode="numeric" placeholder="000-00-00000" value="${esc(B.bizno)}" oninput="B.bizno=this.value"><span class="help">국세청 조회로 대표자·상호 일치 여부를 확인합니다</span></div>`
      :`<div class="field big" style="margin-top:14px"><label>장기요양기관 코드 (기호)</label><input inputmode="numeric" placeholder="1-2345678900" value="${esc(B.ltc)}" oninput="B.ltc=this.value"><span class="help">건강보험공단 기관 정보와 평가등급이 자동으로 연결됩니다</span></div>`}
    <div class="two" style="margin-top:20px"><button class="btn out" onclick="finishBizJoin('none')">나중에 할게요</button><button class="btn sec pill" onclick="if(!(B.verify==='biz'?B.bizno:B.ltc)){toast('번호를 입력해 주세요');return}finishBizJoin('pending')">인증 요청</button></div>`;
  const ov=document.createElement("div");ov.className="ov";ov.id="modal";ov.innerHTML=`<div class="md" role="dialog" aria-modal="true" style="max-width:600px">${body}</div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();});document.body.appendChild(ov);
  const f=ov.querySelector("input");if(f)f.focus();
}
function finishBizJoin(status){ S.auth.biz={org:B.org,fac:B.fac,email:B.email||"kakao",status,name:B.name,phone:B.phone,bizno:B.bizno,ltc:B.ltc}; closeModal(); const t=B.then; toast(status==="pending"?"가입 완료 · 인증 검수 중":"가입 완료 · 인증은 기업 홈에서 언제든"); setMode("biz"); if(t)t(); }
