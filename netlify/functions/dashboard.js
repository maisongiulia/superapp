// Netlify Function: lit la table "Deal & Order Management" cote serveur et renvoie
// l'objet `M` complet du tableau de bord commercial (memes regles que build_dashboard.py,
// valide 71/71 contre l'instantane du 2 juin). Token = secret serveur AIRTABLE_PAT.
// Reponse CORS ouverte pour que le tableau de bord (iframe a origine opaque) puisse la lire.
const BASE="appbmntO89PpFQtUQ", TABLE="tbl1fhIwqPsT0umy7";

// ---- field names (REST API returns fields keyed by name; identical to the CSV headers) ----
const F={STATUS:"Deal Status",COMP:"Companies",DEAL:"Deal Name",CAT:"Category",
  REV:"Total \u20ac",BT:"Total BT",QG:"Q Gn1",QO:"Q GMo",QR:"Q GMr",
  AGENT:"Name (from Agents / Ambassadeurs)",SALE:"Sale Date",CLOSE:"Close Date"};

// ---------- helpers ----------
const money=v=>{if(typeof v==="number")return v;const s=String(v||"").replace(/\u20ac/g,"").replace(/,/g,"").trim();const n=parseFloat(s);return isFinite(n)?n:0;};
const inum =v=>{if(typeof v==="number")return Math.trunc(v);const n=parseFloat(String(v||"").trim());return isFinite(n)?Math.trunc(n):0;};
function pdate(v){
  if(!v)return null; let s=String(v).trim().split("T")[0].split(" ")[0]; if(!s)return null;
  let m;
  if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/)))   return new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
  if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)))return new Date(Date.UTC(+m[3],+m[1]-1,+m[2]));
  return null;
}
const DAY=86400000;
const doyOf=d=>Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,1))/DAY); // 0-based
const diffDays=(a,b)=>Math.round((a-b)/DAY);
function isoWeek(d){
  const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
  const day=(t.getUTCDay()+6)%7; t.setUTCDate(t.getUTCDate()-day+3);
  const isoYear=t.getUTCFullYear();
  const firstThu=new Date(Date.UTC(isoYear,0,4));
  const fday=(firstThu.getUTCDay()+6)%7; firstThu.setUTCDate(firstThu.getUTCDate()-fday+3);
  const week=1+Math.round((t-firstThu)/(7*DAY));
  return [isoYear,week];
}
function isoMonday(isoYear,week){
  const simple=new Date(Date.UTC(isoYear,0,4));
  const fday=(simple.getUTCDay()+6)%7;
  const mon=new Date(simple); mon.setUTCDate(simple.getUTCDate()-fday+(week-1)*7);
  return mon;
}
const r2=x=>Math.round(x*100)/100, r1=x=>Math.round(x*10)/10, rr=x=>Math.round(x);

