// src/player.js - Player mech creation and update
import * as THREE from 'three';
import { scene, camera } from './engine.js';
import { CONFIG } from './config.js';
import { State } from './state.js';
import { consumeMouseDelta, isKeyDown } from './input.js';
import { spawnBoostTrail, triggerCameraShake, spawnExplosion } from './effects.js';

export let playerMesh = null;
export let playerVelocity = new THREE.Vector3();
export let cameraYaw = 0;
export let cameraPitch = 0;

let mechConfig = null;
let abilityCooldownTimer = 0;
let isCloaked = false;
let isReloading = false;
let reloadTimer = 0;
let fireTimer = 0;
let boosterGlows = [];

// Camera follow
const camTargetPos = new THREE.Vector3();
const camCurrentPos = new THREE.Vector3();

export function resetPlayer() {
  if (playerMesh) {
    scene.remove(playerMesh);
    playerMesh = null;
  }
  playerVelocity.set(0, 0, 0);
  cameraYaw = 0;
  cameraPitch = 0;
  abilityCooldownTimer = 0;
  isCloaked = false;
  isReloading = false;
  reloadTimer = 0;
  fireTimer = 0;
  boosterGlows = [];
}

function makeMechMat(color, emissiveIntensity = 0.3) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity,
    roughness: 0.5,
    metalness: 0.85
  });
}

function makeGlowMat(color) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
}

