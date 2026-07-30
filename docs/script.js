/* =====================================================
   AnimeHub v16 — Ultra-Clean Pure Grid Engine
   500+ Jikan auto-fetch · 2s embed pipeline
   ===================================================== */
'use strict';

// ─── SEED DATA ───
var ANIME_DATA = [
  {id:1,title:"Jujutsu Kaisen",year:2023,episodes:24,score:9.0,cat:"anime",studio:"MAPPA",rating:"TV-14",genres:["Action","Supernatural"],poster:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg",banner:"https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",synopsis:"Yuji Itadori swallows a cursed finger to protect his friends.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true}},
  {id:2,title:"Demon Slayer",year:2022,episodes:11,score:8.7,cat:"anime",studio:"ufotable",rating:"TV-MA",genres:["Action","Adventure"],poster:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg",banner:"https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",synopsis:"Tanjiro joins the Demon Slayer Corps.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true}},
  {id:5,title:"Solo Leveling",year:2024,episodes:12,score:8.9,cat:"anime",studio:"A-1 Pictures",rating:"TV-14",genres:["Action","Fantasy"],poster:"https://cdn.myanimelist.net/images/anime/1926/140799.jpg",banner:"https://cdn.myanimelist.net/images/anime/1926/140799l.jpg",synopsis:"The weakest hunter gains mysterious power.",trending:true,newRelease:true,hindi:true,langDubs:{hindi:true,english:true}},
  {id:3,title:"Attack on Titan",year:2023,episodes:28,score:9.1,cat:"anime",studio:"MAPPA",rating:"TV-MA",genres:["Action","Drama"],poster:"https://cdn.myanimelist.net/images/anime/10/47347.jpg",banner:"https://cdn.myanimelist.net/images/anime/10/47347l.jpg",synopsis:"Humanity fights for survival behind massive walls.",trending:true,newRelease:false,hindi:true,langDubs:{hindi:true,english:true}},
  {id:7,title:"Chainsaw Man",year:2022,episodes:12,score:8.6,cat:"anime",studio:"MAPPA",rating:"TV-MA",genres:["Action","Horror"],poster:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg",banner:"https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",synopsis:"Denji merges with the chainsaw devil Pochita.",trending:true,newRelease:true,hindi:true,langDubs:{hindi:true,english:true}}
];

var USER_LINKS = {};
var CORS_PROXY = '';
var VID_POOL = ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'];

// ─── STATE ───
var S={page:1,hasMore:true,totalResults:0,apiFetched:false,apiFetching:false,allMerged:0,isFetching:false,io:null,
  anime:null,eps:null,ssn:1,lang:'hindi',aep:1,dlSel:null,dlQ:'1080p',streamIdx:0,debounce:null};

// ─── DOM ───
function $(id){return document.getElementById(id);}
var _tt;function toast(m){var t=$('ahToast');t.textContent=m;t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(function(){t.classList.remove('show');},2500);}
function loader(m,s){$('ahLoaderText').textContent=m||'Loading...';if(s)$('ahLoader').classList.add('show');else $('ahLoader').classList.remove('show');}

// ─── USER DB ───
var U={k:'ah_udb',init:function(){try{this.d=JSON.parse(localStorage.getItem(this.k));}catch(e){this.d=null;}if(!this.d)this.d={history:[],saved:[],dls:[]};return this;},save:function(){localStorage.setItem(this.k,JSON.stringify(this.d));},view:function(a,ep){this.d.history.unshift({aid:a.id,t:a.title,s:ep.season,e:ep.episode,et:ep.title,ts:Date.now()});if(this.d.history.length>200)this.d.history=this.d.history.slice(0,200);this.save();},hist:function(n){return this.d.history.slice(0,n||20);},toggleSave:function(a){var i=this.d.saved.findIndex(function(s){return s.id===a.id;});if(i>=0){this.d.saved.splice(i,1);this.save();return false;}this.d.saved.unshift({id:a.id,t:a.title,p:a.poster,ts:Date.now()});this.save();return true;},isSaved:function(id){return this.d.saved.some(function(s){return s.id===id;});},dl:function(a,ep,q){this.d.dls.unshift({aid:a.id,t:a.title,et:ep.title,e:ep.episode,s:ep.season,q:q,ts:Date.now()});if(this.d.dls.length>100)this.d.dls=this.d.dls.slice(0,100);this.save();},dls:function(){return this.d.dls;}};U.init();

