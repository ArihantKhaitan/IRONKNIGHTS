// src/enemies.js - Enemy archetypes, AI, camps, patrols, bosses
import * as THREE from 'three';
import { scene } from './engine.js';
import { CONFIG } from './config.js';
import { State } from './state.js';
import { terrainHeight, resolveCollisions } from './world.js';
import { getPlayerPosition, isPlayerCloaked } from './player.js';
import { Audio } from './audio.js';

export let enemies = [];
export let currentBoss = null;

const AI_PATROL = 1;
const AI_ALERT = 2;
const AI_CHASE = 3;
const AI_ATTACK = 4;
const AI_RETURN = 5;

export function nullifyBoss() { currentBoss = null; }

export function clearEnemies(tagPrefix = null) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (tagPrefix === null || (e.tag && e.tag.startsWith(tagPrefix))) {
      scene.remove(e.mesh);
      enemies.splice(i, 1);
    }
  }
  if (currentBoss && (tagPrefix === null || (currentBoss.tag && currentBoss.tag.startsWith(tagPrefix)))) {
    scene.remove(currentBoss.mesh);
    currentBoss = null;
    const bossContainer = document.getElementById('boss-health-container');
    if (bossContainer) bossContainer.classList.add('hidden');
  }
}

export function countByTagPrefix(prefix) {
  let n = 0;
  for (const e of enemies) if (e.tag && e.tag.startsWith(prefix)) n++;
  if (currentBoss && currentBoss.tag && currentBoss.tag.startsWith(prefix)) n++;
  return n;
}

// ────────────────────────────────────────────
// MESH BUILDERS
// ────────────────────────────────────────────
function darkMat() {
  return new THREE.MeshStandardMaterial({ color: 0x26221e, roughness: 0.7, metalness: 0.75 });
}
function plateMat(color) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.6, metalness: 0.7 });
}
function glowMat(color) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
}

function createWalkerMesh(cfg, isBoss) {
  const sc = cfg.scale;
  const group = new THREE.Group();
  const parts = {};

  // Legs (pivot groups)
  [-0.5, 0.5].forEach((lx, i) => {
    const leg = new THREE.Group();
    leg.position.set(lx * sc, 2.1 * sc, 0);
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.6 * sc, 1.2 * sc, 0.6 * sc), darkMat());
    thigh.position.y = -0.6 * sc;
    thigh.castShadow = true;
    leg.add(thigh);
    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.5 * sc, 1.05 * sc, 0.55 * sc), darkMat());
    shin.position.y = -1.55 * sc;
    leg.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.62 * sc, 0.3 * sc, 0.95 * sc), darkMat());
    foot.position.set(0, -2.0 * sc, 0.15 * sc);
    leg.add(foot);
    group.add(leg);
    parts['leg' + i] = leg;
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6 * sc, 1.7 * sc, 1.1 * sc), darkMat());
  torso.position.y = 3.1 * sc;
  torso.castShadow = true;
  group.add(torso);

  // Chest plate + core
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.3 * sc, 1.0 * sc, 0.2 * sc), plateMat(cfg.color));
  chest.position.set(0, 3.2 * sc, 0.58 * sc);
  group.add(chest);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28 * sc, 8, 8), glowMat(cfg.accentColor));
  core.position.set(0, 3.15 * sc, 0.72 * sc);
  group.add(core);

  // Pauldrons
  [-1.15, 1.15].forEach((sx) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.7 * sc, 0.55 * sc, 1.0 * sc), plateMat(cfg.color));
    p.position.set(sx * sc, 3.85 * sc, 0);
    group.add(p);
  });

  // Arms
  [-1.1, 1.1].forEach((ax, i) => {
    const arm = new THREE.Group();
    arm.position.set(ax * sc, 3.6 * sc, 0);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.5 * sc, 1.05 * sc, 0.5 * sc), darkMat());
    upper.position.y = -0.6 * sc;
    arm.add(upper);
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.44 * sc, 0.95 * sc, 0.46 * sc), darkMat());
    lower.position.y = -1.5 * sc;
    arm.add(lower);
    if (i === 1) {
      const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * sc, 0.2 * sc, 1.2 * sc, 6), darkMat());
      gun.rotation.x = Math.PI / 2;
      gun.position.set(0, -1.75 * sc, 0.6 * sc);
      arm.add(gun);
    }
    group.add(arm);
    parts['arm' + i] = arm;
  });

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9 * sc, 0.85 * sc, 0.85 * sc), darkMat());
  head.position.y = 4.45 * sc;
  head.castShadow = true;
  group.add(head);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.65 * sc, 0.16 * sc, 0.1 * sc), glowMat(cfg.accentColor));
  visor.position.set(0, 4.5 * sc, 0.48 * sc);
  group.add(visor);

  if (isBoss) {
    // Crown of jagged iron
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22 * sc, 1.2 * sc + (s % 2) * 0.6 * sc, 5), plateMat(cfg.accentColor));
      spike.position.set(Math.cos(a) * 0.55 * sc, 5.2 * sc, Math.sin(a) * 0.55 * sc);
      group.add(spike);
    }
    const bossLight = new THREE.PointLight(new THREE.Color(cfg.accentColor), 2.4, 24);
    bossLight.position.y = 4 * sc;
    group.add(bossLight);
    // Tattered cape
    const cape = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8 * sc, 2.6 * sc),
      new THREE.MeshStandardMaterial({ color: 0x3a1512, roughness: 1, side: THREE.DoubleSide })
    );
    cape.position.set(0, 3.0 * sc, -0.7 * sc);
    cape.rotation.x = -0.15;
    group.add(cape);
  }

  group.userData.parts = parts;
  group.userData.walkPhase = Math.random() * 10;
  return group;
}

