// src/enemies.js - Enemy AI and management
import * as THREE from 'three';
import { scene } from './engine.js';
import { CONFIG } from './config.js';
import { State } from './state.js';

export let enemies = [];
export let currentBoss = null;

const AI_IDLE = 0;
const AI_PATROL = 1;
const AI_ALERT = 2;
const AI_CHASE = 3;
const AI_ATTACK = 4;

export function clearEnemies() {
  enemies.forEach(e => {
    scene.remove(e.mesh);
  });
  enemies = [];
  if (currentBoss) {
    scene.remove(currentBoss.mesh);
  }
  // Reset using module-level variable trick
  setBoss(null);
}

function setBoss(val) {
  // We export currentBoss as let, so we reassign
  currentBoss = val;
}

export function nullifyBoss() {
  currentBoss = null;
}

function makeMechMat(color, emissiveInt = 0.4) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: emissiveInt,
    roughness: 0.6,
    metalness: 0.8
  });
}

function makeDarkMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x1a1020,
    emissive: 0x0a080f,
    emissiveIntensity: 0.15,
    roughness: 0.65,
    metalness: 0.85
  });
}

export function createEnemyMesh(color, accentColor, scale, isBoss) {
  const sc = scale || 1;
  const group = new THREE.Group();
  const bodyMat = () => makeDarkMat();
  const accentMat = () => makeMechMat(accentColor || color, 0.7);
  const glowMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });

  // Torso
  const torsoGeo = new THREE.BoxGeometry(1.6 * sc, 1.8 * sc, 1.1 * sc);
  const torso = new THREE.Mesh(torsoGeo, bodyMat());
  torso.position.y = 2.3 * sc;
  torso.castShadow = true;
  group.add(torso);

  // Chest core
  const coreGeo = new THREE.SphereGeometry(0.35 * sc, 8, 8);
  const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 2.4 * sc, 0.6 * sc);
  core.userData.isCore = true;
  group.add(core);

  // Core glow light
  const coreLight = new THREE.PointLight(new THREE.Color(color), 1.2, 5);
  coreLight.position.set(0, 2.4 * sc, 1 * sc);
  group.add(coreLight);

  // Head
  const headGeo = new THREE.BoxGeometry(1.1 * sc, 0.9 * sc, 0.9 * sc);
  const head = new THREE.Mesh(headGeo, bodyMat());
  head.position.y = 3.8 * sc;
  head.castShadow = true;
  group.add(head);

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.8 * sc, 0.25 * sc, 0.12 * sc);
  const visor = new THREE.Mesh(visorGeo, glowMat());
  visor.position.set(0, 3.9 * sc, 0.52 * sc);
  group.add(visor);

  // Shoulders
  [-1.1, 1.1].forEach((sx) => {
    const sGeo = new THREE.BoxGeometry(0.6 * sc, 0.55 * sc, 0.9 * sc);
    const shoulder = new THREE.Mesh(sGeo, bodyMat());
    shoulder.position.set(sx * sc, 3.1 * sc, 0);
    shoulder.castShadow = true;
    group.add(shoulder);
  });

  // Arms
  [-1.05, 1.05].forEach((ax) => {
    const uGeo = new THREE.BoxGeometry(0.5 * sc, 1.1 * sc, 0.5 * sc);
    const upper = new THREE.Mesh(uGeo, bodyMat());
    upper.position.set(ax * sc, 2.3 * sc, 0);
    group.add(upper);

    const lGeo = new THREE.BoxGeometry(0.42 * sc, 1.0 * sc, 0.45 * sc);
    const lower = new THREE.Mesh(lGeo, bodyMat());
    lower.position.set(ax * sc, 1.2 * sc, 0);
    group.add(lower);
  });

  // Legs
  [-0.45, 0.45].forEach((lx) => {
    const tGeo = new THREE.BoxGeometry(0.6 * sc, 1.2 * sc, 0.6 * sc);
    const thigh = new THREE.Mesh(tGeo, bodyMat());
    thigh.position.set(lx * sc, 0.95 * sc, 0);
    group.add(thigh);

    const sGeo = new THREE.BoxGeometry(0.52 * sc, 1.1 * sc, 0.55 * sc);
    const shin = new THREE.Mesh(sGeo, bodyMat());
    shin.position.set(lx * sc, -0.15 * sc, 0.04 * sc);
    group.add(shin);

    const fGeo = new THREE.BoxGeometry(0.65 * sc, 0.3 * sc, 1.0 * sc);
    const foot = new THREE.Mesh(fGeo, bodyMat());
    foot.position.set(lx * sc, -0.75 * sc, 0.18 * sc);
    group.add(foot);

    // Leg glow
    const lgGeo = new THREE.BoxGeometry(0.62 * sc, 0.08 * sc, 0.62 * sc);
    const legGlow = new THREE.Mesh(lgGeo, glowMat());
    legGlow.position.set(lx * sc, 0.3 * sc, 0);
    group.add(legGlow);
  });

  // Boss crown of spikes
  if (isBoss) {
    for (let s = 0; s < 5; s++) {
      const angle = (s / 5) * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(0.3 * sc, 1.8 * sc, 6);
      const spikeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.8
      });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(Math.cos(angle) * 0.7 * sc, 4.8 * sc, Math.sin(angle) * 0.7 * sc);
      group.add(spike);
    }

    // Boss point light (stronger)
    const bossLight = new THREE.PointLight(new THREE.Color(color), 3, 20);
    bossLight.position.y = 4 * sc;
    group.add(bossLight);
  }

  return group;
}