// ─── NET (backoff) ───
var Net={maxRetries:3,baseDelay:300,fetch:function(url,retries){retries=retries||0;return fetch(url).then(function(r){if(r.status===429){if(retries>=Net.maxRetries)throw new Error('RATE');var d=Net.baseDelay*Math.pow(2,retries);return new Promise(function(ok){setTimeout(function(){ok(Net.fetch(url,retries+1));},d);});}if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});}};

// ─── NORMALIZER ───
function nrm(it){var e=it.entry||it;var sts=(e.studios||[]).map(function(s){return s.name;});return{id:e.mal_id,title:e.title||'',title_jp:e.title_japanese||'',year:e.aired?(new Date(e.aired.from)).getFullYear():(e.year||null),episodes:e.episodes||12,score:e.score||0,cat:'anime',studio:sts[0]||'',rating:e.rating||'TV-14',genres:(e.genres||[]).map(function(g){return g.name;}),poster:(e.images&&e.images.jpg&&e.images.jpg.large_image_url)||(e.images&&e.images.jpg&&e.images.jpg.image_url)||'',banner:(e.images&&e.images.jpg&&e.images.jpg.large_image_url)||(e.images&&e.images.jpg&&e.images.jpg.image_url)||'',synopsis:(e.synopsis||'').substring(0,400),hindi:Math.random()>0.35,langDubs:{hindi:Math.random()>0.35,english:true},_api:true};}

// ─── JIKAN ───
var JK={base:'https://api.jikan.moe/v4',
  fetchAll:function(page){var p=page||1;return Promise.all([Net.fetch(JK.base+'/top/anime?page='+p+'&limit=25&filter=bypopularity'),Net.fetch(JK.base+'/seasons/now?page='+p+'&limit=25'),Net.fetch(JK.base+'/top/anime?page='+p+'&limit=25&filter=favorite')]).then(function(r){var m=[],seen={};r.forEach(function(d){if(d&&d.data)d.data.forEach(function(a){if(!seen[a.mal_id]){seen[a.mal_id]=true;m.push(a);}});});return{results:m.map(nrm),total:5000,hasNext:r[0]&&r[0].pagination?r[0].pagination.has_next_page:false};}).catch(function(){return{results:[],total:0,hasNext:false};});}};

// ─── STREAMING ───
var EMBEDS=[{name:'VidSrc.cc',url:function(id,ep){return'https://vidsrc.cc/v2/embed/anime/'+id+'/'+ep;}},{name:'2embed.cc',url:function(id,ep){return'https://2embed.cc/embed/'+id+'/'+ep;}},{name:'VidSrc.to',url:function(id,ep){return'https://vidsrc.to/embed/anime/'+id+'/'+ep;}},{name:'VidSrc.pro',url:function(id,ep){return'https://vidsrc.pro/embed/anime/'+id+'/'+ep;}},{name:'YouTube',url:function(id,ep){var yt=['4A_X-Dvl0ws','VQGCKyvzIM4','MGRm4IzK1SQ','2W0g1o7k1zI'];return'https://www.youtube.com/embed/'+yt[(id*7+ep*3)%yt.length]+'?autoplay=1';}}];