function createHoundMesh(cfg) {
  const sc = cfg.scale;
  const group = new THREE.Group();
  const parts = {};

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.1 * sc, 0.9 * sc, 2.4 * sc), darkMat());
  body.position.y = 1.2 * sc;
  body.castShadow = true;
  group.add(body);

  // Spine plates
  for (let i = 0; i < 3; i++) {
    const plate = new THREE.Mesh(new THREE.ConeGeometry(0.18 * sc, 0.5 * sc, 4), plateMat(cfg.color));
    plate.position.set(0, 1.75 * sc, (-0.6 + i * 0.6) * sc);
    group.add(plate);
  }

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7 * sc, 0.6 * sc, 0.9 * sc), darkMat());
  head.position.set(0, 1.35 * sc, 1.5 * sc);
  group.add(head);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12 * sc, 6, 6), glowMat(cfg.accentColor));
  eye.position.set(0.18 * sc, 1.4 * sc, 1.9 * sc);
  group.add(eye);
  const eye2 = eye.clone();
  eye2.position.x = -0.18 * sc;
  group.add(eye2);
  // Jaw spikes
  const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.1 * sc, 0.4 * sc, 4), plateMat(cfg.accentColor));
  jaw.position.set(0, 1.0 * sc, 1.95 * sc);
  jaw.rotation.x = Math.PI;
  group.add(jaw);

  // Four legs
  [[-0.5, -0.8], [0.5, -0.8], [-0.5, 0.8], [0.5, 0.8]].forEach(([lx, lz], i) => {
    const leg = new THREE.Group();
    leg.position.set(lx * sc, 1.1 * sc, lz * sc);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.24 * sc, 0.9 * sc, 0.3 * sc), darkMat());
    upper.position.y = -0.45 * sc;
    leg.add(upper);
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.3 * sc, 0.25 * sc, 0.45 * sc), darkMat());
    paw.position.y = -0.95 * sc;
    leg.add(paw);
    group.add(leg);
    parts['leg' + i] = leg;
  });

  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * sc, 0.12 * sc, 1.1 * sc, 5), darkMat());
  tail.position.set(0, 1.5 * sc, -1.6 * sc);
  tail.rotation.x = 0.7;
  group.add(tail);

  group.userData.parts = parts;
  group.userData.walkPhase = Math.random() * 10;
  return group;
}

