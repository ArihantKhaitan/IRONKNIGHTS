// src/effects.js - Particle effects and screen shake
import * as THREE from 'three';
import { scene } from './engine.js';

const particles = [];
export let cameraShake = 0;

export function triggerCameraShake(amount) {
  cameraShake = Math.max(cameraShake, amount);
}

export function spawnExplosion(position, color) {
  const col = new THREE.Color(color || '#ff6600');
  const count = 20 + Math.floor(Math.random() * 12);

  for (let i = 0; i < count; i++) {
    const useBox = Math.random() > 0.5;
    const size = 0.3 + Math.random() * 0.8;
    const geo = useBox
      ? new THREE.BoxGeometry(size, size, size)
      : new THREE.SphereGeometry(size * 0.5, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.9
    });
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
      Math.cos(phi) * speed * 0.8 + 3,
      Math.sin(phi) * Math.sin(theta) * speed
    );
    p.userData.life = 0.8 + Math.random() * 0.4;
    p.userData.maxLife = p.userData.life;
    p.userData.gravity = true;
    scene.add(p);
    particles.push(p);
  }

  // Point light flash
  const flashLight = new THREE.PointLight(col, 8, 40);
  flashLight.position.copy(position);
  flashLight.userData.life = 0.2;
  flashLight.userData.maxLife = 0.2;
  flashLight.userData.isLight = true;
  scene.add(flashLight);
  particles.push(flashLight);
}

export function spawnHitSpark(position, color) {
  const col = new THREE.Color(color || '#00fff9');
  const count = 8 + Math.floor(Math.random() * 5);

  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.15, 3, 3);
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
    p.userData.life = 0.3 + Math.random() * 0.2;
    p.userData.maxLife = p.userData.life;
    p.userData.gravity = false;
    scene.add(p);
    particles.push(p);
  }
}

export function spawnBoostTrail(position, color) {
  const col = new THREE.Color(color || '#00fff9');
  const geo = new THREE.CylinderGeometry(0.1, 0.3, 1.5, 6);
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 });
  const p = new THREE.Mesh(geo, mat);
  p.position.copy(position);
  p.position.y += Math.random() * 0.5;
  p.rotation.z = Math.PI / 2;
  p.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5
  );
  p.userData.life = 0.25;
  p.userData.maxLife = 0.25;
  p.userData.gravity = false;
  scene.add(p);
  particles.push(p);
}

export function updateEffects(dt) {
  // Decrement camera shake
  if (cameraShake > 0) {
    cameraShake = Math.max(0, cameraShake - dt * 6);
  }

  const toRemove = [];
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.life -= dt;

    if (p.userData.life <= 0) {
      toRemove.push(i);
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

    // Move by velocity
    if (p.userData.velocity) {
      p.position.x += p.userData.velocity.x * dt;
      p.position.y += p.userData.velocity.y * dt;
      p.position.z += p.userData.velocity.z * dt;

      // Gravity
      if (p.userData.gravity) {
        p.userData.velocity.y -= 15 * dt;
      }
      // Drag
      p.userData.velocity.multiplyScalar(0.97);
    }

    // Fade opacity
    if (p.material) {
      p.material.opacity = lifeRatio * (p.userData.maxLife > 0.5 ? 0.9 : 1.0);
    }
  }

  // Remove dead particles in reverse order
  for (let i = toRemove.length - 1; i >= 0; i--) {
    particles.splice(toRemove[i], 1);
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
