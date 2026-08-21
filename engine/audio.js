/* Workbench — synthesised chimes — no audio assets to ship
   Part of a static, offline-capable learning app. No tracking, no accounts. */

/* --- sound: synthesised so the file stays standalone, no assets --- */
let AC=null, sfxOn=true;
export const getSfx=()=>sfxOn;
export const setSfx=v=>{sfxOn=v;};
export function audioWake(){
  try{
    if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
  }catch(e){ AC=null; }
}
export function tone(freq,delay,dur,type,vol,glide){
  if(!AC||!sfxOn) return;
  const t0=AC.currentTime+delay;
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t0);
  if(glide) o.frequency.exponentialRampToValueAtTime(glide,t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol,t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g); g.connect(AC.destination);
  o.start(t0); o.stop(t0+dur+0.03);
}
/* gold: a bright two-note lift */
export function sfxGold(){
  tone(1046.5,0,   .20,"triangle",.20);      // C6
  tone(1567.98,.07,.26,"triangle",.17);      // G6
}
/* blue: a fuller four-note arpeggio with a bell tail — clearly the better prize */
export function sfxBlue(){
  [1046.5,1318.51,1567.98,2093].forEach((f,i)=>tone(f,i*.055,.30,"triangle",.17));
  tone(2093,.24,.55,"sine",.10);
  tone(3136,.26,.45,"sine",.05);
}
/* wrong: a short detuned buzz that slides down */
export function sfxWrong(){
  tone(196,0,.20,"sawtooth",.15,104);
  tone(207,0,.20,"square",  .09,110);
}

/* Shape timings are written as the Hard values; Normal multiplies by tm (1.5),
   so a shape shows for 3.0s on Normal and 2.0s on Hard, fading over the last
   quarter of that either way. */
