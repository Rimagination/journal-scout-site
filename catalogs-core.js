/* Shared by the website, API and plugins. Keep the two distributed copies in sync. */
(() => {
  const MAX_ROWS = 5000;
  const key = value => String(value || '').normalize('NFKC').toLowerCase().replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  const text = (value, max = 500) => {
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error('字段过长或含无效字符');
    return value.trim();
  };
  const issn = value => String(value || '').replace(/[\s–—-]/g, '').toUpperCase();
  function validIssn(value) {
    const s = issn(value);
    return /^\d{7}[\dX]$/.test(s) && [...s].reduce((sum, c, i) => sum + (c === 'X' ? 10 : Number(c)) * (8-i), 0) % 11 === 0;
  }
  function identifier(value) {
    if (!value) return '';
    if (!validIssn(value)) throw new Error('ISSN / eISSN 格式或校验位不正确');
    const s = issn(value); return `${s.slice(0,4)}-${s.slice(4)}`;
  }
  function metadata(input) {
    if (!input || typeof input !== 'object') throw new Error('缺少目录资料');
    const result = {};
    for (const [field, limit] of Object.entries({ name:120, label:24, institution:120, edition:60, scope:300, sourceUrl:1500, effectiveDate:10, notes:3000 })) result[field] = text(input[field] ?? '', limit);
    if (!result.name || !result.label || !result.edition || !result.scope) throw new Error('请填写目录名称、标签名称、版本和适用范围');
    if (result.sourceUrl && !/^https?:\/\//i.test(result.sourceUrl)) throw new Error('来源网址需以 https:// 或 http:// 开头');
    if (result.sourceUrl) { const url = new URL(result.sourceUrl); if (url.username || url.password) throw new Error('来源网址不能包含账号密码'); }
    if (result.effectiveDate && (!/^\d{4}-\d{2}-\d{2}$/.test(result.effectiveDate) || new Date(result.effectiveDate).toISOString().slice(0,10) !== result.effectiveDate)) throw new Error('生效日期不正确');
    return result;
  }
  function entry(input) {
    if (!input || typeof input !== 'object') throw new Error('条目格式不正确');
    const row = {};
    for (const [field, limit] of Object.entries({ name:400, grade:60, abbreviation:80, scope:300, notes:1000, cn:40, subject:150, sourceLocation:150 })) row[field] = text(input[field] ?? '', limit);
    if (!row.name || !row.grade || !key(row.name)) throw new Error('名称和等级必填');
    if (/\.\.\.|…/.test(row.name)) throw new Error('名称不能使用省略号，请填写全称');
    row.type = input.type || 'journal';
    if (!['journal','conference'].includes(row.type)) throw new Error('类型只能是期刊或会议');
    row.issn = identifier(input.issn || ''); row.eissn = identifier(input.eissn || '');
    if (row.type === 'conference' && (row.issn || row.eissn || row.cn)) throw new Error('会议请用全称和简称；论文集 ISSN 不能作为会议标识');
    if (row.cn && !/^\d{2}-\d{4}(?:\/[A-Z][A-Z0-9]*)?$/i.test(row.cn)) throw new Error('CN号形态不正确，请核实是否误填了 ISSN');
    if (input.aliases != null && !Array.isArray(input.aliases)) throw new Error('别名格式不正确');
    if ((input.aliases?.length || 0) > 10) throw new Error('每条最多填写10个别名');
    row.aliases = [...new Set((input.aliases || []).map(s => text(s,400)).filter(Boolean))];
    return row;
  }
  function validateEntries(rows) {
    if (!Array.isArray(rows) || !rows.length || rows.length > MAX_ROWS) throw new Error(`目录需包含1–${MAX_ROWS}行`);
    const entries = [], errors = [], seen = new Map(), positions = [];
    rows.forEach((value, i) => {
      try {
        const row = entry(value);
        const identity = `${row.type}|${key(row.scope)}|${key(row.name)}`;
        const previous = seen.get(identity);
        if (previous) throw new Error(`与第${previous}行名称和适用范围重复，请合并或说明不同范围`);
        seen.set(identity, i+2); entries.push(row); positions.push(i+2);
      } catch (error) { errors.push({ row:i+2, message:error.message }); }
    });
    // Reject contradictory identifier/alias assignments within one scope, rather
    // than letting the order of rows decide which grade a user receives.
    const identities = new Map();
    entries.forEach((row, i) => {
      for (const token of [...[row.name,...row.aliases].map(n => `n:${key(n)}`), ...[row.issn,row.eissn].filter(Boolean).map(s=>`i:${issn(s)}`)]) {
        const identity = `${row.type}|${key(row.scope)}|${token}`;
        if (identities.has(identity) && identities.get(identity) !== i) errors.push({row:positions[i],message:'同一适用范围的名称、别名或 ISSN 与另一行冲突'});
        identities.set(identity,i);
      }
    });
    return { entries, errors };
  }
  function pack(value) {
    if (!value || value.schemaVersion !== 1 || !/^[a-f0-9]{24}$/.test(value.id || '') || !/^[a-f0-9]{32}$/.test(value.version || '')) throw new Error('目录包版本或标识不正确');
    const checked = validateEntries(value.entries);
    if (checked.errors.length) throw new Error(checked.errors[0].message);
    if (value.updateMode != null && !['manual','managed'].includes(value.updateMode)) throw new Error('目录更新方式不正确');
    return { schemaVersion:1, id:value.id, version:value.version, ...metadata(value), entries:checked.entries, ...(value.updateMode==='manual' ? {updateMode:'manual'} : {}) };
  }
  function importPackage(value) {
    if(typeof value!=='string' || value.length>1500000) throw new Error('请选择不超过1.5MB的 Journal Scout 目录包');
    let data;
    try {data=JSON.parse(value);} catch {throw new Error('目录包不是有效的 JSON 文件，请在资料库下载插件目录包');}
    // A downloaded file is a local snapshot. Its contents cannot opt the user
    // into remote subscriptions or turn every local catalog into a failed API check.
    return pack({...data,updateMode:'manual'});
  }
  function withPackage(current,value) {
    const next=[...current.filter(p=>p.id!==value.id),pack(value)];
    createIndex(next); return next;
  }
  async function localPackage(meta,rows) {
    const details=metadata(meta),checked=validateEntries(rows);
    if(checked.errors.length) throw new Error(checked.errors[0].message);
    const digest=async value=>[...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))].map(b=>b.toString(16).padStart(2,'0')).join('');
    const id=(await digest(['local-catalog',details.institution,details.name,details.scope])).slice(0,24);
    const version=(await digest([details,checked.entries])).slice(0,32);
    return pack({schemaVersion:1,id,version,...details,entries:checked.entries,updateMode:'manual'});
  }
  function parseCsv(input) {
    if (typeof input !== 'string' || input.length > 1500000) throw new Error('CSV 过大');
    input = input.replace(/^\ufeff/,'');
    const rows = []; let row=[], cell='', quoted=false, closed=false;
    for (let i=0; i<input.length; i++) {
      const c=input[i];
      if (quoted) {
        if (c==='"' && input[i+1]==='"') { cell+='"'; i++; }
        else if(c==='"') { quoted=false; closed=true; } else cell+=c;
      } else if(c==='"' && !cell && !closed) quoted=true;
      else if(c===',' || c==='\n' || c==='\r') {
        row.push(cell); cell=''; closed=false;
        if(c!==',') { rows.push(row); row=[]; if(c==='\r' && input[i+1]==='\n') i++; }
      } else { if(closed || c==='"') throw new Error('CSV 引号格式不正确'); cell+=c; }
      if(rows.length>MAX_ROWS+1) throw new Error('目录超过5000行');
    }
    if(quoted) throw new Error('CSV 引号未闭合');
    if(cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  const headers = { 名称:'name',期刊名称:'name',期刊全称:'name',会议名称:'name',刊名:'name',等级:'grade',级别:'grade',分级:'grade',期刊分类:'grade',刊物分类:'grade',类型:'type',ISSN:'issn',ISSN号:'issn',eISSN:'eissn',简称:'abbreviation',期刊简称:'abbreviation',会议简称:'abbreviation',适用范围:'scope',备注:'notes',CN号:'cn',别名:'aliases',学科:'subject',来源位置:'sourceLocation' };
  function fromTable(table) {
    if (!Array.isArray(table) || table.length<2 || table.length>MAX_ROWS+1) throw new Error('请在首行填写列名，之后填写1–5000行');
    const columns=table[0].map(v => { const name=String(v || '').trim(); return headers[name] || Object.entries(headers).find(([s])=>s.toLowerCase()===name.toLowerCase())?.[1]; });
    const known=columns.filter(Boolean);
    if(!known.includes('name') || !known.includes('grade')) throw new Error('缺少“名称”或“等级”列');
    if(new Set(known).size!==known.length) throw new Error('列名重复或多个列对应同一字段');
    const unknown=table[0].filter((v,i)=>String(v||'').trim() && !columns[i]).map(String);
    const originalPositions=[];
    const records=table.slice(1).map((row,index) => {
      const value=Object.fromEntries(columns.flatMap((field,i)=>field ? [[field,String(row[i]??'').trim()]] : []));
      if(Object.values(value).some(Boolean)) originalPositions.push(index+2);
      return value;
    })
      .filter(row=>Object.values(row).some(Boolean)).map(row=>({ ...row, type:row.type==='会议' ? 'conference' : !row.type || row.type==='期刊' ? 'journal' : row.type, aliases:row.aliases ? row.aliases.split(';').map(v=>v.trim()).filter(Boolean) : [] }));
    const checked=validateEntries(records);
    for(const issue of checked.errors) issue.row=originalPositions[issue.row-2] ?? issue.row;
    return {...checked, unknown};
  }
  function createIndex(packs) {
    if(!Array.isArray(packs) || packs.length>10) throw new Error('最多同时启用10个目录');
    const indexes=packs.map(raw=>{
      const catalog=pack(raw), names=new Map(), ids=new Map();
      const add=(map,k,row)=>{if(!map.has(k)) map.set(k,new Set()); map.get(k).add(row);};
      for(const row of catalog.entries) {
        for(const name of [row.name,...row.aliases,...(row.type==='conference' && row.abbreviation ? [row.abbreviation] : [])]) add(names,`${row.type}|${key(name)}`,row);
        for(const id of [row.issn,row.eissn].filter(Boolean)) add(ids,issn(id),row);
      }
      return {catalog,names,ids};
    });
    return hint=>{
      if(!hint || hint.consensusRows) return [];
      const type=hint.venueType==='conference' ? 'conference' : 'journal';
      const title=key(hint.title || hint.name), identifiers=[hint.issn,hint.eissn,...(hint.issns||[])].filter(validIssn).map(issn);
      if(/\.\.\.|…/.test(String(hint.title||''))) return [];
      return indexes.flatMap(({catalog,names,ids})=>{
        const byName=names.get(`${type}|${title}`);
        let selected;
        for(const id of identifiers) { const found=ids.get(id); if(found) selected=selected ? new Set([...selected].filter(row=>found.has(row))) : new Set(found); }
        if(selected && byName) selected=new Set([...selected].filter(row=>byName.has(row)));
        if(!selected) selected=new Set(byName||[]);
        if(type==='journal') selected=new Set([...selected].filter(row=>!identifiers.length || !row.issn && !row.eissn || [row.issn,row.eissn].filter(Boolean).some(id=>identifiers.includes(issn(id)))));
        // Two indistinguishable rows in the same scope must never choose a grade.
        const scopes=new Map(); for(const row of selected) { const s=row.scope||catalog.scope; if(!scopes.has(s)) scopes.set(s,[]); scopes.get(s).push(row); }
        return [...scopes.values()].filter(rows=>rows.length===1).map(([row])=>({catalog,row}));
      });
    };
  }
  function badges(matches) {
    return matches.map(({catalog,row})=>({ key:`catalog:${catalog.id}:${row.scope||catalog.scope}`, kind:'hq', text:`${catalog.label} ${row.grade}`,
      title:`${catalog.name} · ${catalog.edition}\n适用范围：${row.scope||catalog.scope}\n原始等级：${row.grade}${catalog.effectiveDate ? '\n生效日期：'+catalog.effectiveDate : ''}${catalog.sourceUrl ? '\n来源：'+catalog.sourceUrl : ''}${row.notes ? '\n'+row.notes : ''}${catalog.notes ? '\n'+catalog.notes : ''}\n用户提交的目录，认定条件请核对原文件。`, catalogId:catalog.id }));
  }
  globalThis.JournalScoutCatalogs=Object.freeze({MAX_ROWS,key,issn,validIssn,metadata,entry,validateEntries,pack,importPackage,withPackage,localPackage,parseCsv,fromTable,createIndex,badges});
})();