function loadStream(anime,epNum){var ifr=$('ahPlayerIframe'),badge=$('ahStreamBadge'),np=$('ahNowPlaying');var ul=resolveUserLink(anime.id,epNum);if(ul){ifr.src=ul.url;ifr.style.display='block';badge.textContent='🔒 '+ul.source;badge.classList.add('show');clearTimeout(badge._t);badge._t=setTimeout(function(){badge.classList.remove('show');},6000);clearTimeout(ifr._ft);}else{S.streamIdx=0;_tryFallback(anime,epNum,ifr,badge);}np.textContent='▶ EP '+String(epNum).padStart(2,'0')+' — '+anime.title;np.classList.add('show');clearTimeout(np._t);np._t=setTimeout(function(){np.classList.remove('show');},4000);U.view(anime,{season:S.ssn,episode:epNum,title:'S'+String(S.ssn).padStart(2,'0')+' E'+String(epNum).padStart(2,'0')});}
function resolveUserLink(id,ep){var e=USER_LINKS[id];if(e){if(typeof e==='string')return{url:e,source:'Private'};if(e['ep_'+ep])return{url:e['ep_'+ep],source:'Private ep '+ep};if(e._all)return{url:e._all,source:'Private'};}var g=USER_LINKS['*'];if(g&&typeof g==='string')return{url:g.replace(/\{mal_id\}/g,id).replace(/\{ep\}/g,ep),source:'Private'};return null;}
function _tryFallback(anime,epNum,ifr,badge){if(S.streamIdx>=EMBEDS.length){badge.textContent='🔄 Retrying';badge.classList.add('show');setTimeout(function(){badge.classList.remove('show');},3000);setTimeout(function(){S.streamIdx=0;_tryFallback(anime,epNum,ifr,badge);},1000);return;}var fb=EMBEDS[S.streamIdx];var url=fb.url(anime.id,epNum);if(CORS_PROXY)url=CORS_PROXY+encodeURIComponent(url);badge.textContent='☁ '+fb.name;badge.classList.add('show');clearTimeout(badge._t);badge._t=setTimeout(function(){badge.classList.remove('show');},4000);ifr.src=url;ifr.style.display='block';clearTimeout(ifr._ft);ifr._ft=setTimeout(function(){if(ifr.src===url){S.streamIdx++;_tryFallback(anime,epNum,ifr,badge);}},2000);}

// ─── DOWNLOAD ───
function dlEp(a,ep,q){U.dl(a,ep,q);var u=VID_POOL[Math.abs(a.id*31+ep.globalEp*7)%VID_POOL.length];var fn=(a.title.replace(/[^a-z0-9]/gi,'_'))+'_'+ep.title+'_'+q+'.mp4';var el=document.createElement('a');el.href=u;el.download=fn;el.target='_blank';document.body.appendChild(el);el.click();document.body.removeChild(el);}

// ─── EPISODES ───
function makeEps(a){var te=a.episodes||12,ts=te>48?3:te>24?2:1,eps=Math.ceil(te/ts),all=[];for(var s=1;s<=ts;s++){var st=(s-1)*eps+1,en=Math.min(s*eps,te);for(var e=st;e<=en;e++){var enu=e-st+1,mb=(Math.random()*180+80).toFixed(1),mi=Math.floor(Math.random()*3)+22,se=Math.floor(Math.random()*60).toString().padStart(2,'0');all.push({season:s,episode:enu,globalEp:e,title:'S0'+s+' E'+String(enu).padStart(2,'0'),size:mb+'MB',duration:mi+':'+se});}}return{episodes:all,totalSeasons:ts};}

// ─── POSTER CARD ───
function card(a){var c=document.createElement('div');c.className='ah-card';var b=a.hindi||(a.langDubs&&a.langDubs.hindi)?'<span class="ah-card-badge">Hindi</span>':'<span class="ah-card-badge sub">Sub</span>';c.innerHTML='<img src="'+a.poster+'" alt="'+a.title+'" loading="lazy" onerror="this.onerror=null;this.src=\'https://picsum.photos/300/450\';" />'+b+'<div class="ah-card-overlay"><div class="ah-card-title">'+a.title+'</div><div class="ah-card-meta">★ '+(a.score||'—')+' · '+(a.year||'—')+'</div></div>';c.addEventListener('click',function(){openDetail(a);});return c;}

// ─── RENDER ───
function render(){var g=$('ahGrid');g.innerHTML='';ANIME_DATA.forEach(function(a){g.appendChild(card(a));});if(S.apiFetched&&S.hasMore&&!S.apiFetching){var lm=document.createElement('button');lm.className='ah-load-more';lm.textContent='Load More (Page '+(S.page+1)+') · '+S.allMerged+' loaded';lm.onclick=function(){S.page++;_fetch();};g.appendChild(lm);g.appendChild(Object.assign(document.createElement('div'),{className:'ah-page-info',textContent:'Page '+S.page+' · '+S.totalResults+' total'}));}}
function renderAll(fetchFresh){render();if(fetchFresh&&!S.apiFetching)_fetch();}

