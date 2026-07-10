// src/combat.js - Projectiles, heavy shot, melee, damage
import * as THREE from 'three';
import { scene } from './engine.js';
import { CONFIG } from './config.js';
import { State } from './state.js';
import { playerMesh, getShootOrigin, canShootPrimary, canShootHeavy, cameraYaw } from './player.js';
import { enemies, currentBoss } from './enemies.js';
import { spawnExplosion, spawnHitSpark, spawnMuzzleFlash, spawnSwordArc, triggerCameraShake } from './effects.js';
import { terrainHeight } from './world.js';
import { Audio } from './audio.js';

export let projectiles = [];

const MELEE_COOLDOWN = 0.7;
let lastMeleeTime = 0;

export function clearProjectiles() {
  projectiles.forEach(p => {
    scene.remove(p.mesh);
    if (p.mesh.geometry) p.mesh.geometry.dispose();
    if (p.mesh.material) p.mesh.material.dispose();
  });
  projectiles = [];
}

function createProjectileMesh(color, heavy = false) {
  // No PointLight here: dynamic lights on projectiles force full-scene
  // shader recompiles and tank the framerate during firefights.
  const geo = heavy
    ? new THREE.SphereGeometry(0.45, 8, 8)
    : new THREE.CylinderGeometry(0.09, 0.09, 1.0, 6);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
  const mesh = new THREE.Mesh(geo, mat);

  // Soft glow shell instead
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(heavy ? 0.95 : 0.32, 6, 6),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.35, depthWrite: false })
  );
  mesh.add(glow);
  return mesh;
}

export function firePlayerPrimary() {
  const origin = getShootOrigin();
  if (!origin || !canShootPrimary()) return;

  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.squire;
  const mesh = createProjectileMesh(mechCfg.color);
  const dir = origin.direction.clone();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  mesh.position.copy(origin.position);
  scene.add(mesh);

  projectiles.push({
    mesh, direction: dir, speed: 95, life: 2.2,
    isPlayer: true, heavy: false,
    damage: mechCfg.damage * State.damageMultiplier(),
    color: mechCfg.color
  });

  spawnMuzzleFlash(origin.position, mechCfg.color);
  Audio.play('shot');
  triggerCameraShake(0.12);
}

export function firePlayerHeavy() {
  const origin = getShootOrigin();
  if (!origin || !canShootHeavy()) return;

  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.squire;
  const mesh = createProjectileMesh('#ff7a2f', true);
  const dir = origin.direction.clone();
  mesh.position.copy(origin.position);
  scene.add(mesh);

  projectiles.push({
    mesh, direction: dir, speed: 60, life: 3.0,
    isPlayer: true, heavy: true, aoe: 9,
    damage: mechCfg.heavyDamage * State.damageMultiplier(),
    color: '#ff7a2f'
  });

  spawnMuzzleFlash(origin.position, '#ff7a2f');
  Audio.play('heavyShot');
  triggerCameraShake(0.6);
}

export function spawnEnemyProjectile(position, direction, damage, speed = 48, color = '#ff5533') {
  const mesh = createProjectileMesh(color);
  const dir = direction.clone().normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  mesh.position.copy(position);
  scene.add(mesh);
  projectiles.push({
    mesh, direction: dir, speed, life: 3.5,
    isPlayer: false, heavy: false, damage, color
  });
  Audio.play('enemyShot');
}

// ── Melee: sword arc in front of the mech ──
export function tryMeleeAttack() {
  const now = performance.now() / 1000;
  if (now - lastMeleeTime < MELEE_COOLDOWN || !playerMesh) return false;
  lastMeleeTime = now;

  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.squire;
  const playerPos = playerMesh.position;
  const facing = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, cameraYaw, 0, 'YXZ'));

  spawnSwordArc(playerMesh, mechCfg.accentColor);
  Audio.play('melee');

  let hitAny = false;
  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);

  const meleeDamage = 45 * State.damageMultiplier() * (mechCfg.scale > 1.15 ? 1.5 : 1);

  allEnemies.forEach(enemy => {
    if (!enemy || !enemy.mesh) return;
    const toEnemy = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos);
    toEnemy.y = 0;
    const dist = toEnemy.length();
    if (dist > 9 + enemy.scale) return;
    // Frontal 150° arc
    toEnemy.normalize();
    if (facing.dot(toEnemy) < -0.26 && dist > 3) return;
    dealDamageToEnemy(enemy, meleeDamage);
    spawnHitSpark(enemy.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0)), mechCfg.accentColor);
    hitAny = true;
  });

  if (hitAny) {
    Audio.play('meleeHit');
    triggerCameraShake(0.8);
  }
  return hitAny;
}

