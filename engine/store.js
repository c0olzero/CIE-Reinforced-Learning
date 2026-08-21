/* Workbench — local persistence: high scores and difficulty only
   Part of a static, offline-capable learning app. No tracking, no accounts. */

/* Everything here stays on the device. localStorage is used rather than cookies:
   a cookie would be attached to every request, which is worse for privacy and
   pointless for a static site. Falls back to memory if storage is blocked. */
const mem={};
export function bestScore(k){ try{ return +localStorage.getItem("wb_"+k)||0; }catch(e){ return mem[k]||0; } }
export function saveBest(k,v){ try{ localStorage.setItem("wb_"+k,v); }catch(e){ mem[k]=v; } }
export function loadDiff(){ try{ return localStorage.getItem("wb_diff")||"normal"; }catch(e){ return mem.diff||"normal"; } }
export function saveDiff(v){ try{ localStorage.setItem("wb_diff",v); }catch(e){ mem.diff=v; } }
