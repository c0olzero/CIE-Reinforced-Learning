/* Workbench — shared arcade shell: clock, score, combo, difficulty, title and end screens */

import {h, pending} from "./dom.js";
import {t} from "./i18n.js";
import {bestScore, saveBest, loadDiff, saveDiff} from "./store.js";
import {getSfx, setSfx, audioWake} from "./audio.js";

export const ARC_LIFE=2000;   // how long a shape stays on screen (Hard; Normal multiplies by tm)
export const ARC_FADE=1500;   // when it starts fading out

/* ---- shared shell: clock, score, best, combo, title and end screens ----

   Every duration in both arcades is expressed as a base value times `tm`,
   so difficulty is one number. Hard is the original pacing (tm 1); Normal
   stretches everything by 1.5. Tweak TM_NORMAL and nothing else drifts.     */
export const TM_HARD=1, TM_NORMAL=1.5;

export function arcadeShell(stage,cfg){
  stage.classList.add("arcade");
  const top=h("div","arc-top");
  const elClock=h("div","arc-clock","30.00s");
  top.appendChild(elClock);
  if(cfg.topExtra) top.appendChild(cfg.topExtra);   // e.g. the angle game's target
  stage.appendChild(top);
  const hud=h("div","hud-score");
  const mk=lab=>{ const d=h("div"), b=h("b","0"); d.append(b,h("span",null,t(lab))); hud.appendChild(d); return b; };
  const elScore=mk("scoreL"), elBest=mk("bestL");
  stage.appendChild(hud);
  const bar=h("div","arc-bar"); bar.style.width="100%"; stage.appendChild(bar);
  const mute=h("button","arc-mute",getSfx()?"🔊":"🔇");
  mute.onclick=()=>{ setSfx(!getSfx()); mute.textContent=getSfx()?"🔊":"🔇"; };
  stage.appendChild(mute);
  const comboPos=cfg.comboPos||"tl";
  const comboEl=h("div","combo "+comboPos); stage.appendChild(comboEl);

  let diff=loadDiff();
  let tm=diff==="hard"?TM_HARD:TM_NORMAL;
  const bestKey=()=>cfg.key+"_"+diff;
  let best=bestScore(bestKey()); elBest.textContent=best;

  let running=false, raf=0, last=0, score=0, timeLeft=0, total=0, played=0;
  let combo=0, mult=1;

  function paintCombo(bump){
    comboEl.className="combo "+comboPos+(bump?" bump":"");
    comboEl.innerHTML="";
    if(combo<2) return;                             // only shows from combo 2
    const txt=t("comboLbl")+" "+combo+": "+mult.toFixed(1)+"x";
    [...txt].forEach((ch,i)=>{
      const sp=h("span",null,ch===" "?"\u00A0":ch);
      sp.style.animationDelay=(i*18)+"ms";
      comboEl.appendChild(sp);
    });
  }
  function breakCombo(){
    if(combo>=2){                                   // let the old counter fall away
      const ghost=comboEl.cloneNode(true);
      ghost.className="combo "+comboPos+" broke";
      [...ghost.children].forEach((sp,i)=>{
        sp.style.animationDelay=(i*26)+"ms";
        sp.style.setProperty("--r",(Math.random()*70-35).toFixed(0)+"deg");
      });
      stage.appendChild(ghost);
      setTimeout(()=>ghost.remove(),1200);
    }
    combo=0; mult=1; paintCombo(false);
  }

  const api={
    stage:stage,
    get running(){ return running; },
    get played(){ return played; },
    get tm(){ return tm; },
    get hard(){ return diff==="hard"; },
    get mult(){ return mult; },
    /* a hit: extend the combo, scale the points, hand back the total to display */
    award(pts){
      combo++; mult=1+0.1*(combo-1);
      const totalPts=Math.round(pts*mult);
      score+=totalPts; elScore.textContent=score;
      paintCombo(true);
      return totalPts;
    },
    /* a miss: flat penalty, combo collapses */
    penalise(pts){
      score=Math.max(0,score-pts); elScore.textContent=score;
      breakCombo();
    },
    addTime(ms){ timeLeft+=ms; },
    pop(x,y,text,color){
      const el=h("div","arc-pop",text);
      el.style.left=x+"px"; el.style.top=y+"px"; el.style.color=color;
      stage.appendChild(el);
      setTimeout(()=>el.remove(),900);
    }
  };
  function stop(){ running=false; cancelAnimationFrame(raf); raf=0; }
  pending.push(()=>{ stop(); cfg.cleanup&&cfg.cleanup(); });

  function paint(){
    // pad from the ROUNDED string: 9.999 rounds to "10.00", and testing the raw
    // value first would prepend a zero and print 010.00s
    let cs=(Math.max(0,timeLeft)/1000).toFixed(2);
    if(cs.indexOf(".")===1) cs="0"+cs;
    elClock.textContent=cs+"s";
    const low=5000;
    elClock.classList.toggle("low",timeLeft<=low);
    bar.style.width=Math.min(100,timeLeft/total*100)+"%";
    bar.classList.toggle("low",timeLeft<=low);
  }
  function frame(now){
    if(!running) return;
    const dt=Math.min(120,now-last); last=now;
    played+=dt; timeLeft-=dt;
    if(timeLeft<=0){ timeLeft=0; paint(); return end(); }
    cfg.frame(dt,played,api);
    paint();
    raf=requestAnimationFrame(frame);
  }
  function screen(build){
    const dim=h("div","dim"); const box=h("div","dimbox");
    build(box,dim); dim.appendChild(box); stage.appendChild(dim);
    return dim;
  }
  function begin(){
    score=0; played=0; combo=0; mult=1; paintCombo(false);
    total=cfg.clockMs||30000; timeLeft=total;   // same 30s on Normal and Hard
    elScore.textContent="0"; paint();
    cfg.reset(api);
    running=true; last=performance.now();
    raf=requestAnimationFrame(frame);
  }
  function end(){
    stop();
    cfg.cleanup&&cfg.cleanup();
    combo=0; mult=1; paintCombo(false);
    const record=score>best;
    if(record){ best=score; saveBest(bestKey(),best); elBest.textContent=best; }
    screen((box,dim)=>{
      box.appendChild(h("div","arc-big",t("timeUp")));
      if(record) box.appendChild(h("div","arc-new",t("newBest")));
      box.appendChild(h("div","arc-final",String(score)));
      const sub=h("div","arc-sub");
      sub.append(h("div",null,t("playedFor")((played/1000).toFixed(1))),
                 h("div",null,t("finalBest")(best)));
      box.appendChild(sub);
      const row=h("div","dim-btns");
      const b=h("button","nextbtn",t("again"));
      b.onclick=()=>{ audioWake(); dim.remove(); begin(); };
      // swap difficulty and go straight into a run on the other setting
      const b2=h("button","nextbtn alt",t(diff==="hard"?"toNormal":"toHard"));
      b2.onclick=()=>{
        audioWake();
        diff = diff==="hard" ? "normal" : "hard";
        saveDiff(diff);
        tm = diff==="hard" ? TM_HARD : TM_NORMAL;
        best=bestScore(bestKey()); elBest.textContent=best;
        dim.remove(); begin();
      };
      row.append(b,b2);
      box.appendChild(row);
    });
  }
  screen((box,dim)=>{
    box.appendChild(h("div","arc-big",t("ready")));
    const howEl=h("p","arc-how",t(cfg.how));
    box.appendChild(howEl);
    // e.g. Symmetry Arcade's sweeper/revolver choice; refreshBest re-reads
    // the BEST stat for whatever key the game's mode change just switched to
    if(cfg.modePicker) cfg.modePicker(box,howEl,()=>{ best=bestScore(bestKey()); elBest.textContent=best; });
    box.appendChild(h("div","difflabel",t("diffPick")));
    const row=h("div","diffrow");
    [["normal","diffN"],["hard","diffH"]].forEach(([d,k])=>{
      const b=h("button","diffbtn",t(k));
      b.setAttribute("aria-pressed",d===diff);
      b.onclick=()=>{
        diff=d; saveDiff(d); tm=d==="hard"?TM_HARD:TM_NORMAL;
        best=bestScore(bestKey()); elBest.textContent=best;
        [...row.children].forEach((x,i)=>x.setAttribute("aria-pressed",i===(d==="normal"?0:1)));
      };
      row.appendChild(b);
    });
    box.appendChild(row);
    box.appendChild(h("div","diffnote",t(cfg.diffNote||"diffNote")));
    const rules=h("div","arc-rule");
    cfg.rules.forEach(([c,k])=>{
      const line=h("div"); const sw=h("i"); sw.style.background=c;
      line.append(sw,document.createTextNode(t(k))); rules.appendChild(line);
    });
    box.appendChild(rules);
    const b=h("button","nextbtn",t("start"));
    b.onclick=()=>{ audioWake(); dim.remove(); begin(); };
    box.appendChild(b);
  });
  return api;
}
