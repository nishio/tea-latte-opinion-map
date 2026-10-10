'use strict';
(async()=>{
 const status=document.querySelector('#shown-count');
 try{
  const [result,meta]=await Promise.all([fetch('data/reports/report.json').then(r=>{if(!r.ok)throw Error('report');return r.json()}),fetch('methodology.json').then(r=>{if(!r.ok)throw Error('method');return r.json()})]);
  document.querySelector('[data-count]').textContent=result.arguments.length.toLocaleString('ja-JP');
  const colors=['#26708c','#b57137','#66866c','#986a7a','#6e7fab'];
  const groups=result.clusters.filter(c=>c.level===1).sort((a,b)=>a.id.localeCompare(b.id));
  const colorFor=id=>colors[Math.max(0,groups.findIndex(g=>g.id===id))%colors.length];
  const shortLabels=meta.short_labels;
  const args=result.arguments,svg=document.querySelector('#map'),NS='http://www.w3.org/2000/svg';
  const xs=args.map(a=>a.x),ys=args.map(a=>a.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  let activeGroup=null,filtered=args,index=0;
  const circles=new Map();
  const show=a=>{
   index=filtered.findIndex(x=>x.arg_id===a.arg_id);if(index<0)return;
   for(const [id,c]of circles){c.classList.toggle('active',id===a.arg_id);c.setAttribute('tabindex',id===a.arg_id?'0':'-1')}
   const selected=circles.get(a.arg_id);if(selected)svg.appendChild(selected);
   const g=groups.find(g=>a.cluster_ids.includes(g.id));
   document.querySelector('#opinion-category').textContent=shortLabels[g?.id]||g?.label||'意見';
   document.querySelector('#opinion-text').textContent=a.argument;
   document.querySelector('#map-opinion').textContent=a.argument;
   const mapSource=document.querySelector('#map-source');mapSource.hidden=!a.url;if(a.url)mapSource.href=a.url;
   const link=document.querySelector('#source-link');link.hidden=!a.url;if(a.url)link.href=a.url;
   document.querySelector('#voice-index').textContent=`${index+1} / ${filtered.length}`;
  };
  for(const a of args){
   const c=document.createElementNS(NS,'circle');c.setAttribute('cx',String(36+(a.x-minX)/(maxX-minX||1)*728));c.setAttribute('cy',String(38+(maxY-a.y)/(maxY-minY||1)*444));c.setAttribute('r','6');c.setAttribute('fill',colorFor(a.cluster_ids.find(id=>id.startsWith('1_'))));c.setAttribute('tabindex','-1');c.setAttribute('role','button');c.setAttribute('aria-label',a.argument);c.addEventListener('click',()=>show(a));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(a)}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const next=filtered[(index+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1)+filtered.length)%filtered.length];show(next);circles.get(next.arg_id).focus()}});svg.appendChild(c);circles.set(a.arg_id,c);
  }
  const selectGroup=(id,initial)=>{
   activeGroup=id;filtered=id?args.filter(a=>a.cluster_ids.includes(id)):args;
   for(const b of document.querySelectorAll('#filters button'))b.setAttribute('aria-pressed',String((b.dataset.group||null)===id));
   for(const a of args){const c=circles.get(a.arg_id);const dim=Boolean(id&&!a.cluster_ids.includes(id));c.classList.toggle('dimmed',dim);c.style.pointerEvents=dim?'none':'';}
   status.textContent=`${filtered.length}件の意見を表示中 / 全${args.length}件`;
   if(filtered.length)show(initial||filtered[0]);
  };
  for(const [i,g]of [{id:'',label:'すべて'},...groups].entries()){
   const b=document.createElement('button');b.type='button';b.dataset.group=g.id;b.setAttribute('aria-pressed',String(!g.id));
   if(g.id){const dot=document.createElement('span');dot.className='filter-dot';dot.style.backgroundColor=colorFor(g.id);b.append(dot)}
   b.append(document.createTextNode(shortLabels[g.id]||g.label));b.addEventListener('click',()=>selectGroup(g.id||null));document.querySelector('#filters').append(b);
  }
  document.querySelector('#previous').addEventListener('click',()=>show(filtered[(index-1+filtered.length)%filtered.length]));
  document.querySelector('#next').addEventListener('click',()=>show(filtered[(index+1)%filtered.length]));
  const startingVoices=document.querySelector('#starting-voices');startingVoices.replaceChildren();
  meta.insights[0].evidence.forEach((evidence,i)=>{
   const a=args.find(a=>a.url===evidence.url);if(!a)throw Error('Missing starting opinion');
   const card=document.createElement('article');card.className='starting-voice';
   const label=document.createElement('p');label.className='eyebrow';label.textContent=`STEP 1 / 感想 ${i+1}`;
   const p=document.createElement('p');p.className='starting-text';p.textContent=evidence.paraphrase;
   const link=document.createElement('a');link.href=evidence.url;link.textContent='元の投稿 ↗';link.target='_blank';link.rel='noopener noreferrer';
   const button=document.createElement('button');button.type='button';button.className='button primary';button.textContent='この感想から読む →';button.setAttribute('aria-label',evidence.paraphrase+' この感想から読む');
   button.addEventListener('click',()=>{
    document.querySelector('#guided-reader').hidden=false;
    selectGroup(a.cluster_ids.find(id=>groups.some(g=>g.id===id)),a);
    const heading=document.querySelector('#reader-heading');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   });
   card.append(label,p,link,button);startingVoices.append(card);
  });
  selectGroup(null);
  status.textContent=`全${args.length}件の意見を、話題ごとに読めます。`;
  document.querySelector('#map-disclosure').addEventListener('toggle',e=>{
   e.currentTarget.querySelector('.disclosure-hint').textContent=e.currentTarget.open?'地図を閉じる −':'タップして開く ＋';
  });
  const insights=document.querySelector('#insights');insights.replaceChildren();
  meta.insights.forEach((item,i)=>{
   const article=document.createElement('article');article.className='insight';
   const n=document.createElement('span');n.className='num';n.textContent=String(i+1).padStart(2,'0');
   const h=document.createElement('h3');h.textContent=item.title;const p=document.createElement('p');p.textContent=item.body;
   const ul=document.createElement('ul');for(const evidence of item.evidence){const li=document.createElement('li');li.append(document.createTextNode(evidence.paraphrase+' '));const a=document.createElement('a');a.textContent='出典 ↗';a.href=evidence.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);ul.append(li)}
   article.append(n,h,p,ul);insights.append(article);
  });
  document.querySelector('#analysis-method').textContent=`広聴AI analysis-core、GPT-4.1、text-embedding-3-small。548件から${meta.posts_with_arguments}投稿に由来する${args.length}件の意見を整理。公開前の照合・修正後に、5群・15小群の地図を再生成しました。紹介用の短い分類名は編集しています。`;
  document.querySelector('#share-link').href='https://x.com/intent/post?'+new URLSearchParams({text:'午後ティーの新作、あなたはどっち派？ 好みが分かれる理由を広聴AIで眺める意見の地図。',url:'https://nishio.github.io/tea-latte-opinion-map/'});
 }catch(e){status.textContent='感想を読み込めませんでした。ページを再読み込みしてください。';document.querySelector('#starting-voices').textContent='感想を表示できませんでした。下のリンクから広聴AIの全画面を開けます。';document.querySelector('#opinion-text').textContent='データの読み込みに失敗しました。通信状態をご確認ください。';console.error(e)}
})();
