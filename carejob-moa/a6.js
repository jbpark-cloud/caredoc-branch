function render(){
  const y=window.scrollY; $("app").innerHTML=SCREENS[S.screen](); window.scrollTo({top:y});
  const userNav=[["home","홈"],["search","일자리 찾기"],["start","자격증이 없어요"]], bizNav=[["biz","기업 홈"],["post","공고 등록"],["talent","인재정보"],["ads","광고 상품"]];
  $("nav").innerHTML=(S.mode==="biz"?bizNav:userNav).map(n=>`<button class="${S.screen===n[0]||(n[0]==='search'&&S.screen==='detail')?"on":""}" onclick="go('${n[0]}')">${n[1]}</button>`).join("");
  $("m-user").classList.toggle("on",S.mode==="user");$("m-biz").classList.toggle("on",S.mode==="biz");
}
render();
