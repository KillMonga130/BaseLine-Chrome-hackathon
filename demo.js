// Small demo logic: parse CSS-like input and check against embedded exceptions and webstatus sample.
(async function(){
  const resultsEl = document.getElementById('results');
  const cssInput = document.getElementById('cssInput');
  const runBtn = document.getElementById('run');

  // Load local data files from repo (we'll fetch the JSON files placed alongside docs)
  async function loadJSON(url){
    try{ const r = await fetch(url); if(!r.ok) throw new Error(r.status); return await r.json(); }catch(e){ return null; }
  }

  const exceptions = await loadJSON('../data/exceptions.json');
  const webstatus = await loadJSON('../data/webstatus-cache.json');

  function check(css){
    const declRe = /([a-zA-Z-]+)\s*:\s*([^;\n}]+)\s*;/g;
    let m;
    const out = [];
    while((m = declRe.exec(css)) !== null){
      const prop = m[1].trim();
      const value = m[2].trim();
      const key = `css.properties.${prop}.${value}`;
      if (exceptions && exceptions[key]){
        out.push(`${prop}: ${value} — NOT BASELINE (exception): ${exceptions[key].reason}`);
        continue;
      }
      // naive feature-level webstatus lookup
      if (webstatus){
        for(const q of Object.keys(webstatus||{})){
          const data = webstatus[q];
          if(!data || !data.data) continue;
          for(const feat of data.data){
            if(feat.feature_id && feat.feature_id.indexOf(prop)!==-1){
              if(feat.baseline && feat.baseline.status === 'limited'){
                out.push(`${prop}: ${value} — NOT BASELINE (webstatus:${feat.feature_id})`);
              }
            }
          }
        }
      }
    }
    if(out.length===0) return '(no problems found)';
    return out.join('\n');
  }

  runBtn.addEventListener('click', ()=>{
    const css = cssInput.value;
    resultsEl.textContent = 'Checking...';
    setTimeout(()=>{ resultsEl.textContent = check(css); }, 200);
  });
})();
