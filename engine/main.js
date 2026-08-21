/* Workbench — boot and routing. Modules are fetched on demand. */

import {h, stopPending} from "./dom.js";
import {t, getLang, setLang} from "./i18n.js";
import {CATALOGUE} from "./catalogue.js";

/* ---------- 6. routing + screens ---------- */
const main=document.getElementById("main");
const backBtn=document.getElementById("backBtn");
const langBtn=document.getElementById("langBtn");
let route={mod:null,game:null};
let loaded={};      // module id -> its games, once fetched

function render(){
  document.getElementById("brand").firstChild.textContent=t("brand");
  document.getElementById("tagline").textContent=t("tagline");
  langBtn.textContent=t("lang");
  backBtn.hidden=!route.mod;
  backBtn.querySelector("span").textContent=t("back");
  stopPending();
  main.innerHTML="";
  route.mod ? renderModule() : renderHub();
}
backBtn.onclick=()=>{route.mod=null;render();};
langBtn.onclick=()=>{ setLang(getLang()==="en"?"vi":"en"); render(); };

function renderHub(){
  const wrap=h("div","hub");
  const p=t("lede");
  const lede=h("h1","lede"); lede.append(p[0],h("em",null,p[1]),p[2]);
  wrap.append(lede,h("p","sub",t("sub")));
  const cards=h("div","cards");
  CATALOGUE.forEach((m,i)=>{
    const c=h("button","card"+(m.live?"":" soon"));
    if(m.live){
      const strip=h("div","strip");
      m.colors.forEach(n=>{const s=h("span");s.style.background="var(--c"+n+")";strip.appendChild(s);});
      c.appendChild(strip);
    }
    c.append(h("span","tag",m.live?String(i+1).padStart(2,"0"):t("soon")),
             h("h3",null,m.title[getLang()]),h("p",null,m.blurb[getLang()]));
    if(m.live) c.onclick=()=>{ route={mod:m.id,game:null}; render(); };
    else c.disabled=true;
    cards.appendChild(c);
  });
  wrap.appendChild(cards);
  main.appendChild(wrap);
}

async function renderModule(){
  const mod=CATALOGUE.find(m=>m.id===route.mod);
  if(!loaded[mod.id]){
    const busy=h("div","sub",t("loading")); main.appendChild(busy);
    try{ loaded[mod.id]=(await mod.load()).default; }
    catch(e){ console.error("module load failed:",e); busy.textContent=t("loadFail"); return; }
    busy.remove();
    if(route.mod!==mod.id) return;                 // navigated away while fetching
  }
  const games=loaded[mod.id].games;
  if(!route.game) route.game=games[0].id;
  const tabs=h("div","tabs");
  games.forEach(g=>{
    const b=h("button","tab"+(g.rainbow?" rainbow":""),t(g.name));
    b.setAttribute("role","tab");
    b.setAttribute("aria-selected",g.id===route.game);
    b.onclick=()=>{route.game=g.id;render();};
    tabs.appendChild(b);
  });
  main.appendChild(tabs);
  const lab=h("div","lab");
  const stage=h("div","stage");
  const side=h("div","side");
  lab.append(stage,side);
  main.appendChild(lab);
  const g=games.find(x=>x.id===route.game);
  if(g.full) lab.classList.add("full");
  g.render(side,stage);
}


render();
