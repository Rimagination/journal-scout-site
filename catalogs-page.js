(() => {
  const core=globalThis.JournalScoutCatalogs;
  const ONLINE=document.body.dataset.onlineCatalogs==='true';
  const API=location.hostname==='localhost' || location.hostname==='127.0.0.1' ? (globalThis.JOURNAL_SCOUT_API_BASE || 'https://www.scansci.com/api') : 'https://www.scansci.com/api';
  const STORE='journal-scout-catalogs-v1';
  const $=id=>document.getElementById(id);
  const make=(tag,value='',className='')=>{ const n=document.createElement(tag); n.textContent=value; if(className) n.className=className; return n; };
  const errors={unauthorized:'请先登录 ScanSci，再重新检查目录。',forbidden:'当前账号没有此操作权限。',catalog_exists:'相同机构、名称和范围的目录已存在，请联系原上传者更新。',submission_limit:'待审核目录已达3份或今天提交较多，请等待审核。',not_pending:'这份目录已处理，请刷新列表。',not_found:'暂未找到这份目录。'};
  let selected=[], items=[], nextOffset=null, searchSerial=0, draft=null, previewSerial=0, loggedIn=false, admin=false, accountLoaded=false, connected=false;
  try { const saved=JSON.parse(localStorage.getItem(STORE)||'[]'); selected=saved.map(core.pack).slice(0,10); } catch { selected=[]; }
  async function api(path, options={}) {
    if(!ONLINE)throw new Error('在线目录服务尚未开放。');
    const privateRequest=options.private===true; const init={...options}; delete init.private;
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),20000);
    try {
      const r=await fetch(API+'/journal-catalogs'+path,{...init,signal:controller.signal,credentials:privateRequest ? 'include' : 'omit',headers:options.body ? {'Content-Type':'application/json'} : {}});
      const result=await r.json();
      if(!r.ok || !result.ok) throw new Error(!privateRequest && [401,403,404].includes(r.status) ? '在线插件目录暂未开放。学校资料可直接下载，也可以制作并导入本地目录包。' : result.message || errors[result.error] || (r.status>=500 ? '目录服务暂不可用，请稍后重试。' : '请求未成功，请稍后重试。'));
      return result;
    } finally { clearTimeout(timer); }
  }
  function save() { localStorage.setItem(STORE,JSON.stringify(selected)); updateCount(); }
  function updateCount() { $('selectedCount').textContent=`已启用 ${selected.length} 个`; }
  function notifyPlugin() {
    window.postMessage({type:'journal-scout:catalogs:set',packs:selected},location.origin);
  }
  window.addEventListener('message',event=>{
    if(event.source!==window || event.origin!==location.origin) return;
    if(event.data?.type==='journal-scout:catalogs:ready') {
      connected=true; $('pluginStatus').textContent='浏览器插件已连接；勾选后会立即应用到插件。';
      // On connection the plugin is authoritative, preventing an old website tab
      // from silently overwriting a newer selection made in extension settings.
      try { selected=event.data.packs.map(core.pack); save(); render(); } catch { /* Keep website selection on an invalid response. */ }
    }
    if(event.data?.type==='journal-scout:catalogs:saved') $('pluginStatus').textContent=event.data.error || '已应用到浏览器插件；已打开的论文标签会随之更新。';
  });
  window.postMessage({type:'journal-scout:catalogs:hello'},location.origin);
  function render() {
    const list=$('catalogList'); list.replaceChildren();
    for(const item of items) {
      const card=make('article','','catalog-card'), head=make('div','','catalog-card-head'), label=make('label'), input=make('input');
      input.type='checkbox'; input.checked=selected.some(p=>p.id===item.id);
      const title=make('h2',item.name); label.append(input,title); head.append(label); card.append(head);
      card.append(make('p',`${item.edition} · ${item.count} 项`,'catalog-subtle'),make('p',item.scope));
      card.append(make('span',`${item.label} 原始等级`,'catalog-grade-sample'));
      const details=make('details'); details.append(make('summary','来源与使用说明'));
      details.append(make('p','由用户提交并经平台审核；具体认定条件以原文件为准。'));
      if(item.effectiveDate) details.append(make('p','生效日期：'+item.effectiveDate));
      if(item.notes) details.append(make('p',item.notes));
      if(item.sourceUrl) { const a=make('a','查看来源 ↗'); a.href=item.sourceUrl; a.target='_blank'; a.rel='noopener noreferrer'; details.append(a); }
      const download=make('button','下载目录包 ↓','catalog-button'); download.type='button'; download.addEventListener('click',async()=>{
        download.disabled=true;
        try { const result=await api(`/${item.id}/versions/${item.version}`); downloadJson(core.pack(result.pack),`${item.label}-${item.edition}.json`); }
        catch(e) { $('catalogStatus').textContent=e.message; } finally { download.disabled=false; }
      });
      const p=make('p'); p.append(download); card.append(p,details); list.append(card);
      input.addEventListener('change',async()=>{
        input.disabled=true;
        const previous=selected;
        try {
          if(input.checked) {
            if(selected.length>=10) throw new Error('最多同时启用10个目录，请先取消一项。');
            const result=await api(`/${item.id}/versions/${item.version}`); const pack=core.pack(result.pack);
            selected=[...selected.filter(p=>p.id!==item.id),pack];
          } else selected=selected.filter(p=>p.id!==item.id);
          if(JSON.stringify(selected).length>2000000) throw new Error('已选目录合计过大，请先减少启用的目录。');
          save(); notifyPlugin(); $('catalogStatus').textContent='已保存选择，目录在本机匹配。';
        } catch(e) { selected=previous; updateCount(); $('catalogStatus').textContent=e.name==='QuotaExceededError' ? '本机存储空间不足，请减少启用的目录。' : e.message; input.checked=selected.some(p=>p.id===item.id); }
        finally { input.disabled=false; }
      });
    }
    if(!items.length) list.append(make('p','暂无符合条件的公开目录。你可以上传一份，审核通过后在这里使用。','catalog-empty'));
    $('moreCatalogs').hidden=nextOffset===null;
  }
  async function load(more=false) {
    const serial=++searchSerial; $('catalogStatus').textContent='正在读取目录…'; $('moreCatalogs').disabled=true;
    try {
      const q=$('catalogSearch').value.trim(); const result=await api(`?q=${encodeURIComponent(q)}&offset=${more ? nextOffset||0 : 0}`);
      if(serial!==searchSerial) return;
      items=more ? [...items,...result.catalogs] : result.catalogs; nextOffset=result.nextOffset; render();
      $('catalogStatus').textContent=items.length ? `${items.length} 份目录${nextOffset!==null ? '，还可加载更多' : ''}` : '';
    } catch(e) { if(serial===searchSerial) { $('catalogStatus').textContent=e.message; if(!more) { items=[]; nextOffset=null; $('catalogList').replaceChildren(); } } }
    finally { if(serial===searchSerial) $('moreCatalogs').disabled=false; }
  }
  $('searchCatalogs').addEventListener('click',()=>{if(ONLINE)void load();});
  $('catalogSearch').addEventListener('keydown',e=>{if(e.key==='Enter') {e.preventDefault(); if(ONLINE)void load();}});
  $('moreCatalogs').addEventListener('click',()=>load(true));
  async function account() {
    $('accountStatus').textContent='正在读取登录状态…';
    try {
      const result=await api('/account',{private:true}); loggedIn=true; admin=result.admin; accountLoaded=true;
      $('accountStatus').textContent=`已登录 ScanSci。${result.submissions.length ? '最近提交：'+result.submissions.slice(0,3).map(x=>`${x.name}（${{pending:'待审核',published:'已发布',rejected:'未通过'}[x.status]}${x.reviewNote ? '：'+x.reviewNote : ''}）`).join('；') : '目录审核通过后公开提供使用。'}`;
      if(admin) { $('reviewSection').hidden=false; await loadReview(); }
    } catch(e) {
      loggedIn=false; accountLoaded=true; $('accountStatus').textContent=e.message+' ';
      const a=make('a','前往 ScanSci 登录 ↗'); a.href='https://www.scansci.com/'; a.target='_blank'; a.rel='noopener';
      const retry=make('button','我已登录','catalog-button'); retry.type='button'; retry.addEventListener('click',account); $('accountStatus').append(a,document.createTextNode(' '),retry);
    }
    $('submitCatalog').disabled=!draft || !loggedIn;
  }
  $('openUpload').addEventListener('click',()=>{ $('uploadSection').hidden=false; $('uploadSection').scrollIntoView({behavior:'smooth',block:'start'}); if(ONLINE&&!accountLoaded) void account(); });
  $('closeUpload').addEventListener('click',()=>{$('uploadSection').hidden=true; $('openUpload').focus();});
  function invalidate() { draft=null; previewSerial++; $('submitCatalog').disabled=true; $('downloadLocalCatalog').disabled=true; $('uploadStatus').textContent='修改后请重新检查预览。'; }
  $('uploadForm').addEventListener('input',invalidate); $('catalogFile').addEventListener('change',invalidate);
  let xlsxPromise;
  function xlsxLibrary() {
    if(!xlsxPromise) xlsxPromise=new Promise((resolve,reject)=>{const script=document.createElement('script'); script.src='./assets/vendor/xlsx-0.20.3.min.js'; script.onload=()=>resolve(globalThis.XLSX); script.onerror=()=>{xlsxPromise=null;reject(new Error('Excel 读取组件未能加载，请重试或改用 CSV。'));}; document.head.append(script);});
    return xlsxPromise;
  }
  function checkZip(buffer) {
    const d=new DataView(buffer); let end=-1;
    for(let p=d.byteLength-22;p>=Math.max(0,d.byteLength-65557);p--) if(d.getUint32(p,true)===0x06054b50){end=p;break;}
    if(end<0) throw new Error('Excel 文件结构不正确');
    const count=d.getUint16(end+10,true), size=d.getUint32(end+12,true), start=d.getUint32(end+16,true);
    if(count>1000 || start+size>end) throw new Error('Excel 文件结构超出支持范围');
    let total=0,p=start;
    for(let n=0;n<count;n++) { if(p+46>end || d.getUint32(p,true)!==0x02014b50) throw new Error('Excel 目录损坏'); total+=d.getUint32(p+24,true); p+=46+d.getUint16(p+28,true)+d.getUint16(p+30,true)+d.getUint16(p+32,true); }
    if(total>16*1024*1024) throw new Error('Excel 解压后过大，请只保留目录表格。');
  }
  function previewTable(entries,issues=[]) {
    const wrap=$('uploadPreview'); wrap.hidden=false; wrap.replaceChildren();
    if(issues.length) { const list=make('ul','','catalog-errors'); for(const error of issues.slice(0,30)) list.append(make('li',`第${error.row}行：${error.message}`)); wrap.append(list); }
    const table=make('table'), head=make('thead'), header=make('tr'); for(const name of ['名称','原始等级','类型','标识','适用范围']) header.append(make('th',name)); head.append(header); table.append(head);
    const tbody=make('tbody'); for(const row of entries.slice(0,40)) {const tr=make('tr'); for(const cell of [row.name,row.grade,row.type==='conference'?'会议':'期刊',[row.issn,row.eissn].filter(Boolean).join(' / ')||'按名称匹配',row.scope||$('uploadForm').elements.scope.value]) tr.append(make('td',cell)); tbody.append(tr); } table.append(tbody); wrap.append(table);
    wrap.append(make('p',`预览前${Math.min(40,entries.length)}行。格式检查通过不等于已确认所有刊物身份，发布前还需核对来源。`,'catalog-subtle'));
  }
  $('previewCatalog').addEventListener('click',async()=>{
    const form=$('uploadForm'); if(!form.reportValidity()) return;
    const serial=++previewSerial; draft=null; $('submitCatalog').disabled=true; $('downloadLocalCatalog').disabled=true; $('previewCatalog').disabled=true; $('uploadStatus').textContent='正在本机读取文件…';
    try {
      const metadata=core.metadata(Object.fromEntries(new FormData(form))); const file=$('catalogFile').files[0];
      if(!file || file.size>1024*1024 || !/\.(xlsx|csv)$/i.test(file.name)) throw new Error('请选择不超过1MB的 .xlsx 或 UTF-8 CSV 文件。');
      const buffer=await file.arrayBuffer(); let table;
      if(/\.csv$/i.test(file.name)) {let value; try {value=new TextDecoder('utf-8',{fatal:true}).decode(buffer);} catch {throw new Error('CSV 请保存为 UTF-8 编码。');} table=core.parseCsv(value);}
      else {
        checkZip(buffer); const xlsx=await xlsxLibrary(); const book=xlsx.read(buffer,{type:'array',sheetRows:5002,cellFormula:true,cellHTML:false});
        const sheet=book.Sheets['目录'] || book.Sheets[book.SheetNames[0]];
        if(!sheet || sheet['!merges']?.length) throw new Error('请取消合并单元格，每行填写一个条目。');
        const range=xlsx.utils.decode_range(sheet['!fullref']||sheet['!ref']||'A1');
        if(range.e.c>30 || range.e.r>5000) throw new Error('目录最多5000行、31列，请删除多余的行列。');
        if(Object.entries(sheet).some(([name,value])=>!name.startsWith('!') && value?.f)) throw new Error('表格含公式，请粘贴为纯文本后上传。');
        table=xlsx.utils.sheet_to_json(sheet,{header:1,raw:false,defval:'',blankrows:true});
      }
      const checked=core.fromTable(table);
      if(checked.unknown.length) checked.errors.push({row:1,message:'未识别的列：'+checked.unknown.join('、')+'。请改用模板列名或删除这些列。'});
      if(serial!==previewSerial) return;
      previewTable(checked.entries,checked.errors);
      if(checked.errors.length) throw new Error(`发现${checked.errors.length}处问题，请修改后重新预览。`);
      if(new TextEncoder().encode(JSON.stringify(checked.entries)).length>900000) throw new Error('标准化目录超过900KB，请按适用范围分开上传。');
      let binary=''; const bytes=new Uint8Array(buffer); for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      draft={metadata,entries:checked.entries,source:{name:file.name,base64:btoa(binary)}};
      $('downloadLocalCatalog').disabled=false;
      $('uploadStatus').textContent=`${checked.entries.length}行格式检查通过，原始等级已保留。`;
      $('submitCatalog').disabled=!loggedIn;
    } catch(e) { if(serial===previewSerial) $('uploadStatus').textContent=e.message; }
    finally { $('previewCatalog').disabled=false; }
  });
  $('downloadLocalCatalog').addEventListener('click',async()=>{
    if(!draft)return;
    const current=draft;$('downloadLocalCatalog').disabled=true;
    try {
      const pack=await core.localPackage(current.metadata,current.entries);
      if(draft!==current)return;
      downloadJson(pack,`${pack.label}-${pack.edition}.journal-scout.json`);
      $('uploadStatus').textContent='目录包已生成。在浏览器插件或 Zotero 的“高校与自定义目录”设置中导入即可，无需上传。';
    }catch(error){$('uploadStatus').textContent=error.message;}
    finally{$('downloadLocalCatalog').disabled=!draft;}
  });
  $('uploadForm').addEventListener('submit',async e=>{
    e.preventDefault(); if(!draft || !loggedIn) return;
    $('submitCatalog').disabled=true; $('previewCatalog').disabled=true; $('uploadStatus').textContent='正在提交原文件与目录…';
    try { await api('',{method:'POST',private:true,body:JSON.stringify(draft)}); draft=null; $('downloadLocalCatalog').disabled=true; $('uploadStatus').textContent='提交成功，审核通过后会出现在统一目录中。'; await account(); }
    catch(error) { $('uploadStatus').textContent=error.message; $('submitCatalog').disabled=!draft; }
    finally { $('previewCatalog').disabled=false; }
  });
  function downloadJson(data,name) { const url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'})); const a=make('a'); a.href=url; a.download=name.replace(/[\\/:*?"<>|]/g,'-'); a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  async function loadReview() {
    const list=$('reviewList'); list.textContent='正在读取…';
    try {
      const result=await api('/review',{private:true}); list.replaceChildren();
      if(!result.submissions.length) list.textContent='当前没有待审核目录。';
      for(const item of result.submissions) {
        const row=make('article','','catalog-review-row'); row.append(make('strong',`${item.name} · ${item.edition} · ${item.count}项`),make('p',item.scope));
        const actions=make('div','','catalog-review-actions');
        const preview=make('button','核对名单','catalog-button'); preview.type='button'; preview.addEventListener('click',async()=>{try {const r=await api(`/review/${item.version}/preview`,{private:true}); downloadJson(r.pack,`${item.name}-待审.json`);} catch(e){$('catalogStatus').textContent=e.message;}});
        const source=make('button','下载原文件','catalog-button'); source.type='button'; source.addEventListener('click',()=>{window.open(API+`/journal-catalogs/review/${item.version}/source`,'_blank','noopener');});
        const note=make('input'); note.placeholder='审核备注'; note.maxLength=500; note.setAttribute('aria-label','审核备注');
        actions.append(preview,source,note);
        for(const [action,label] of [['publish','通过并发布'],['reject','退回修改']]) {
          const button=make('button',label,'catalog-button'); button.type='button';
          button.addEventListener('click',async()=>{
            button.disabled=true;
            try {
              await api(`/review/${item.version}`,{method:'POST',private:true,body:JSON.stringify({action,note:note.value})});
              if(action==='publish') {
                items=[{...item,status:'published'},...items.filter(row=>row.id!==item.id)];render();
                $('catalogStatus').textContent='已发布。公开搜索缓存会在5分钟内更新。';
              }
              await loadReview();
            } catch(e) {$('catalogStatus').textContent=e.message;button.disabled=false;}
          }); actions.append(button);
        }
        row.append(actions); list.append(row);
      }
    } catch(e) {list.textContent=e.message;}
  }
  $('refreshReview').addEventListener('click',loadReview);
  window.addEventListener('storage',e=>{if(e.key===STORE) {try{selected=JSON.parse(e.newValue||'[]').map(core.pack);updateCount();render();}catch{}}});
  updateCount();
  $('selectedCount').hidden=!ONLINE;
  $('onlineCatalogs').hidden=!ONLINE;
  $('accountStatus').hidden=!ONLINE;
  $('submitCatalog').hidden=!ONLINE;
  if(ONLINE)void load();
})();