export function createPlayer() {
  mechConfig = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  const col = mechConfig.color;
  const accent = mechConfig.accentColor;
  const sc = mechConfig.scale;
  const darkMat = () => new THREE.MeshStandardMaterial({ color: 0x1a1a2a, emissive: 0x0a0a15, emissiveIntensity: 0.2, roughness: 0.6, metalness: 0.9 });

  const group = new THREE.Group();

  // Torso
  const torsoGeo = new THREE.BoxGeometry(1.8 * sc, 2 * sc, 1.2 * sc);
  const torso = new THREE.Mesh(torsoGeo, darkMat());
  torso.position.y = 2.5 * sc;
  torso.castShadow = true;
  group.add(torso);

  // Chest glow panel
  const chestGeo = new THREE.BoxGeometry(0.9 * sc, 0.7 * sc, 0.05 * sc);
  const chestGlow = new THREE.Mesh(chestGeo, makeGlowMat(col));
  chestGlow.position.set(0, 2.5 * sc, 0.63 * sc);
  group.add(chestGlow);

  // Torso neon strips
  const stripGeo = new THREE.BoxGeometry(1.9 * sc, 0.1 * sc, 1.25 * sc);
  const topStrip = new THREE.Mesh(stripGeo, makeGlowMat(accent));
  topStrip.position.set(0, 3.55 * sc, 0);
  group.add(topStrip);
  const botStrip = new THREE.Mesh(stripGeo.clone(), makeGlowMat(col));
  botStrip.position.set(0, 1.55 * sc, 0);
  group.add(botStrip);

  // Head
  const headGeo = new THREE.BoxGeometry(1.2 * sc, 1 * sc, 1 * sc);
  const head = new THREE.Mesh(headGeo, darkMat());
  head.position.y = 4.1 * sc;
  head.castShadow = true;
  group.add(head);

  // Visor
  const visorGeo = new THREE.BoxGeometry(0.9 * sc, 0.3 * sc, 0.15 * sc);
  const visorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 4.2 * sc, 0.58 * sc);
  visor.userData.isVisor = true;
  group.add(visor);

  // Visor point light
  const visorLight = new THREE.PointLight(new THREE.Color(col), 1.5, 6);
  visorLight.position.set(0, 4.2 * sc, 1 * sc);
  group.add(visorLight);

  // Shoulders
  [-1.3, 1.3].forEach((sx) => {
    const shoulderGeo = new THREE.BoxGeometry(0.7 * sc, 0.6 * sc, 1.0 * sc);
    const shoulder = new THREE.Mesh(shoulderGeo, darkMat());
    shoulder.position.set(sx * sc, 3.3 * sc, 0);
    shoulder.castShadow = true;
    group.add(shoulder);

    // Shoulder accent
    const sAccentGeo = new THREE.BoxGeometry(0.72 * sc, 0.1 * sc, 1.02 * sc);
    const sAccent = new THREE.Mesh(sAccentGeo, makeGlowMat(accent));
    sAccent.position.set(sx * sc, 3.65 * sc, 0);
    group.add(sAccent);
  });

  // Arms
  [-1.2, 1.2].forEach((ax, idx) => {
    const upperGeo = new THREE.BoxGeometry(0.55 * sc, 1.2 * sc, 0.55 * sc);
    const upper = new THREE.Mesh(upperGeo, darkMat());
    upper.position.set(ax * sc, 2.5 * sc, 0);
    upper.castShadow = true;
    group.add(upper);

    const lowerGeo = new THREE.BoxGeometry(0.45 * sc, 1.1 * sc, 0.5 * sc);
    const lower = new THREE.Mesh(lowerGeo, darkMat());
    lower.position.set(ax * sc, 1.3 * sc, 0);
    lower.castShadow = true;
    group.add(lower);

    // Right arm gun barrel
    if (idx === 1) {
      const barrelGeo = new THREE.CylinderGeometry(0.12 * sc, 0.15 * sc, 1.2 * sc, 8);
      const barrel = new THREE.Mesh(barrelGeo, darkMat());
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(ax * sc, 1.2 * sc, -0.9 * sc);
      barrel.userData.isBarrel = true;
      group.add(barrel);

      // Glowing barrel tip
      const tipGeo = new THREE.SphereGeometry(0.18 * sc, 6, 6);
      const tipMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col) });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(ax * sc, 1.2 * sc, -1.55 * sc);
      tip.userData.isBarrelTip = true;
      group.add(tip);

      // Tip glow light
      const tipLight = new THREE.PointLight(new THREE.Color(col), 1.2, 4);
      tipLight.position.copy(tip.position);
      tipLight.userData.isBarrelLight = true;
      group.add(tipLight);
    }
  });

  // Legs
  [-0.5, 0.5].forEach((lx) => {
    // Thigh
    const thighGeo = new THREE.BoxGeometry(0.65 * sc, 1.3 * sc, 0.65 * sc);
    const thigh = new THREE.Mesh(thighGeo, darkMat());
    thigh.position.set(lx * sc, 1.05 * sc, 0);
    thigh.castShadow = true;
    group.add(thigh);

    // Shin
    const shinGeo = new THREE.BoxGeometry(0.55 * sc, 1.2 * sc, 0.6 * sc);
    const shin = new THREE.Mesh(shinGeo, darkMat());
    shin.position.set(lx * sc, -0.1 * sc, 0.05 * sc);
    shin.castShadow = true;
    group.add(shin);

    // Foot
    const footGeo = new THREE.BoxGeometry(0.7 * sc, 0.35 * sc, 1.1 * sc);
    const foot = new THREE.Mesh(footGeo, darkMat());
    foot.position.set(lx * sc, -0.8 * sc, 0.2 * sc);
    foot.castShadow = true;
    group.add(foot);

    // Leg accent strip
    const legAccentGeo = new THREE.BoxGeometry(0.67 * sc, 0.1 * sc, 0.67 * sc);
    const legAccent = new THREE.Mesh(legAccentGeo, makeGlowMat(col));
    legAccent.position.set(lx * sc, 0.35 * sc, 0);
    group.add(legAccent);
  });

  // Back thrusters
  [-0.5, 0.5].forEach((tx) => {
    const thrusterGeo = new THREE.CylinderGeometry(0.3 * sc, 0.4 * sc, 1.5 * sc, 8);
    const thruster = new THREE.Mesh(thrusterGeo, darkMat());
    thruster.position.set(tx * sc, 2.8 * sc, 0.75 * sc);
    thruster.castShadow = true;
    group.add(thruster);

    // Booster glow
    const boostGeo = new THREE.ConeGeometry(0.35 * sc, 1.2 * sc, 8);
    const boostMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0 });
    const boostMesh = new THREE.Mesh(boostGeo, boostMat);
    boostMesh.position.set(tx * sc, 2.0 * sc, 0.75 * sc);
    boostMesh.rotation.x = Math.PI;
    boostMesh.userData.isBoosterGlow = true;
    boosterGlows.push(boostMesh);
    group.add(boostMesh);
  });

  group.position.set(0, 0, 0);
  scene.add(group);
  playerMesh = group;

  // Reset camera
  camCurrentPos.set(0, 8, 20);
  camera.position.copy(camCurrentPos);
}

