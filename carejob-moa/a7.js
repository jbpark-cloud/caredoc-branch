function ads(){
  const items=[
   ["상위노출","지역·직종 목록 최상단 고정 + 주황 테두리","30,000원","7일",["30일 90,000원","같은 조건 무료 공고보다 평균 3~4배 조회(가안)","케어닥 앱 노출은 포함되지 않음"],true],
   ["메인 배너","케어잡모아 첫 화면 '오늘 눈여겨볼 공고' 배너","150,000원","7일",["시설 브랜딩 · 로고·사진 노출","지역(구) 단위 타깃 선택","월 4개 시설만 판매"],false],
   ["급구 태그","빨간 '급구' 표시 + 최신순 상단","7,000원","3일",["상위노출과 함께 쓰면 할인","오늘 당장 필요할 때"],false],
   ["동네 문자 알림","근무지 반경 3km 구직자에게 공고 문자 발송","건당 90원","1회",["최소 200건 18,000원","수신 동의 구직자에게만 발송","야간 발송 없음 (08~20시)"],false],
   ["인재 제안","인재정보에서 고른 구직자에게 공고 제안 발송","건당 5,000원","1건",["10건 묶음 40,000원","구직자 수락 시 연락처 공개","미수락 건 환불"],false]];
  return `<div style="padding-block:24px" class="stack"><button class="btn out xs" style="align-self:flex-start" onclick="go('biz')">← 기업 홈</button><h1>광고 상품</h1><p class="muted">공고 등록과 지원자 열람은 언제나 무료입니다. 가격은 가안이며 확정 전입니다.</p></div>
  <div class="grid g4" style="grid-template-columns:repeat(5,1fr)">${items.map(x=>`<div class="card price${x[5]?" hot":""}">${x[5]?'<span class="tag or" style="align-self:flex-start">가장 많이 선택</span>':""}<h3>${x[0]}</h3><p class="muted small">${x[1]}</p><p class="p">${x[2]}<small> / ${x[3]}</small></p><ul>${x[4].map(l=>`<li>${l}</li>`).join("")}</ul><button class="btn ${x[5]?"pri":"out"} pill" onclick="order('${x[0]}','${x[2]}')">신청</button></div>`).join("")}</div>
  <div class="sec-t"><h2>상시 채용 시설이라면 월정액</h2></div>
  <div class="card" style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;border-color:var(--secondary)"><div><span class="tag sec">프리미엄 월정액</span><h3 style="margin-top:8px">공고 무제한 + 상위노출 2건 상시 + 문자 알림 500건 + 인재 제안 50건</h3><p class="muted">요양원·요양병원처럼 늘 사람을 뽑는 시설용. 월 190,000원(가안).</p></div><button class="btn sec pill" onclick="order('프리미엄 월정액','190,000원')">상담 신청</button></div>
  <div class="sec-t"><h2>상품 비교</h2></div>
  <div class="card tbl"><table><tr><th></th><th>무료 공고</th><th style="background:var(--primary-bg)">상위노출</th><th>메인 배너</th><th>급구</th><th>문자 알림</th><th>월정액</th></tr>
   <tr><td>목록 노출</td><td>최신순</td><td style="background:var(--primary-bg)">최상단 고정</td><td>최신순</td><td>상단</td><td>–</td><td>최상단 고정 2건</td></tr>
   <tr><td>첫 화면 노출</td><td>–</td><td style="background:var(--primary-bg)">눈여겨볼 공고</td><td>배너</td><td>–</td><td>–</td><td>눈여겨볼 공고</td></tr>
   <tr><td>강조 표시</td><td>–</td><td style="background:var(--primary-bg)">주황 테두리</td><td>로고·사진</td><td>빨간 태그</td><td>–</td><td>주황 테두리</td></tr>
   <tr><td>구직자 직접 도달</td><td>–</td><td style="background:var(--primary-bg)">–</td><td>–</td><td>–</td><td>문자</td><td>문자 500건 · 제안 50건</td></tr>
   <tr><td class="num">가격(가안)</td><td class="num">0원</td><td class="num" style="background:var(--primary-bg)">3만원/7일</td><td class="num">15만원/7일</td><td class="num">7천원/3일</td><td class="num">90원/건</td><td class="num">19만원/월</td></tr>
  </table></div>`;
}
let ORD=[0];
function order(name,price){
  if(!isBiz()){ openBizJoin(()=>order(name,price)); return; }
  closeModal(); const ov=document.createElement("div");ov.className="ov";ov.id="modal";
  ov.innerHTML=`<div class="md" role="dialog"><h2>${name} 신청</h2><p class="muted">적용할 공고를 고르고 결제하세요. (프로토타입: 실제 결제 없음)</p>
   <div class="stack" style="margin-top:16px">${["요양보호사 · 오전 9~12시","요양보호사 · 야간"].map((x,i)=>`<div class="check${ORD.includes(i)?" on":""}" onclick="(()=>{const k=ORD.indexOf(${i});k<0?ORD.push(${i}):ORD.splice(k,1);order('${name}','${price}')})()"><span class="bx">${ORD.includes(i)?I.check:""}</span>${x}</div>`).join("")}</div>
   <div class="card" style="margin-top:16px;background:var(--bg)"><div class="row" style="justify-content:space-between"><span>${name} × ${ORD.length}건</span><b>${price}${ORD.length>1?" × "+ORD.length:""}</b></div><div class="row" style="justify-content:space-between"><span class="muted small">부가세 별도 · 세금계산서 발행</span></div></div>
   <div class="two" style="margin-top:20px"><button class="btn out" onclick="closeModal()">취소</button><button class="btn pri pill" ${ORD.length?"":"disabled"} onclick="closeModal();toast('${name} ${ORD.length}건 결제 완료(목업)')">결제하기</button></div></div>`;
  ov.addEventListener("click",e=>{if(e.target===ov)closeModal();}); document.body.appendChild(ov);
}
let TALENTS=null;
function seedRand(s){return function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}}
function buildTalents(){
  const r=seedRand(7); const pick=a=>a[Math.floor(r()*a.length)];
  const sur=["김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권"], gn=["숙","희","순","자","옥","영","미","경","정","선","혜","란"];
  const LIC=[["요양보호사"],["요양보호사","사회복지사 2급"],["간병인 교육 이수"],["간호조무사"],["요양보호사","간호조무사"],["없음"],["없음"],["사회복지사 2급"],["요양보호사","1종 보통"],["조리사","보건증"],["1종 보통"],["물리치료사"],["간호사"]];
  const WANT={"요양보호사":["요양보호사"],"요양보호사,사회복지사 2급":["사회복지사","요양보호사"],"간병인 교육 이수":["간병인"],"간호조무사":["간호조무사"],"요양보호사,간호조무사":["간호조무사","요양보호사"],"없음":["병원동행매니저","생활지원사","조리원·조리보조","사무행정"],"사회복지사 2급":["사회복지사"],"요양보호사,1종 보통":["요양보호사","운전원(송영)"],"조리사,보건증":["조리원·조리보조"],"1종 보통":["운전원(송영)"],"물리치료사":["물리치료사"],"간호사":["간호사"]};
  const out=[];
  for(let i=0;i<72;i++){
    const lic=pick(LIC); const key=lic.join(","); const want=WANT[key]||["요양보호사"]; const job=pick(want);
    const gu=r()<0.6?pick(["강남구","송파구","강동구","서초구"]):pick(GUS.filter(g=>g!=="전체")); const dong=pick(JOBS.filter(j=>j.gu===gu).map(j=>j.area.split(" ")[1])||["역삼동"]);
    const age=50+Math.floor(r()*17); const sex=r()<0.9?"여":"남"; const yrs=lic[0]==="없음"?0:Math.floor(r()*12);
    const sched=pick(SCHEDS); const days=pick(["월~금","월·수·금","화·목","주말 가능","요일 무관"]);
    const pay=job==="간병인"?`일 ${12+Math.floor(r()*4)}만원`:(sched==="오전만"||sched==="주3일")?`시급 ${(13+Math.floor(r()*3))*1000+500}원`:`월 ${220+Math.floor(r()*8)*10}만원`;
    const last=pick([0,0,1,1,2,3,5,7,10,14]); const caredoc=r()<0.25; const care=caredoc?`케어닥 근무 ${1+Math.floor(r()*4)}년 · 평점 ${(4+r()).toFixed(1)}`:"";
    const move=pick(["도보","자차","대중교통","자전거"]); const memo=pick(["와상 어르신 케어 경험 있음","치매 어르신 대응 익숙","야간 근무 가능","즉시 출근 가능","주 3일만 희망","입주 가능","조리 경력 5년","송영 운전 경력"]);
    out.push({id:i+1,name:pick(sur)+"OO",age,sex,gu,dong,lic,job,yrs,sched,days,pay,last,caredoc,care,move,memo,noLic:lic[0]==="없음"});
  }
  return out;
}
