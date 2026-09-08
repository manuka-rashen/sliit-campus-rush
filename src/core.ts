export type Phase = 'ready' | 'playing' | 'paused' | 'over';
export type Action = 'left' | 'right' | 'jump' | 'slide';
export type Kind = 'coin' | 'barrier' | 'arch' | 'block' | 'shield';
export type Entity = { id: number; kind: Kind; lane: number; at: number; taken: boolean };
export const LANE_WIDTH = 3.2;
export const JUMP_SPEED = 10.8;
export const GRAVITY = 26;
export const SLIDE_TIME = 0.85;
export const sectionNames = ['Main courtyard', 'New building avenue', 'Engineering walk', 'Business school lane'];
export type Game = {
  phase: Phase; distance: number; coins: number; speed: number; lane: number;
  x: number; y: number; velocityY: number; slide: number; shield: boolean;
  invincible: number; nextRow: number; nextId: number; seed: number;
  entities: Entity[]; time: number; flash: number; hit: Kind | null;
};

export function createGame(seed = 73481): Game {
  return { phase: 'ready', distance: 0, coins: 0, speed: 16, lane: 0, x: 0, y: 0,
    velocityY: 0, slide: 0, shield: false, invincible: 0, nextRow: 58, nextId: 0,
    seed: seed >>> 0, entities: [], time: 0, flash: 0, hit: null };
}
export function random(g: Game) {
  g.seed = (Math.imul(g.seed, 1664525) + 1013904223) >>> 0;
  return g.seed / 4294967296;
}
export function score(g: Game) { return Math.floor(g.distance * 10) + g.coins * 50; }
export function section(g: Game) { return sectionNames[Math.floor(g.distance / 200) % sectionNames.length]; }
function spawn(g: Game, kind: Kind, lane: number, at: number) {
  g.entities.push({ id: g.nextId++, kind, lane, at, taken: false });
}
export function fillAhead(g: Game) {
  while (g.nextRow < g.distance + 230) {
    const at = g.nextRow;
    // Every row has a clear lane, and enough distance to change both lanes.
    const safeLane = Math.floor(random(g) * 3) - 1;
    for (const lane of [-1, 0, 1]) {
      if (lane === safeLane || random(g) < 0.27) continue;
      const roll = random(g);
      spawn(g, at < 115 ? 'barrier' : roll < .34 ? 'barrier' : roll < .68 ? 'arch' : 'block', lane, at);
    }
    for (let n = 0; n < 5; n++) spawn(g, 'coin', safeLane, at - 8 + n * 2.5);
    if (Math.floor(at / 200) > Math.floor((at - 32) / 200)) spawn(g, 'shield', safeLane, at + 7);
    g.nextRow += 29 + random(g) * 7;
  }
}
export function startGame(g: Game) { g.phase = 'playing'; fillAhead(g); }
export function action(g: Game, command: Action) {
  if (g.phase !== 'playing') return;
  if (command === 'left') g.lane = Math.max(-1, g.lane - 1);
  if (command === 'right') g.lane = Math.min(1, g.lane + 1);
  if (command === 'jump' && g.y === 0) { g.velocityY = JUMP_SPEED; g.slide = 0; }
  if (command === 'slide') {
    if (g.y > 0) g.velocityY = Math.min(g.velocityY, -16);
    else g.slide = SLIDE_TIME;
  }
}
export function togglePause(g: Game) {
  if (g.phase === 'playing') g.phase = 'paused';
  else if (g.phase === 'paused') g.phase = 'playing';
}
export function collides(g: Game, e: Entity) {
  if (Math.abs(g.x - e.lane * LANE_WIDTH) > 1.14) return false;
  if (e.kind === 'barrier') return g.y < 1.15;
  if (e.kind === 'arch') return g.y + (g.slide > 0 ? .92 : 2.25) > 1.38;
  return e.kind === 'block';
}
export function step(g: Game, dt: number) {
  if (g.phase !== 'playing') return;
  const before = g.distance;
  g.time += dt;
  g.speed = Math.min(30, 16 + g.distance / 220);
  g.distance += g.speed * dt;
  g.x += (g.lane * LANE_WIDTH - g.x) * (1 - Math.exp(-16 * dt));
  g.slide = Math.max(0, g.slide - dt);
  g.invincible = Math.max(0, g.invincible - dt);
  g.flash = Math.max(0, g.flash - dt);
  if (g.velocityY !== 0 || g.y > 0) {
    g.y += g.velocityY * dt - GRAVITY * dt * dt / 2;
    g.velocityY -= GRAVITY * dt;
    if (g.y <= 0) { g.y = 0; g.velocityY = 0; }
  }
  for (const e of g.entities) {
    if (e.taken || e.at < before - .85 || e.at > g.distance + .85) continue;
    if (e.kind === 'coin' || e.kind === 'shield') {
      if (Math.abs(g.x - e.lane * LANE_WIDTH) < 1.1 && g.y < 1.75) {
        e.taken = true;
        if (e.kind === 'coin') g.coins++;
        else { g.shield = true; g.flash = .5; }
      }
    } else if (collides(g, e) && g.invincible === 0) {
      if (g.shield) { g.shield = false; e.taken = true; g.invincible = 1.2; g.flash = .6; }
      else { g.phase = 'over'; g.hit = e.kind; return; }
    }
  }
  g.entities = g.entities.filter(e => e.at > g.distance - 12 && !e.taken);
  fillAhead(g);
}
export function advance(g: Game, elapsed: number) {
  let remaining = Math.min(.1, Math.max(0, elapsed));
  while (remaining > 0) { const dt = Math.min(1 / 120, remaining); step(g, dt); remaining -= dt; }
}
