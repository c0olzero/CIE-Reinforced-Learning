/* Workbench — shared screen furniture: HUD, celebration overlay
   Part of a static, offline-capable learning app. No tracking, no accounts. */

import {h, rand, pending} from "./dom.js";
import {t, getLang} from "./i18n.js";

const WORDS={
  en:{ok:["CONGRATULATIONS","AMAZING","YAY!","BRILLIANT","WELL DONE","NICE ONE","SUPERB",
          "YOU GOT IT","FANTASTIC","WOOHOO!","CLEVER!","PERFECT!","SUPERSTAR","BOOM!"],
      bad:["ALMOST!","SO CLOSE","NICE TRY","NEARLY!","GOOD THINKING","KEEP GOING",
           "NOT QUITE YET","ONE MORE GO"]},
  vi:{ok:["TUYỆT VỜI","GIỎI QUÁ","HOAN HÔ","XUẤT SẮC","CHÍNH XÁC","QUÁ ĐỈNH","LÀM TỐT LẮM",
          "SIÊU LUÔN","HAY QUÁ","TUYỆT CÚ MÈO","CHUẨN LUÔN"],
      bad:["SUÝT RỒI","GẦN ĐÚNG","THỬ LẠI NHÉ","SẮP ĐƯỢC RỒI","CỐ LÊN","NGHĨ HAY LẮM",
           "CHƯA ĐÚNG THÔI"]}
};

/* Dimmed celebration over the stage: a big colourful word, the explanation,
   and a Next button that drains over 8s. */
export function celebrate(stage,ok,text,onNext,nextLabel,extra){
  const dim=h("div","dim "+(ok?"ok":"bad"));
  const box=h("div","dimbox");

  const word=h("div","word");
  const wordText=rand(WORDS[getLang()][ok?"ok":"bad"]);
  const n=[...wordText].length;                   // size to fit: CONGRATULATIONS is 15 wide
  word.style.fontSize="clamp(26px,"+Math.min(7.4,112/n).toFixed(2)+"vw,"
                     +Math.min(ok?74:52,880/n).toFixed(0)+"px)";
  [...wordText].forEach((ch,i)=>{
    const sp=h("span",null,ch===" "?"\u00A0":ch);
    sp.style.animationDelay=(i*38)+"ms";
    if(ok){
      sp.style.color="var(--c"+(i%6)+")";
      sp.style.setProperty("--rot",(Math.random()*30-15).toFixed(1)+"deg");
    }
    word.appendChild(sp);
  });
  box.appendChild(word);
  // wrapped, not stamped directly onto extra: extra's own display type
  // (block, inline, svg...) varies by caller, and text-align:center on
  // .dimbox only ever centers inline content — a flex wrapper centers
  // the proof regardless of what kind of element it turns out to be
  if(extra){
    const extraWrap=h("div","dim-extra");
    extraWrap.appendChild(extra);
    box.appendChild(extraWrap);
  }   // proof, not just words
  // usually a plain sentence, but a caller can pass a built DOM node instead
  // (e.g. a real stacked fraction glyph inline, not text like "3/19")
  box.appendChild(text instanceof Node ? text : h("p","dimtext",text));

  const btn=h("button","nextbtn");
  const bar=h("span","nextbar"), lab=h("span","nextlab",nextLabel), num=h("span","nextnum","8");
  lab.appendChild(num); btn.append(bar,lab); box.appendChild(btn);
  dim.appendChild(box); stage.appendChild(dim);

  const MS=8000;
  let elapsed=0, last=performance.now(), raf=0, done=false;
  const cancel=()=>{ done=true; cancelAnimationFrame(raf); };
  const fire=()=>{
    if(done) return;
    cancel();
    const k=pending.indexOf(cancel); if(k>=0) pending.splice(k,1);
    dim.remove(); onNext();
  };
  const tick=now=>{
    elapsed+=now-last; last=now;
    const k=Math.min(1,elapsed/MS);
    bar.style.transform="scaleX("+(1-k)+")";
    num.textContent=Math.max(0,Math.ceil((MS-elapsed)/1000));
    if(k>=1){ fire(); return; }
    raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  btn.onclick=e=>{ e.stopPropagation(); fire(); };
  pending.push(cancel);
  return dim;
}

/* ---- screen furniture shared by every game ---- */
export function hudScore(stage){
  const el=h("div","hud-score"), out={s:0,b:0,n:0};
  ["streak","best","solved"].forEach(k=>{
    const d=h("div"), b=h("b","0");
    d.append(b,h("span",null,t(k))); el.appendChild(d); out[k+"El"]=b;
  });
  stage.appendChild(el);
  out.hit=ok=>{
    if(ok){out.s++;out.n++;out.b=Math.max(out.b,out.s);} else out.s=0;
    out.streakEl.textContent=out.s; out.bestEl.textContent=out.b; out.solvedEl.textContent=out.n;
  };
  return out;
}
/* question pinned to the top left */
export function hudQuestion(stage,text){
  const q=h("div","hud-q",text); stage.appendChild(q); return q;
}
export function hudActions(stage){
  const a=h("div","hud-act"); stage.appendChild(a); return a;
}

/* the fraction quizzes use the full-bleed HUD but no 3D stage */
export function foldlessHud(stage){ stage.classList.add("pickmode"); }

/* ---------- go ---------- */