function randomPatrolTarget() {
  const angle = Math.random() * Math.PI * 2;
  const r = 20 + Math.random() * 100;
  return new THREE.Vector3(Math.sin(angle) * r, 0, Math.cos(angle) * r);
}

function spawnPosition(index, total) {
  const angle = (index / total) * Math.PI * 2 + Math.random() * 0.5;
  const r = 40 + Math.random() * 90;
  return new THREE.Vector3(Math.sin(angle) * r, 0, Math.cos(angle) * r);
}

export function spawnEnemies(count, types) {
  for (let i = 0; i < count; i++) {
    const typeId = types[Math.floor(Math.random() * types.length)];
    const cfg = CONFIG.ENEMIES[typeId];
    if (!cfg) continue;

    const mesh = createEnemyMesh(cfg.color, cfg.accentColor, cfg.scale, false);
    const pos = spawnPosition(i, count);
    mesh.position.copy(pos);
    scene.add(mesh);

    const enemy = {
      type: typeId,
      mesh,
      health: cfg.health,
      maxHealth: cfg.health,
      damage: cfg.damage,
      speed: cfg.speed,
      scale: cfg.scale,
      color: cfg.color,
      lastShot: 0,
      fireRate: cfg.fireRate,
      aiState: AI_PATROL,
      patrolTarget: randomPatrolTarget(),
      goldReward: cfg.goldReward,
      scoreReward: cfg.scoreReward,
      isBoss: false,
      alertTimer: 0,
      detectionRange: cfg.detectionRange,
      chaseRange: cfg.chaseRange,
      attackRange: cfg.attackRange,
      desiredDist: cfg.desiredDist,
      config: cfg
    };
    enemies.push(enemy);
  }
}

export function spawnBoss(type) {
  const cfg = CONFIG.BOSSES[type];
  if (!cfg) return;

  const mesh = createEnemyMesh(cfg.color, cfg.accentColor, cfg.scale, true);
  mesh.position.set(0, 0, -60);
  scene.add(mesh);

  const boss = {
    type,
    mesh,
    health: cfg.health,
    maxHealth: cfg.maxHealth,
    damage: cfg.damage,
    speed: cfg.speed,
    scale: cfg.scale,
    color: cfg.color,
    lastShot: 0,
    fireRate: 0.8,
    aiState: AI_CHASE,
    patrolTarget: randomPatrolTarget(),
    goldReward: cfg.goldReward,
    scoreReward: cfg.scoreReward,
    isBoss: true,
    alertTimer: 0,
    currentPhase: 0,
    phases: cfg.phases,
    detectionRange: 200,
    chaseRange: 200,
    attackRange: 25,
    desiredDist: 18,
    config: cfg
  };
  currentBoss = boss;

  // Show boss health bar
  const bossContainer = document.getElementById('boss-health-container');
  if (bossContainer) {
    bossContainer.classList.remove('hidden');
    const bossName = document.getElementById('boss-name');
    if (bossName) bossName.textContent = cfg.name.toUpperCase();
  }
}

