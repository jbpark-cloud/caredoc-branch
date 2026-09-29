function listRow(j){
  return `<tr class="lr${j.urgent?" urg":""}" onclick="go('detail',${j.id})">
    <td class="c-day"><span class="${j.days===0?"new":""}">${j.days===0?"오늘":j.days+"일 전"}</span><span class="cap">${j.head}명 · 채용시까지</span></td>
    <td class="c-org"><b>${esc(j.org)}</b><span class="rt">${j.urgent?'<span class="tag rd">급구</span>':''}${j.caredoc?'<span class="tag bl">케어닥 직영</span>':''}${j.noLic?'<span class="tag gr">자격증 없어도</span>':''}<span class="cap">${j.fac}</span>${gradeEl(j.grade)}</span></td>
    <td class="c-job">${j.job}<span class="cap">${esc(j.title)}</span></td>
    <td class="c-area">${j.area}<span class="cap or">${j.dist}</span></td>
    <td class="c-time">${j.hours[0]}<span class="cap">${j.hours[1]||""} · ${j.sched}</span></td>
    <td class="c-pay"><b>${j.pay}</b><span class="cap">${j.ins?"4대보험":"보험 미가입"}${j.payOpen?"":" · 협의"}</span></td>
    <td class="c-act"><button class="btn pri pill xs" onclick="event.stopPropagation();S.job=JOBS.find(x=>x.id===${j.id});openApply()">지원</button></td></tr>`;
}
function feedCard(j){
  return `<article class="fcard${j.top?" top":""}" onclick="go('detail',${j.id})"><div class="pay">${j.pay}</div><div class="dist">${j.dist}</div><h3>${esc(j.title)}</h3><div class="org">${j.top?'<span class="tag or">상위노출</span>':''}${j.urgent?'<span class="tag rd">급구</span>':''}${j.caredoc?'<span class="tag bl">케어닥 직영</span>':''}${j.noLic?'<span class="tag gr">자격증 없어도</span>':''}<span>${esc(j.org)} · ${j.area}</span></div><div class="meta"><span>${I.clock}${j.hours.join(" · ")}</span>${gradeEl(j.grade)}<span class="small muted">${j.days===0?"오늘":j.days+"일 전"}</span></div><div class="btns"><button class="btn out" onclick="event.stopPropagation();toast('전화 연결: 02-555-0${String(j.id).padStart(2,'0')}3')">${I.phone}전화</button><button class="btn pri pill" onclick="event.stopPropagation();S.job=JOBS.find(x=>x.id===${j.id});openApply()">간편 지원하기</button></div></article>`;
}
function distNum(d){const m=d.match(/\d+/);let n=+m[0];if(d.includes("버스"))n=n*4+5;if(d.includes("지하철"))n=n*5+8;return n;}
function filtered(){
  let r=JOBS.filter(j=>(S.f.gu==="전체"||j.gu===S.f.gu)&&(!S.f.dong||j.area.includes(S.f.dong)||j.job.includes(S.f.dong)||j.org.includes(S.f.dong)||j.title.includes(S.f.dong))&&(!S.f.job.length||S.f.job.includes(j.job))&&(!S.f.sched.length||S.f.sched.includes(j.sched))&&(!S.f.fac.length||S.f.fac.includes(j.fac))&&(!S.f.noLic||j.noLic));
  const top=r.filter(j=>j.top),rest=r.filter(j=>!j.top);
  const sortf={near:(a,b)=>distNum(a.dist)-distNum(b.dist),new:(a,b)=>a.days-b.days,grade:(a,b)=>(a.grade||"F").localeCompare(b.grade||"F")}[S.f.sort];
  return [...top.sort(sortf),...rest.sort(sortf)];
}
function tf(key,v){const a=S.f[key];const i=a.indexOf(v);i<0?a.push(v):a.splice(i,1);render();}
function search(){
  const list=filtered();
  const chip=(key,v)=>`<button class="chip${S.f[key].includes(v)?" on":""}" onclick="tf('${key}','${v}')">${v}</button>`;
  return `<div class="search">
    <aside class="filter">
      <div><h3>지역</h3><div class="field"><select id="f-gu" onchange="S.f.gu=this.value;render()">${GUS.map(g=>`<option${S.f.gu===g?" selected":""}>${g}</option>`).join("")}</select></div>
        <div class="field" style="margin-top:8px"><input id="f-dong" placeholder="동 이름·직종·시설명" value="${esc(S.f.dong)}" onchange="S.f.dong=this.value;render()"></div></div>
      <div><h3>근무 시간</h3><div class="chips">${SCHEDS.map(s=>chip("sched",s)).join("")}</div></div>
      <div><h3>직종</h3><div class="chips">${JOB_TYPES.map(s=>chip("job",s)).join("")}</div></div>
      <div><h3>시설 종류</h3><div class="chips">${FACS.map(s=>chip("fac",s)).join("")}</div></div>
      <div class="toggle${S.f.noLic?" on":""}" onclick="S.f.noLic=!S.f.noLic;render()" role="switch" aria-checked="${S.f.noLic}" tabindex="0"><span>자격증 없어도 가능한 일만</span><span class="sw"></span></div>
      <button class="btn out sm" onclick="S.f={gu:'전체',dong:'',job:[],sched:[],fac:[],noLic:false,sort:'near'};render()">조건 모두 지우기</button>
    </aside>
    <section>
      <div class="listhead"><h2>${S.f.gu==="전체"?"서울":S.f.gu}${S.f.dong?" "+esc(S.f.dong):""} 일자리 <span class="muted" style="font-size:18px">${list.length}건</span></h2>
        <div class="row"><div class="seg"><button class="${S.f.view!=="card"?"on":""}" onclick="S.f.view='list';render()">목록</button><button class="${S.f.view==="card"?"on":""}" onclick="S.f.view='card';render()">카드</button></div>
        <label class="small muted">정렬 <select onchange="S.f.sort=this.value;render()"><option value="near"${S.f.sort==="near"?" selected":""}>가까운 순</option><option value="new"${S.f.sort==="new"?" selected":""}>최신 순</option><option value="grade"${S.f.sort==="grade"?" selected":""}>시설 등급 순</option></select></label></div></div>
      ${list.length?(S.f.view==="card"?`<div class="grid g2">${list.slice(0,S.f.limit||40).map(jobCard).join("")}</div>`:`<div class="tbl listwrap"><table class="list"><thead><tr><th class="c-day">등록</th><th class="c-org">기관명</th><th class="c-job">직종</th><th class="c-area">지역 · 거리</th><th class="c-time">근무시간</th><th class="c-pay">급여</th><th class="c-act"></th></tr></thead><tbody>${list.slice(0,S.f.limit||40).map(listRow).join("")}</tbody></table></div>`)+`${list.length>(S.f.limit||40)?`<button class="btn out wide" style="margin-top:16px" onclick="S.f.limit=(S.f.limit||40)+40;render()">공고 더 보기 (${list.length-(S.f.limit||40)}건 남음)</button>`:""}`:`<div class="empty"><p style="font-size:20px;color:var(--title)">조건에 맞는 공고가 아직 없어요</p><p>조건을 하나 줄여 보시거나, 새 공고가 올라오면 문자로 알려드릴까요?</p><button class="btn pri pill" style="margin-top:16px" onclick="requireUser(()=>{S.alert=(S.f.gu==='전체'?'서울':S.f.gu)+' '+(S.f.sched.join('·')||'전체');toast('새 공고 알림을 신청했습니다')})">이 조건 새 공고 문자 받기</button></div>`}
    </section></div>`;
}
function detail(){
  const j=S.job;
  const rv=j.rv;
  return `<div class="detail pad-bar">
    <section class="stack" style="gap:16px">
      <button class="btn out xs" style="align-self:flex-start" onclick="go('search')">← 목록으로</button>
      <div class="card stack" style="gap:12px">
        <div class="row">${j.top?'<span class="tag or">상위노출</span>':''}${j.urgent?'<span class="tag rd">급구</span>':''}${j.caredoc?'<span class="tag bl">케어닥 직영</span>':''}${j.noLic?'<span class="tag gr">자격증 없어도 가능</span>':''}</div>
        <h1>${esc(j.title)}</h1>
        <p style="font-size:20px">${esc(j.org)} <span class="muted">· ${j.fac} · ${j.area}</span></p>
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