function createBeaconMesh(cfg) {
  const sc = cfg.scale;
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2 * sc, 2.8 * sc, 1.4 * sc, 8), darkMat());
  base.position.y = 0.7 * sc;
  group.add(base);

  const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.1 * sc, 8 * sc, 1.1 * sc), plateMat('#4a3a34'));
  pylon.position.y = 5 * sc;
  pylon.castShadow = true;
  group.add(pylon);

  const brazier = new THREE.Mesh(new THREE.CylinderGeometry(1.2 * sc, 0.8 * sc, 1.0 * sc, 8), darkMat());
  brazier.position.y = 9.4 * sc;
  group.add(brazier);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.9 * sc, 2.6 * sc, 7), new THREE.MeshBasicMaterial({ color: 0xff4422, transparent: true, opacity: 0.95 }));
  flame.position.y = 11 * sc;
  group.add(flame);
  group.userData.beaconFlame = flame;

  const light = new THREE.PointLight(0xff4422, 2.6, 60);
  light.position.y = 11 * sc;
  group.add(light);

  // War-sigil rings
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6 * sc, 0.1 * sc, 6, 20), glowMat('#ff4422'));
  ring.position.y = 9.4 * sc;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.userData.parts = {};
  group.userData.walkPhase = 0;
  return group;
}

// ────────────────────────────────────────────
// SPAWNING
// ────────────────────────────────────────────
function buildEnemy(typeId, x, z, opts = {}) {
  const cfg = CONFIG.ENEMIES[typeId];
  if (!cfg) return null;

  let mesh;
  if (cfg.kind === 'hound') mesh = createHoundMesh(cfg);
  else if (cfg.kind === 'structure') mesh = createBeaconMesh(cfg);
  else mesh = createWalkerMesh(cfg, false);

  const y = terrainHeight(x, z);
  mesh.position.set(x, y, z);
  mesh.rotation.y = Math.random() * Math.PI * 2;
  scene.add(mesh);

  const healthMul = opts.healthMul || 1;
  const enemy = {
    type: typeId,
    name: opts.name || cfg.name,
    kind: cfg.kind,
    mesh,
    health: Math.round(cfg.health * healthMul),
    maxHealth: Math.round(cfg.health * healthMul),
    damage: cfg.damage,
    speed: cfg.speed,
    scale: cfg.scale,
    color: cfg.color,
    fireRate: cfg.fireRate,
    lastShot: Math.random(),
    lastMelee: 0,
    aiState: cfg.immobile ? AI_ATTACK : AI_PATROL,
    immobile: !!cfg.immobile,
    melee: !!cfg.melee,
    meleeRange: cfg.meleeRange || 0,
    meleeRate: cfg.meleeRate || 1,
    home: opts.home || { x, z },
    leash: opts.leash || 90,
    patrolTarget: null,
    alertTimer: 0,
    goldReward: Math.round(cfg.goldReward * (opts.goldMul || 1)),
    scoreReward: cfg.scoreReward,
    isBoss: false,
    tag: opts.tag || 'ambient',
    detectionRange: cfg.detectionRange,
    chaseRange: cfg.chaseRange,
    attackRange: cfg.attackRange,
    desiredDist: cfg.desiredDist,
    config: cfg
  };
  if (opts.marker) {
    // Floating red marker (bounty targets)
    const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), glowMat('#ff3322'));
    marker.position.y = 6 * cfg.scale;
    marker.userData.isMarker = true;
    mesh.add(marker);
  }
  enemies.push(enemy);
  return enemy;
}

export function spawnSquad(x, z, types, opts = {}) {
  const squad = [];
  types.forEach((t, i) => {
    const a = (i / types.length) * Math.PI * 2;
    const r = 4 + Math.random() * 8;
    const e = buildEnemy(t, x + Math.cos(a) * r, z + Math.sin(a) * r, { ...opts, home: opts.home || { x, z } });
    if (e) squad.push(e);
  });
  return squad;
}

export function spawnCamp(camp) {
  return spawnSquad(camp.x, camp.z, camp.guards, { tag: 'camp:' + camp.id, leash: 70 });
}

export function spawnBountyTarget(bounty) {
  const e = buildEnemy('marauder', bounty.x, bounty.z, {
    tag: 'bounty:' + bounty.id,
    name: bounty.name,
    healthMul: 4.5,
    goldMul: 0,
    marker: true,
    leash: 120
  });
  if (e) {
    e.scale = 1.15;
    e.mesh.scale.setScalar(1.28);
    e.speed *= 1.1;
    e.damage *= 1.5;
  }
  // Henchmen
  spawnSquad(bounty.x + 10, bounty.z + 6, ['marauder', 'hound'], { tag: 'bountyGuard:' + bounty.id });
  return e;
}

export function spawnBeacon(x, z, tag) {
  return buildEnemy('beacon', x, z, { tag });
}

