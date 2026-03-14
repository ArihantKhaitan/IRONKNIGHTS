// src/combat.js - Projectiles, melee, damage
import * as THREE from 'three';
import { scene } from './engine.js';
import { CONFIG } from './config.js';
import { State } from './state.js';
import { playerMesh, getShootOrigin, canShoot } from './player.js';
import { enemies, currentBoss } from './enemies.js';
import { spawnExplosion, spawnHitSpark, triggerCameraShake } from './effects.js';

export let projectiles = [];

const MELEE_COOLDOWN = 0.8; // seconds
let meleeCooldownTimer = 0;
let lastMeleeTime = 0;

export function clearProjectiles() {
  projectiles.forEach(p => {
    scene.remove(p.mesh);
    if (p.mesh.geometry) p.mesh.geometry.dispose();
    if (p.mesh.material) p.mesh.material.dispose();
  });
  projectiles = [];
}

function createProjectileMesh(color, isPlayer) {
  const geo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
  const mesh = new THREE.Mesh(geo, mat);

  // Glow light
  const light = new THREE.PointLight(new THREE.Color(color), 1.5, 8);
  mesh.add(light);

  return mesh;
}

export function firePlayerProjectile() {
  const origin = getShootOrigin();
  if (!origin) return;
  if (!canShoot()) return;

  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  const mesh = createProjectileMesh(mechCfg.color, true);

  // Align cylinder to direction
  const dir = origin.direction.clone();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  mesh.position.copy(origin.position);

  scene.add(mesh);
  projectiles.push({
    mesh,
    direction: dir,
    speed: 80,
    life: 2.5,
    maxLife: 2.5,
    isPlayer: true,
    damage: mechCfg.damage,
    color: mechCfg.color
  });
}

export function spawnEnemyProjectile(position, direction, damage) {
  const mesh = createProjectileMesh('#ff0044', false);
  const dir = direction.clone().normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  mesh.position.copy(position);

  scene.add(mesh);
  projectiles.push({
    mesh,
    direction: dir,
    speed: 50,
    life: 3.0,
    maxLife: 3.0,
    isPlayer: false,
    damage,
    color: '#ff0044'
  });
}

export function tryMeleeAttack() {
  const now = performance.now() / 1000;
  if (now - lastMeleeTime < MELEE_COOLDOWN) return false;
  if (!playerMesh) return false;
  lastMeleeTime = now;

  const playerPos = playerMesh.position;
  let hitAny = false;

  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);

  allEnemies.forEach(enemy => {
    if (!enemy || !enemy.mesh) return;
    const dist = playerPos.distanceTo(enemy.mesh.position);
    if (dist < 8) {
      dealDamageToEnemy(enemy, 35);
      spawnHitSpark(enemy.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)), '#00fff9');
      hitAny = true;
    }
  });

  if (hitAny) {
    triggerCameraShake(0.8);
    document.dispatchEvent(new CustomEvent('meleeHit'));
  }

  return hitAny;
}

export function dealDamageToEnemy(enemy, damage) {
  if (!enemy || enemy.health <= 0) return;
  enemy.health -= damage;

  // Flash red
  enemy.mesh.traverse(child => {
    if (child.isMesh && child.material && child.material.emissive) {
      const origEmissive = child.material.emissive.clone();
      const origIntensity = child.material.emissiveIntensity;
      child.material.emissive.set(0xff0000);
      child.material.emissiveIntensity = 1.0;
      setTimeout(() => {
        if (child.material) {
          child.material.emissive.copy(origEmissive);
          child.material.emissiveIntensity = origIntensity;
        }
      }, 120);
    }
  });

  if (enemy.health <= 0) {
    // Kill enemy
    enemy.health = 0;
    spawnExplosion(enemy.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)), enemy.color);
    triggerCameraShake(enemy.isBoss ? 3.0 : 1.0);

    // Add rewards
    State.gold += Math.floor(enemy.goldReward * (CONFIG.LEVELS[State.currentLevel]?.goldPerKill || 1));
    State.player.score += enemy.scoreReward;
    State.player.kills += 1;

    if (enemy.isBoss) {
      scene.remove(enemy.mesh);
      // Clear currentBoss ref - handled via event
      document.dispatchEvent(new CustomEvent('bossDefeated', { detail: { boss: enemy } }));
      // Hide boss health bar
      const bossContainer = document.getElementById('boss-health-container');
      if (bossContainer) bossContainer.classList.add('hidden');
    } else {
      // Remove from enemies array
      const idx = enemies.indexOf(enemy);
      if (idx !== -1) enemies.splice(idx, 1);
      scene.remove(enemy.mesh);
    }

    document.dispatchEvent(new CustomEvent('enemyKilled', { detail: { enemy } }));

    // Update kill feed
    addKillFeed(enemy.isBoss ? enemy.config.name : enemy.type);
  }
}

