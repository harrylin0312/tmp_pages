'use strict';
const radio={id:'lZVbK5Iz-_A',duration:2515,language:'ko',label:'韓文',
 title:'BESTie 電台訪談',edition:'SBS RADIO · 2026.11.18',
 subtitles:'subtitles.json',prefs:'bestie-prefs',download:'BESTie-261118',
 note:'依韓語原音辨識、翻譯並校訂；演唱段落顯示歌曲提示。'};
const potluck={id:'prw6wJGJroI',duration:2026,language:'en',label:'英文',
 title:'BESTie 聚餐特輯',edition:'꼰대희 · 2026.11.21',
 subtitles:'potluck-subtitles.json',prefs:'bestie-potluck-prefs',download:'BESTie-potluck',
 note:'依原片英文字幕的時間碼翻成繁體中文。中文為機器翻譯並局部校訂。'};
const episode=new URLSearchParams(location.search).get('episode')==='potluck'?potluck:radio;

const $=id=>document.getElementById(id);let cues=[],player,ready=false,active=-1,buttons=[],query='',lastFollow=0;const {duration}=episode;const fmt=t=>`${Math.floor(Math.max(0,t)/60).toString().padStart(2,'0')}:${Math.floor(Math.max(0,t)%60).toString().padStart(2,'0')}`;
document.title=episode.title;
$('episode-title').textContent=episode.title;
$('episode-edition').textContent=episode.edition;
$('episode-footer').textContent=episode.title;
$('subtitle-note').textContent=episode.note;
$('original-video').href='https://www.youtube.com/watch?v='+episode.id;
$('viewer-seek').max=duration;
$('clock').textContent='00:00 / '+fmt(duration);
$('ko').lang=episode.language;
$('bilingual-label').textContent=episode.label+'對照';
$('search').placeholder='搜尋中文或'+episode.label+'內容';
for(const link of document.querySelectorAll('[data-episode]')){
 if(link.dataset.episode===(episode===potluck?'potluck':'radio'))link.setAttribute('aria-current','page');
}

