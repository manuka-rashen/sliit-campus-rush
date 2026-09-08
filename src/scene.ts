import * as T from 'three';
import { createCampus } from '../lib/campus';
import { advance, createGame, action, startGame, togglePause, section, score, LANE_WIDTH } from './core';
import type { Action, Game, Entity } from './core';

export type ViewState = { phase: Game['phase']; score: number; coins: number; distance: number;
  speed: number; shield: boolean; section: string; hit: Game['hit'] };
export type Engine = { start: () => void; command: (a: Action) => void; pause: () => void;
  mute: (value: boolean) => void; dispose: () => void };

const PLAYER_Z = 4;
export function mountGame(host: HTMLDivElement, update: (value: ViewState) => void): Engine {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute('aria-label', 'SLIIT Campus Rush 3D play area');
  renderer.domElement.setAttribute('role', 'img');
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color('#92d8f2');
  scene.fog = new T.Fog('#a8dff1', 90, 230);
  const camera = new T.PerspectiveCamera(57, 1, .2, 255);
  const hemi = new T.HemisphereLight('#e1f6ff', '#7e9470', 2.4); scene.add(hemi);
  const sun = new T.DirectionalLight('#fff4cf', 3.4); sun.position.set(-25, 70, 25);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 35, bottom: -90, near: 1, far: 150 });
  sun.shadow.bias = -.0008; sun.shadow.normalBias = .15; scene.add(sun, sun.target);
  const materials = new Map<string, T.MeshStandardMaterial>();
  function mat(color: string) {
    if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .72 }));
    return materials.get(color)!;
  }
  function mesh(parent: T.Object3D, geometry: T.BufferGeometry, color: string, x=0, y=0, z=0) {
    const m = new T.Mesh(geometry, mat(color)); m.position.set(x,y,z);
    m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
  }
  function box(parent: T.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, color: string) {
    return mesh(parent, new T.BoxGeometry(w,h,d), color,x,y,z);
  }
  function batch(parent: T.Object3D, geometry: T.BufferGeometry, color: string, transforms: number[][]) {
    const instance = new T.InstancedMesh(geometry, mat(color), transforms.length);
    const dummy = new T.Object3D();
    transforms.forEach(([x,y,z,s=1],i)=>{dummy.position.set(x,y,z);dummy.scale.setScalar(s);dummy.updateMatrix();instance.setMatrixAt(i,dummy.matrix);});
    instance.receiveShadow=true; instance.castShadow=true; parent.add(instance); return instance;
  }
  const {root: campus, groups} = createCampus();
  const chunks: T.Group[] = [];
  const terrain = new T.Mesh(new T.PlaneGeometry(1500,1500), mat('#79b877'));
  terrain.rotation.x = -Math.PI/2; terrain.position.y=-.2; terrain.receiveShadow=true; scene.add(terrain);
  function place(parent: T.Group, id: string, x: number, z: number, scale: number, angle: number) {
    const source=groups[id]; if(!source) return;
    const clone=source.clone(true);
    const bounds=new T.Box3().setFromObject(clone);
    const center=bounds.getCenter(new T.Vector3());
    const inner=new T.Group(); inner.add(clone); clone.position.set(-center.x, -bounds.min.y, -center.z);
    inner.scale.setScalar(scale); inner.rotation.y=angle; inner.position.set(x,.1,z); parent.add(inner);
  }
  for (let i=0;i<4;i++) {
    const chunk=new T.Group(); scene.add(chunk); chunks.push(chunk);
    box(chunk,0,-.04,-100,11.1,.12,200,'#d68458');
    for(const side of [-1,1]) {
      box(chunk,side*5.9,.1,-100,.8,.28,200,'#ffe3aa');
      box(chunk,side*8.25,0,-100,3.8,.1,200,'#e8ceaa');
      box(chunk,side*10.35,.12,-100,.4,.3,200,'#f8edcc');
    }
    batch(chunk,new T.BoxGeometry(.12,.035,200),'#ffd5a2',[[-1.6,.04,-100],[1.6,.04,-100]]);
    batch(chunk,new T.BoxGeometry(11,.03,.075),'#bd6b4e',Array.from({length:80},(_,n)=>[0,.04,-n*2.5]));
    batch(chunk,new T.BoxGeometry(.2,.04,1.9),'#ffebc2',Array.from({length:40},(_,n)=>[0,.06,-n*5]));
    const treePoints=Array.from({length:20},(_,n)=>[(n%2?1:-1)*12,.0,-n*10-4]);
    batch(chunk,new T.CylinderGeometry(.14,.24,2.4,6),'#947148',treePoints.map(([x,,z])=>[x,1.2,z]));
    batch(chunk,new T.IcosahedronGeometry(1.9,1),'#489d68',treePoints.map(([x,,z],n)=>[x,3.3,z,1+(n%3)*.12]));
    batch(chunk,new T.BoxGeometry(2.7,.3,2.7),'#f5e9c8',treePoints.map(([x,,z])=>[x,.15,z]));
    const lamps=Array.from({length:10},(_,n)=>[(n%2?1:-1)*7.8,2.4,-n*20-7]);
    batch(chunk,new T.CylinderGeometry(.055,.075,4.8,6),'#426c75',lamps);
    batch(chunk,new T.BoxGeometry(.6,.16,.85),'#ffe4a0',lamps.map(([x,,z])=>[x,4.9,z]));
    // Original merged campus geometry is reused, rearranged around the running route.
    if(i===0) {
      place(chunk,'blue',-23,-39,.64,Math.PI/2);
      place(chunk,'main',-29,-95,.7,Math.PI/2);
      place(chunk,'hall',28,-66,.7,-Math.PI/2);
      // The terracotta courtyard's orange piers and red overhead SLIIT beam.
      for(const side of [-1,1]) box(chunk,side*6.7,4.2,-14,.9,8.4,1.15,'#ed813d');
      box(chunk,0,8.3,-14,14.4,.85,1.1,'#b9334e');
    } else if(i===1) {
      place(chunk,'new-building-1',-22,-40,.75,Math.PI/2);
      place(chunk,'new-building-2',-22,-92,.75,Math.PI/2);
      place(chunk,'recreation',22,-70,.9,-Math.PI/2);
    } else if(i===2) {
      place(chunk,'west',-23,-50,.8,Math.PI/2);
      place(chunk,'cahm',23,-100,.8,0);
      place(chunk,'tennis',-25,-128,1,0);
    } else {
      place(chunk,'business-school',27,-60,.8,-Math.PI/2);
      place(chunk,'basketball',-27,-70,1,0);
    }
  }
  // Friendly, original student character with articulated running limbs.
  const runner=new T.Group(); scene.add(runner);
  const body=new T.Group(); runner.add(body);
  mesh(body,new T.CapsuleGeometry(.32,.45,4,8),'#f89234',0,1.3,0);
  mesh(body,new T.SphereGeometry(.34,12,10),'#bf835b',0,1.99,0);
  const hair=mesh(body,new T.SphereGeometry(.355,12,8),'#263744',0,2.1,.04); hair.scale.set(1,.65,1);
  box(body,0,1.4,.32,.52,.66,.25,'#143d6f');
  box(body,0,1.43,.47,.36,.38,.12,'#2879b4');
  const limbs:T.Group[]=[];
  for(const side of [-1,1]) {
    const leg=new T.Group();leg.position.set(side*.21,.97,0);body.add(leg);
    mesh(leg,new T.CapsuleGeometry(.13,.45,3,6),'#24466a',0,-.33,0);
    box(leg,0,-.73,-.075,.29,.19,.48,'#fff6dc');limbs.push(leg);
    const arm=new T.Group();arm.position.set(side*.4,1.6,0);body.add(arm);
    mesh(arm,new T.CapsuleGeometry(.11,.35,3,6),'#bf835b',0,-.27,0);limbs.push(arm);
  }
  const shadow=new T.Mesh(new T.CircleGeometry(.7,24),new T.MeshBasicMaterial({color:'#263b41',transparent:true,opacity:.16,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.08;scene.add(shadow);
  const shieldAura = new T.Mesh(new T.SphereGeometry(1.3,16,12),new T.MeshBasicMaterial({color:'#6dedff',transparent:true,opacity:.16,wireframe:true}));
  shieldAura.position.y=1.1;runner.add(shieldAura);

  function makeEntity(e: Entity) {
    const group=new T.Group();
    if(e.kind==='coin') {
      const m=mesh(group,new T.CylinderGeometry(.4,.4,.13,12),'#ffce35',0,1.25,0);m.rotation.x=Math.PI/2;
      const ring=mesh(group,new T.TorusGeometry(.25,.045,4,12),'#fff0a0',0,1.25,.08);
      ring.castShadow=false;
    } else if(e.kind==='barrier') {
      for(const x of [-.82,.82])box(group,x,.47,0,.18,.94,.5,'#294f64');
      box(group,0,.84,0,2.05,.56,.38,'#ff9e35');
      for(const x of [-.6,0,.6]) {const stripe=box(group,x,.84,.205,.23,.57,.02,'#fff0c2');stripe.rotation.z=-.3;}
    } else if(e.kind==='arch') {
      for(const x of [-1.05,1.05])box(group,x,1.65,0,.2,3.3,.55,'#234e67');
      box(group,0,2.37,0,2.3,1.98,.52,'#1476a3');
      for(const x of [-.75,-.25,.25,.75])box(group,x,1.6,.28,.3,.22,.06,'#a8f3f3');
      const down=mesh(group,new T.ConeGeometry(.22,.3,3),'#fce899',0,2.4,.33);down.rotation.z=Math.PI;
    } else if(e.kind==='block') {
      box(group,0,1.48,0,2.18,2.96,1.65,'#b65549');
      for(const y of [.35,1.4,2.65])box(group,0,y,.87,2.25,.16,.12,'#edaa66');
      for(const x of [-.89,.89])box(group,x,1.5,.87,.15,2.9,.12,'#edaa66');
      const bar=box(group,0,1.5,.91,.19,3.05,.13,'#edaa66');bar.rotation.z=.55;
    } else {
      mesh(group,new T.OctahedronGeometry(.65),'#3ee4e5',0,1.35,0);
      const ring=mesh(group,new T.TorusGeometry(.83,.045,4,18),'#f0ffff',0,1.35,0);ring.rotation.x=.4;
    }
    scene.add(group); return group;
  }
  const entityMeshes=new Map<number,T.Group>();
  const trashGeometry=new Set<T.BufferGeometry>();
  function removeEntity(id:number) {
    const group=entityMeshes.get(id); if(!group)return;
    group.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});scene.remove(group);entityMeshes.delete(id);
  }
  let game=createGame();
  let disposed=false, frame=0, lastTime=0, lastUpdate=0, muted=true;
  let audio:AudioContext|null=null;
  function sound(frequency:number, duration=.09) {
    if(muted || !audio || audio.state!=='running')return;
    const oscillator=audio.createOscillator(),gain=audio.createGain();
    oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency*.65,audio.currentTime+duration);
    gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
    oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);
  }
  function ensureAudio() {
    if(muted)return;
    try{audio??=new AudioContext();void audio.resume().catch(()=>{});}catch{/* Audio is optional. */}
  }
  function emit() { update({phase:game.phase,score:score(game),coins:game.coins,distance:Math.floor(game.distance),
    speed:game.speed,shield:game.shield,section:section(game),hit:game.hit}); }
  function command(a:Action) {action(game,a);if(a==='jump')sound(420);if(a==='slide')sound(170);}
  function start() {
    for(const id of [...entityMeshes.keys()])removeEntity(id);
    game=createGame(73481+Math.floor(Math.random()*100000));startGame(game);ensureAudio();emit();
  }
  function pause(){togglePause(game);emit();}
  function resized() {
    const w=host.clientWidth,h=host.clientHeight;
    renderer.setSize(w,h);camera.aspect=w/Math.max(1,h);
    camera.fov=w/h<.8?66:57;camera.updateProjectionMatrix();
  }
  const observer=new ResizeObserver(resized);observer.observe(host);resized();
  function key(e:KeyboardEvent) {
    if((e.target as HTMLElement)?.closest('button,a,input'))return;
    const keys:Record<string,Action>={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'jump',w:'jump',W:'jump',' ':'jump',ArrowDown:'slide',s:'slide',S:'slide'};
    if(keys[e.key]) {e.preventDefault();if(game.phase==='ready'||game.phase==='over'){if(e.key===' ')start();}else if(!e.repeat)command(keys[e.key]);}
    if((e.key==='Escape'||e.key.toLowerCase()==='p')&&!e.repeat){e.preventDefault();pause();}
  }
  let pointer:{x:number;y:number;id:number}|null=null;
  function down(e:PointerEvent){pointer={x:e.clientX,y:e.clientY,id:e.pointerId};}
  function up(e:PointerEvent){
    if(!pointer||pointer.id!==e.pointerId)return;
    const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
    command(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'slide':'jump');
  }
  function visibility(){if(document.hidden&&game.phase==='playing'){game.phase='paused';emit();}}
  function contextLost(e:Event){e.preventDefault();if(game.phase==='playing'){game.phase='paused';emit();}}
  function contextRestored(){resized();}
  window.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
  renderer.domElement.addEventListener('pointercancel',()=>{pointer=null;});
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
  function render(now:number) {
    if(disposed)return;
    const dt=lastTime?(now-lastTime)/1000:0;lastTime=now;
    const oldCoins=game.coins,oldPhase=game.phase;advance(game,dt);
    if(game.coins>oldCoins)sound(900+(game.coins%5)*100);
    if(game.phase==='over'&&oldPhase!=='over')sound(130,.32);
    const idle=game.phase==='ready';
    for(let i=0;i<chunks.length;i++) {
      const ahead=((i*200-game.distance+200)%800+800)%800-200;
      chunks[i].position.z=PLAYER_Z-ahead;
    }
    const keep=new Set<number>();
    for(const e of game.entities) {
      if(e.taken || e.at-game.distance>200)continue;keep.add(e.id);
      if(!entityMeshes.has(e.id))entityMeshes.set(e.id,makeEntity(e));
      const m=entityMeshes.get(e.id)!;m.position.set(e.lane*LANE_WIDTH,0,PLAYER_Z-(e.at-game.distance));
      if(e.kind==='coin'||e.kind==='shield') {m.rotation.y=now*.002;m.position.y=Math.sin(now*.004+e.id)*.1;}
    }
    for(const id of entityMeshes.keys())if(!keep.has(id))removeEntity(id);
    const running=game.phase==='playing';
    const bob=running&&game.y===0&&game.slide===0?Math.abs(Math.sin(game.time*11))*.08:0;
    runner.position.set(game.x,game.y+bob,PLAYER_Z);
    runner.rotation.z=(game.lane*LANE_WIDTH-game.x)*-.055;
    body.scale.y=game.slide>0?.4:1;body.rotation.x=game.slide>0?-.12:0;
    for(let i=0;i<limbs.length;i++)limbs[i].rotation.x=running&&game.y===0?Math.sin(game.time*11+(i===0||i===3?0:Math.PI))*.65:0;
    runner.visible=game.invincible<=0||Math.floor(now/65)%2===0;
    shieldAura.visible=game.shield;shieldAura.rotation.y=now*.001;
    shadow.position.set(game.x,.09,PLAYER_Z);shadow.scale.setScalar(1-game.y*.12);
    const targetX=idle?Math.sin(now*.00015)*.5:game.x*.22;
    camera.position.lerp(new T.Vector3(targetX,idle?7.5:6.4,idle?18:16.4),1-Math.exp(-5*Math.min(dt,.1)));
    if(!lastUpdate)camera.position.set(0,7.5,18);
    camera.lookAt(game.x*.12,1.6,-20);
    renderer.render(scene,camera);
    if(now-lastUpdate>80||game.phase!==oldPhase){emit();lastUpdate=now;}
    frame=requestAnimationFrame(render);
  }
  frame=requestAnimationFrame(render);emit();
  return {start,command,pause,mute(value){muted=value;if(!muted)ensureAudio();},dispose(){
    disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',key);
    document.removeEventListener('visibilitychange',visibility);
    renderer.domElement.removeEventListener('webglcontextlost',contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);
    const disposedMaterials=new Set<T.Material>();
    for(const object of [scene,campus])object.traverse(o=>{if(o instanceof T.Mesh){trashGeometry.add(o.geometry);const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>disposedMaterials.add(m));}});
    trashGeometry.forEach(g=>g.dispose());disposedMaterials.forEach(m=>m.dispose());
    renderer.dispose();renderer.domElement.remove();void audio?.close();
  }};
}