// ---------- the generator (mirrors build_dashboard.py build()) ----------
function buildM(rows, today){
  const cw=rows.filter(r=>String(r[F.STATUS]||"").trim()==="Closed-Won");
  const sale=r=>pdate(r[F.SALE])||pdate(r[F.CLOSE]);
  const comp=r=>String(r[F.COMP]||r[F.DEAL]||"").trim();
  const cat =r=>{let c=r[F.CAT]; if(Array.isArray(c))c=c.length?(c[0].name||c[0]):""; return String(c||"").trim().replace(/^"+|"+$/g,"").trim();};
  const agents=r=>{let a=r[F.AGENT]; if(Array.isArray(a))a=a.map(x=>x&&x.name?x.name:x).join(", "); return String(a||"").split(",").map(s=>s.trim()).filter(Boolean);};

  const deals=[];
  for(const r of cw){ const d=sale(r); if(!d||d>today)continue;
    deals.push({d,comp:comp(r),cat:cat(r),rev:money(r[F.REV]),bt:inum(r[F.BT]),
      qg:inum(r[F.QG]),qo:inum(r[F.QO]),qr:inum(r[F.QR]),agents:agents(r)});}
  const yr=today.getUTCFullYear();
  const d26=deals.filter(x=>x.d.getUTCFullYear()===yr);
  const d25=deals.filter(x=>x.d.getUTCFullYear()===yr-1);
  const tot=rs=>[r2(rs.reduce((a,x)=>a+x.rev,0)),rs.reduce((a,x)=>a+x.bt,0),rs.length];
  const [r26,b26,o26]=tot(d26),[r25,b25,o25]=tot(d25);
  const ytd  ={rev:r26,bt:b26,orders:o26,avgbottle:b26?r2(r26/b26):0};
  const ytd25={rev:r25,bt:b25,orders:o25,avgbottle:b25?r2(r25/b25):0};

  const md=(arr,f)=>{const m={};for(const x of arr){const k=f(x);m[k]=(m[k]||0);}return m;};
  const mr25={},mr26={},mb26={};
  for(const x of d25)mr25[x.d.getUTCMonth()+1]=(mr25[x.d.getUTCMonth()+1]||0)+x.rev;
  for(const x of d26){const mo=x.d.getUTCMonth()+1;mr26[mo]=(mr26[mo]||0)+x.rev;mb26[mo]=(mb26[mo]||0)+x.bt;}
  const monthly=[];for(let m=1;m<=12;m++)monthly.push({m,r25:r2(mr25[m]||0),r26:r2(mr26[m]||0),bt26:mb26[m]||0});

  const ch={};
  for(const x of d26){const c=ch[x.cat]||(ch[x.cat]={rev:0,bt:0,ord:0,pos:new Set()});c.rev+=x.rev;c.bt+=x.bt;c.ord++;c.pos.add(x.comp);}
  const channels=Object.keys(ch).map(c=>({c,...ch[c]})).sort((a,b)=>b.rev-a.rev).map(v=>({
    cat:v.c,rev:r2(v.rev),bt:v.bt,ord:v.ord,avgorder:v.ord?r2(v.rev/v.ord):0,
    revpos:r2(v.rev/(v.pos.size||1)),btord:v.ord?r1(v.bt/v.ord):0,avgbottle:v.bt?r2(v.rev/v.bt):0}));

  const products=[{p:"Gn1",q:d26.reduce((a,x)=>a+x.qg,0)},{p:"GMo",q:d26.reduce((a,x)=>a+x.qo,0)},{p:"GMr",q:d26.reduce((a,x)=>a+x.qr,0)}];

  // weekly (ISO)
  const wk={};
  for(const x of d26){const [yy,ww]=isoWeek(x.d);const k=yy+"-"+ww;(wk[k]||(wk[k]={yy,ww,rev:0,bt:0}));wk[k].rev+=x.rev;wk[k].bt+=x.bt;}
  const weekly=[];let cum=0;
  Object.values(wk).sort((a,b)=>a.yy-b.yy||a.ww-b.ww).forEach(w=>{const mon=isoMonday(w.yy,w.ww);cum+=w.rev;
    weekly.push({w:`${w.yy}-W${String(w.ww).padStart(2,"0")}`,start:mon.toISOString().slice(0,10),rev:r2(w.rev),bt:w.bt,cum:r2(cum)});});

  const [ty,tw]=isoWeek(today);
  const lmon=isoMonday(ty,tw); lmon.setUTCDate(lmon.getUTCDate()-7); const [ly,lw]=isoWeek(lmon);
  function weekAccts(yy,ww){
    const rs=d26.filter(x=>{const [a,b]=isoWeek(x.d);return a===yy&&b===ww;});
    const agg={};
    for(const x of rs){const a=agg[x.comp]||(agg[x.comp]={bt:0,rev:0,resp:"",cat:""});a.bt+=x.bt;a.rev+=x.rev;a.cat=x.cat;a.resp=x.agents.length?x.agents.join(", "):"Direct";}
    const accts=Object.keys(agg).map(k=>({acct:k,resp:agg[k].resp,cat:agg[k].cat,bt:agg[k].bt,rev:r2(agg[k].rev)})).sort((a,b)=>b.rev-a.rev);
    return {rev:r2(rs.reduce((a,x)=>a+x.rev,0)),bt:rs.reduce((a,x)=>a+x.bt,0),ord:rs.length,accts};
  }
  const thisweek=weekAccts(ty,tw); thisweek.cum=ytd.rev; const lastweek=weekAccts(ly,lw);

  const acc26={};
  for(const x of d26){const a=acc26[x.comp]||(acc26[x.comp]={rev:0,bt:0,ord:0});a.rev+=x.rev;a.bt+=x.bt;a.ord++;}
  const topaccounts=Object.keys(acc26).map(k=>({acct:k,rev:r2(acc26[k].rev),bt:acc26[k].bt,ord:acc26[k].ord})).sort((a,b)=>b.rev-a.rev).slice(0,15);

  const ag={};const un={rev:0,bt:0,ord:0};
  for(const x of d26){if(x.agents.length){const n=x.agents.length;for(const a of x.agents){const g=ag[a]||(ag[a]={rev:0,bt:0,ord:0,accts:new Set()});g.rev+=x.rev/n;g.bt+=x.bt/n;g.ord++;g.accts.add(x.comp);}}else{un.rev+=x.rev;un.bt+=x.bt;un.ord++;}}
  const agents_l=Object.keys(ag).map(k=>({agent:k,rev:r2(ag[k].rev),bt:rr(ag[k].bt),ord:ag[k].ord,accts:ag[k].accts.size})).sort((a,b)=>b.rev-a.rev);
  const unattributed={rev:r2(un.rev),bt:un.bt,ord:un.ord};

  const q2=d26.filter(x=>{const m=x.d.getUTCMonth()+1;return m>=4&&m<=6;});
  const aq={},aqrev={};
  for(const x of q2){const names=x.agents.length?x.agents:["Direct / Online"];const n=names.length;
    for(const a of names){(aq[a]||(aq[a]={}));(aq[a][x.comp]||(aq[a][x.comp]={rev:0,bt:0}));aq[a][x.comp].rev+=x.rev/n;aq[a][x.comp].bt+=x.bt/n;aqrev[a]=(aqrev[a]||0)+x.rev/n;}}
  const aoq=Object.keys(aqrev).sort((a,b)=>aqrev[b]-aqrev[a]).map(a=>({agent:a,rev:r2(aqrev[a]),
    accounts:Object.keys(aq[a]).map(c=>({acct:c,rev:r2(aq[a][c].rev),bt:rr(aq[a][c].bt)})).sort((x,y)=>y.rev-x.rev).slice(0,3)}));

  // all-time per company
  const all={};for(const x of deals)(all[x.comp]||(all[x.comp]=[])).push(x);
  const best=Object.keys(all).map(c=>{const ds=all[c].map(o=>o.d).sort((a,b)=>a-b);const n=ds.length;
    const gaps=[];for(let i=1;i<ds.length;i++)gaps.push(diffDays(ds[i],ds[i-1]));
    const avgc=gaps.length?Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length):0;
    return {acct:c,orders:n,avgcycle:avgc,total:r2(all[c].reduce((a,o)=>a+o.rev,0))};})
    .sort((a,b)=>b.orders-a.orders||b.total-a.total).slice(0,15);

  const doy=doyOf(today)+1;
  const runrate=doy?r26/doy:0;
  const traj={runrate:r2(runrate),days:doy,proj_rev:rr(r2(runrate)*365),
    proj_bt:doy?rr(b26/doy*365):0,vs2025:r25?r1((r2(runrate)*365-r25)/r25*100):0,rev2025:rr(r25)};

  function cumarr(ds,cap){const per={};for(const x of ds)per[doyOf(x.d)]=(per[doyOf(x.d)]||0)+x.rev;
    const arr=[];let run=0;for(let i=0;i<366;i++){if(cap==null||i<cap)run+=(per[i]||0);arr.push(r1(run));}return arr;}
  const cum2025=cumarr(d25,null),cum2026=cumarr(d26,doy);

  // reorder engine
  function classify(){
    const flag=[],ok=[],react=[];
    for(const c of Object.keys(all)){
      const xs=all[c].slice().sort((a,b)=>a.d-b.d);const dates=xs.map(o=>o.d);const n=dates.length;
      const last=dates[n-1];const rev=xs.reduce((a,o)=>a+o.rev,0);const ct=xs[n-1].cat;
      let exp,rule;
      if(n>=2){const gaps=[];for(let i=1;i<dates.length;i++)gaps.push(diffDays(dates[i],dates[i-1]));
        const cyc=gaps.reduce((a,b)=>a+b,0)/gaps.length;exp=cyc*1.2;rule=`cycle ${Math.round(cyc)}d \u00d71.2`;}
      else{exp=ct==="Retail"?30:45;rule=`fallback ${exp}d`;}
      const overdue=diffDays(today,last);const mult=exp?r2(overdue/exp):0;const ontrack=overdue<=exp;
      const row={acct:c,cat:ct,last:last.toISOString().slice(0,10),rule,mult,rev:rr(rev),overdue,n,priority:rr(overdue*rev),ontrack};
      const ly=last.getUTCFullYear();
      if(ly===yr)(ontrack?ok:flag).push(row); else if(ly===yr-1)react.push(row);
    }
    const pr=L=>L.sort((a,b)=>b.priority-a.priority);
    return [pr(flag),pr(ok),pr(react)];
  }
  const [flag,ok,react]=classify();
  const reorder={active_flag:flag,active_ok:ok,react,n_active:flag.length+ok.length,n_flag:flag.length,n_react:react.length};

  return {ytd,ytd25,monthly,channels,avgbottle:{"2025":ytd25.avgbottle,"2026":ytd.avgbottle},products,
    weekly,thisweek,lastweek,topaccounts,bestreorder:best,agents:agents_l,unattributed,aoq,
    trajectory:traj,cum2025,cum2026,today_doy:traj.days,reorder};
}

