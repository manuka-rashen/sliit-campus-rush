import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, startGame, action, advance, togglePause, score, collides, fillAhead, section } from '../src/core.ts';
import type { Game, Entity, Kind } from '../src/core.ts';

function isolated(kind?: Kind, at=6, lane=0) {
  const g=createGame(83);startGame(g);g.nextRow=10000;g.entities=[];
  if(kind)g.entities.push({id:1,kind,lane,at,taken:false});return g;
}
function run(g:Game,seconds:number,dt=1/60){for(let t=0;t<seconds;t+=dt)advance(g,dt);}
test('start, pause, resume and restart preserve the expected run state',()=>{
  const g=createGame();advance(g,1);assert.equal(g.distance,0);
  startGame(g);run(g,1);assert.ok(g.distance>15);
  togglePause(g);const saved=JSON.stringify(g);run(g,3);action(g,'jump');assert.equal(JSON.stringify(g),saved);
  togglePause(g);run(g,.2);assert.ok(g.distance>19);
  const fresh=createGame();assert.equal(fresh.coins,0);assert.equal(fresh.distance,0);assert.equal(fresh.phase,'ready');
});
test('lane changes are smooth and stop at the outer lanes',()=>{
  const g=isolated();for(let n=0;n<8;n++)action(g,'left');assert.equal(g.lane,-1);
  run(g,.5);assert.ok(Math.abs(g.x+3.2)<.01);
  for(let n=0;n<8;n++)action(g,'right');run(g,.5);assert.equal(g.lane,1);assert.ok(Math.abs(g.x-3.2)<.01);
});
test('orange barriers stop a grounded runner; a timed jump clears them',()=>{
  const hit=isolated('barrier');run(hit,.5);assert.equal(hit.phase,'over');assert.equal(hit.hit,'barrier');
  const jumped=isolated('barrier');action(jumped,'jump');run(jumped,.9);assert.equal(jumped.phase,'playing');assert.equal(jumped.y,0);
});
test('blue signs require sliding and tall crates require a lane change',()=>{
  const hit=isolated('arch');run(hit,.5);assert.equal(hit.phase,'over');
  const slid=isolated('arch');action(slid,'slide');run(slid,.5);assert.equal(slid.phase,'playing');
  const crate=isolated('block');action(crate,'jump');run(crate,.5);assert.equal(crate.phase,'over');
  const dodge=isolated('block');action(dodge,'right');run(dodge,.5);assert.equal(dodge.phase,'playing');
});
test('jump cannot stack mid-air; slide can bring the player down faster',()=>{
  const g=isolated();action(g,'jump');run(g,.2);const velocity=g.velocityY;action(g,'jump');assert.equal(g.velocityY,velocity);
  action(g,'slide');assert.ok(g.velocityY<=-16);run(g,.3);assert.equal(g.y,0);
});
test('coins award once, from the matching lane, and contribute to the score',()=>{
  const g=isolated('coin',3);g.entities.push({id:2,kind:'coin',lane:1,at:3,taken:false});run(g,.5);
  assert.equal(g.coins,1);assert.equal(score(g),Math.floor(g.distance*10)+50);run(g,.5);assert.equal(g.coins,1);
});
test('a cyan shield absorbs one collision and allows a brief recovery',()=>{
  const g=isolated('shield',2);g.entities.push({id:2,kind:'block',lane:0,at:6,taken:false});
  run(g,.5);assert.equal(g.phase,'playing');assert.equal(g.shield,false);assert.ok(g.invincible>0);
  g.entities.push({id:3,kind:'block',lane:0,at:38,taken:false});run(g,2);assert.equal(g.phase,'over');
});
test('collision boundaries match visible jump and slide clearance',()=>{
  const g=isolated();const e:Entity={id:0,kind:'arch',at:0,lane:0,taken:false};
  g.slide=.5;assert.equal(collides(g,e),false);g.y=.6;assert.equal(collides(g,e),true);
  g.slide=0;g.y=1.2;e.kind='barrier';assert.equal(collides(g,e),false);
  g.x=3.2;e.kind='block';assert.equal(collides(g,e),false);
});
test('low frame rates cannot skip collisions and hidden-tab time is bounded',()=>{
  const g=isolated('block',1.3);advance(g,.1);assert.equal(g.phase,'over');
  const gap=isolated();advance(g,50);assert.ok(gap.distance<2);
  const a=isolated(),b=isolated();run(a,3,1/30);run(b,3,1/120);assert.ok(Math.abs(a.distance-b.distance)<.6);
});
test('course generation is deterministic, bounded, and always leaves a clear lane',()=>{
  const a=createGame(42),b=createGame(42);fillAhead(a);fillAhead(b);assert.deepEqual(a.entities,b.entities);
  const g=createGame(91);startGame(g);
  for(let distance=0;distance<12000;distance+=50){
    g.distance=distance;g.entities=g.entities.filter(e=>e.at>distance-12);fillAhead(g);
    assert.ok(g.entities.length<100);
    const rows=new Map<number,Set<number>>();
    for(const e of g.entities)if(['barrier','arch','block'].includes(e.kind)){
      const lanes=rows.get(e.at)||new Set<number>();lanes.add(e.lane);rows.set(e.at,lanes);
    }
    for(const lanes of rows.values())assert.ok(lanes.size<=2);
  }
});
test('all four campus sections cycle and pace has a playable upper bound',()=>{
  const g=isolated();const names=[];
  for(const d of [0,200,400,600]){g.distance=d;names.push(section(g));}
  assert.equal(new Set(names).size,4);g.distance=800;assert.equal(section(g),names[0]);
  g.distance=100000;g.nextRow=1000000;advance(g,.1);assert.equal(g.speed,30);
});
