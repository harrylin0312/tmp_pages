/* Single tap toggles playback; repeated taps on one side seek in five-second steps. */
(function(root){
 function createPlayerGestures({togglePlayback,seekBy,onInteraction=()=>{},now=()=>Date.now(),schedule=setTimeout,cancel=clearTimeout}){
  let timer=null,lastTime=-Infinity,lastSide=null;
  function clear(){if(timer!==null)cancel(timer);timer=null}
  return {
   tap(x,width){
    const time=now(),side=x<width*.4?'left':x>width*.6?'right':'center';
    onInteraction();
    if(side!=='center'&&side===lastSide&&time-lastTime<320){
     clear();lastTime=time;seekBy(side==='left'?-5:5);return;
    }
    // Finish an earlier unrelated tap before starting a new gesture.
    if(timer!==null){clear();togglePlayback()}
    lastSide=side;lastTime=time;
    timer=schedule(()=>{timer=null;lastSide=null;togglePlayback()},300);
   },
   reset(){clear();lastTime=-Infinity;lastSide=null;streak=false}
  };
 }
 if(typeof module==='object'&&module.exports)module.exports={createPlayerGestures};else root.createPlayerGestures=createPlayerGestures;
})(typeof window!=='undefined'?window:globalThis);

/* Own pointer sequences completely; never replay compatibility clicks into playback. */
(function(root){
 function bindPlayerSurface(surface,gestures,{now=()=>Date.now()}={}){
  let press=null,lastPointerAt=-Infinity;
  const stop=e=>{if(e.cancelable!==false)e.preventDefault();e.stopPropagation()};
  const release=id=>{try{if(surface.hasPointerCapture(id))surface.releasePointerCapture(id)}catch{}};
  const handlers={
   pointerdown(e){stop(e);lastPointerAt=now();if(!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0)){press=null;gestures.reset();return}press={id:e.pointerId,x:e.clientX,y:e.clientY,at:now(),moved:false};try{surface.setPointerCapture(e.pointerId)}catch{}},
   pointermove(e){stop(e);if(press&&press.id===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>18){press.moved=true;gestures.reset()}},
   pointerup(e){stop(e);lastPointerAt=now();const p=press;press=null;release(e.pointerId);if(!p||p.id!==e.pointerId||p.moved||now()-p.at>600)return;const rect=surface.getBoundingClientRect();gestures.tap(e.clientX-rect.left,rect.width)},
   pointercancel(e){stop(e);press=null;release(e.pointerId);gestures.reset()},
   lostpointercapture(){press=null},
   click(e){stop(e);if(e.detail===0&&now()-lastPointerAt>700){const rect=surface.getBoundingClientRect();gestures.tap(rect.width/2,rect.width)}},
   dblclick:stop,
   contextmenu(e){stop(e);press=null;gestures.reset()}
  };
  for(const [name,handler]of Object.entries(handlers))surface.addEventListener(name,handler);
  return ()=>{for(const [name,handler]of Object.entries(handlers))surface.removeEventListener(name,handler);press=null;gestures.reset()};
 }
 if(typeof module==='object'&&module.exports)module.exports.bindPlayerSurface=bindPlayerSurface;else root.bindPlayerSurface=bindPlayerSurface;
})(typeof window!=='undefined'?window:globalThis);