export function spawnBoss(bossId, x, z, tag = 'boss') {
  const cfg = CONFIG.BOSSES[bossId];
  if (!cfg) return null;

  const mesh = createWalkerMesh(cfg, true);
  const y = terrainHeight(x, z);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  currentBoss = {
    type: bossId,
    name: cfg.name,
    kind: 'walker',
    mesh,
    health: cfg.health,
    maxHealth: cfg.maxHealth,
    damage: cfg.damage,
    speed: cfg.speed,
    scale: cfg.scale,
    color: cfg.color,
    fireRate: cfg.fireRate,
    lastShot: 0,
    lastMelee: 0,
    specialTimer: 6,
    aiState: AI_CHASE,
    immobile: false,
    melee: false,
    home: { x, z },
    leash: 9999,
    patrolTarget: null,
    alertTimer: 0,
    goldReward: cfg.goldReward,
    scoreReward: cfg.scoreReward,
    isBoss: true,
    tag,
    currentPhase: 0,
    phases: cfg.phases,
    detectionRange: 300,
    chaseRange: 400,
    attackRange: 40,
    desiredDist: 22,
    config: cfg
  };

  const bossContainer = document.getElementById('boss-health-container');
  if (bossContainer) {
    bossContainer.classList.remove('hidden');
    const bossName = document.getElementById('boss-name');
    if (bossName) bossName.textContent = cfg.name.toUpperCase();
  }
  Audio.play('bossRoar');
  return currentBoss;
}

// ────────────────────────────────────────────
// AI UPDATE
// ────────────────────────────────────────────
function updateBossPhase(boss) {
  const ratio = boss.health / boss.maxHealth;
  let newPhase = 0;
  for (let i = boss.phases.length - 1; i >= 1; i--) {
    if (ratio <= boss.phases[i].threshold) { newPhase = i; break; }
  }
  if (newPhase !== boss.currentPhase) {
    boss.currentPhase = newPhase;
    const phase = boss.phases[newPhase];
    boss.speed = phase.speed;
    boss.damage = phase.damage;
    Audio.play('bossRoar');
    document.dispatchEvent(new CustomEvent('bossPhaseChange', { detail: { boss, phase: newPhase } }));
    showBossPhaseAlert(boss.config.name, newPhase + 1);
  }
}

function showBossPhaseAlert(name, phase) {
  const container = document.getElementById('game-container');
  if (!container) return;
  const existing = document.querySelector('.boss-phase-alert');
  if (existing) existing.remove();
  const alert = document.createElement('div');
  alert.className = 'boss-phase-alert';
  alert.innerHTML = `<span class="phase-label">PHASE ${phase}</span><br><span class="phase-boss">${name.toUpperCase()}</span>`;
  container.appendChild(alert);
  setTimeout(() => alert.remove(), 2500);
}

function faceToward(entity, targetX, targetZ, dt, rate = 7) {
  const dx = targetX - entity.mesh.position.x;
  const dz = targetZ - entity.mesh.position.z;
  if (dx * dx + dz * dz < 0.01) return;
  const targetAngle = Math.atan2(dx, dz);
  let da = targetAngle - entity.mesh.rotation.y;
  while (da > Math.PI) da -= Math.PI * 2;
  while (da < -Math.PI) da += Math.PI * 2;
  entity.mesh.rotation.y += da * Math.min(1, rate * dt);
}

function moveEntity(entity, dirX, dirZ, speed, dt) {
  entity.mesh.position.x += dirX * speed * dt;
  entity.mesh.position.z += dirZ * speed * dt;
  resolveCollisions(entity.mesh.position, entity.scale * 1.2);
  entity.mesh.position.y = terrainHeight(entity.mesh.position.x, entity.mesh.position.z);
  entity.moving = true;
}

function moveToward(entity, tx, tz, dt, speed) {
  const dx = tx - entity.mesh.position.x;
  const dz = tz - entity.mesh.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.6) return dist;
  moveEntity(entity, dx / dist, dz / dist, speed, dt);
  faceToward(entity, tx, tz, dt);
  return dist;
}

