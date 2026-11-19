(function(root){
 function fitVideo(width,height,bar=0){
  const available=Math.max(0,height-bar),w=Math.min(width,available*16/9),h=w*9/16;
  return {left:(width-w)/2,top:bar+(available-h)/2,width:w,height:h};
 }
 if(typeof module==='object')module.exports={fitVideo};else root.fitVideo=fitVideo;
})(typeof window==='object'?window:globalThis);
