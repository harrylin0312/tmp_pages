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
