function jobCard(j){
  return `<article class="card job${j.top?" top":""}" onclick="go('detail',${j.id})" tabindex="0" onkeydown="if(event.key==='Enter')go('detail',${j.id})">
    <div class="org">${j.top?'<span class="tag or">상위노출</span>':''}${j.urgent?'<span class="tag rd">급구</span>':''}${j.caredoc?'<span class="tag bl">케어닥 직영</span>':''}${j.noLic?'<span class="tag gr">자격증 없어도 가능</span>':''}<span>${esc(j.org)} · ${j.fac}</span></div>
    <h3>${esc(j.title)}</h3>
    <div class="meta"><span>${I.pin}${j.area} · <b>${j.dist}</b></span><span>${I.clock}${j.hours.join(" · ")}</span></div>
    <div class="pay">${j.pay}</div>
    <div class="foot">${gradeEl(j.grade)}<span class="small muted">${j.days}일 전 · 후기 ${j.reviews}</span></div>
  </article>`;
}
