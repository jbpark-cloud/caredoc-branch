function home(){
  const gu=S.home.gu;
  const cnt=t=>JOBS.filter(j=>j.job===t).length, urg=t=>JOBS.filter(j=>j.job===t&&j.urgent).length;
  const FAC_ALL=["방문요양","주야간보호","요양원","요양병원","재활병원","일반 병원","복지관","실버타운","간병인 협회"];
  const hp=S.home.pick; // {fac|gu|job|sched: value}
  const hf={gu:hp.gu||null,fac:hp.fac?[hp.fac]:[],job:hp.job?[hp.job]:[],sched:hp.sched?[hp.sched]:[]};
  const pool=JOBS.filter(j=>(!hf.gu||j.gu===hf.gu)&&(!hf.fac.length||hf.fac.includes(j.fac))&&(!hf.job.length||hf.job.includes(j.job))&&(!hf.sched.length||hf.sched.includes(j.sched)));
  const plat=pool.filter(j=>j.top).sort((a,b)=>a.days-b.days);
  const rest=pool.filter(j=>!j.top).sort((a,b)=>a.days-b.days);
  const near=JOBS.filter(j=>j.gu===gu).sort((a,b)=>distNum(a.dist)-distNum(b.dist));
  const good=JOBS.filter(j=>j.grade==="A"&&j.ins&&j.payOpen).sort((a,b)=>b.score-a.score).slice(0,4);
  const caredoc=JOBS.filter(j=>j.caredoc);
  const pins=near.slice(0,8).map((j,i)=>{const ang=i/8*Math.PI*2-1.2;const r=(46+distNum(j.dist)*3.2);return {j,x:300+Math.cos(ang)*r*1.85,y:118+Math.sin(ang)*r*0.62}});
  const tab=S.home.tab;
  const panel={
    fac:FAC_ALL.map(f=>[f,JOBS.filter(j=>j.fac===f).length,JOBS.filter(j=>j.fac===f&&j.urgent).length]),
    gu:GUS.filter(g=>g!=="전체").map(g=>[g,JOBS.filter(j=>j.gu===g).length,JOBS.filter(j=>j.gu===g&&j.urgent).length]),
    job:JOB_TYPES.map(t=>[t,cnt(t),urg(t)]),
    sched:SCHEDS.map(s=>[s,JOBS.filter(j=>j.sched===s).length,JOBS.filter(j=>j.sched===s&&j.urgent).length]),
  }[tab];
  const pickLabel={fac:"기관별",gu:"지역별",job:"직종별",sched:"근무시간별"};
  const sel=Object.entries(hp).filter(([k,v])=>v);
  // 기관별 그룹 목록
  const groupMode=S.home.group;
  let listHtml="";
  if(groupMode==="fac"){
    const shown=rest.slice(0,S.home.limit); const groups={};
    shown.forEach(j=>{(groups[j.fac]=groups[j.fac]||[]).push(j)});
    listHtml=FAC_ALL.filter(f=>groups[f]).map(f=>`<tr class="grp"><td colspan="7"><b>${f}</b> <span class="muted small">${JOBS.filter(j=>j.fac===f).length}건 중 ${groups[f].length}건</span> <button class="lnk" onclick="homePick('fac','${f}')">이 기관만 보기</button></td></tr>`+groups[f].map(listRow).join("")).join("");
  } else if(groupMode==="gu"){
    const shown=rest.slice(0,S.home.limit); const groups={};
    shown.forEach(j=>{(groups[j.gu]=groups[j.gu]||[]).push(j)});
    listHtml=Object.keys(groups).sort((a,b)=>a.localeCompare(b,"ko")).map(g=>`<tr class="grp"><td colspan="7"><b>${g}</b> <span class="muted small">${JOBS.filter(j=>j.gu===g).length}건 중 ${groups[g].length}건</span> <button class="lnk" onclick="homePick('gu','${g}')">이 지역만 보기</button></td></tr>`+groups[g].map(listRow).join("")).join("");
  } else listHtml=rest.slice(0,S.home.limit).map(listRow).join("");
  return `
  <section class="top-strip"><div class="wrap">
    <div class="locbar">
      <div class="loc">${I.pin.replace('class="ico sm gy"','class="ico"')}<select id="home-gu" onchange="S.home.gu=this.value;render()">${GUS.filter(g=>g!=="전체").map(g=>`<option${gu===g?" selected":""}>${g}</option>`).join("")}</select><span class="cap">${near.length}개 자리 · 가까운 순</span></div>
      <div class="stats"><span><b>${JOBS.length}</b>전체 공고</span><span><b>${JOBS.filter(j=>j.days===0).length}</b>오늘 새 공고</span><span><b>${JOBS.filter(j=>j.urgent).length}</b>급구</span><span><b>${JOBS.filter(j=>j.noLic).length}</b>자격증 없어도</span></div>
    </div>
    <div class="banner-row">
      <div class="banner main" onclick="go('start')"><span class="tag" style="background:rgba(255,255,255,.2);color:#fff">자격증이 없어요</span><h2>오늘 시작할 수 있는 일부터,<br>요양보호사가 되는 길까지</h2><p>지금 가능한 ${JOBS.filter(j=>j.noLic).length}개 자리 · 교육 연결 · 상담 무료</p><b>진입 경로 보기 →</b></div>
      <div class="banner ad" onclick="go('detail',${caredoc[0].id})"><span class="tag or">광고 · 메인 배너</span><h3>${esc(caredoc[0].org)}</h3><p>${esc(caredoc[0].title)}<br>${caredoc[0].pay} · ${caredoc[0].hours[0]}</p><span class="cap">케어닥 직영 · 공단 평가 ${caredoc[0].grade||"–"}등급</span></div>
      <div class="banner biz" onclick="setMode('biz')"><span class="tag" style="background:rgba(255,255,255,.18);color:#fff">시설·병원 담당자</span><h3>공고 등록 0원</h3><p>우리 동네 구직자에게 바로 닿습니다</p><b>무료로 공고 올리기 →</b></div>
    </div>
  </div></section>
  <div class="wrap">
    <!-- 분류 패널: 기관별 · 지역별 · 직종별 · 근무시간별 -->
    <div class="browse">
      <div class="btabs">${Object.entries(pickLabel).map(([k,v])=>`<button class="${tab===k?"on":""}" onclick="S.home.tab='${k}';render()">${v}</button>`).join("")}<span class="sp"></span>${sel.length?`<span class="tag or" style="font-size:14px;padding:4px 6px 4px 12px">${pickLabel[sel[0][0]]} · ${sel[0][1]} <button class="x" onclick="S.home.pick={};render()">×</button></span>`:`<span class="cap">누르면 아래 목록이 바뀝니다</span>`}</div>
      <div class="bgrid ${tab}">${panel.map(([name,n,u])=>`<button class="bitem${hp[tab]===name?" on":""}" onclick="homePick('${tab}','${name}')"><span>${name}</span><b>${n}</b>${u?`<em>급구 ${u}</em>`:""}</button>`).join("")}</div>
    </div>
    <!-- 플래티넘(상위노출) 채용정보 -->
    <div class="sec-t"><div><h2>상위노출 채용정보 <span class="muted" style="font-size:16px">${plat.length}건</span></h2><p class="muted small">유료 상위노출 공고 · 주황 테두리</p></div><button onclick="setMode('biz');go('ads')">내 공고도 여기에 →</button></div>
    ${plat.length?`<div class="feedgrid">${plat.slice(0,6).map(feedCard).join("")}</div>`:`<div class="card" style="text-align:center;color:var(--sub)">이 조건의 상위노출 공고는 아직 없어요. 아래 전체 목록을 봐 주세요.</div>`}
    <!-- 전체 채용정보: 밀도 높은 목록 -->
    <div class="sec-t" id="list-anchor" style="margin-bottom:10px;scroll-margin-top:80px"><div><h2>전체 채용정보 <span class="muted" style="font-size:16px">${rest.length}건</span></h2>
      <div class="selrow">${sel.length?sel.map(([k,v])=>`<span class="tag or">${pickLabel[k]} · ${v} <button class="x" onclick="S.home.pick={};render()">×</button></span>`).join(""):'<span class="cap">분류를 고르지 않으면 서울 전체 최신 순</span>'}</div></div>
      <div class="row"><span class="small muted">묶어 보기</span><div class="seg"><button class="${!groupMode?"on":""}" onclick="S.home.group='';render()">최신 순</button><button class="${groupMode==="fac"?"on":""}" onclick="S.home.group='fac';render()">기관별</button><button class="${groupMode==="gu"?"on":""}" onclick="S.home.group='gu';render()">지역별</button></div></div></div>
    <div class="tbl listwrap"><table class="list">
      <thead><tr><th class="c-day">등록</th><th class="c-org">기관명</th><th class="c-job">직종</th><th class="c-area">지역 · 거리</th><th class="c-time">근무시간</th><th class="c-pay">급여</th><th class="c-act"></th></tr></thead>
      <tbody>${listHtml||`<tr><td colspan="7" class="empty">이 조건의 공고가 아직 없어요. 다른 분류를 골라 보세요.</td></tr>`}</tbody></table></div>
    ${rest.length>S.home.limit?`<button class="btn out wide" style="margin-top:12px" onclick="S.home.limit+=30;render()">공고 더 보기 (${rest.length-S.home.limit}건 남음)</button>`:""}
    <!-- 내 주변 지도 + 등급 좋은 시설 -->
    <div class="sec-t"><div><h2>${gu} 내 주변</h2><p class="muted small">핀의 글자는 건강보험공단 평가등급 · 주황 핀은 상위노출</p></div><button onclick="S.f.gu='${gu}';go('search')">목록으로 →</button></div>
    <div class="dsplit">
      <div class="mapbox"><svg viewBox="0 0 600 236" aria-label="주변 지도 미리보기">
        <rect width="600" height="236" fill="var(--bg)"/>
        <g stroke="var(--line)" stroke-width="2" fill="none"><path d="M0 118h600M300 0v236M0 60h600M0 178h600M150 0v236M450 0v236"/></g>
        <g stroke="var(--line)" stroke-width="7" fill="none" opacity=".7"><path d="M30 200 Q300 30 570 200"/><path d="M60 16 Q300 210 540 26"/></g>
        <circle cx="300" cy="118" r="9" fill="var(--secondary)"/><circle cx="300" cy="118" r="18" fill="none" stroke="var(--secondary)" stroke-width="2" opacity=".5"/><text x="300" y="146" text-anchor="middle" font-size="12" fill="var(--sub)" font-family="inherit">내 위치</text>
        ${pins.map(p=>`<g style="cursor:pointer" onclick="go('detail',${p.j.id})"><circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="13" fill="${p.j.top?'var(--primary)':'var(--card)'}" stroke="var(--primary)" stroke-width="2"/><text x="${p.x.toFixed(0)}" y="${(p.y+4).toFixed(0)}" text-anchor="middle" font-size="11" font-weight="700" fill="${p.j.top?'#fff':'var(--primary)'}" font-family="inherit">${p.j.grade||"•"}</text><text x="${p.x.toFixed(0)}" y="${(p.y+27).toFixed(0)}" text-anchor="middle" font-size="11" fill="var(--title)" font-family="inherit">${esc(p.j.job)}</text></g>`).join("")}
      </svg><div class="mapfoot"><span class="cap">실제 서비스에서는 카카오 지도 · 반경 조절</span><button class="btn out sm" onclick="toast('지도 전체 보기(2차)')">지도 크게 보기</button></div></div>
      <div class="goodlist"><h3>등급 A · 4대보험 · 급여 공개 시설</h3>${good.map(j=>`<article class="mini-job" onclick="go('detail',${j.id})"><span class="grade"><b class="g${j.grade}">${j.grade}</b></span><div><b>${esc(j.org)}</b><span>${esc(j.job)} · ${j.pay} · ${j.dist}</span></div><span class="tag gr">후기 ${j.score}</span></article>`).join("")}</div>
    </div>
    <div class="sec-t"><h2>왜 케어잡모아인가요</h2></div>
    <div class="grid g3 why">
      <div class="card stack">${I.home}<h3>가까운 곳·맞는 시간부터</h3><p class="muted">도보·버스 정거장 기준 거리와 오전·주3일·야간·입주·단기 근무형태로 찾습니다.</p></div>
      <div class="card stack">${I.shield.replace('class="ico sm"','class="ico"')}<h3>믿을 수 있는 시설인지 먼저</h3><p class="muted">공단 평가등급, 4대보험, 급여 공개 여부, 근무자 후기를 공고에 기본 표시합니다.</p></div>
      <div class="card stack">${I.cert}<h3>자격증이 없어도 시작</h3><p class="muted">지금 가능한 일부터 요양보호사 자격 취득까지, 케어닥 교육과 이어드립니다.</p></div>
    </div>
  </div>
  <nav class="tabbar five"><button class="on" onclick="go('home')">${I.tab_home}홈</button><button onclick="go('search')">${I.tab_list}일자리</button><button onclick="requireUser(()=>go('me'))">${I.tab_send}내 지원</button><button onclick="go('start')">${I.tab_cert}자격증</button><button onclick="setMode('biz')">${I.tab_biz}기업회원</button></nav>`;
}
