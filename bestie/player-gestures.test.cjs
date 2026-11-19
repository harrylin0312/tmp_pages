const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPlayerGestures}=require('./player-gestures.js');
function setup(){let time=0,next=0,toggles=0,seeks=[],timers=new Map();const g=createPlayerGestures({togglePlayback:()=>toggles++,seekBy:d=>seeks.push(d),now:()=>time,schedule:(f,ms)=>{timers.set(++next,{f,at:time+ms});return next},cancel:id=>timers.delete(id)});return {g,advance(ms){time+=ms;for(const [id,t]of [...timers])if(t.at<=time){timers.delete(id);t.f()}},get toggles(){return toggles},seeks}}
test('one tap toggles playback once after the double-tap window',()=>{const s=setup();s.g.tap(100,1000);assert.equal(s.toggles,0);s.advance(301);assert.equal(s.toggles,1);assert.deepEqual(s.seeks,[])});
test('left double tap rewinds five seconds without toggling playback',()=>{const s=setup();s.g.tap(100,1000);s.advance(120);s.g.tap(100,1000);s.advance(500);assert.deepEqual(s.seeks,[-5]);assert.equal(s.toggles,0)});
test('right double tap advances five seconds without toggling playback',()=>{const s=setup();s.g.tap(900,1000);s.advance(120);s.g.tap(900,1000);s.advance(500);assert.deepEqual(s.seeks,[5]);assert.equal(s.toggles,0)});
test('continued taps add five seconds per tap',()=>{const s=setup();s.g.tap(900,1000);s.advance(100);s.g.tap(900,1000);s.advance(100);s.g.tap(900,1000);s.advance(500);assert.deepEqual(s.seeks,[5,5]);assert.equal(s.toggles,0)});
test('reset cancels a pending tap when another control takes focus',()=>{const s=setup();s.g.tap(500,1000);s.g.reset();s.advance(500);assert.equal(s.toggles,0)});
