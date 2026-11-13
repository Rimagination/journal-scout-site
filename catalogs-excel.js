/* Public file format: an Excel workbook, with literal values and explicit rows. */
(() => {
  const core=globalThis.JournalScoutCatalogs;
  const fields=[['名称','name'],['等级','grade'],['类型','type'],['ISSN','issn'],['eISSN','eissn'],['简称','abbreviation'],['适用范围','scope'],['备注','notes'],['CN号','cn'],['别名','aliases'],['学科','subject'],['来源位置','sourceLocation']];
  const infoFields=[['目录名称','name'],['学校 / 机构','institution'],['标签名称','label'],['目录版本','edition'],['适用范围','scope'],['官方来源网址','sourceUrl'],['生效日期','effectiveDate'],['规则说明','notes']];
  function checkContainer(buffer) {
    if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<22||buffer.byteLength>1024*1024)throw new Error('请选择不超过 1 MB 的 Excel（.xlsx）文件。');
    const view=new DataView(buffer);let end=-1;
    for(let p=buffer.byteLength-22;p>=Math.max(0,buffer.byteLength-65557);p--)if(view.getUint32(p,true)===0x06054b50&&p+22+view.getUint16(p+20,true)===buffer.byteLength){end=p;break;}
    if(end<0)throw new Error('这不是有效的 .xlsx 文件。PDF、文字说明或其他文件改名后也无法使用，请填写 Excel 模板。');
    const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),start=view.getUint32(end+16,true);
    if(view.getUint16(end+4,true)||view.getUint16(end+6,true)||!count||count>1000||start+size!==end)throw new Error('Excel 文件结构超出支持范围。');
    let total=0,p=start;const names=new Set();
    for(let n=0;n<count;n++){
      if(p+46>end||view.getUint32(p,true)!==0x02014b50)throw new Error('Excel 文件目录损坏。');
      const length=view.getUint16(p+28,true),next=p+46+length+view.getUint16(p+30,true)+view.getUint16(p+32,true);
      if(next>end||view.getUint16(p+8,true)&1)throw new Error('不支持损坏或加密的 Excel 文件。');
      const name=new TextDecoder().decode(new Uint8Array(buffer,p+46,length));
      if(names.has(name)||/vbaProject|externalLinks\//i.test(name))throw new Error('请使用不含宏或外部链接的标准 Excel 文件。');
      names.add(name);total+=view.getUint32(p+24,true);p=next;
    }
    if(p!==end||!names.has('[Content_Types].xml')||!names.has('xl/workbook.xml'))throw new Error('文件不是标准 Excel（.xlsx）工作簿。');
    if(total>16*1024*1024)throw new Error('Excel 解压后过大，请只保留目录表格。');
  }
  function read(buffer,xlsx) {
    checkContainer(buffer);
    const book=xlsx.read(buffer,{type:'array',sheetRows:5002,cellFormula:true,cellHTML:false});
    const sheet=book.Sheets['目录'];
    if(!sheet)throw new Error('缺少“目录”工作表，请使用下载的 Excel 模板。');
    for(const [name,value] of Object.entries(book.Sheets)){
      if(value['!merges']?.length)throw new Error(`“${name}”含合并单元格，请取消合并，每行填写一个条目。`);
      if(Object.entries(value).some(([cell,v])=>!cell.startsWith('!')&&v?.f))throw new Error(`“${name}”含公式，请粘贴为值后上传。`);
    }
    const range=xlsx.utils.decode_range(sheet['!fullref']||sheet['!ref']||'A1');
    if(range.s.r||range.s.c||range.e.c>=fields.length||range.e.r>core.MAX_ROWS)throw new Error('请从 A1 填写模板列名；目录最多 5,000 行、12 列。');
    const table=xlsx.utils.sheet_to_json(sheet,{header:1,raw:false,defval:'',blankrows:true});
    const headers=table[0]?.map(v=>String(v).trim())||[];
    if(['名称','等级','类型'].some(name=>!headers.includes(name)))throw new Error('首行必须包含“名称、等级、类型”列，请使用 Excel 模板。');
    const checked=core.fromTable(table);
    if(checked.unknown.length)checked.errors.push({row:1,message:'未识别的列：'+checked.unknown.join('、')+'。请使用模板列名。'});
    const typeColumn=headers.indexOf('类型');
    const nameColumn=headers.indexOf('名称');
    for(let i=1;i<table.length;i++){
      const row=table[i];if(!row.some(v=>String(v).trim()))continue;
      if(!['期刊','会议'].includes(String(row[typeColumn]||'').trim()))checked.errors.push({row:i+1,message:'类型必须明确填写“期刊”或“会议”。'});
      const name=String(row[nameColumn]||'').trim();
      if(name&&(/^[\d\s.,-]+$/.test(name)||/^(?:所有|全部|其他|其它).*(?:期刊|刊物|会议)|^(?:SCI|SCIE|SSCI|CSSCI|CSCD|CCF)\s*(?:收录|期刊|刊物|会议|[ABC]类?会议)?$/i.test(name)))checked.errors.push({row:i+1,message:'请填写具体期刊或会议的全称，不能用集合规则或分级名称代替名单。'});
      if(row.some((v,c)=>String(v).trim()&&!headers[c]))checked.errors.push({row:i+1,message:'数据列缺少列名，请使用模板表头。'});
      if(row.some((v,c)=>['name','grade'].includes(fields.find(([name])=>name===headers[c])?.[1])&&/[\r\n]/.test(String(v))))checked.errors.push({row:i+1,message:'名称和等级不能包含换行；请将每个期刊或会议分成单独一行。'});
    }
    const metadata={};
    const info=book.Sheets['目录信息'];
    if(info){
      const rows=xlsx.utils.sheet_to_json(info,{header:1,raw:false,defval:''});
      for(const [label,value] of rows){const key=infoFields.find(([name])=>name===String(label).trim())?.[1];if(key){if(key in metadata)throw new Error('“目录信息”中字段重复：'+label);metadata[key]=String(value||'').trim();}}
    }
    return {...checked,metadata};
  }
  function write(metadata,entries,xlsx) {
    const meta=core.metadata(metadata),checked=core.validateEntries(entries);
    if(checked.errors.length)throw new Error(checked.errors[0].message);
    const table=[fields.map(([name])=>name),...checked.entries.map(row=>fields.map(([,key])=>key==='type'?(row.type==='conference'?'会议':'期刊'):key==='aliases'?row.aliases.join(';'):row[key]||''))];
    const book=xlsx.utils.book_new(),sheet=xlsx.utils.aoa_to_sheet(table);
    sheet['!cols']=[65,18,10,16,16,20,65,70,20,65,45,35].map(wch=>({wch}));
    sheet['!autofilter']={ref:sheet['!ref']};
    xlsx.utils.book_append_sheet(book,sheet,'目录');
    const info=xlsx.utils.aoa_to_sheet([['字段','内容'],...infoFields.map(([name,key])=>[name,meta[key]])]);
    info['!cols']=[{wch:18},{wch:100}];xlsx.utils.book_append_sheet(book,info,'目录信息');
    const buffer=xlsx.write(book,{type:'array',bookType:'xlsx',compression:true});
    if(buffer.byteLength>1024*1024)throw new Error('Excel 超过 1 MB，请按适用范围拆分。');
    return buffer;
  }
  globalThis.JournalScoutCatalogExcel=Object.freeze({fields,infoFields,read,write});
})();
