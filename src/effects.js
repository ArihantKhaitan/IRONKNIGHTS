// src/effects.js - Particles, muzzle flash, sword arcs, smoke, ambient embers
import * as THREE from 'three';
import { scene } from './engine.js';

const particles = [];
export let cameraShake = 0;

export function triggerCameraShake(amount) {
  cameraShake = Math.max(cameraShake, amount);
}

export function decayCameraShake(dt) {
  if (cameraShake > 0) cameraShake = Math.max(0, cameraShake - dt * 6);
}

function pushParticle(p) {
  scene.add(p);
  particles.push(p);
}

export function spawnExplosion(position, color, count = 20) {
  const col = new THREE.Color(color || '#ff7a2f');
  for (let i = 0; i < count; i++) {
    const useBox = Math.random() > 0.5;
    const size = 0.3 + Math.random() * 0.8;
    const geo = useBox ? new THREE.BoxGeometry(size, size, size) : new THREE.SphereGeometry(size * 0.5, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(position);
    p.position.x += (Math.random() - 0.5) * 2;
    p.position.y += (Math.random() - 0.5) * 2;
    p.position.z += (Math.random() - 0.5) * 2;
    const speed = 5 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    p.userData.velocity = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.cos(phi) * speed * 0.8 + 4,
      Math.sin(phi) * Math.sin(theta) * speed
    );
    p.userData.life = 0.7 + Math.random() * 0.5;
    p.userData.maxLife = p.userData.life;
    p.userData.gravity = true;
    pushParticle(p);
  }

  // Flash light
  const flash = new THREE.PointLight(col, 8, 45);
  flash.position.copy(position);
  flash.userData.life = 0.18;
  flash.userData.maxLife = 0.18;
  flash.userData.isLight = true;
  pushParticle(flash);

  // Lingering smoke
  for (let i = 0; i < Math.min(6, count / 3); i++) {
    spawnSmokePuff(position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3)));
  }
}

export function spawnSmokePuff(position) {
  const geo = new THREE.SphereGeometry(0.8 + Math.random() * 0.8, 5, 5);
  const mat = new THREE.MeshBasicMaterial({ color: 0x33302c, transparent: true, opacity: 0.35, depthWrite: false });
  const p = new THREE.Mesh(geo, mat);
  p.position.copy(position);
  p.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 1.5, 2.5 + Math.random() * 2, (Math.random() - 0.5) * 1.5);
  p.userData.life = 1.6 + Math.random();
  p.userData.maxLife = p.userData.life;
  p.userData.gravity = false;
  p.userData.grow = 1.2;
  pushParticle(p);
}

export function spawnHitSpark(position, color) {
  const col = new THREE.Color(color || '#ffb35c');
  const count = 7 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.14, 3, 3);
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1 });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(position);
    const speed = 3 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    p.userData.velocity = new THREE.Vector3(
      Math.cos(theta) * Math.cos(phi) * speed,
      Math.sin(phi) * speed + 2,
      Math.sin(theta) * Math.cos(phi) * speed
    );
    p.userData.life = 0.25 + Math.random() * 0.2;
    p.userData.maxLife = p.userData.life;
    pushParticle(p);
  }
}

export function spawnMuzzleFlash(position, color) {
  const col = new THREE.Color(color || '#ffb35c');
  const flash = new THREE.PointLight(col, 4, 14);
  flash.position.copy(position);
  flash.userData.life = 0.06;
  flash.userData.maxLife = 0.06;
  flash.userData.isLight = true;
  pushParticle(flash);

  const geo = new THREE.SphereGeometry(0.35, 5, 5);
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
  const p = new THREE.Mesh(geo, mat);
  p.position.copy(position);
  p.userData.life = 0.07;
  p.userData.maxLife = 0.07;
  pushParticle(p);
}

export function spawnSwordArc(playerMesh, color) {
  const col = new THREE.Color(color || '#7fd4c1');
  const geo = new THREE.TorusGeometry(5, 0.35, 4, 20, Math.PI * 1.2);
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
  const arc = new THREE.Mesh(geo, mat);
  arc.position.copy(playerMesh.position).add(new THREE.Vector3(0, 3, 0));
  arc.rotation.y = playerMesh.rotation.y + Math.PI / 2 + 0.6;
  arc.rotation.x = -0.25;
  arc.userData.life = 0.22;
  arc.userData.maxLife = 0.22;
  arc.userData.spinY = -9;
  pushParticle(arc);
}

