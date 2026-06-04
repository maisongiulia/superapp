// Netlify Function: lit la base Airtable "MG Order Management" cote serveur
// et renvoie les donnees commerciales pretes pour la carte (clients/kpi/topcities).
// Le token Airtable reste un secret serveur (variable d'environnement AIRTABLE_PAT),
// il n'apparait jamais dans le navigateur. Reponse en CORS ouvert (lecture publique).
const BASE="appbmntO89PpFQtUQ", TABLE="tblROmuyHpdCS0xwh";
const F={name:"fldDPbamdqCB39enj",rev:"fldSmKYrGAQRxgFHd",ord:"fldnFSelCAgDvJbFR",trend:"fldkdeN28DuWv4g9E",cat:"flddtTtDhcU4SYBug"};
const GEO=[["hong kong", [22.32, 114.17, "HK", "Hong Kong"]], ["sobrerie", [46.2, 6.14, "CH", "Genève"]], ["switzerland", [46.2, 6.14, "CH", "Suisse"]], ["milano", [45.46, 9.19, "IT", "Milano"]], ["verso", [45.46, 9.19, "IT", "Milano"]], ["intimissimi", [45.46, 9.19, "IT", "Italie"]], ["casa italia", [45.46, 9.19, "IT", "Italie"]], ["saint barth", [17.9, -62.83, "BL", "Saint-Barth"]], ["tropical", [17.9, -62.83, "BL", "Saint-Barth"]], ["paragrafas", [54.69, 25.28, "LT", "Vilnius"]], ["grape travelers", [40.71, -74.01, "US", "USA"]], ["spiritu", [22.32, 114.17, "HK", "Hong Kong"]], ["utah beach", [49.41, -1.17, "FR", "Normandie"]], ["caen", [49.18, -0.37, "FR", "Caen"]], ["rennes", [48.11, -1.68, "FR", "Rennes"]], ["nantes", [47.22, -1.55, "FR", "Nantes"]], ["rochelle", [46.16, -1.15, "FR", "La Rochelle"]], ["bordeaux", [44.84, -0.58, "FR", "Bordeaux"]], ["millesima", [44.84, -0.58, "FR", "Bordeaux"]], ["pau", [43.3, -0.37, "FR", "Pau"]], ["biarritz", [43.48, -1.56, "FR", "Biarritz"]], ["strasbourg", [48.57, 7.75, "FR", "Strasbourg"]], ["clermont", [45.78, 3.08, "FR", "Clermont-Fd"]], ["tours", [47.39, 0.69, "FR", "Tours"]], ["courchevel", [45.42, 6.63, "FR", "Courchevel"]], ["boulogne", [48.83, 2.24, "FR", "Paris"]], ["paris", [48.86, 2.35, "FR", "Paris"]], ["celine", [48.86, 2.35, "FR", "Paris"]], ["grande épicerie", [48.85, 2.32, "FR", "Paris"]], ["maison du whisky", [48.87, 2.35, "FR", "Paris"]], ["potel", [48.86, 2.35, "FR", "Paris"]], ["pavillon traiteur", [48.86, 2.35, "FR", "Paris"]], ["bnp", [48.86, 2.35, "FR", "Paris"]], ["qu'importe l'ivresse - paris", [48.88, 2.32, "FR", "Paris"]], ["celine", [48.86, 2.35, "FR", "Paris"]], ["aix", [43.53, 5.45, "FR", "Aix-en-Pce"]], ["marseille", [43.3, 5.37, "FR", "Marseille"]], ["petit nice", [43.28, 5.35, "FR", "Marseille"]], ["kif", [43.3, 5.37, "FR", "Marseille"]], ["auriol", [43.37, 5.64, "FR", "Auriol"]], ["cassis", [43.21, 5.54, "FR", "Cassis"]], ["roches blanches", [43.21, 5.54, "FR", "Cassis"]], ["bandol", [43.14, 5.75, "FR", "Bandol"]], ["puget", [43.46, 6.69, "FR", "Puget/Argens"]], ["st tropez", [43.27, 6.64, "FR", "St-Tropez"]], ["tropez", [43.27, 6.64, "FR", "St-Tropez"]], ["lou pinet", [43.27, 6.64, "FR", "St-Tropez"]], ["ponche", [43.27, 6.64, "FR", "St-Tropez"]], ["belrose", [43.24, 6.58, "FR", "Gassin"]], ["cheval blanc", [43.27, 6.64, "FR", "St-Tropez"]], ["tartane", [43.22, 6.64, "FR", "Ramatuelle"]], ["lily of the valley", [43.2, 6.57, "FR", "La Croix-Valmer"]], ["mas candille", [43.6, 6.99, "FR", "Mougins"]], ["grasse", [43.66, 6.92, "FR", "Grasse"]], ["robertet", [43.66, 6.92, "FR", "Grasse"]], ["chèvre d'or", [43.73, 7.36, "FR", "Èze"]], ["vence", [43.72, 7.11, "FR", "Vence"]], ["saint paul", [43.7, 7.12, "FR", "St-Paul"]], ["cave saint paul", [43.7, 7.12, "FR", "St-Paul"]], ["cagnes", [43.66, 7.15, "FR", "Cagnes/Mer"]], ["antibes", [43.58, 7.12, "FR", "Antibes"]], ["safranier", [43.58, 7.12, "FR", "Antibes"]], ["eden rose", [43.55, 7.12, "FR", "Cap d'Antibes"]], ["monaco", [43.74, 7.42, "MC", "Monaco"]], ["sbm", [43.74, 7.42, "MC", "Monaco"]], ["robuchon", [43.74, 7.42, "MC", "Monaco"]], ["yachting", [43.74, 7.42, "MC", "Monaco"]], ["jeroboam", [43.74, 7.42, "MC", "Monaco"]], ["as monaco", [43.74, 7.42, "MC", "Monaco"]], ["nice", [43.7, 7.27, "FR", "Nice"]], ["ruhl", [43.69, 7.27, "FR", "Nice"]], ["anantara", [43.7, 7.26, "FR", "Nice"]], ["hyde", [43.69, 7.27, "FR", "Nice"]], ["rado", [43.69, 7.27, "FR", "Nice"]], ["neptune", [43.69, 7.27, "FR", "Nice"]], ["la mome", [43.7, 7.27, "FR", "Nice"]], ["université nice", [43.7, 7.27, "FR", "Nice"]], ["riviera art", [43.7, 7.27, "FR", "Nice"]]];
const ONLINE={"Faire.eu": 1, "Shopify": 1, "Sumup": 1};

