function detail(){
  const j=S.job;
  const rv=j.rv;
  return `<div class="detail pad-bar">
    <section class="stack" style="gap:16px">
      <nav class="crumb" aria-label="경로"><a href="#" onclick="go('home');return false">홈</a><span>›</span><a href="#" onclick="S.f={gu:'전체',dong:'',job:[],sched:[],fac:[],noLic:false,sort:'near'};go('search');return false">일자리</a><span>›</span><a href="#" onclick="S.f={gu:'${j.gu}',dong:'',job:[],sched:[],fac:[],noLic:false,sort:'near'};go('search');return false">${j.gu}</a><span>›</span><a href="#" onclick="S.f={gu:'${j.gu}',dong:'',job:['${j.job}'],sched:[],fac:[],noLic:false,sort:'near'};go('search');return false">${j.job}</a><span>›</span><b>${esc(j.org)}</b></nav>
      <div class="card stack" style="gap:12px">
        <div class="row">${j.top?'<span class="tag or">상위노출</span>':''}${j.urgent?'<span class="tag rd">급구</span>':''}${j.caredoc?'<span class="tag bl">케어닥 직영</span>':''}${j.noLic?'<span class="tag gr">자격증 없어도 가능</span>':''}</div>
        <h1>${esc(j.title)}</h1>
        <p style="font-size:20px"><a href="/facility/${j.id}" class="orglink" onclick="openFacility('${esc(j.org)}');return false">${esc(j.org)}</a> <span class="muted">· ${j.fac} · ${j.area}</span> <span class="cap">시설 페이지 보기 →</span></p>
        <div class="urlbar"><span class="cap">이 공고 주소</span><code>carejobmoa.kr${pathFor()}</code><button class="btn out xs" onclick="(async()=>{try{await navigator.clipboard.writeText('https://carejobmoa.kr'+pathFor());toast('주소를 복사했습니다')}catch(e){toast('복사가 지원되지 않는 환경입니다')}})()">복사</button></div>
        <div class="hr" style="margin:8px 0"></div>
        <dl class="kv">
          <dt>급여</dt><dd><b style="font-size:20px">${j.pay}</b> ${j.payOpen?'<span class="tag gr">급여 공개</span>':'<span class="tag gy">면접 시 협의</span>'}</dd>
          <dt>근무 시간</dt><dd>${j.hours.join(" · ")} <span class="tag or">${j.sched}</span></dd>
          <dt>거리</dt><dd>내 위치(${S.f.dong||"강남구 대치동"})에서 <b>${j.dist}</b></dd>
          <dt>4대보험</dt><dd>${j.ins?"가입":"미가입 · 프리랜서 계약"}</dd>
          <dt>자격</dt><dd>${j.req}</dd>
          <dt>모집 인원</dt><dd>${j.head}명 · 마감 시까지</dd>
        </dl>
        <div class="hr" style="margin:8px 0"></div>
        <div class="grid g2"><div><h3>하는 일</h3><ul style="margin:8px 0 0;padding-left:20px">${j.duty.map(d=>`<li>${d}</li>`).join("")}</ul></div><div><h3>복리후생</h3><div class="chips" style="margin-top:8px">${j.benef.map(b=>`<span class="tag gy" style="font-size:14px;padding:6px 12px">${b}</span>`).join("")}</div></div></div>
      </div>
      <div class="card">
        <div class="row" style="justify-content:space-between;margin-bottom:14px"><h2>이 시설, 믿을 수 있나요?</h2><span class="cap">케어잡모아가 확인한 정보</span></div>
        <div class="trust">
          <div><b>${j.grade||"–"}</b><span>건강보험공단 평가등급${j.grade?"":" (대상 아님)"}</span></div>
          <div><b>${j.ins?"가입":"미가입"}</b><span>4대보험</span></div>
          <div><b>${j.payOpen?"공개":"비공개"}</b><span>급여 공개 여부</span></div>
          <div><b>${j.score}<small class="muted" style="font-size:14px"> /5</small></b><span>근무자 후기 ${j.reviews}건</span></div>
        </div>
        <div class="stack" style="margin-top:8px">${rv.map(r=>`<div class="review"><span class="star">${stars(r[2])}</span><p>${r[1]}</p><span class="who">${r[0]}</span></div>`).join("")}</div>
      </div>
      <div class="card stack">
        <h2>오시는 길</h2>
        <div class="map"><svg viewBox="0 0 600 180" aria-label="약도"><rect width="600" height="180" fill="var(--bg)"/><path d="M0 90h600M300 0v180M120 0v180M480 0v180M0 40h600M0 140h600" stroke="var(--line)" stroke-width="2" fill="none"/><circle cx="150" cy="120" r="10" fill="var(--secondary)"/><text x="150" y="152" text-anchor="middle" font-size="14" fill="var(--sub)" font-family="inherit">내 위치</text><path d="M160 116 Q300 60 440 66" stroke="var(--primary)" stroke-width="4" stroke-dasharray="8 6" fill="none"/><circle cx="450" cy="64" r="12" fill="var(--primary)"/><text x="450" y="45" text-anchor="middle" font-size="15" font-weight="700" fill="var(--title)" font-family="inherit">${esc(j.org)}</text><text x="300" y="112" text-anchor="middle" font-size="16" font-weight="700" fill="var(--primary)" font-family="inherit">${j.dist}</text></svg></div>
        <p class="muted">${j.area} · 지도 앱으로 길찾기는 실제 서비스에서 연결됩니다.</p>
      </div>
    </section>
    <aside class="side card stack" style="gap:12px">
      <h3>지원하기</h3>
      <p class="muted small">회원가입 없이 이름·전화번호만으로 지원됩니다. 걸리는 시간 1분.</p>
      <button class="btn pri pill wide" style="height:56px;font-size:18px" onclick="openApply()">간편 지원하기</button>
      <div class="two"><button class="btn out" onclick="requireUser(()=>toast('공고를 저장했습니다'))">저장</button><button class="btn out" onclick="toast('전화 연결: 02-555-0${j.id}23')">${I.phone}전화로 문의</button></div>
      <p class="tel">02-555-0${String(j.id).padStart(2,"0")}3</p>
      <p class="cap">담당 ${j.caredoc?"케어닥 채용팀":"원장 김OO"} · 평일 09~18시 통화 가능</p>
    </aside>
  </div>
  <div class="bar two"><button class="btn out" onclick="toast('전화 연결: 02-555-0${j.id}23')">${I.phone}전화</button><button class="btn pri pill" onclick="openApply()">간편 지원하기</button></div>`;
}
// 구직자: 전화번호=아이디, 비밀번호 없음. 기업: 이메일+비밀번호, 인증 상태(none|pending|verified)
function isUser(){return !!S.auth.user} function isBiz(){return !!S.auth.biz}
function requireUser(then){ if(isUser()){then();return;} openLogin("user",then); }
function requireBiz(then){ if(isBiz()){then();return;} openBizJoin(then); }
const BSTAT={none:"미인증",pending:"검수 중",verified:"인증 완료"};
function maskPhone(p){return String(p).replace(/\D/g,"").replace(/(\d{3})(\d{4})(\d{4})/,"$1-****-$3");}
function authSlot(){
  const el=$("auth-slot"); if(!el)return;
  if(S.mode==="biz"){ el.innerHTML=isBiz()?`<button class="uchip" onclick="go('bizme')"><b>${esc(S.auth.biz.org)}</b><span class="tag ${S.auth.biz.status==="verified"?"gr":S.auth.biz.status==="pending"?"bl":"gy"}">${BSTAT[S.auth.biz.status]}</span></button>`:`<button class="btn out sm pill" onclick="openLogin('biz')">로그인</button><button class="btn sec sm pill" onclick="openBizJoin()">1분 가입</button>`; }
  else { el.innerHTML=isUser()?`<button class="uchip" onclick="go('me')"><b>${esc(S.auth.user.name)}님</b><span class="cap">${maskPhone(S.auth.user.phone)}</span></button>`:`<button class="btn out sm pill" onclick="openLogin()">로그인</button>`; }
}
function logout(){S.auth.user=null;S.auth.biz=null;toast("로그아웃했습니다");go(S.mode==="biz"?"biz":"home");}
let L={};
function openLogin(kind,then){ L={kind:kind||null,step:kind?1:0,phone:"",code:"",via:"sms",ok:false,then:then||null,email:"",pw:""}; renderLogin(); }
