/* Reference metadata and school emblems are static; filtering runs on this device. */
(() => {
  const list=document.getElementById('referenceList'),status=document.getElementById('referenceStatus');
  const search=document.getElementById('catalogSearch');
  const buttons=[...document.querySelectorAll('#schoolCategories [data-category]')];
  const headings={all:'全部目录','985':'985 高校','211':'211 高校',other:'其他高校'};
  const make=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;};
  let directories=[],limit=12,category='all';
  function render() {
    const q=search.value.trim().toLocaleLowerCase();list.replaceChildren();
    const matches=directories.filter(({school,item})=>(school.institution+' '+item.name+' '+item.scope+' '+item.edition).toLocaleLowerCase().includes(q));
    for(const button of buttons) {
      const key=button.dataset.category;
      button.querySelector('.catalog-category-count').textContent=matches.filter(d=>key==='all'||d.category===key).length;
      button.setAttribute('aria-pressed',String(key===category));
    }
    const visible=matches.filter(d=>category==='all'||d.category===category);
    document.getElementById('referenceHeading').textContent=headings[category];
    document.getElementById('referenceTotal').textContent=`${new Set(visible.map(d=>d.school.institution)).size} 所高校 · ${visible.length} 份目录`;
    for(const {school,item,index} of visible.slice(0,limit)) {
      const card=make('article','','catalog-book'),cover=make('div','','catalog-book-cover catalog-cover-'+index%4);
      cover.setAttribute('aria-hidden','true');
      cover.append(make('span','高校期刊目录','catalog-cover-kicker'));
      if(school.logo?.url) {
        const img=make('img');img.src=school.logo.url;img.alt='';img.width=76;img.height=76;img.loading='lazy';img.decoding='async';
        if(school.logo.variant!=='emblem')img.className='catalog-cover-lockup';
        img.addEventListener('error',()=>{img.replaceWith(make('span',school.institution.slice(0,2),'catalog-cover-initials'));},{once:true});
        cover.append(img);
      } else cover.append(make('span',school.institution.slice(0,2),'catalog-cover-initials'));
      cover.append(make('strong',school.institution,'catalog-cover-school'),make('span',item.edition.match(/(?:19|20)\d{2}/)?.[0]||'参考资料','catalog-cover-year'));
      const content=make('div','','catalog-book-content');
      content.append(make('p',school.institution,'catalog-book-school'),make('h3',item.name));
      const meta=make('div','','catalog-book-meta');meta.append(make('span',item.edition));
      if(item.status.includes('历史'))meta.append(make('span','历史版本','catalog-history-badge'));
      content.append(meta,make('p',item.scope,'catalog-book-scope'));
      const actions=make('div','','catalog-book-actions');
      if(school.download) {
        const a=make('a','下载原始资料 ↓','catalog-button');a.href=school.download;a.download='';actions.append(a);
        if(school.catalogs.length>1)actions.append(make('span',`学校资料包 · 含 ${school.catalogs.length} 项`,'catalog-subtle'));
      } else actions.append(make('span','原件暂不提供下载','catalog-subtle'));
      if(/^https?:\/\//.test(item.sourceUrl)) {
        const a=make('a','官网来源 ↗','catalog-source-link');a.href=item.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);
      }
      content.append(actions);
      const detail=make('details');detail.append(make('summary','版本与适用说明'),make('p',item.status+' · '+item.currentness));
      if(item.note)detail.append(make('p',item.note));
      content.append(detail);card.append(cover,content);list.append(card);
    }
    if(!visible.length) {
      const empty=make('div','','catalog-empty');empty.append(make('h3',q?'没有找到匹配的目录':'这一分类还没有收录目录'),make('p',q?'试试学校全称、学院名称或其他关键词。':'后续收录的资料会显示在这里。','catalog-subtle'));list.append(empty);
    }
    document.getElementById('moreReferences').hidden=limit>=visible.length;
    status.textContent=visible.length?`已显示 ${Math.min(limit,visible.length)} / ${visible.length} 份目录` : '';
  }
  search.addEventListener('input',()=>{limit=12;render();});
  buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;limit=12;render();}));
  document.getElementById('moreReferences').addEventListener('click',()=>{limit+=12;render();});
  fetch('./assets/catalogs/library-index.json',{credentials:'omit'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
    if(data.schemaVersion!==1 || !Array.isArray(data.schools))throw Error();
    directories=data.schools.flatMap(school=>school.catalogs.map(item=>({school,item,category:school.is985?'985':school.is211?'211':'other'}))).map((d,index)=>({...d,index}));render();
  }).catch(()=>{status.textContent='学校资料暂时无法加载，请稍后重试。';});
})();