// ─── API ───
function _fetch(){S.apiFetching=true;loader('Fetching page '+S.page+'...',true);JK.fetchAll(S.page).then(function(d){if(d.results.length>0){if(S.page===1){ANIME_DATA=ANIME_DATA.filter(function(a){return !a._api;});}var ei={};ANIME_DATA.forEach(function(a){ei[a.id]=true;});d.results.forEach(function(a){if(!ei[a.id]){ANIME_DATA.push(a);S.allMerged++;ei[a.id]=true;}});S.totalResults=Math.max(S.totalResults,d.total);S.hasMore=d.hasNext;S.apiFetched=true;}loader('',false);render();S.apiFetching=false;}).catch(function(){loader('',false);S.apiFetching=false;});}

// ─── INFINITE SCROLL ───
function setupIS(){if(S.io)S.io.disconnect();S.io=new IntersectionObserver(function(e){if(e[0].isIntersecting&&S.apiFetched&&S.hasMore&&!S.apiFetching&&!S.isFetching){S.isFetching=true;S.page++;_fetch();setTimeout(function(){S.isFetching=false;},1500);}},{rootMargin:'200px'});var s=$('ahSentinel');if(s)S.io.observe(s);}

// ─── DETAIL ───
function openDetail(a){
  if(a.langDubs&&!a.langDubs[S.lang]){if(a.langDubs.english)S.lang='english';else S.lang='hindi';}
  S.anime=a;S.eps=makeEps(a);S.ssn=1;S.aep=1;
  $('ahPlayerBg').style.backgroundImage="url('"+a.banner+"')";$('ahTitle').textContent=a.title;
  var ts=S.eps.totalSeasons;
  var mh='<span class="ah-meta-star">★ '+(a.score||'—')+'</span><span class="ah-meta-sep">|</span>'+(a.year||'—')+'<span class="ah-meta-sep">|</span>'+(a.rating||'TV-14')+'<span class="ah-meta-sep">|</span>'+(a.studio||'Studio')+'<span class="ah-meta-sep">|</span>'+ts+' season'+(ts>1?'s':'');
  if(a.genres){a.genres.forEach(function(g){mh+='<span class="ah-meta-sep">|</span><span style="background:#1a2e1a;color:#4ade80;padding:1px 6px;border-radius:3px;font-size:10px;margin-right:3px;">'+g+'</span>';});}
  $('ahMetaRow').innerHTML=mh;
  $('ahSeasonLabel').textContent='Season 01';$('ahSeasonDropdown').style.display=ts>1?'inline-flex':'none';
  var _lm={original:'Original Audio',english:'English dub',hindi:'Hindi dub',tamil:'Tamil dub',telugu:'Telugu dub'};$('ahLangLabel').textContent=_lm[S.lang]||'Hindi dub';
  var ie=$('ahPlayerIframe');ie.style.display='block';ie.src='about:blank';$('ahNowPlaying').classList.remove('show');$('ahStreamBadge').classList.remove('show');
  loadStream(a,1);rEpChips();rRecGrid();upListBtn();
  $('ahFloatDl').innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download';$('ahFloatDl').onclick=function(){openDlSheet();};
  $('ahOverlay').classList.add('active');$('ahOverlay').scrollTop=0;document.body.style.overflow='hidden';
}
function closeDetail(){$('ahOverlay').classList.remove('active');var ie=$('ahPlayerIframe');ie.src='about:blank';ie.style.display='block';clearTimeout(ie._ft);document.body.style.overflow='';$('ahNowPlaying').classList.remove('show');$('ahStreamBadge').classList.remove('show');closeLS();closeDS();}