export function getShootOrigin() {
  if (!playerMesh) return null;
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  const sc = mechCfg.scale;

  // Gun barrel tip position in world space
  const localTip = new THREE.Vector3(1.2 * sc, 1.2 * sc, -1.55 * sc);
  const worldTip = localTip.clone().applyMatrix4(playerMesh.matrixWorld);

  // Direction: forward along camera direction with slight pitch
  const dir = new THREE.Vector3(0, 0, -1);
  dir.applyEuler(new THREE.Euler(cameraPitch, cameraYaw, 0, 'YXZ'));

  return { position: worldTip, direction: dir.normalize() };
}

export function canShoot() {
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  if (State.player.ammo <= 0) return false;
  if (fireTimer > 0) return false;
  fireTimer = mechCfg.fireRate;
  State.player.ammo = Math.max(0, State.player.ammo - 1);
  return true;
}

export function getAbilityCooldownPercent() {
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  if (abilityCooldownTimer <= 0) return 0;
  return abilityCooldownTimer / mechCfg.abilityCooldown;
}

export function triggerAbility() {
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  if (abilityCooldownTimer > 0) return;
  abilityCooldownTimer = mechCfg.abilityCooldown;

  switch (mechCfg.ability) {
    case 'DASH_BLINK': {
      if (!playerMesh) return;
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyEuler(new THREE.Euler(0, cameraYaw, 0, 'YXZ'));
      const startPos = playerMesh.position.clone();
      playerMesh.position.addScaledVector(forward, 15);
      // Clamp to arena
      const dist = Math.sqrt(playerMesh.position.x ** 2 + playerMesh.position.z ** 2);
      if (dist > 145) {
        playerMesh.position.multiplyScalar(145 / dist);
      }
      playerMesh.position.y = Math.max(0, Math.min(15, playerMesh.position.y));
      spawnExplosion(startPos, mechCfg.color);
      spawnExplosion(playerMesh.position.clone(), mechCfg.color);
      triggerCameraShake(0.5);
      break;
    }
    case 'GROUND_SLAM': {
      if (!playerMesh) return;
      const pos = playerMesh.position.clone();
      document.dispatchEvent(new CustomEvent('groundSlam', { detail: { position: pos } }));
      triggerCameraShake(2.0);
      break;
    }
    case 'CLOAK': {
      if (!playerMesh || isCloaked) return;
      isCloaked = true;
      playerMesh.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.15;
        }
      });
      setTimeout(() => {
        isCloaked = false;
        if (playerMesh) {
          playerMesh.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.opacity = 1.0;
            }
          });
        }
      }, 3000);
      break;
    }
    case 'SHIELD_WALL': {
      State.player.shield = State.player.maxShield;
      triggerCameraShake(0.8);
      if (playerMesh) {
        spawnExplosion(playerMesh.position.clone().add(new THREE.Vector3(0, 2, 0)), mechCfg.accentColor);
      }
      break;
    }
  }
}

let lastAbilityKeyDown = false;
let lastMeleeKeyDown = false;