export function spawnBoostTrail(position, color) {
  const col = new THREE.Color(color || '#ff9a55');
  const geo = new THREE.CylinderGeometry(0.1, 0.3, 1.5, 6);
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 });
  const p = new THREE.Mesh(geo, mat);
  p.position.copy(position);
  p.position.y += Math.random() * 0.5;
  p.rotation.z = Math.PI / 2;
  p.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
  p.userData.life = 0.25;
  p.userData.maxLife = 0.25;
  pushParticle(p);
}

// ── Ambient drifting embers / ash around the player ──
let emberTimer = 0;
export function updateAmbient(dt, playerPos, storm) {
  if (!playerPos) return;
  emberTimer -= dt;
  const rate = 0.09 - storm * 0.065; // faster spawns in a storm
  if (emberTimer <= 0) {
    emberTimer = Math.max(0.015, rate);
    const isEmber = Math.random() < 0.3 + storm * 0.2;
    const geo = new THREE.SphereGeometry(isEmber ? 0.09 : 0.14, 3, 3);
    const mat = new THREE.MeshBasicMaterial({
      color: isEmber ? 0xff8a3d : 0x777069,
      transparent: true, opacity: isEmber ? 0.95 : 0.5
    });
    const p = new THREE.Mesh(geo, mat);
    const a = Math.random() * Math.PI * 2;
    const r = 10 + Math.random() * 55;
    p.position.set(
      playerPos.x + Math.cos(a) * r,
      playerPos.y + 2 + Math.random() * 16,
      playerPos.z + Math.sin(a) * r
    );
    const windX = 2.5 + storm * 12;
    p.userData.velocity = new THREE.Vector3(
      windX + (Math.random() - 0.5) * 2,
      isEmber ? (0.6 + Math.random()) : (-0.8 - Math.random() * 1.4),
      1 + (Math.random() - 0.5) * 2
    );
    p.userData.life = 3 + Math.random() * 3;
    p.userData.maxLife = p.userData.life;
    p.userData.wobble = Math.random() * 10;
    pushParticle(p);
  }
}

// ── Chimney / campfire smoke ──
let smokeTimer = 0;
export function updateSmokeSources(dt, sources, playerPos) {
  if (!sources || !playerPos) return;
  smokeTimer -= dt;
  if (smokeTimer > 0) return;
  smokeTimer = 0.55;
  for (const s of sources) {
    const d2 = (s.x - playerPos.x) ** 2 + (s.z - playerPos.z) ** 2;
    if (d2 > 180 * 180) continue;
    spawnSmokePuff(new THREE.Vector3(s.x + (Math.random() - 0.5), s.y, s.z + (Math.random() - 0.5)));
  }
}

export function updateEffects(dt) {
  decayCameraShake(dt);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.life -= dt;

    if (p.userData.life <= 0) {
      particles.splice(i, 1);
      scene.remove(p);
      if (p.geometry) p.geometry.dispose();
      if (p.material) p.material.dispose();
      continue;
    }

    const lifeRatio = p.userData.life / p.userData.maxLife;

    if (p.userData.isLight) {
      p.intensity = 8 * lifeRatio;
      continue;
    }

    if (p.userData.velocity) {
      p.position.x += p.userData.velocity.x * dt;
      p.position.y += p.userData.velocity.y * dt;
      p.position.z += p.userData.velocity.z * dt;
      if (p.userData.gravity) p.userData.velocity.y -= 15 * dt;
      if (p.userData.wobble !== undefined) {
        p.position.x += Math.sin(p.userData.life * 3 + p.userData.wobble) * dt * 1.5;
      }
      p.userData.velocity.multiplyScalar(0.985);
    }

    if (p.userData.grow) {
      const s = 1 + (1 - lifeRatio) * p.userData.grow;
      p.scale.set(s, s, s);
    }
    if (p.userData.spinY) {
      p.rotation.y += p.userData.spinY * dt;
    }

    if (p.material) {
      p.material.opacity = lifeRatio * (p.userData.maxLife > 0.5 ? 0.9 : 1.0);
    }
  }
}

export function clearEffects() {
  particles.forEach(p => {
    scene.remove(p);
    if (p.geometry) p.geometry.dispose();
    if (p.material) p.material.dispose();
  });
  particles.length = 0;
  cameraShake = 0;
}