// ── Damage to enemies ──
export function dealDamageToEnemy(enemy, damage) {
  if (!enemy || enemy.health <= 0) return;
  enemy.health -= damage;

  // Red damage flash (guarded so rapid fire doesn't stack timeouts)
  if (!enemy.flashing) {
    enemy.flashing = true;
    const flashed = [];
    enemy.mesh.traverse(child => {
      if (child.isMesh && child.material && child.material.emissive) {
        flashed.push({ mat: child.material, orig: child.material.emissive.getHex(), origI: child.material.emissiveIntensity });
        child.material.emissive.setHex(0xff2200);
        child.material.emissiveIntensity = 0.9;
      }
    });
    setTimeout(() => {
      enemy.flashing = false;
      for (const f of flashed) {
        f.mat.emissive.setHex(f.orig);
        f.mat.emissiveIntensity = f.origI;
      }
    }, 100);
  }

  if (enemy.health <= 0) {
    enemy.health = 0;
    spawnExplosion(enemy.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)), enemy.color, enemy.isBoss ? 40 : 20);
    triggerCameraShake(enemy.isBoss ? 3.0 : 0.9);
    Audio.play(enemy.isBoss ? 'bigExplosion' : 'explosion');

    State.addGold(enemy.goldReward);
    State.player.score += enemy.scoreReward;
    State.player.kills += 1;

    if (enemy.isBoss) {
      scene.remove(enemy.mesh);
      document.dispatchEvent(new CustomEvent('bossDefeated', { detail: { boss: enemy } }));
      const bossContainer = document.getElementById('boss-health-container');
      if (bossContainer) bossContainer.classList.add('hidden');
    } else {
      const idx = enemies.indexOf(enemy);
      if (idx !== -1) enemies.splice(idx, 1);
      scene.remove(enemy.mesh);
    }

    document.dispatchEvent(new CustomEvent('enemyKilled', { detail: { enemy } }));
    addKillFeed(enemy.name || enemy.type);
  }
}

function addKillFeed(name) {
  const feed = document.getElementById('kill-feed');
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'kill-feed-item';
  item.textContent = `✕ ${String(name).toUpperCase()} DESTROYED`;
  feed.appendChild(item);
  while (feed.children.length > 5) feed.removeChild(feed.firstChild);
  setTimeout(() => {
    item.classList.add('fade-out');
    setTimeout(() => item.remove(), 500);
  }, 2200);
}

// ── Damage to the player ──
export function takeDamage(amount) {
  if (State.isGameOver || !State.isPlaying) return;

  let remaining = amount;
  if (State.player.shield > 0) {
    const abs = Math.min(State.player.shield, remaining);
    State.player.shield -= abs;
    remaining -= abs;
  }
  if (remaining > 0) {
    State.player.health -= remaining;
    triggerCameraShake(Math.min(2, remaining * 0.05));
  }
  showDamageIndicators();
  Audio.play('hurt');

  if (State.player.health <= 0) {
    State.player.health = 0;
    document.dispatchEvent(new CustomEvent('playerDied'));
  }
}

function showDamageIndicators() {
  document.querySelectorAll('.damage-indicator').forEach(ind => {
    ind.classList.add('active');
    setTimeout(() => ind.classList.remove('active'), 300);
  });
}

// ── Ground slam ability ──
export function handleGroundSlam(position) {
  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);

  const slamRadius = 25;
  const slamDamage = 90 * State.damageMultiplier();
  allEnemies.forEach(enemy => {
    if (!enemy || !enemy.mesh) return;
    const dist = position.distanceTo(enemy.mesh.position);
    if (dist < slamRadius) {
      dealDamageToEnemy(enemy, Math.floor(slamDamage * (1 - dist / slamRadius) + 15));
    }
  });

  spawnExplosion(position.clone().add(new THREE.Vector3(0, 1, 0)), '#c9a227', 30);
  Audio.play('bigExplosion');
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 8 + Math.random() * 14;
    const ep = position.clone().add(new THREE.Vector3(Math.cos(angle) * r, 1, Math.sin(angle) * r));
    setTimeout(() => spawnExplosion(ep, '#ff7a2f', 12), i * 70);
  }
}

