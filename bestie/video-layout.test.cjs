const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fitVideo}=require('./video-layout.js');
for(const [width,height] of [[852,393],[1280,557],[393,852],[1920,1080]])for(const bar of [0,42])test(`16:9 centered without cropping in ${width}x${height}, bar ${bar}`,()=>{
 const r=fitVideo(width,height,bar),epsilon=1e-8;
 assert.ok(Math.abs(r.width/r.height-16/9)<epsilon);
 assert.ok(Math.abs(r.left-(width-r.width-r.left))<epsilon);
 assert.ok(Math.abs(r.top-bar-(height-r.top-r.height))<epsilon);
 assert.ok(r.left>=-epsilon&&r.top>=bar-epsilon&&r.width<=width+epsilon&&r.height<=height-bar+epsilon);
});