function circleStrafe(enemy, playerPos, dt) {
  const dx = playerPos.x - enemy.mesh.position.x;
  const dz = playerPos.z - enemy.mesh.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.01) return;
  const rx = dx / dist, rz = dz / dist;
  const px = -rz, pz = rx;
  const radial = (dist - enemy.desiredDist) * 0.3;
  const strafeSign = enemy.strafeDir || (enemy.strafeDir = Math.random() > 0.5 ? 1 : -1);
  let mx = rx * radial + px * strafeSign;
  let mz = rz * radial + pz * strafeSign;
  const ml = Math.hypot(mx, mz);
  if (ml > 0.01) {
    moveEntity(enemy, mx / ml, mz / ml, enemy.speed * 0.8, dt);
  }
  faceToward(enemy, playerPos.x, playerPos.z, dt, 8);
}

function attemptShoot(enemy, playerPos, time) {
  if (!enemy.fireRate) return;
  if (time - enemy.lastShot < enemy.fireRate) return;
  enemy.lastShot = time;

  const sc = enemy.scale;
  const from = enemy.mesh.position.clone().add(new THREE.Vector3(0, 3 * sc, 0));
  const to = playerPos.clone().add(new THREE.Vector3(0, 2.5, 0));
  const dir = new THREE.Vector3().subVectors(to, from).normalize();
  dir.x += (Math.random() - 0.5) * 0.12;
  dir.y += (Math.random() - 0.5) * 0.04;
  dir.z += (Math.random() - 0.5) * 0.12;
  dir.normalize();

  const pending = enemy.mesh.userData.shootPending || (enemy.mesh.userData.shootPending = []);
  pending.push({ from, dir, damage: enemy.damage, speed: enemy.type === 'longbow' ? 65 : 48, color: enemy.type === 'longbow' ? '#9fd47f' : '#ff5533' });
}

function attemptMelee(enemy, playerPos, dist, time) {
  if (time - enemy.lastMelee < enemy.meleeRate) return;
  if (dist > enemy.meleeRange + 2) return;
  enemy.lastMelee = time;
  const pending = enemy.mesh.userData.shootPending || (enemy.mesh.userData.shootPending = []);
  pending.push({ melee: true, damage: enemy.damage });
}

function bossSpecial(boss, playerPos, dt) {
  boss.specialTimer -= dt;
  if (boss.specialTimer > 0) return;
  boss.specialTimer = Math.max(3, 7 - boss.currentPhase * 1.5);

  const pending = boss.mesh.userData.shootPending || (boss.mesh.userData.shootPending = []);
  const from = boss.mesh.position.clone().add(new THREE.Vector3(0, 3.2 * boss.scale, 0));

  if (boss.type === 'ASHEN_KING') {
    // Ring of fire: radial burst
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pending.push({ from: from.clone(), dir: new THREE.Vector3(Math.cos(a), -0.05, Math.sin(a)), damage: boss.damage * 0.5, speed: 42, color: '#ff7a2f' });
    }
  } else {
    // Volley spread at the player
    const base = new THREE.Vector3().subVectors(playerPos.clone().add(new THREE.Vector3(0, 2, 0)), from).normalize();
    for (let i = -1; i <= 1; i++) {
      const dir = base.clone();
      dir.x += i * 0.14; dir.z += i * 0.1;
      dir.normalize();
      pending.push({ from: from.clone(), dir, damage: boss.damage * 0.65, speed: 52, color: boss.config.accentColor });
    }
  }
  Audio.play('heavyShot');
}

