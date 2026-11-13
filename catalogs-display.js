(() => {
  const core=globalThis.JournalScoutCatalogs;
  let match=()=>[];
  function load() {
    try {match=core.createIndex(JSON.parse(localStorage.getItem('journal-scout-catalogs-v1')||'[]'));} catch {match=()=>[];}
  }
  load();
  window.JournalScoutCustomBadges=row=>core.badges(match(row)).map(b=>({...b,className:'tag--hq'}));
  window.addEventListener('storage',event=>{if(event.key==='journal-scout-catalogs-v1') {load();window.dispatchEvent(new Event('journal-scout:catalogs-changed'));}});
})();