export function updatePlayer(dt) {
  if (!playerMesh) return;
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;

  // Mouse look
  const { dx, dy } = consumeMouseDelta();
  cameraYaw -= dx * 0.002;
  cameraPitch -= dy * 0.002;
  cameraPitch = Math.max(-0.6, Math.min(0.5, cameraPitch));

  // Timers
  if (fireTimer > 0) fireTimer = Math.max(0, fireTimer - dt);
  if (abilityCooldownTimer > 0) abilityCooldownTimer = Math.max(0, abilityCooldownTimer - dt);

  // Reload logic
  if (isReloading) {
    reloadTimer -= dt;
    if (reloadTimer <= 0) {
      State.player.ammo = mechCfg.maxAmmo;
      isReloading = false;
      const indicator = document.getElementById('reload-indicator');
      if (indicator) indicator.style.display = 'none';
    }
  } else if (isKeyDown('KeyR') && State.player.ammo < mechCfg.maxAmmo) {
    isReloading = true;
    reloadTimer = 2.0;
    const indicator = document.getElementById('reload-indicator');
    if (indicator) indicator.style.display = 'block';
  }

  // Ability trigger (E key, single press)
  const abilityKeyNow = isKeyDown('KeyE');
  if (abilityKeyNow && !lastAbilityKeyDown) triggerAbility();
  lastAbilityKeyDown = abilityKeyNow;

  // Melee (Q key, single press - also dispatched by main)
  const meleeKeyNow = isKeyDown('KeyQ');
  if (meleeKeyNow && !lastMeleeKeyDown) {
    document.dispatchEvent(new CustomEvent('meleeTriggered'));
  }
  lastMeleeKeyDown = meleeKeyNow;

  // Movement vectors
  const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

  const moveDir = new THREE.Vector3();
  if (isKeyDown('KeyW')) moveDir.addScaledVector(forward, -1);
  if (isKeyDown('KeyS')) moveDir.addScaledVector(forward, 1);
  if (isKeyDown('KeyA')) moveDir.addScaledVector(right, -1);
  if (isKeyDown('KeyD')) moveDir.addScaledVector(right, 1);

  const isSprinting = (isKeyDown('ShiftLeft') || isKeyDown('ShiftRight')) && moveDir.lengthSq() > 0;
  const speed = isSprinting ? mechCfg.boostSpeed : mechCfg.speed;

  if (moveDir.lengthSq() > 0) {
    moveDir.normalize();
  }

  // Boost fuel
  if (isSprinting) {
    State.player.boost = Math.max(0, State.player.boost - 30 * dt);
    if (State.player.boost <= 0) {
      // Out of boost, revert to normal speed
    }
  } else {
    State.player.boost = Math.min(State.player.maxBoost, State.player.boost + 15 * dt);
  }

  const targetVelX = moveDir.x * speed;
  const targetVelZ = moveDir.z * speed;
  playerVelocity.x = THREE.MathUtils.lerp(playerVelocity.x, targetVelX, 10 * dt);
  playerVelocity.z = THREE.MathUtils.lerp(playerVelocity.z, targetVelZ, 10 * dt);

  // Vertical (hover/fly)
  const isHovering = isKeyDown('Space');
  if (isHovering) {
    playerVelocity.y = THREE.MathUtils.lerp(playerVelocity.y, 8, 4 * dt);
    State.isFlying = true;
  } else {
    playerVelocity.y = THREE.MathUtils.lerp(playerVelocity.y, 0, 4 * dt);
    State.isFlying = playerMesh.position.y > 0.2;
  }

  // Apply velocity
  playerMesh.position.x += playerVelocity.x * dt;
  playerMesh.position.y += playerVelocity.y * dt;
  playerMesh.position.z += playerVelocity.z * dt;

  // Clamp to arena and height
  const horizDist = Math.sqrt(playerMesh.position.x ** 2 + playerMesh.position.z ** 2);
  if (horizDist > 145) {
    const scale = 145 / horizDist;
    playerMesh.position.x *= scale;
    playerMesh.position.z *= scale;
  }
  playerMesh.position.y = Math.max(0, Math.min(15, playerMesh.position.y));

  // Rotate mech to face movement direction
  if (moveDir.lengthSq() > 0.01) {
    const targetAngle = Math.atan2(moveDir.x, moveDir.z) + Math.PI;
    const currentAngle = playerMesh.rotation.y;
    let da = targetAngle - currentAngle;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    playerMesh.rotation.y = currentAngle + da * Math.min(1, 8 * dt);
  }

  // Booster glow
  const showBoost = isSprinting || isHovering;
  boosterGlows.forEach(bg => {
    bg.material.opacity = showBoost ? 0.85 : 0;
  });

  // Boost trail
  if (showBoost && Math.random() < 0.5) {
    spawnBoostTrail(playerMesh.position.clone().add(new THREE.Vector3(0, 2, 0)), mechCfg.accentColor);
  }

  // Camera follow
  const camOffset = new THREE.Vector3(
    Math.sin(cameraYaw) * 12,
    5 + cameraPitch * 10,
    Math.cos(cameraYaw) * 12
  );
  camTargetPos.copy(playerMesh.position).add(camOffset);
  camera.position.lerp(camTargetPos, Math.min(1, 8 * dt));

  const lookTarget = playerMesh.position.clone().add(new THREE.Vector3(0, 2, 0));
  camera.lookAt(lookTarget);
}
