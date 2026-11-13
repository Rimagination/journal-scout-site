/* Validate and package the reviewed, explicitly named source rows. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
await import('../catalogs-core.js');
const core=globalThis.JournalScoutCatalogs;
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const work=path.join(site,'.local/standard-catalogs');
const data=JSON.parse(fs.readFileSync(path.join(work,'input.json'),'utf8'));
const labels={'对外经济贸易大学':'对外经贸','西南财经大学':'西南财大','西北农林科技大学':'西农食品','南京大学':'南大','华中农业大学':'华农植科','西南交通大学':'西南交大'};
const manifest={schemaVersion:1,updated:'2026-11-13',sources:{}};
const clean=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const issue=(row,reason)=>({name:row.title,grade:row.grade,scope:row.scope,location:String(row.pdf_page),sequence:row.source_sequence,reason});
const sources=new Map(data.sources.map(source=>[source.id,source]));
const groups=Map.groupBy(data.rows,row=>row.source_id);
const merges=JSON.parse(fs.readFileSync(path.join(site,'assets/catalogs/catalog-groups.json'),'utf8')).groups;
for(const merge of merges) {
  const members=merge.sourceIds.map(id=>sources.get(id));
  if(members.some(source=>!source)||merge.sourceIds.some(id=>!groups.has(id)))throw Error('Missing merged source: '+merge.id);
  if(members.some(source=>['school','scope','edition'].some(key=>source[key]!==members[0][key])))throw Error('Cannot merge different institutions, scopes or editions: '+merge.id);
  sources.set(merge.id,{...members[0],id:merge.id,title:merge.name,sourceIds:merge.sourceIds,
    note:members.map(source=>source.title+'：'+source.note+' 来源：'+source.page_url).join('\n')+'\n合并保留 A/B 原等级。已导入旧 A、B 目录时，请停用旧目录后导入本合并目录。'});
  const rows=merge.sourceIds.flatMap(id=>groups.get(id));
  merge.sourceIds.forEach(id=>groups.delete(id));groups.set(merge.id,rows);
}

for(const [sourceId,originals] of groups) {
  const source=sources.get(sourceId),log=[],converted=[];
  const sourceIds=source.sourceIds||[sourceId];
  const documents=sourceIds.map(id=>({id,title:sources.get(id).title,url:sources.get(id).page_url,originalUrl:sources.get(id).file_url,sha256:data.sourceHashes[id]}));
  const exclusions=data.exclusions.filter(row=>row.source_id===sourceId);
  const excludedNames=new Set(exclusions.map(row=>core.key(row.title)));
  const excludedIds=new Set(exclusions.map(row=>core.issn(row.identifier)).filter(Boolean));
  for(const raw of originals) {
    if(raw.rule_row) {log.push(issue(raw,'集合认定规则，不转换为单一期刊'));continue;}
    const isConference=clean(raw.title).startsWith('(会议)')||clean(raw.identifier)==='会议';
    const row={name:raw.title.replace(/^[（(]会议[）)]\s*/,''),grade:raw.grade,type:isConference?'conference':'journal',
      scope:source.scope+' / '+raw.scope,subject:raw.scope,sourceLocation:(documents.length>1?sources.get(raw.source_id).title+' · ':'')+(typeof raw.pdf_page==='number'?`原 PDF 第${raw.pdf_page}页，序号${raw.source_sequence}`:String(raw.pdf_page)),notes:''};
    const identifier=clean(raw.identifier),notes=[];
    if(isConference) {
      if(identifier&&identifier!=='会议')notes.push('原表论文集标识：'+identifier+'（不作为会议 ISSN 匹配）');
    } else if(identifier) {
      const ids=[...new Set((identifier.match(/\d{4}[-–—]?\d{3}[\dXx]/g)||[]).filter(core.validIssn).map(core.issn))];
      const cn=identifier.replace(/^CN\s*/i,'').replace(/\s/g,'');
      if(ids.length>2)throw Error('More than two identifiers: '+sourceId+' '+raw.title);
      if(ids.length){row.issn=ids[0];row.eissn=ids[1]||'';if(raw.identifier_field==='CN号')notes.push('原表 CN 栏为 ISSN，已按刊号形态整理');}
      else if(/^\d{2}-\d{4}(?:\/[A-Z][A-Z0-9]*)?$/i.test(cn))row.cn=cn;
      else {notes.push('原始刊号：'+identifier+'（未通过刊号校验，仅保留刊名匹配）');log.push(issue(raw,'原始刊号未通过校验，未填入 ISSN/CN 标准字段'));}
    }
    if(!isConference&&(excludedNames.has(core.key(row.name))||[row.issn,row.eissn].filter(Boolean).some(id=>excludedIds.has(core.issn(id))))) {
      log.push(issue(raw,'官方暂剔除名单：不进入可导入目录'));continue;
    }
    row.notes=notes.join('；');
    converted.push({row:core.entry(row),raw});
  }
  const dedup=new Map();
  for(const {row,raw} of converted) {
    const key=[row.type,core.key(row.scope),core.key(row.name)].join('|');
    const previous=dedup.get(key);
    if(!previous){dedup.set(key,{row,raw});continue;}
    if(previous.row.grade!==row.grade||['issn','eissn','cn'].some(k=>previous.row[k]&&row[k]&&previous.row[k]!==row[k]))throw Error('Conflicting duplicate: '+sourceId+' '+row.name);
    previous.row.aliases=[...new Set([...previous.row.aliases,...(previous.row.name!==row.name?[row.name]:[])])];
    for(const key of ['issn','eissn','cn'])if(!previous.row[key])previous.row[key]=row[key];
    previous.row.notes=[...new Set([previous.row.notes,row.notes,`同刊同范围重复记录已合并；另见${row.sourceLocation}`].filter(Boolean))].join('；');
    log.push(issue(raw,'同刊、同范围、同等级重复记录，合并并保留别名与来源位置'));
  }
  const entries=[...dedup.values()].map(x=>x.row),check=core.validateEntries(entries);
  if(check.errors.length)throw Error(sourceId+' '+JSON.stringify(check.errors.slice(0,5)));
  const group=sourceId==='swjtu-2026-public'?Map.groupBy(entries,row=>row.subject.split(' / ')[0]):new Map([['',entries]]);
  const folder=path.join(work,sourceId);fs.mkdirSync(folder,{recursive:true});
  const files=[];
  const notes=[source.note,'仅整理原表具名条目，保留原等级与学科范围；集合认定规则不自动展开。',
    '论文类型、发表日期、预警排除等认定条件以官网原文件为准。',
    sourceId==='swjtu-2026-public'?'官方暂剔除名单单独记录，不纳入可导入目录。':''].filter(Boolean).join('\n');
  for(const [area,areaRows] of group) {
    // Keep subject groups together and leave headroom for package metadata.
    const chunks=[];let batch=[],bytes=0;
    for(const rows of Map.groupBy(areaRows,row=>row.scope).values()) {
      const size=Buffer.byteLength(JSON.stringify(rows));
      if(size>750000)throw Error('A single subject needs explicit subdivision: '+sourceId+' '+rows[0].scope);
      if(batch.length&&(bytes+size>750000||batch.length+rows.length>5000)){chunks.push(batch);batch=[];bytes=0;}
      batch.push(...rows);bytes+=size;
    }
    if(batch.length)chunks.push(batch);
    for(const [part,rows] of chunks.entries()) {
    const section=area+(chunks.length>1?`（第${part+1}/${chunks.length}册）`:'');
    const pack=await core.localPackage({name:source.title+(section?' · '+section:''),institution:source.school,label:labels[source.school],edition:source.edition,
      scope:source.scope+(section?' / '+section:''),sourceUrl:source.page_url,effectiveDate:/^\d{4}-\d{2}-\d{2}$/.test(source.effective)?source.effective:'',notes},rows);
    const text=JSON.stringify(pack);
    if(Buffer.byteLength(text)>900000)throw Error('Package exceeds standard 900KB limit: '+sourceId+' '+area);
    const name=sourceId+(group.size>1||chunks.length>1?'-'+String(files.length+1):'')+'.journal-scout.json';
    fs.writeFileSync(path.join(folder,name),text);files.push(name);
    }
  }
  const review={sourceId,sourceUrl:source.page_url,originalUrl:source.file_url,sourceSha256:documents[0].sha256,sources:documents,
    originalRows:originals.length,standardRows:entries.length,conferenceRows:entries.filter(r=>r.type==='conference').length,
    issues:log,exclusions:exclusions.map(r=>({name:r.title,identifier:r.identifier,location:r.location})),
    scopeChecks:data.scopeChecks.filter(r=>r.sourceId===sourceId),checkedOn:'2026-11-13'};
  fs.writeFileSync(path.join(folder,'整理记录.json'),JSON.stringify(review,null,2));
  fs.writeFileSync(path.join(folder,'整理说明.txt'),[
    source.school+' · '+source.title,source.edition,'适用范围：'+source.scope,'标准具名条目：'+entries.length,
    '使用：解压后在支持高校目录的插件版本中导入 .journal-scout.json。Excel 的“目录”工作表使用统一上传模板列名。',
    '分册：'+(files.length>1?'按原表学科边界分册，分别导入；单册不超过5000行和900KB。':'本目录提供一份 JSON 及对应 Excel。'),
    notes,'原表记录数：'+originals.length,'整理及合并记录详见“整理记录.json”。',
    ...documents.flatMap(doc=>['原件：'+doc.title,'官方来源：'+doc.url,'原件 SHA-256：'+doc.sha256])
  ].join('\n'));
  manifest.sources[sourceId]={sourceId,count:entries.length,originalCount:originals.length,parts:files.length,files,
    conferenceCount:review.conferenceRows,sourceSha256:documents[0].sha256,sourceIds,download:`./downloads/catalogs/standard/${sourceId}-20261113.zip`};
  if(new Set(files).size!==files.length)throw Error('Duplicate package filenames: '+sourceId);
}
fs.writeFileSync(path.join(work,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({sources:Object.keys(manifest.sources).length,counts:Object.values(manifest.sources).map(s=>[s.sourceId,s.count,s.parts,s.conferenceCount])}));