function updateBossPhase(boss) {
  const healthRatio = boss.health / boss.maxHealth;
  const phases = boss.phases;
  let newPhase = 0;
  for (let i = phases.length - 1; i >= 0; i--) {
    if (healthRatio <= phases[i].threshold && i > 0) {
      newPhase = i;
      break;
    }
  }
  if (newPhase !== boss.currentPhase) {
    boss.currentPhase = newPhase;
    const phase = phases[newPhase];
    boss.speed = phase.speed;
    boss.damage = phase.damage;
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

function moveToward(entity, target, dt, speed) {
  const dir = new THREE.Vector3().subVectors(target, entity.mesh.position);
  dir.y = 0;
  const dist = dir.length();
  if (dist < 0.5) return dist;
  dir.normalize();
  entity.mesh.position.addScaledVector(dir, speed * dt);
  // Face movement direction
  const targetAngle = Math.atan2(dir.x, dir.z);
  const curAngle = entity.mesh.rotation.y;
  let da = targetAngle - curAngle;
  while (da > Math.PI) da -= Math.PI * 2;
  while (da < -Math.PI) da += Math.PI * 2;
  entity.mesh.rotation.y = curAngle + da * Math.min(1, 6 * dt);
  return dist;
}

function circleStrafe(enemy, playerPos, dt) {
  const toPlayer = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
  toPlayer.y = 0;
  const dist = toPlayer.length();
  if (dist < 0.01) return;

  const desired = enemy.desiredDist || 15;
  const radialDir = toPlayer.clone().normalize();
  const perpDir = new THREE.Vector3(-radialDir.z, 0, radialDir.x);

  // Combine: move toward/away from desired distance + strafe
  const radialFactor = (dist - desired) * 0.3;
  const strafeDir = new THREE.Vector3()
    .addScaledVector(radialDir, radialFactor)
    .addScaledVector(perpDir, 1.0);

  if (strafeDir.lengthSq() > 0.01) {
    strafeDir.normalize();
    enemy.mesh.position.addScaledVector(strafeDir, enemy.speed * dt);

    // Clamp to arena
    const hDist = Math.sqrt(enemy.mesh.position.x ** 2 + enemy.mesh.position.z ** 2);
    if (hDist > 140) {
      const s = 140 / hDist;
      enemy.mesh.position.x *= s;
      enemy.mesh.position.z *= s;
    }
    enemy.mesh.position.y = 0;
  }

  // Face player
  const faceDir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
  faceDir.y = 0;
  if (faceDir.lengthSq() > 0.01) {
    const targetAngle = Math.atan2(faceDir.x, faceDir.z);
    const curAngle = enemy.mesh.rotation.y;
    let da = targetAngle - curAngle;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    enemy.mesh.rotation.y = curAngle + da * Math.min(1, 8 * dt);
  }
}

function attemptShoot(enemy, playerPos, time) {
  if (time - enemy.lastShot < enemy.fireRate) return;
  enemy.lastShot = time;

  const from = enemy.mesh.position.clone().add(new THREE.Vector3(0, 2, 0));
  const to = playerPos.clone().add(new THREE.Vector3(0, 1.5, 0));
  const dir = new THREE.Vector3().subVectors(to, from).normalize();

  // Add inaccuracy
  dir.x += (Math.random() - 0.5) * 0.15;
  dir.z += (Math.random() - 0.5) * 0.15;
  dir.normalize();

  enemy.mesh.userData.shootPending = enemy.mesh.userData.shootPending || [];
  enemy.mesh.userData.shootPending.push({ from, dir, damage: enemy.damage });
}

export function updateEnemies(dt) {
  if (!State.isPlaying) return;

  // Import playerMesh position dynamically to avoid circular deps at module load
  const playerMeshEl = document.getElementById('game-canvas')?.__playerRef;
  let playerPos = new THREE.Vector3(0, 0, 0);

  // Get player position from global reference set by main.js
  if (window.__playerPosition) {
    playerPos.copy(window.__playerPosition);
  }

  const time = performance.now() / 1000;

  // Update regular enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (!enemy || !enemy.mesh) continue;
    updateEnemyAI(enemy, playerPos, dt, time);
  }

  // Update boss
  if (currentBoss && currentBoss.mesh) {
    updateEnemyAI(currentBoss, playerPos, dt, time);
    updateBossPhase(currentBoss);
  }

  // Animate runes (float)
  const t = time;
}

function updateEnemyAI(enemy, playerPos, dt, time) {
  const toPlayer = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
  toPlayer.y = 0;
  const distToPlayer = toPlayer.length();

  switch (enemy.aiState) {
    case AI_PATROL: {
      const dist = moveToward(enemy, enemy.patrolTarget, dt, enemy.speed * 0.4);
      if (dist < 3) {
        enemy.patrolTarget = randomPatrolTarget();
      }
      // Detect player
      if (distToPlayer < enemy.detectionRange) {
        enemy.aiState = AI_ALERT;
        enemy.alertTimer = 0.5;
      }
      break;
    }
    case AI_ALERT: {
      // Face player while alerting
      const fDir = new THREE.Vector3().subVectors(playerPos, enemy.mesh.position);
      fDir.y = 0;
      if (fDir.lengthSq() > 0.01) {
        const ta = Math.atan2(fDir.x, fDir.z);
        const ca = enemy.mesh.rotation.y;
        let da = ta - ca;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        enemy.mesh.rotation.y = ca + da * Math.min(1, 6 * dt);
      }
      enemy.alertTimer -= dt;
      if (enemy.alertTimer <= 0) {
        enemy.aiState = AI_CHASE;
      }
      break;
    }
    case AI_CHASE: {
      if (distToPlayer < enemy.attackRange) {
        enemy.aiState = AI_ATTACK;
      } else if (distToPlayer > enemy.chaseRange) {
        enemy.aiState = AI_PATROL;
      } else {
        moveToward(enemy, playerPos, dt, enemy.speed);
      }
      break;
    }
    case AI_ATTACK: {
      circleStrafe(enemy, playerPos, dt);
      attemptShoot(enemy, playerPos, time);
      if (distToPlayer > enemy.chaseRange) {
        enemy.aiState = AI_CHASE;
      }
      break;
    }
    default:
      enemy.aiState = AI_PATROL;
  }

  // Keep on ground
  enemy.mesh.position.y = Math.max(0, enemy.mesh.position.y);

  // Clamp to arena
  const hd = Math.sqrt(enemy.mesh.position.x ** 2 + enemy.mesh.position.z ** 2);
  if (hd > 140) {
    const s = 140 / hd;
    enemy.mesh.position.x *= s;
    enemy.mesh.position.z *= s;
  }
}