function addKillFeed(name) {
  const feed = document.getElementById('kill-feed');
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'kill-feed-item';
  item.textContent = `+ ${name.toUpperCase()} DESTROYED`;
  feed.appendChild(item);
  setTimeout(() => {
    item.classList.add('fade-out');
    setTimeout(() => item.remove(), 500);
  }, 2000);
}

export function takeDamage(amount) {
  if (State.isGameOver) return;

  let remaining = amount;

  // Shield absorbs first
  if (State.player.shield > 0) {
    const shieldAbs = Math.min(State.player.shield, remaining);
    State.player.shield -= shieldAbs;
    remaining -= shieldAbs;
  }

  // Then health
  if (remaining > 0) {
    State.player.health -= remaining;
    showDamageIndicators();
    triggerCameraShake(remaining * 0.05);
  }

  if (State.player.health <= 0) {
    State.player.health = 0;
    document.dispatchEvent(new CustomEvent('playerDied'));
  }
}

function showDamageIndicators() {
  const indicators = document.querySelectorAll('.damage-indicator');
  indicators.forEach(ind => {
    ind.classList.add('active');
    setTimeout(() => ind.classList.remove('active'), 300);
  });
}

export function handleGroundSlam(position) {
  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);

  const slamRadius = 25;
  let hitCount = 0;
  allEnemies.forEach(enemy => {
    if (!enemy || !enemy.mesh) return;
    const dist = position.distanceTo(enemy.mesh.position);
    if (dist < slamRadius) {
      const falloff = 1 - (dist / slamRadius);
      dealDamageToEnemy(enemy, Math.floor(80 * falloff));
      hitCount++;
    }
  });

  // Large explosion
  spawnExplosion(position, '#c9a227');
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 8 + Math.random() * 15;
    const ep = position.clone().add(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    setTimeout(() => spawnExplosion(ep, '#ff6600'), i * 80);
  }
}

export function updateProjectiles(dt) {
  if (!State.isPlaying) return;

  const playerPos = playerMesh ? playerMesh.position : new THREE.Vector3();

  // Process shoot pending from enemies
  const allEnemies = [...enemies];
  if (currentBoss) allEnemies.push(currentBoss);

  allEnemies.forEach(enemy => {
    if (!enemy.mesh || !enemy.mesh.userData.shootPending) return;
    const pending = enemy.mesh.userData.shootPending;
    while (pending.length > 0) {
      const shot = pending.shift();
      spawnEnemyProjectile(shot.from, shot.dir, shot.damage);
    }
  });

  // Update all projectiles
  const toRemove = [];
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    if (!proj || !proj.mesh) {
      toRemove.push(i);
      continue;
    }

    // Move
    proj.mesh.position.addScaledVector(proj.direction, proj.speed * dt);
    proj.life -= dt;

    if (proj.life <= 0) {
      scene.remove(proj.mesh);
      if (proj.mesh.geometry) proj.mesh.geometry.dispose();
      if (proj.mesh.material) proj.mesh.material.dispose();
      toRemove.push(i);
      continue;
    }

    let hit = false;

    if (proj.isPlayer) {
      // Check all enemies
      for (let j = allEnemies.length - 1; j >= 0; j--) {
        const enemy = allEnemies[j];
        if (!enemy || !enemy.mesh) continue;
        const hitRadius = enemy.scale * 2.5;
        if (proj.mesh.position.distanceTo(enemy.mesh.position) < hitRadius) {
          dealDamageToEnemy(enemy, proj.damage);
          spawnHitSpark(proj.mesh.position.clone(), proj.color);
          hit = true;
          break;
        }
      }
    } else {
      // Check player
      if (proj.mesh.position.distanceTo(playerPos) < 3) {
        takeDamage(proj.damage);
        spawnHitSpark(proj.mesh.position.clone(), '#ff0044');
        hit = true;
      }
    }

    if (hit) {
      scene.remove(proj.mesh);
      if (proj.mesh.geometry) proj.mesh.geometry.dispose();
      if (proj.mesh.material) proj.mesh.material.dispose();
      toRemove.push(i);
    }
  }

  // Remove in reverse order
  for (let i = toRemove.length - 1; i >= 0; i--) {
    projectiles.splice(toRemove[i], 1);
  }
}
