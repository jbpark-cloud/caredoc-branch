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
      <nav class="crumb" aria-label="경로"><a href="#" onclick="go('home');return false">홈</a><span>›</span><b>일자리</b>${S.f.gu!=="전체"?`<span>›</span><b>${S.f.gu}</b>`:""}${S.f.job.length===1?`<span>›</span><b>${S.f.job[0]}</b>`:""}</nav>
      <div class="listhead"><h2>${S.f.gu==="전체"?"서울":S.f.gu}${S.f.dong?" "+esc(S.f.dong):""} ${S.f.job.length===1?S.f.job[0]+" ":""}일자리 <span class="muted" style="font-size:18px">${list.length}건</span></h2>
        <div class="row"><div class="seg"><button class="${S.f.view!=="card"?"on":""}" onclick="S.f.view='list';render()">목록</button><button class="${S.f.view==="card"?"on":""}" onclick="S.f.view='card';render()">카드</button></div>
        <label class="small muted">정렬 <select onchange="S.f.sort=this.value;render()"><option value="near"${S.f.sort==="near"?" selected":""}>가까운 순</option><option value="new"${S.f.sort==="new"?" selected":""}>최신 순</option><option value="grade"${S.f.sort==="grade"?" selected":""}>시설 등급 순</option></select></label></div></div>
      ${list.length?(S.f.view==="card"?`<div class="grid g2">${list.slice(0,S.f.limit||40).map(jobCard).join("")}</div>`:`<div class="tbl listwrap"><table class="list"><thead><tr><th class="c-day">등록</th><th class="c-org">기관명</th><th class="c-job">직종</th><th class="c-area">지역 · 거리</th><th class="c-time">근무시간</th><th class="c-pay">급여</th><th class="c-act"></th></tr></thead><tbody>${list.slice(0,S.f.limit||40).map(listRow).join("")}</tbody></table></div>`)+`${list.length>(S.f.limit||40)?`<button class="btn out wide" style="margin-top:16px" onclick="S.f.limit=(S.f.limit||40)+40;render()">공고 더 보기 (${list.length-(S.f.limit||40)}건 남음)</button>`:""}`:`<div class="empty"><p style="font-size:20px;color:var(--title)">조건에 맞는 공고가 아직 없어요</p><p>조건을 하나 줄여 보시거나, 새 공고가 올라오면 문자로 알려드릴까요?</p><button class="btn pri pill" style="margin-top:16px" onclick="requireUser(()=>{S.alert=(S.f.gu==='전체'?'서울':S.f.gu)+' '+(S.f.sched.join('·')||'전체');toast('새 공고 알림을 신청했습니다')})">이 조건 새 공고 문자 받기</button></div>`}
    </section></div>`;
}
