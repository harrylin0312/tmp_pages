'use strict';
const $=id=>document.getElementById(id);let cues=[],player,ready=false,active=-1,buttons=[],query='',lastFollow=0;const duration=2515;const fmt=t=>`${Math.floor(Math.max(0,t)/60).toString().padStart(2,'0')}:${Math.floor(Math.max(0,t)%60).toString().padStart(2,'0')}`;
let prefs={};try{prefs=JSON.parse(localStorage.getItem('bestie-prefs')||'{}')}catch{}
if(prefs.layoutVersion!==2){prefs.bilingual=false;prefs.size=20;prefs.layoutVersion=2}
for(const id of ['bilingual','size','offset','speed','follow']){if(prefs[id]!==undefined){if($(id).type==='checkbox')$(id).checked=prefs[id];else $(id).value=prefs[id]}$(id).addEventListener('change',()=>{save();if(id==='bilingual')render();if(id==='speed'&&ready)player.setPlaybackRate(Number($('speed').value));update(true)})}
function save(){for(const id of ['bilingual','size','offset','speed','follow'])prefs[id]=$(id).type==='checkbox'?$(id).checked:$(id).value;try{localStorage.setItem('bestie-prefs',JSON.stringify(prefs))}catch{}document.documentElement.style.setProperty('--caption-size',`${Number($('size').value)}px`);$('ko').hidden=!$('bilingual').checked;$('toggle-korean').textContent=$('bilingual').checked?'韓文：開':'韓文：關';$('toggle-korean').setAttribute('aria-pressed',String($('bilingual').checked))}
save();$('size').addEventListener('input',save);
$('toggle-korean').onclick=()=>{$('bilingual').checked=!$('bilingual').checked;save();render();update(true)};
for(const [id,delta] of [['smaller',-2],['larger',2]])$(id).onclick=()=>{$('size').value=Math.max(12,Math.min(32,Number($('size').value)+delta));save()};
function seek(t){if(!ready){$('status').textContent='播放器尚未就緒，請稍候或在 YouTube 開啟原片。';return}player.seekTo(Math.max(0,Math.min(duration,t)),true);player.playVideo();update(true)}
$('back').onclick=()=>ready&&seek(player.getCurrentTime()-5);$('forward').onclick=()=>ready&&seek(player.getCurrentTime()+5);$('play').onclick=()=>{if(ready){player.getPlayerState()===1?player.pauseVideo():player.playVideo()}else $('status').textContent='播放器尚未載入。請確認網路連線，或使用上方原片連結。'};
$('fullscreen').onclick=async()=>{const stage=$('stage');if(document.fullscreenElement){await document.exitFullscreen();return}if(stage.classList.contains('theater')){stage.classList.remove('theater');$('fullscreen').textContent='全螢幕';return}try{if(!stage.requestFullscreen)throw new Error();await stage.requestFullscreen()}catch{stage.classList.add('theater');$('fullscreen').textContent='離開全螢幕'}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'離開全螢幕':'全螢幕'});document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('stage').classList.remove('theater');$('fullscreen').textContent='全螢幕'}});
function find(t){let lo=0,hi=cues.length-1,ans=-1;while(lo<=hi){const m=(lo+hi)>>1;if(cues[m].start<=t){ans=m;lo=m+1}else hi=m-1}return ans>=0&&t<cues[ans].end?ans:-1}
function update(force=false){if(!ready&&!force)return;const time=ready?player.getCurrentTime():0;const t=time+(Number($('offset').value)||0);$('clock').textContent=`${fmt(time)} / 41:55`;if(!scrubbing)$('viewer-seek').value=time;const i=find(t);if(i!==active||force){if(active>=0)buttons[active]?.classList.remove('active');active=i;const cue=cues[i];$('zh').textContent=cue?cue.zh:(time>0?'（此處無對話或正在播放音樂）':'按下播放，字幕會隨影片顯示。');$('ko').textContent=cue?.ko||'';if(i>=0){const b=buttons[i];b?.classList.add('active');if(b&&$('follow').checked&&!query&&Date.now()-lastFollow>2000){const list=$('transcript');list.scrollTo({top:b.offsetTop-list.offsetTop-list.clientHeight/2+b.clientHeight/2,behavior:'smooth'})}}}}
function render(){const frag=document.createDocumentFragment();buttons=[];let count=0;for(let i=0;i<cues.length;i++){const c=cues[i];if(query&&!`${c.zh} ${c.ko}`.toLowerCase().includes(query))continue;count++;const b=document.createElement('button');b.type='button';b.className='cue'+(i===active?' active':'');b.setAttribute('aria-label',`${fmt(c.start)} ${c.zh}`);const time=document.createElement('time');time.textContent=fmt(c.start);const body=document.createElement('span');body.textContent=c.zh;if($('bilingual').checked){const ko=document.createElement('small');ko.lang='ko';ko.textContent=c.ko;body.append(ko)}b.append(time,body);b.onclick=()=>seek(c.start-(Number($('offset').value)||0));buttons[i]=b;frag.append(b)}$('transcript').replaceChildren(frag);$('results').textContent=query?`找到 ${count} 段`:`共 ${cues.length} 段 · 點選文字即可跳轉`}
$('search').addEventListener('input',()=>{query=$('search').value.trim().toLowerCase();render()});$('transcript').addEventListener('wheel',()=>lastFollow=Date.now(),{passive:true});$('transcript').addEventListener('touchstart',()=>lastFollow=Date.now(),{passive:true});
$('download').onclick=()=>{if(!cues.length)return;const ts=t=>{let ms=Math.max(0,Math.round(t*1000));return `${Math.floor(ms/3600000).toString().padStart(2,'0')}:${(Math.floor(ms/60000)%60).toString().padStart(2,'0')}:${(Math.floor(ms/1000)%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};const srt=cues.map((c,i)=>`${i+1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.zh}\n`).join('\n');const url=URL.createObjectURL(new Blob(['\ufeff'+srt],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='BESTie-261118.zh-Hant.srt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};

let chromeTimer,scrubbing=false;
const stage=$('stage'),chrome=$('viewer-chrome');
function setChrome(show){
 clearTimeout(chromeTimer);stage.classList.toggle('controls-visible',show);chrome.inert=!show;
 if(!show){$('viewer-panel').hidden=true;$('viewer-settings').setAttribute('aria-expanded','false');if(chrome.contains(document.activeElement))document.activeElement.blur()}
 if(show&&ready&&player.getPlayerState()===1&&$('viewer-panel').hidden&&!scrubbing)chromeTimer=setTimeout(()=>setChrome(false),2800);
}
$('viewer-surface').onclick=()=>setChrome(!stage.classList.contains('controls-visible'));
$('viewer-settings').onclick=()=>{const open=$('viewer-panel').hidden;$('viewer-panel').hidden=!open;$('viewer-settings').setAttribute('aria-expanded',String(open));setChrome(true)};
$('viewer-back').onclick=()=>{$('back').click();setChrome(true)};
$('viewer-forward').onclick=()=>{$('forward').click();setChrome(true)};
$('viewer-play').onclick=()=>{$('play').click();setChrome(true)};
$('viewer-seek').addEventListener('input',()=>{scrubbing=true;clearTimeout(chromeTimer);$('clock').textContent=`${fmt(Number($('viewer-seek').value))} / 41:55`});
$('viewer-seek').addEventListener('change',()=>{seek(Number($('viewer-seek').value));scrubbing=false;setChrome(true)});
chrome.addEventListener('pointerdown',()=>{clearTimeout(chromeTimer)});
chrome.addEventListener('pointerup',()=>setChrome(true));
stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')setChrome(true)});
chrome.addEventListener('focusin',()=>setChrome(true));
const landscape=matchMedia('(orientation: landscape) and (max-height: 600px)');
function updateFocusView(){document.body.classList.toggle('focus-view',landscape.matches);setChrome(true)}
landscape.addEventListener('change',updateFocusView);updateFocusView();

function hideNativeCaptions(){try{if(player&&player.getOptions().includes('captions'))player.unloadModule('captions')}catch{}}
window.onYouTubeIframeAPIReady=()=>{player=new YT.Player('player',{videoId:'lZVbK5Iz-_A',playerVars:{controls:0,disablekb:1,playsinline:1,rel:0,fs:0,cc_load_policy:0,origin:location.origin},events:{onApiChange:hideNativeCaptions,onReady:()=>{ready=true;hideNativeCaptions();player.setPlaybackRate(Number($('speed').value));$('status').textContent='播放器已就緒。點一下畫面可顯示控制列，字幕設定內可開關韓文與調整字級。';setInterval(()=>update(),120)},onStateChange:e=>{if(e.data===1)hideNativeCaptions();$('play').textContent=e.data===1?'暫停':'播放';$('viewer-play').textContent=e.data===1?'暫停':'播放';setChrome(true)},onError:e=>{$('status').textContent=`YouTube 播放器無法播放（${e.data}）。可用上方原片連結開啟，並下載中文字幕 SRT。`}}})};
fetch('subtitles.json').then(r=>{if(!r.ok)throw new Error('字幕載入失敗');return r.json()}).then(data=>{cues=data;render();update(true)}).catch(()=>{$('zh').textContent='字幕載入失敗，請重新整理頁面。';$('status').textContent='無法載入字幕檔案。'});const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{$('status').textContent='YouTube 播放器載入失敗，請檢查網路或使用原片連結。'};document.head.append(script);