// ---------- Airtable fetch + handler ----------
async function fetchAll(token){
  let out=[],offset=null,guard=0;
  do{
    const qs=new URLSearchParams({pageSize:"100"}); if(offset)qs.set("offset",offset);
    const r=await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}?${qs}`,{headers:{Authorization:"Bearer "+token}});
    if(!r.ok){const t=await r.text().catch(()=>"");const e=new Error("airtable "+r.status+" "+t);e.status=r.status;throw e;}
    const j=await r.json(); out=out.concat((j.records||[]).map(rec=>rec.fields||{})); offset=j.offset;
  }while(offset&&++guard<40);
  return out;
}

exports.handler = async () => {
  const CORS={"content-type":"application/json","access-control-allow-origin":"*","cache-control":"public, max-age=300"};
  try{
    const token=process.env.AIRTABLE_PAT;
    if(!token) return {statusCode:500,headers:CORS,body:JSON.stringify({error:"AIRTABLE_PAT manquant"})};
    const rows=await fetchAll(token);
    return {statusCode:200,headers:CORS,body:JSON.stringify(buildM(rows,new Date()))};
  }catch(e){
    return {statusCode:(e.status||500),headers:CORS,body:JSON.stringify({error:String(e.message||e)})};
  }
};

module.exports.buildM = buildM;  // exported for offline validation