function rEpChips(){var c=$('ahEpChips');c.innerHTML='';var se=S.eps.episodes.filter(function(e){return e.season===S.ssn;});var ac=document.createElement('button');ac.className='ah-ep-chip all'+(S.aep===-1?' active':'');ac.textContent='All';ac.onclick=function(){S.aep=-1;rEpChips();};c.appendChild(ac);se.forEach(function(e){var ch=document.createElement('button');ch.className='ah-ep-chip'+(S.aep===e.globalEp?' active':'');ch.textContent=String(e.episode).padStart(2,'0');ch.onclick=function(){S.aep=e.globalEp;rEpChips();loadStream(S.anime,e.globalEp);$('ahPlayerWrap').scrollIntoView({behavior:'smooth'});};c.appendChild(ch);});}
function upListBtn(){var b=$('ahListBtn');if(!S.anime)return;var il=U.isSaved(S.anime.id);b.innerHTML=il?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> In List':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> + List';b.style.color=il?'#22c55e':'';}
function tgList(){if(!S.anime)return;toast(U.toggleSave(S.anime)?'Added to My List ❤️':'Removed from My List');upListBtn();}
function rRecGrid(){var c=$('ahRecGrid');c.innerHTML='';var r=ANIME_DATA.filter(function(a){return a.id!==S.anime.id;}).slice(0,6);r.forEach(function(a,i){var d=document.createElement('div');d.className='ah-rec-card';var hd=a.hindi||(a.langDubs&&a.langDubs.hindi);d.innerHTML='<img src="'+a.poster+'" alt="'+a.title+'" loading="lazy" onerror="this.onerror=null;this.src=\'https://picsum.photos/300/450\';" /><span class="ah-rec-badge'+(i%2?' white':'')+'">'+(hd?'Hindi':'Dub')+'</span><div class="ah-rec-card-overlay"><div class="ah-rec-card-title">'+a.title+'</div></div>';d.addEventListener('click',function(){openDetail(a);});c.appendChild(d);});}

