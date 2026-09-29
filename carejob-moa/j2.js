const JOBS=(function(){
const {R,pick,rint,wpick,GU,DONG,FAC,FS,PRE,NAME,JT,FJ,NOLIC,SCH,won,PAY}=__JD0;const {TITLE,BENEF,DUTY,REQ,DIST,RV,CDF,CDN,sample}=__JD1;
  const out=[];
  for(let n=0;n<240;n++){
    let fac,caredoc,job;
    if(n<12){fac=pick(CDF);caredoc=true;} else {fac=wpick(FAC,[20,17,15,13,11,7,6,6,5]);caredoc=false;}
    if(n>=12&&n<38){job=JT[(n-12)%13];fac=pick(FAC.filter(f=>FJ[f][job]));}
    const jw=FJ[fac];
    if(caredoc&&fac==="일반 병원")job="병원동행매니저"; else if(!(n>=12&&n<38))job=wpick(Object.keys(jw),Object.values(jw));
    const gu=n>=12?wpick(GU,GU.map(g=>["강남구","송파구","강동구","서초구"].includes(g)?6:1)):pick(["강남구","송파구","강동구","서초구","성동구"]);
    const dong=pick(DONG[gu]); const [sched,hours]=pick(SCH[job]); const pay=PAY[job][sched]();
    const grade=["방문요양센터","주야간보호센터","요양원"].includes(fac)?pick(["A","A","B","B","B","C","C","D",""]):(fac==="요양병원"?pick(["A","B","C",""]):"");
    const ins=R()<(["간병인","병원동행매니저"].includes(job)?0.35:0.92); const payOpen=R()<0.72;
    const score=Math.round((3.4+R()*1.5)*10)/10, reviews=rint(3,45), noLic=NOLIC.has(job), urgent=R()<0.18;
    const org=(caredoc?CDN[fac]:pick(PRE)+pick(NAME[fac])).replace("{gu}",gu).replace("{dong}",dong);
    const days=pick([0,1,1,2,2,3,4,5,6,7,9,12,15,20]); const top=(caredoc&&R()<0.6)||(!caredoc&&R()<0.12); const dist=pick(DIST);
    const title=pick(TITLE[job]).replace(/\{job\}/g,job).replace("{fac}",FS[fac]).replace("{h0}",hours[0]);
    let benef=sample(BENEF,rint(2,5)); if(!ins)benef=benef.filter(b=>b!=="4대보험"&&b!=="퇴직금");
    out.push({id:n+1,job,fac:FS[fac],area:gu+" "+dong,gu,sched,hours,pay,grade,ins,payOpen,score,reviews,noLic,urgent,caredoc,org,dist,days,top,title,benef,duty:DUTY[job],req:REQ[job],head:pick([1,1,2,2,3,5]),rv:sample(RV,3)});
  }
  return out;

})();