// ── Heavy shot AoE detonation ──
function detonate(proj) {
  spawnExplosion(proj.mesh.position.clone(), '#ff7a2f', 24);
  Audio.play('explosion');
  triggerCameraShake(0.7);
  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);
  allEnemies.forEach(enemy => {
    if (!enemy || !enemy.mesh) return;
    const dist = proj.mesh.position.distanceTo(enemy.mesh.position);
    if (dist < proj.aoe + enemy.scale * 2) {
      dealDamageToEnemy(enemy, proj.damage * Math.max(0.35, 1 - dist / (proj.aoe + enemy.scale * 2)));
    }
  });
}

// ── Per-frame projectile update ──
export function updateProjectiles(dt) {
  if (!State.isPlaying) return;

  const playerPos = playerMesh ? playerMesh.position : new THREE.Vector3();
  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);

  // Drain enemy fire queues (ranged shots + hound bites)
  allEnemies.forEach(enemy => {
    const pending = enemy.mesh && enemy.mesh.userData.shootPending;
    if (!pending) return;
    while (pending.length > 0) {
      const shot = pending.shift();
      if (shot.melee) {
        // Bite only lands if still close
        if (enemy.mesh.position.distanceTo(playerPos) < (enemy.meleeRange || 5) + 2.5) {
          takeDamage(shot.damage);
          spawnHitSpark(playerPos.clone().add(new THREE.Vector3(0, 2, 0)), '#ff5533');
          Audio.play('meleeHit');
        }
      } else {
        spawnEnemyProjectile(shot.from, shot.dir, shot.damage, shot.speed, shot.color);
      }
    }
  });

  const toRemove = [];
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    if (!proj || !proj.mesh) { toRemove.push(i); continue; }

    proj.mesh.position.addScaledVector(proj.direction, proj.speed * dt);
    proj.life -= dt;

    let dead = false;
    let exploded = false;

    if (proj.life <= 0) {
      dead = true;
    } else if (proj.mesh.position.y < terrainHeight(proj.mesh.position.x, proj.mesh.position.z)) {
      // Hit the ground
      if (proj.heavy) { detonate(proj); exploded = true; }
      else spawnHitSpark(proj.mesh.position.clone(), proj.color);
      dead = true;
    } else if (proj.isPlayer) {
      for (let j = 0; j < allEnemies.length; j++) {
        const enemy = allEnemies[j];
        if (!enemy || !enemy.mesh || enemy.health <= 0) continue;
        const hitRadius = enemy.scale * 2.6 + (proj.heavy ? 0.5 : 0);
        const dy = proj.mesh.position.y - (enemy.mesh.position.y + 2 * enemy.scale);
        const dh = Math.hypot(proj.mesh.position.x - enemy.mesh.position.x, proj.mesh.position.z - enemy.mesh.position.z);
        if (dh < hitRadius && Math.abs(dy) < 3.2 * enemy.scale + 1.5) {
          if (proj.heavy) { detonate(proj); exploded = true; }
          else {
            dealDamageToEnemy(enemy, proj.damage);
            spawnHitSpark(proj.mesh.position.clone(), proj.color);
            Audio.play('hit');
          }
          dead = true;
          break;
        }
      }
    } else {
      const dy = proj.mesh.position.y - (playerPos.y + 2.5);
      const dh = Math.hypot(proj.mesh.position.x - playerPos.x, proj.mesh.position.z - playerPos.z);
      if (dh < 2.6 && Math.abs(dy) < 4) {
        takeDamage(proj.damage);
        spawnHitSpark(proj.mesh.position.clone(), '#ff5533');
        dead = true;
      }
    }

    if (dead) {
      scene.remove(proj.mesh);
      if (proj.mesh.geometry) proj.mesh.geometry.dispose();
      if (proj.mesh.material) proj.mesh.material.dispose();
      toRemove.push(i);
    }
  }

  for (let i = 0; i < toRemove.length; i++) {
    projectiles.splice(toRemove[i], 1);
  }
}