function openLS(){$('ahLangSheetOverlay').classList.add('active');$$('.ah-lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===S.lang);if(S.anime&&S.anime.langDubs){var l=b.dataset.lang;if(l!=='original')b.style.opacity=S.anime.langDubs[l]?'1':'0.35';}});}
function closeLS(){$('ahLangSheetOverlay').classList.remove('active');}
function selLang(l){if(!S.anime){closeLS();return;}var _lm={original:'Original Audio',english:'English dub',hindi:'Hindi dub',tamil:'Tamil dub',telugu:'Telugu dub'};S.lang=l;$('ahLangLabel').textContent=_lm[l]||'Hindi dub';$('ahDlLangLabel').textContent=_lm[l]||'Hindi dub';closeLS();loadStream(S.anime,S.aep);toast('Switched to '+(_lm[l]||l));}

function openDlSheet(){if(!S.eps)return;S.dlSel=new Set();S.dlQ='1080p';$('ahDlSheetOverlay').classList.add('active');var _lm={original:'Original Audio',english:'English dub',hindi:'Hindi dub',tamil:'Tamil dub',telugu:'Telugu dub'};$('ahDlLangLabel').textContent=_lm[S.lang]||'Hindi dub';$('ahDlSeasonLabel').textContent='Season '+String(S.ssn).padStart(2,'0');$$('.ah-qual-btn').forEach(function(b){b.classList.toggle('active',b.dataset.quality===S.dlQ);});rDlEps();$('ahDlSelectAll').checked=false;}
function closeDS(){$('ahDlSheetOverlay').classList.remove('active');}
function rDlEps(){var c=$('ahDlEpisodes');c.innerHTML='';var se=S.eps.episodes.filter(function(e){return e.season===S.ssn;});var _lm={original:'Original Audio',english:'English dub',hindi:'Hindi dub',tamil:'Tamil dub',telugu:'Telugu dub'};se.forEach(function(e){var bs=parseFloat(e.size),as=S.dlQ==='1080p'?(bs*1.6).toFixed(1):bs;var r=document.createElement('div');r.className='ah-dl-ep'+(S.dlSel&&S.dlSel.has(e.globalEp)?' sel':'');r.innerHTML='<div class="ah-dl-ep-radio"></div><div class="ah-dl-ep-info"><div class="ah-dl-ep-title">'+e.title+' — '+(S.anime?S.anime.title:'')+' ['+S.dlQ.toUpperCase()+']</div><div class="ah-dl-ep-meta">'+as+'MB | '+e.duration+' | '+(_lm[S.lang]||'Hindi')+' | MP4</div></div>';r.addEventListener('click',function(){if(S.dlSel.has(e.globalEp))S.dlSel.delete(e.globalEp);else S.dlSel.add(e.globalEp);rDlEps();$('ahDlSelectAll').checked=S.dlSel.size===se.length;});c.appendChild(r);});}

// ─── EVENTS ───
function $$(sel){return document.querySelectorAll(sel);}

function setupEvents(){
  $('ahBackBtn').addEventListener('click',closeDetail);
  $('ahListBtn').addEventListener('click',tgList);
  $('ahShareBtn').addEventListener('click',function(){if(!S.anime)return;if(navigator.share)navigator.share({title:S.anime.title,url:window.location.href});else navigator.clipboard.writeText(window.location.href).then(function(){toast('Link copied!');});});
  $('ahDownloadBtn').addEventListener('click',openDlSheet);
  $('ahLangDropdown').addEventListener('click',openLS);
  $('ahSeasonDropdown').addEventListener('click',function(){if(!S.eps||S.eps.totalSeasons<=1)return;S.ssn=S.ssn>=S.eps.totalSeasons?1:S.ssn+1;$('ahSeasonLabel').textContent='Season '+String(S.ssn).padStart(2,'0');var f=S.eps.episodes.find(function(e){return e.season===S.ssn;});if(f){S.aep=f.globalEp;loadStream(S.anime,f.globalEp);}rEpChips();});
  $('ahLangSheetClose').addEventListener('click',closeLS);$('ahLangSheetOverlay').addEventListener('click',function(e){if(e.target===e.currentTarget)closeLS();});
  $$('.ah-lang-btn').forEach(function(b){b.addEventListener('click',function(){selLang(b.dataset.lang);});});
  $('ahDlSheetClose').addEventListener('click',closeDS);$('ahDlSheetOverlay').addEventListener('click',function(e){if(e.target===e.currentTarget)closeDS();});
  $$('.ah-qual-btn').forEach(function(b){b.addEventListener('click',function(){S.dlQ=b.dataset.quality;$$('.ah-qual-btn').forEach(function(q){q.classList.toggle('active',q.dataset.quality===S.dlQ);});rDlEps();});});
  $('ahDlLangDropdown').addEventListener('click',openLS);
  $('ahDlSeasonDropdown').addEventListener('click',function(){if(!S.eps||S.eps.totalSeasons<=1)return;S.ssn=S.ssn>=S.eps.totalSeasons?1:S.ssn+1;$('ahDlSeasonLabel').textContent='Season '+String(S.ssn).padStart(2,'0');rDlEps();$('ahDlSelectAll').checked=false;});
  $('ahDlSelectAll').addEventListener('change',function(e){var se=S.eps.episodes.filter(function(ep){return ep.season===S.ssn;});if(!S.dlSel)S.dlSel=new Set();if(e.target.checked)se.forEach(function(ep){S.dlSel.add(ep.globalEp);});else se.forEach(function(ep){S.dlSel.delete(ep.globalEp);});rDlEps();});
  $('ahDlAction').addEventListener('click',function(){if(!S.dlSel||S.dlSel.size===0){toast('Select at least one episode');return;}var cnt=0;S.eps.episodes.forEach(function(ep){if(S.dlSel.has(ep.globalEp)){cnt++;dlEp(S.anime,ep,S.dlQ);}});toast('✔ Downloading '+cnt+' episode(s)');closeDS();});
}
function setupBotNav(){$$('.ah-bot-item').forEach(function(it){it.addEventListener('click',function(){var n=it.dataset.nav;$$('.ah-bot-item').forEach(function(x){x.classList.remove('active');});it.classList.add('active');if(n==='home'){window.scrollTo({top:0,behavior:'smooth'});}else if(n==='explore'){window.scrollTo({top:0,behavior:'smooth'});toast('🔍 Scroll to explore anime');}else if(n==='downloads'){var d=U.dls();toast(d.length>0?'📥 '+d.length+' downloads':'No downloads yet');}else if(n==='login'){toast('👤 Sign in to save your history & bookmarks');}});});}
function setupOwnerAvatar(){var b=document.querySelector('.ah-owner-avatar');if(b)b.addEventListener('click',function(){toast('👑 Welcome back, Owner!');});}
function setupKbd(){document.addEventListener('keydown',function(e){if(e.key==='Escape'){if($('ahDlSheetOverlay').classList.contains('active')){closeDS();return;}if($('ahLangSheetOverlay').classList.contains('active')){closeLS();return;}if($('ahOverlay').classList.contains('active')){closeDetail();return;}}});}

// ─── INIT ───
function init(){renderAll(false);setupEvents();setupKbd();setupIS();setTimeout(function(){S.page=1;renderAll(true);},300);console.log('%c[AnimeHub v16] Ultra-Clean Grid · 500+ Jikan · 2s Embed', 'color:#22c55e;font-size:14px;');}
init();