function geocode(name){const n=(name||"").toLowerCase();for(const g of GEO){if(n.indexOf(g[0])>=0)return g[1];}return [43.70,7.27,"FR","Cote d'Azur"];}
function hash(s){let h=5381;for(let i=0;i<s.length;i++){h=((h<<5)+h+s.charCodeAt(i))|0;}return Math.abs(h);}
function firstCat(v){
  if(v==null)return"";
  if(Array.isArray(v)){const x=v[0];return x&&x.name?x.name:(typeof x==="string"?x:"");}
  if(typeof v==="object"){
    if(v.name)return v.name;
    if(v.valuesByLinkedRecordId){const ks=Object.keys(v.valuesByLinkedRecordId);if(ks.length){let a=v.valuesByLinkedRecordId[ks[0]];a=Array.isArray(a)?a[0]:a;return a&&a.name?a.name:(typeof a==="string"?a:"");}}
    return "";
  }
  return ""+v;
}

async function fetchAll(token){
  const base="https://api.airtable.com/v0/"+BASE+"/"+TABLE+"?returnFieldsByFieldId=true&pageSize=100";
  let recs=[],offset=null,guard=0;
  do{
    const u=base+(offset?("&offset="+encodeURIComponent(offset)):"");
    const r=await fetch(u,{headers:{Authorization:"Bearer "+token}});
    if(!r.ok){const t=await r.text().catch(()=>""); const e=new Error("airtable "+r.status+" "+t); e.status=r.status; throw e;}
    const j=await r.json();
    recs=recs.concat(j.records||[]);
    offset=j.offset;
  }while(offset && ++guard<40);
  return recs;
}

function recompute(recs){
  const total=recs.length; const clients=[];
  for(const rec of recs){
    const f=rec.fields||{};
    const rev=+f[F.rev]||0; if(rev<=0) continue;            // "actif" = a commande
    const name=f[F.name]||"(sans nom)";
    const orders=+f[F.ord]||0;
    const trend=f[F.trend];
    const cat=firstCat(f[F.cat])||"\u2014";
    const g=geocode(name), h=hash(name);
    const jlat=((h%100)/100-0.5)*0.16, jlng=(((Math.floor(h/100))%100)/100-0.5)*0.22;
    const t=(trend>0)?"up":((trend===-1)?"dn":"flat");
    clients.push({n:name,rev:Math.round(rev),o:orders,t:t,cat:cat,
      lat:+(g[0]+jlat).toFixed(3),lng:+(g[1]+jlng).toFixed(3),cc:g[2],city:g[3],
      online:!!ONLINE[name]});
  }
  const totRev=clients.reduce((a,c)=>a+c.rev,0);
  const ccset={}; clients.forEach(c=>{if(!c.online)ccset[c.cc]=1;});
  const growing=clients.filter(c=>c.t==="up").length;
  const atRisk=clients.filter(c=>c.t==="dn").length;
  const cy={}; clients.forEach(c=>{if(c.online)return;(cy[c.city]=cy[c.city]||{rev:0,n:0});cy[c.city].rev+=c.rev;cy[c.city].n++;});
  const topcities=Object.keys(cy).map(k=>[k,cy[k].rev,cy[k].n]).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return {clients,
    kpi:{liveAccounts:clients.length,totalCRM:total,leads:total-clients.length,
         countries:Object.keys(ccset).length,growing,atRisk,
         totRev:Math.round(totRev),topCity:(topcities[0]?topcities[0][0]:"\u2014")},
    topcities,
    updatedAt:new Date().toISOString()};
}

exports.handler = async () => {
  const CORS={"content-type":"application/json","access-control-allow-origin":"*","cache-control":"public, max-age=300"};
  try{
    const token=process.env.AIRTABLE_PAT;
    if(!token) return {statusCode:500, headers:CORS, body:JSON.stringify({error:"AIRTABLE_PAT manquant dans les variables d'environnement Netlify"})};
    const recs=await fetchAll(token);
    return {statusCode:200, headers:CORS, body:JSON.stringify(recompute(recs))};
  }catch(e){
    return {statusCode:(e.status||500), headers:CORS, body:JSON.stringify({error:String(e.message||e)})};
  }
};