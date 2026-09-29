function talent(){
  if(!TALENTS)TALENTS=buildTalents();
  const f=S.tal;
  const list=TALENTS.filter(t=>(f.gu==="전체"||t.gu===f.gu)&&(!f.job.length||f.job.includes(t.job))&&(!f.sched.length||f.sched.includes(t.sched))&&(!f.lic||t.lic.some(l=>l!=="없음"))&&(!f.caredoc||t.caredoc)).sort((a,b)=>a.last-b.last);
  const chip=(key,v)=>`<button class="chip${S.tal[key].includes(v)?" on":""}" onclick="(()=>{const a=S.tal.${key};const i=a.indexOf('${v}');i<0?a.push('${v}'):a.splice(i,1);render()})()">${v}</button>`;
  return `<div style="padding-block:24px 8px" class="stack"><div class="row" style="justify-content:space-between"><div><h1>인재정보 <span class="muted" style="font-size:18px">${TALENTS.length}명</span></h1><p class="muted">간편지원 후 "다른 시설에서도 연락받을게요"에 동의한 구직자만 보입니다. 열람 무료 · 제안 발송만 유료.</p></div><span class="tag gr" style="font-size:14px">연락처는 구직자가 수락해야 공개</span></div>
  ${isBiz()?"":`<div class="vbanner none" style="margin-top:8px"><div><b>미리보기 중입니다</b><p>가입하면 프로필 상세와 제안 보내기가 열립니다. 가입 1분, 열람 무료.</p></div><div class="row"><button class="btn out sm" onclick="openLogin('biz')">로그인</button><button class="btn sec sm pill" onclick="openBizJoin(()=>go('talent'))">기업회원 1분 가입</button></div></div>`}</div>
  <div class="search" style="padding-top:8px">
    <aside class="filter">
      <div><h3>거주 지역</h3><div class="field"><select onchange="S.tal.gu=this.value;render()">${GUS.map(g=>`<option${f.gu===g?" selected":""}>${g}</option>`).join("")}</select></div></div>
      <div><h3>희망 직종</h3><div class="chips">${JOB_TYPES.map(s=>chip("job",s)).join("")}</div></div>
      <div><h3>희망 근무 시간</h3><div class="chips">${SCHEDS.map(s=>chip("sched",s)).join("")}</div></div>
      <div class="toggle${f.lic?" on":""}" onclick="S.tal.lic=!S.tal.lic;render()" role="switch" tabindex="0"><span>자격증 보유자만</span><span class="sw"></span></div>
      <div class="toggle${f.caredoc?" on":""}" onclick="S.tal.caredoc=!S.tal.caredoc;render()" role="switch" tabindex="0"><span>케어닥 근무 인증만</span><span class="sw"></span></div>
      <button class="btn out sm" onclick="S.tal={gu:'전체',job:[],sched:[],lic:false,caredoc:false};render()">조건 모두 지우기</button>
      <div class="card" style="background:var(--info-bg);border-color:transparent"><b>제안 보내기 요금(가안)</b><p class="small">건당 5,000원 · 10건 묶음 40,000원 · 월정액 회원 50건 포함. 구직자가 수락하면 연락처가 열립니다. 미수락 건은 환불.</p></div>
    </aside>
    <section>
      <div class="listhead"><h2>${f.gu==="전체"?"서울":f.gu} 구직자 <span class="muted" style="font-size:18px">${list.length}명</span></h2><span class="small muted">최근 활동 순</span></div>
      ${list.length?`<div class="tbl listwrap"><table class="list talent"><thead><tr><th class="c-day">활동</th><th class="c-org">구직자</th><th class="c-job">희망 직종 · 자격</th><th class="c-area">거주 · 이동</th><th class="c-time">가능 시간</th><th class="c-pay">희망 급여</th><th class="c-act"></th></tr></thead><tbody>${list.slice(0,S.tal.limit||30).map(talentRow).join("")}</tbody></table></div>${list.length>(S.tal.limit||30)?`<button class="btn out wide" style="margin-top:12px" onclick="S.tal.limit=(S.tal.limit||30)+30;render()">더 보기 (${list.length-(S.tal.limit||30)}명 남음)</button>`:""}`:`<div class="empty"><p style="font-size:20px;color:var(--title)">조건에 맞는 구직자가 아직 없어요</p><p>조건을 하나 줄여 보세요.</p></div>`}
    </section></div>`;
}
function talentRow(t){
  return `<tr class="lr" onclick="openTalent(${t.id})">
    <td class="c-day"><span class="${t.last===0?"new":""}">${t.last===0?"오늘":t.last+"일 전"}</span><span class="cap">활동</span></td>
    <td class="c-org"><b>${t.name} <span class="muted" style="font-weight:500">${t.age}세 ${t.sex}</span></b><span class="rt">${t.caredoc?'<span class="tag bl">케어닥 근무 인증</span>':''}${t.noLic?'<span class="tag gr">자격 취득 예정</span>':''}<span class="cap">${esc(t.memo)}</span></span></td>
    <td class="c-job">${t.job}<span class="cap">${t.lic.join(" · ")}${t.yrs?` · 경력 ${t.yrs}년`:" · 신입"}</span></td>
    <td class="c-area">${t.gu} ${t.dong}<span class="cap">${t.move}</span></td>
    <td class="c-time">${t.sched}<span class="cap">${t.days}</span></td>
    <td class="c-pay"><b>${t.pay}</b><span class="cap">희망</span></td>
    <td class="c-act"><button class="btn sec pill xs" onclick="event.stopPropagation();openTalent(${t.id})">제안</button></td></tr>`;
}
function t_sel(id){const t=TALENTS.find(x=>x.id===id); if(!t.sel)t.sel=[0]; return t.sel;}
function openTalent(id){
  if(!isBiz()){ openBizJoin(()=>openTalent(id)); return; }
  const t=TALENTS.find(x=>x.id===id); if(!t.sel)t.sel=[0]; closeModal();
  const ov=document.createElement("div");ov.className="ov";ov.id="modal";
  ov.innerHTML=`<div class="md" role="dialog"><div class="row" style="margin-bottom:6px">${t.caredoc?'<span class="tag bl">케어닥 근무 인증</span>':''}${t.noLic?'<span class="tag gr">자격 취득 예정</span>':''}<span class="tag gy">${t.last===0?"오늘 활동":t.last+"일 전 활동"}</span></div>
   <h2>${t.name} <span class="muted" style="font-size:18px;font-weight:500">${t.age}세 ${t.sex} · ${t.gu} ${t.dong}</span></h2>
   <dl class="kv" style="margin-top:14px"><dt>희망 직종</dt><dd>${t.job}</dd><dt>자격</dt><dd>${t.lic.join(" · ")}</dd><dt>경력</dt><dd>${t.yrs?t.yrs+"년":"신입"}${t.care?` · <b style="color:var(--info)">${t.care}</b>`:""}</dd><dt>가능 시간</dt><dd>${t.sched} · ${t.days}</dd><dt>이동</dt><dd>${t.move}</dd><dt>희망 급여</dt><dd>${t.pay}</dd><dt>한마디</dt><dd>${esc(t.memo)}</dd><dt>연락처</dt><dd><span class="muted">010-****-**** · 수락 후 공개</span></dd></dl>
   <div class="card" style="margin-top:16px;background:var(--bg)"><b>제안할 공고</b><div class="stack" style="margin-top:8px">${["요양보호사 · 오전 9~12시","요양보호사 · 야간"].map((x,i)=>`<div class="check${(t.sel||[0]).includes(i)?" on":""}" onclick="(()=>{const s=t_sel(${t.id});const k=s.indexOf(${i});k<0?s.push(${i}):s.splice(k,1);openTalent(${t.id})})()"><span class="bx">${(t.sel||[0]).includes(i)?I.check:""}</span>${x}</div>`).join("")}</div><p class="cap" style="margin-top:8px">구직자에게 카카오톡으로 공고와 시설 정보(평가등급·급여·거리)가 전달됩니다. 수락률 평균 38%(가안).</p></div>
   <div class="row" style="justify-content:space-between;margin-top:16px"><span>제안 ${(t.sel||[0]).length}건 <b>${((t.sel||[0]).length*5000).toLocaleString()}원</b> <span class="cap">미수락 시 환불</span></span></div>
   <div class="two" style="margin-top:12px"><button class="btn out" onclick="closeModal()">닫기</button><button class="btn sec pill" ${(t.sel||[0]).length?"":"disabled"} onclick="closeModal();toast('${t.name}님께 제안을 보냈습니다 (목업)')">제안 보내기</button></div></div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();}); document.body.appendChild(ov);
}
const SCREENS={home,search,detail,start,biz,post,ads,talent,me,bizme};
function render(){
  const y=window.scrollY; let html=SCREENS[S.screen](); if(S.mode==="biz"&&!html.includes('class="tabbar')) html+=`<nav class="tabbar five"><button class="${S.screen==='biz'?'on':''}" onclick="go('biz')">${I.tab_home}기업 홈</button><button class="${S.screen==='post'?'on':''}" onclick="requireBiz(()=>go('post'))">${I.tab_send}공고 등록</button><button class="${S.screen==='talent'?'on':''}" onclick="go('talent')">${I.tab_list}인재정보</button><button class="${S.screen==='ads'?'on':''}" onclick="go('ads')">${I.tab_cert}광고</button><button onclick="setMode('user')">${I.tab_biz}구직자</button></nav>`; $("app").innerHTML=html; window.scrollTo({top:y});
  const userNav=[["home","홈"],["search","일자리 찾기"],["start","자격증이 없어요"]], bizNav=[["biz","기업 홈"],["post","공고 등록"],["talent","인재정보"],["ads","광고 상품"]];
  $("nav").innerHTML=(S.mode==="biz"?bizNav:userNav).map(n=>`<button class="${S.screen===n[0]||(n[0]==='search'&&S.screen==='detail')?"on":""}" onclick="go('${n[0]}')">${n[1]}</button>`).join("");
  $("m-user").classList.toggle("on",S.mode==="user");$("m-biz").classList.toggle("on",S.mode==="biz");
  authSlot(); if(S.screen==="search"){ applySEO(false); const p=pathFor(); if(location.protocol!=="file:"&&location.pathname!==p){ try{history.replaceState(null,"",p);}catch(e){} } }
}
routeFromPath(); render(); applySEO(false);