let prefs={};try{prefs=JSON.parse(localStorage.getItem(episode.prefs)||'{}')}catch{}
if(prefs.layoutVersion!==2){prefs.bilingual=false;prefs.size=20;prefs.layoutVersion=2}
for(const id of ['bilingual','size','offset','speed','follow']){if(prefs[id]!==undefined){if($(id).type==='checkbox')$(id).checked=prefs[id];else $(id).value=prefs[id]}$(id).addEventListener('change',()=>{save();if(id==='bilingual')render();if(id==='speed'&&ready)player.setPlaybackRate(Number($('speed').value));update(true)})}
function save(){for(const id of ['bilingual','size','offset','speed','follow'])prefs[id]=$(id).type==='checkbox'?$(id).checked:$(id).value;try{localStorage.setItem(episode.prefs,JSON.stringify(prefs))}catch{}document.documentElement.style.setProperty('--caption-size',`${Number($('size').value)}px`);$('ko').hidden=!$('bilingual').checked;$('toggle-korean').textContent=$('bilingual').checked?episode.label+'：開':episode.label+'：關';$('toggle-korean').setAttribute('aria-pressed',String($('bilingual').checked))}
save();$('size').addEventListener('input',save);
$('toggle-korean').onclick=()=>{$('bilingual').checked=!$('bilingual').checked;save();render();update(true)};
for(const [id,delta] of [['smaller',-2],['larger',2]])$(id).onclick=()=>{$('size').value=Math.max(12,Math.min(32,Number($('size').value)+delta));save()};
function seek(t,{play=true}={}){if(!ready){$('status').textContent='播放器尚未就緒，請稍候或在 YouTube 開啟原片。';return}player.seekTo(Math.max(0,Math.min(duration,t)),true);if(play)player.playVideo();update(true)}
$('back').onclick=()=>ready&&seek(player.getCurrentTime()-5);$('forward').onclick=()=>ready&&seek(player.getCurrentTime()+5);$('play').onclick=()=>{if(ready){player.getPlayerState()===1?player.pauseVideo():player.playVideo()}else $('status').textContent='播放器尚未載入。請確認網路連線，或使用上方原片連結。'};
const icons={
 play:'<path d="M8 5v14l11-7z"/>',
 pause:'<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>',
 full:'<path d="M4 4h6v3H7v3H4zm10 0h6v6h-3V7h-3zM4 14h3v3h3v3H4zm13 0h3v6h-6v-3h3z"/>',
 exit:'<path d="M7 4h3v6H4V7h3zm7 0h3v3h3v3h-6zM4 14h6v6H7v-3H4zm10 0h6v3h-3v3h-3z"/>',
 gear:'<path d="m19.4 13 .1-1-.1-1 2-1.5-2-3.4-2.3 1a8 8 0 0 0-1.7-1L15 3h-4l-.4 2.1a8 8 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5-.1 1 .1 1-2 1.5 2 3.4 2.3-1a8 8 0 0 0 1.7 1L11 20h4l.4-2.1a8 8 0 0 0 1.7-1l2.3 1 2-3.4zM13 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8" fill-rule="evenodd"/>',
 back:'<path d="M11 6V2L5 8l6 6v-4a6 6 0 1 1-6 6H2A9 9 0 1 0 11 6"/><text x="13" y="19" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">5</text>',
 forward:'<path d="M13 6V2l6 6-6 6v-4a6 6 0 1 0 6 6h3A9 9 0 1 1 13 6"/><text x="11" y="19" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">5</text>'
};
const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
function iconButton(id,name,label){$(id).innerHTML=svg(name);$(id).setAttribute('aria-label',label);$(id).title=label}
function syncPlaybackUI(){const playing=ready&&player.getPlayerState()===1;for(const id of ['viewer-play','viewer-center-play'])iconButton(id,playing?'pause':'play',playing?'暫停':'播放')}
function syncFullscreenUI(){const full=!!(document.fullscreenElement||document.webkitFullscreenElement||$('stage').classList.contains('theater'));iconButton('fullscreen',full?'exit':'full',full?'離開全螢幕':'全螢幕');document.body.classList.toggle('theater-open',full);setChrome(true)}
$('fullscreen').onclick=async()=>{
 const el=$('stage'),active=document.fullscreenElement||document.webkitFullscreenElement;
 if(active){try{await (document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch{}return}
 if(el.classList.contains('theater')){el.classList.remove('theater');syncFullscreenUI();return}
 try{if(el.requestFullscreen)await el.requestFullscreen({navigationUI:'hide'});else if(el.webkitRequestFullscreen)await el.webkitRequestFullscreen();else throw new Error('fullscreen unavailable')}catch{el.classList.add('theater')}
 syncFullscreenUI();
};
for(const name of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(name,syncFullscreenUI);
document.addEventListener('keydown',e=>{
 if(nativeMode||e.target.closest('button,a,input,select,textarea,[contenteditable=true]'))return;
 if(e.key==='Escape'){$('stage').classList.remove('theater');syncFullscreenUI()}
 if(e.code==='Space'||e.key.toLowerCase()==='k'){e.preventDefault();$('play').click();setChrome(true)}
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();skipSeconds(e.key==='ArrowLeft'?-5:5)}
 if(e.key.toLowerCase()==='f'){e.preventDefault();$('fullscreen').click()}
});
function find(t){let lo=0,hi=cues.length-1,ans=-1;while(lo<=hi){const m=(lo+hi)>>1;if(cues[m].start<=t){ans=m;lo=m+1}else hi=m-1}return ans>=0&&t<cues[ans].end?ans:-1}
function update(force=false){if(!ready&&!force)return;const time=ready?player.getCurrentTime():0;const t=time+(Number($('offset').value)||0);$('clock').textContent=`${fmt(time)} / ${fmt(duration)}`;if(!scrubbing)$('viewer-seek').value=time;const pct=Math.max(0,Math.min(100,time/duration*100));$('viewer-seek').style.setProperty('--played',`${pct}%`);const i=find(t);if(i!==active||force){if(active>=0)buttons[active]?.classList.remove('active');active=i;const cue=cues[i];$('zh').textContent=cue?cue.zh:(time>0?'（此處無對話或正在播放音樂）':'按下播放，字幕會隨影片顯示。');$('ko').textContent=cue?.[episode.language]||'';if(i>=0){const b=buttons[i];b?.classList.add('active');if(b&&$('follow').checked&&!query&&Date.now()-lastFollow>2000){const list=$('transcript');list.scrollTo({top:b.offsetTop-list.offsetTop-list.clientHeight/2+b.clientHeight/2,behavior:'smooth'})}}}}
function render(){const frag=document.createDocumentFragment();buttons=[];let count=0;for(let i=0;i<cues.length;i++){const c=cues[i];if(query&&!`${c.zh} ${c[episode.language]}`.toLowerCase().includes(query))continue;count++;const b=document.createElement('button');b.type='button';b.className='cue'+(i===active?' active':'');b.setAttribute('aria-label',`${fmt(c.start)} ${c.zh}`);const time=document.createElement('time');time.textContent=fmt(c.start);const body=document.createElement('span');body.textContent=c.zh;if($('bilingual').checked){const ko=document.createElement('small');ko.lang=episode.language;ko.textContent=c[episode.language];body.append(ko)}b.append(time,body);b.onclick=()=>seek(c.start-(Number($('offset').value)||0));buttons[i]=b;frag.append(b)}$('transcript').replaceChildren(frag);$('results').textContent=query?`找到 ${count} 段`:`共 ${cues.length} 段 · 點選文字即可跳轉`}
$('search').addEventListener('input',()=>{query=$('search').value.trim().toLowerCase();render()});$('transcript').addEventListener('wheel',()=>lastFollow=Date.now(),{passive:true});$('transcript').addEventListener('touchstart',()=>lastFollow=Date.now(),{passive:true});
$('download').onclick=()=>{if(!cues.length)return;const ts=t=>{let ms=Math.max(0,Math.round(t*1000));return `${Math.floor(ms/3600000).toString().padStart(2,'0')}:${(Math.floor(ms/60000)%60).toString().padStart(2,'0')}:${(Math.floor(ms/1000)%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};const srt=cues.map((c,i)=>`${i+1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.zh}\n`).join('\n');const url=URL.createObjectURL(new Blob(['\ufeff'+srt],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=episode.download+'.zh-Hant.srt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

let chromeTimer,scrubbing=false,nativeMode=false,playerGeneration=0,updateTimer,nativeCaptionsInitialized=false;
const stage=$('stage'),chrome=$('viewer-chrome');
function setChrome(show){
 if(nativeMode){clearTimeout(chromeTimer);stage.classList.remove('controls-visible');chrome.inert=true;return}
 clearTimeout(chromeTimer);stage.classList.toggle('controls-visible',show);chrome.inert=!show;
 if(!show){$('viewer-panel').hidden=true;$('viewer-settings').setAttribute('aria-expanded','false');if(chrome.contains(document.activeElement))document.activeElement.blur()}
 if(show&&ready&&player.getPlayerState()===1&&$('viewer-panel').hidden&&!scrubbing)chromeTimer=setTimeout(()=>setChrome(false),2800);
}
let feedbackTimer,feedbackTotal=0,feedbackDirection=0,skipTarget=null,lastSkipAt=-Infinity;
function skipSeconds(delta){
 if(!ready)return;
 const now=Date.now(),base=skipTarget!==null&&now-lastSkipAt<750?skipTarget:player.getCurrentTime();skipTarget=Math.max(0,Math.min(duration,base+delta));lastSkipAt=now;seek(skipTarget,{play:player.getPlayerState()===1});
 const direction=Math.sign(delta);feedbackTotal=direction===feedbackDirection?feedbackTotal+Math.abs(delta):Math.abs(delta);feedbackDirection=direction;
 const feedback=$('seek-feedback');feedback.dataset.side=direction<0?'left':'right';$('seek-arrows').innerHTML='<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M3 5v14l11-7zm13 0v14l11-7z"/></svg>';$('seek-label').textContent=`${feedbackTotal} 秒`;
 feedback.classList.remove('flash');void feedback.offsetWidth;feedback.classList.add('flash');clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{feedback.classList.remove('flash');feedbackTotal=0;feedbackDirection=0},750);
 setChrome(true);
}
const gestures=createPlayerGestures({onSingleTap:()=>setChrome(!stage.classList.contains('controls-visible')),seekBy:skipSeconds,onInteraction:()=>{$('viewer-panel').hidden=true;$('viewer-settings').setAttribute('aria-expanded','false');clearTimeout(chromeTimer)}});
bindPlayerSurface($('viewer-surface'),gestures);
$('viewer-center-play').onclick=()=>{gestures.reset();$('play').click();setChrome(true)};
$('viewer-settings').onclick=()=>{const open=$('viewer-panel').hidden;$('viewer-panel').hidden=!open;$('viewer-settings').setAttribute('aria-expanded',String(open));setChrome(true)};
$('viewer-back').onclick=()=>skipSeconds(-5);
$('viewer-forward').onclick=()=>skipSeconds(5);
$('viewer-play').onclick=()=>{$('play').click();setChrome(true)};
$('viewer-seek').addEventListener('input',()=>{scrubbing=true;clearTimeout(chromeTimer);$('clock').textContent=`${fmt(Number($('viewer-seek').value))} / ${fmt(duration)}`});
$('viewer-seek').addEventListener('change',()=>{seek(Number($('viewer-seek').value));scrubbing=false;setChrome(true)});
chrome.addEventListener('pointerdown',e=>{e.stopPropagation();gestures.reset();clearTimeout(chromeTimer)});
chrome.addEventListener('pointerup',e=>{e.stopPropagation();setChrome(true)});
chrome.addEventListener('click',e=>e.stopPropagation());
chrome.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation()});
stage.addEventListener('pointermove',e=>{if(!nativeMode&&e.pointerType==='mouse'&&e.target===$('viewer-surface'))setChrome(true)});
chrome.addEventListener('focusin',()=>setChrome(true));
const landscape=matchMedia('(orientation: landscape) and (max-height: 600px)');
function updateFocusView(){document.body.classList.toggle('focus-view',landscape.matches);setChrome(true)}
landscape.addEventListener('change',updateFocusView);updateFocusView();
iconButton('viewer-settings','gear','字幕設定');iconButton('viewer-back','back','倒退五秒');iconButton('viewer-forward','forward','快轉五秒');syncPlaybackUI();syncFullscreenUI();

function hideNativeCaptions(){try{if(player&&player.getOptions().includes('captions')){player.unloadModule('captions');nativeCaptionsInitialized=true}}catch{}}
function applyInputMode(){
 const wrap=stage.querySelector('.video-wrap'),iframe=player?.getIframe?.();
 stage.classList.toggle('native-mode',nativeMode);wrap.inert=!nativeMode;wrap.setAttribute('aria-hidden',String(!nativeMode));
 if(iframe){iframe.inert=!nativeMode;iframe.tabIndex=nativeMode?0:-1}
 $('viewer-surface').disabled=nativeMode;$('viewer-surface').inert=nativeMode;$('native-bar').hidden=!nativeMode;
 setChrome(!nativeMode);updateVideoLayout();
}
function changeInputMode(next){
 if(next===nativeMode||!ready)return;
 gestures.reset();scrubbing=false;$('viewer-panel').hidden=true;$('viewer-settings').setAttribute('aria-expanded','false');clearTimeout(chromeTimer);
 nativeMode=next;applyInputMode();
}
$('open-native').onclick=()=>changeInputMode(true);
$('close-native').onclick=()=>changeInputMode(false);
function initPlayer({time=0,playing=false,rate=Number($('speed').value)}={}){
 const generation=++playerGeneration;nativeCaptionsInitialized=false;
 player=new YT.Player('player',{videoId:episode.id,playerVars:{controls:1,disablekb:0,playsinline:1,rel:0,fs:0,cc_load_policy:0,start:Math.floor(time),origin:location.origin},events:{
 onApiChange:()=>{if(generation===playerGeneration&&(!nativeMode||!nativeCaptionsInitialized))hideNativeCaptions()},
 onReady:()=>{if(generation!==playerGeneration)return;ready=true;hideNativeCaptions();player.setPlaybackRate(rate);if(playing)player.playVideo();applyInputMode();syncPlaybackUI();$('status').textContent='點一下顯示或隱藏控制列；左右雙擊移動 5 秒。齒輪內可進入 YouTube 畫質設定。';clearInterval(updateTimer);updateTimer=setInterval(()=>update(),120)},
 onStateChange:e=>{if(generation!==playerGeneration)return;if(e.data===1)hasPlayed=true;if(e.data===2)saveProgress();if(e.data===0){saveProgress(true);hasPlayed=false}if(e.data===1&&(!nativeMode||!nativeCaptionsInitialized))hideNativeCaptions();$('play').textContent=e.data===1?'暫停':'播放';syncPlaybackUI();setChrome(true)},
 onError:e=>{if(generation===playerGeneration)$('status').textContent=`YouTube 播放器無法播放（${e.data}）。可使用上方原片連結。`}
 }});
 applyInputMode();
}
const progressKey='tmp-pages-progress:'+episode.id;
function readProgress(){
 try {
  const position=Number(localStorage.getItem(progressKey));
  return Number.isFinite(position)&&position>=2&&position<duration-3?position:0;
 } catch {return 0}
}
let hasPlayed=false;
function saveProgress(ended=false){
 if(!hasPlayed||!ready)return;
 const position=player.getCurrentTime();
 if(!Number.isFinite(position))return;
 try {
  if(ended||position>=duration-3)localStorage.removeItem(progressKey);
  else if(position>=0)localStorage.setItem(progressKey,String(position));
 } catch {}
}
window.addEventListener('pagehide',()=>saveProgress());
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden')saveProgress();
});
setInterval(()=>{if(ready&&player.getPlayerState()===1)saveProgress()},3000);
window.onYouTubeIframeAPIReady=()=>initPlayer({time:readProgress()});
fetch(episode.subtitles).then(r=>{if(!r.ok)throw new Error('字幕載入失敗');return r.json()}).then(data=>{cues=data;render();update(true)}).catch(()=>{$('zh').textContent='字幕載入失敗，請重新整理頁面。';$('status').textContent='無法載入字幕檔案。'});const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{$('status').textContent='YouTube 播放器載入失敗，請檢查網路或使用原片連結。'};document.head.append(script);

function updateVideoLayout(){
 const viewport=window.visualViewport,root=document.documentElement;
 for(const [key,value] of Object.entries({left:viewport?.offsetLeft||0,top:viewport?.offsetTop||0,width:viewport?.width||innerWidth,height:viewport?.height||innerHeight}))root.style.setProperty('--viewport-'+key,value+'px');
 const fitted=document.body.classList.contains('focus-view')||stage.classList.contains('theater')||document.fullscreenElement===stage||document.webkitFullscreenElement===stage||nativeMode;
 stage.classList.toggle('fitted-video',fitted);
 if(!fitted)return;
 const rect=fitVideo(stage.clientWidth,stage.clientHeight,nativeMode?42:0);
 for(const [key,value] of Object.entries(rect))stage.style.setProperty('--video-'+key,value+'px');
}
new ResizeObserver(updateVideoLayout).observe(stage);
for(const event of ['resize','orientationchange'])window.addEventListener(event,updateVideoLayout);
for(const event of ['resize','scroll'])window.visualViewport?.addEventListener(event,updateVideoLayout);
for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,updateVideoLayout);
updateVideoLayout();