function updateEnemyAI(enemy, playerPos, dt, time) {
  enemy.moving = false;

  if (enemy.immobile) {
    // Beacons just burn
    if (enemy.mesh.userData.beaconFlame) {
      const f = enemy.mesh.userData.beaconFlame;
      const s = 0.85 + Math.sin(time * 7 + enemy.mesh.position.x) * 0.2;
      f.scale.set(s, s, s);
    }
    return;
  }

  const dx = playerPos.x - enemy.mesh.position.x;
  const dz = playerPos.z - enemy.mesh.position.z;
  const distToPlayer = Math.hypot(dx, dz);
  const cloaked = isPlayerCloaked();
  const detection = cloaked ? enemy.detectionRange * 0.12 : enemy.detectionRange;

  const homeDist = Math.hypot(enemy.mesh.position.x - enemy.home.x, enemy.mesh.position.z - enemy.home.z);

  switch (enemy.aiState) {
    case AI_PATROL: {
      if (!enemy.patrolTarget || Math.random() < 0.002) {
        const a = Math.random() * Math.PI * 2;
        const r = 8 + Math.random() * 25;
        enemy.patrolTarget = { x: enemy.home.x + Math.cos(a) * r, z: enemy.home.z + Math.sin(a) * r };
      }
      const d = moveToward(enemy, enemy.patrolTarget.x, enemy.patrolTarget.z, dt, enemy.speed * 0.35);
      if (d < 2.5) enemy.patrolTarget = null;
      if (distToPlayer < detection) {
        enemy.aiState = AI_ALERT;
        enemy.alertTimer = 0.4;
      }
      break;
    }
    case AI_ALERT: {
      faceToward(enemy, playerPos.x, playerPos.z, dt);
      enemy.alertTimer -= dt;
      if (enemy.alertTimer <= 0) enemy.aiState = AI_CHASE;
      break;
    }
    case AI_CHASE: {
      if (homeDist > enemy.leash && distToPlayer > enemy.attackRange) {
        enemy.aiState = AI_RETURN;
      } else if (distToPlayer < enemy.attackRange) {
        enemy.aiState = AI_ATTACK;
      } else if (distToPlayer > enemy.chaseRange || cloaked) {
        enemy.aiState = AI_PATROL;
      } else {
        moveToward(enemy, playerPos.x, playerPos.z, dt, enemy.speed);
      }
      break;
    }
    case AI_ATTACK: {
      if (cloaked) { enemy.aiState = AI_PATROL; break; }
      if (enemy.melee) {
        // Hounds: run straight in, bite
        if (distToPlayer > enemy.meleeRange) {
          moveToward(enemy, playerPos.x, playerPos.z, dt, enemy.speed);
        } else {
          faceToward(enemy, playerPos.x, playerPos.z, dt, 10);
        }
        attemptMelee(enemy, playerPos, distToPlayer, time);
        if (distToPlayer > enemy.chaseRange) enemy.aiState = AI_CHASE;
      } else {
        circleStrafe(enemy, playerPos, dt);
        attemptShoot(enemy, playerPos, time);
        if (distToPlayer > enemy.chaseRange) enemy.aiState = AI_CHASE;
      }
      break;
    }
    case AI_RETURN: {
      const d = moveToward(enemy, enemy.home.x, enemy.home.z, dt, enemy.speed * 0.7);
      if (d < 6) enemy.aiState = AI_PATROL;
      if (distToPlayer < enemy.attackRange) enemy.aiState = AI_ATTACK;
      break;
    }
    default:
      enemy.aiState = AI_PATROL;
  }

  // Walk animation
  const parts = enemy.mesh.userData.parts;
  if (parts && enemy.moving) {
    enemy.mesh.userData.walkPhase += dt * enemy.speed * 0.6;
    const swing = Math.sin(enemy.mesh.userData.walkPhase) * 0.45;
    if (enemy.kind === 'hound') {
      if (parts.leg0) parts.leg0.rotation.x = swing;
      if (parts.leg1) parts.leg1.rotation.x = -swing;
      if (parts.leg2) parts.leg2.rotation.x = -swing;
      if (parts.leg3) parts.leg3.rotation.x = swing;
    } else {
      if (parts.leg0) parts.leg0.rotation.x = swing;
      if (parts.leg1) parts.leg1.rotation.x = -swing;
      if (parts.arm0) parts.arm0.rotation.x = -swing * 0.5;
      if (parts.arm1) parts.arm1.rotation.x = swing * 0.5;
    }
  }

  // Bounty marker bob
  enemy.mesh.children.forEach(c => {
    if (c.userData.isMarker) {
      c.position.y = 6 * enemy.scale + Math.sin(time * 3) * 0.4;
      c.rotation.y += dt * 2;
    }
  });
}

export function updateEnemies(dt) {
  if (!State.isPlaying) return;
  const playerPos = getPlayerPosition();
  if (!playerPos) return;
  const time = performance.now() / 1000;

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (!e || !e.mesh) continue;
    // Skip far-away enemies (open world perf)
    const d2 = (e.mesh.position.x - playerPos.x) ** 2 + (e.mesh.position.z - playerPos.z) ** 2;
    if (d2 > 350 * 350) continue;
    updateEnemyAI(e, playerPos, dt, time);
  }

  if (currentBoss && currentBoss.mesh) {
    updateEnemyAI(currentBoss, playerPos, dt, time);
    bossSpecial(currentBoss, playerPos, dt);
    updateBossPhase(currentBoss);
  }
}
