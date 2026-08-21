/* Bundle the module graph, run it in a headless DOM, open every tab.
   Requires: npm i -D esbuild jsdom      Usage: node verify.js */
const {execSync}=require("child_process"), fs=require("fs"), path=require("path");
execSync("npx esbuild engine/main.js --bundle --format=iife --outfile=/tmp/wb.js --log-level=warning",{stdio:"inherit"});
const css=["base","games","responsive"].map(f=>fs.readFileSync(`styles/${f}.css`,"utf8")).join("\n");
let html=fs.readFileSync("index.html","utf8")
  .replace(/<link rel="stylesheet"[^>]*>/g,"")
  .replace(/<script type="module"[^>]*><\/script>/,"")
  .replace(/<script>\s*if\("serviceWorker"[\s\S]*?<\/script>/,"")
  .replace("</head>",`<style>${css}</style></head>`)
  .replace("</body>",`<script>${fs.readFileSync("/tmp/wb.js","utf8")}</script></body>`);
const {JSDOM}=require("jsdom"); const errs=[];
const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,beforeParse(w){
  w.ResizeObserver=class{observe(){}disconnect(){}unobserve(){}};
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
  Object.defineProperty(w.Element.prototype,"clientWidth",{get:()=>1200});
  Object.defineProperty(w.Element.prototype,"clientHeight",{get:()=>560});
  w.Element.prototype.getBoundingClientRect=()=>({width:1200,height:560,left:0,top:0,right:1200,bottom:560,x:0,y:0});
  w.Element.prototype.setPointerCapture=()=>{};
  w.AudioContext=class{constructor(){this.state="running";this.currentTime=0;this.destination={};}resume(){}
    createOscillator(){return{type:"",frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}};}
    createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}};
  w.onerror=m=>errs.push(String(m));
  w.console.error=(...a)=>errs.push(a.join(" "));
}});
const w=dom.window,d=w.document;
const click=e=>{ if(e) e.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await sleep(700); let n=0;
  const live=d.querySelectorAll(".card:not(.soon)").length;
  for(let m=0;m<live;m++){
    click(d.querySelector("#backBtn")); await sleep(60);
    click([...d.querySelectorAll(".card:not(.soon)")][m]); await sleep(500);
    const tabs=[...d.querySelectorAll(".tab")];
    if(!tabs.length){ errs.push("module "+m+" did not load"); continue; }
    for(let i=0;i<tabs.length;i++){
      click([...d.querySelectorAll(".tab")][i]); await sleep(120);
      for(const b of [...d.querySelectorAll(".abtn,.btn,.thumb,.shape,.diffbtn")].slice(0,5)) click(b);
      await sleep(60); n++;
    }
  }
  console.log(`\n${n} tabs across ${live} modules — ${errs.length} error(s)`);
  errs.slice(0,10).forEach(e=>console.log("  *",e));
  process.exit(errs.length?1:0);
})();
