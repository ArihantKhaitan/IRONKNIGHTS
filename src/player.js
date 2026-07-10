// src/player.js - Player mech: knight-engine model, movement, camera
import * as THREE from 'three';
import { scene, camera } from './engine.js';
import { CONFIG } from './config.js';
import { State } from './state.js';
import { consumeMouseDelta, isKeyDown } from './input.js';
import { spawnBoostTrail, triggerCameraShake, spawnExplosion } from './effects.js';
import { terrainHeight, resolveCollisions } from './world.js';
import { Audio } from './audio.js';

export let playerMesh = null;
export let cameraYaw = 0;
export let cameraPitch = -0.12;
export let cameraMode = 'third'; // 'third' | 'first'

export function toggleCameraView() {
  cameraMode = cameraMode === 'third' ? 'first' : 'third';
  Audio.play('ui');
  document.dispatchEvent(new CustomEvent('toast', {
    detail: { text: cameraMode === 'first' ? 'FIRST PERSON' : 'THIRD PERSON', sub: 'Press [V] to switch view' }
  }));
}

const playerVelocity = new THREE.Vector3();
let hoverY = 0;
let hoverVel = 0;

let mechConfig = null;
let abilityCooldownTimer = 0;
let isCloaked = false;
let cloakTimer = 0;
let isReloading = false;
let reloadTimer = 0;
let fireTimer = 0;
let heavyTimer = 0;

let parts = null;      // limb pivots for walk animation
let boosterGlows = [];
let walkPhase = 0;
let lastStepIdx = 0;

const camTargetPos = new THREE.Vector3();

export function getPlayerPosition() {
  return playerMesh ? playerMesh.position : null;
}

export function isPlayerCloaked() { return isCloaked; }

export function resetPlayer() {
  if (playerMesh) {
    scene.remove(playerMesh);
    playerMesh = null;
  }
  playerVelocity.set(0, 0, 0);
  hoverY = 0; hoverVel = 0;
  abilityCooldownTimer = 0;
  isCloaked = false; cloakTimer = 0;
  isReloading = false; reloadTimer = 0;
  fireTimer = 0; heavyTimer = 0;
  boosterGlows = [];
  parts = null;
  walkPhase = 0;
}

function plateMat(color, rough = 0.55) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: rough, metalness: 0.8
  });
}
function glowMat(color) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
}

export function createPlayer(spawnX = 0, spawnZ = 420) {
  mechConfig = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.squire;
  const sc = mechConfig.scale;
  const col = mechConfig.color;
  const accent = mechConfig.accentColor;
  const dark = () => plateMat('#2b2b30', 0.5);
  const trim = () => plateMat(col, 0.4);

  const group = new THREE.Group();
  parts = {};

  // ── Legs (pivoted at hip for walk swing) ──
  [-0.55, 0.55].forEach((lx, i) => {
    const leg = new THREE.Group();
    leg.position.set(lx * sc, 2.25 * sc, 0);

    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.62 * sc, 1.25 * sc, 0.66 * sc), dark());
    thigh.position.y = -0.65 * sc;
    thigh.castShadow = true;
    leg.add(thigh);

    const kneePlate = new THREE.Mesh(new THREE.BoxGeometry(0.5 * sc, 0.4 * sc, 0.2 * sc), trim());
    kneePlate.position.set(0, -1.25 * sc, 0.38 * sc);
    leg.add(kneePlate);

    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.52 * sc, 1.1 * sc, 0.58 * sc), dark());
    shin.position.set(0, -1.7 * sc, 0.03 * sc);
    shin.castShadow = true;
    leg.add(shin);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.68 * sc, 0.32 * sc, 1.05 * sc), dark());
    foot.position.set(0, -2.1 * sc, 0.18 * sc);
    foot.castShadow = true;
    leg.add(foot);

    group.add(leg);
    parts['leg' + i] = leg;
  });

  // ── Pelvis / waist skirt (armor tassets) ──
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(1.5 * sc, 0.55 * sc, 1.0 * sc), dark());
  pelvis.position.y = 2.35 * sc;
  group.add(pelvis);
  [-0.7, 0.7].forEach((sx) => {
    const tasset = new THREE.Mesh(new THREE.BoxGeometry(0.35 * sc, 0.8 * sc, 0.9 * sc), trim());
    tasset.position.set(sx * sc, 2.15 * sc, 0);
    tasset.rotation.z = sx > 0 ? -0.15 : 0.15;
    group.add(tasset);
  });

  // ── Torso: layered breastplate ──
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.75 * sc, 1.7 * sc, 1.15 * sc), dark());
  torso.position.y = 3.5 * sc;
  torso.castShadow = true;
  group.add(torso);
  parts.torso = torso;

  const breastplate = new THREE.Mesh(new THREE.BoxGeometry(1.5 * sc, 1.2 * sc, 0.25 * sc), trim());
  breastplate.position.set(0, 3.6 * sc, 0.62 * sc);
  group.add(breastplate);

  // Furnace-heart glow in the chest
  const heart = new THREE.Mesh(new THREE.BoxGeometry(0.4 * sc, 0.5 * sc, 0.08 * sc), glowMat('#ff7a2f'));
  heart.position.set(0, 3.55 * sc, 0.78 * sc);
  group.add(heart);
  const heartLight = new THREE.PointLight(0xff7a2f, 0.9, 6);
  heartLight.position.set(0, 3.55 * sc, 1.1 * sc);
  group.add(heartLight);

  // ── Pauldrons (big layered shoulders) ──
  [-1.25, 1.25].forEach((sx) => {
    const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.85 * sc, 0.6 * sc, 1.1 * sc), trim());
    pauldron.position.set(sx * sc, 4.25 * sc, 0);
    pauldron.castShadow = true;
    group.add(pauldron);
    const pauldron2 = new THREE.Mesh(new THREE.BoxGeometry(0.7 * sc, 0.35 * sc, 0.95 * sc), dark());
    pauldron2.position.set(sx * sc * 1.05, 3.9 * sc, 0);
    group.add(pauldron2);
  });

  // ── Arms (pivoted at shoulder) ──
  [-1.25, 1.25].forEach((ax, i) => {
    const arm = new THREE.Group();
    arm.position.set(ax * sc, 4.0 * sc, 0);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.55 * sc, 1.1 * sc, 0.55 * sc), dark());
    upper.position.y = -0.65 * sc;
    upper.castShadow = true;
    arm.add(upper);

    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.48 * sc, 1.0 * sc, 0.52 * sc), dark());
    lower.position.y = -1.6 * sc;
    arm.add(lower);

    if (i === 1) {
      // Right arm: the cannon
      const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * sc, 0.26 * sc, 1.5 * sc, 8), plateMat('#3a3a40', 0.4));
      cannon.rotation.x = Math.PI / 2;
      cannon.position.set(0, -1.9 * sc, 0.75 * sc);
      arm.add(cannon);
      const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * sc, 0.26 * sc, 0.25 * sc, 8), trim());
      muzzle.rotation.x = Math.PI / 2;
      muzzle.position.set(0, -1.9 * sc, 1.55 * sc);
      arm.add(muzzle);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.14 * sc, 6, 6), glowMat('#ff7a2f'));
      tip.position.set(0, -1.9 * sc, 1.68 * sc);
      tip.userData.isBarrelTip = true;
      arm.add(tip);
    } else {
      // Left arm: the blade, sheathed low
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16 * sc, 1.9 * sc, 0.4 * sc), plateMat('#c9c4b8', 0.3));
      blade.position.set(-0.1 * sc, -2.6 * sc, 0.1 * sc);
      arm.add(blade);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.4 * sc, 0.16 * sc, 0.6 * sc), trim());
      guard.position.set(-0.1 * sc, -1.7 * sc, 0.1 * sc);
      arm.add(guard);
    }

    group.add(arm);
    parts['arm' + i] = arm;
  });

  // ── Head: great helm with crest ──
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.95 * sc, 0.95 * sc, 0.95 * sc), dark());
  head.position.y = 4.95 * sc;
  head.castShadow = true;
  group.add(head);
  parts.head = head;

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.7 * sc, 0.18 * sc, 0.1 * sc), glowMat(accent));
  visor.position.set(0, 5.0 * sc, 0.52 * sc);
  group.add(visor);
  const visorLight = new THREE.PointLight(new THREE.Color(accent), 0.8, 5);
  visorLight.position.set(0, 5.0 * sc, 0.9 * sc);
  group.add(visorLight);

  // Crest fin + plume
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.12 * sc, 0.5 * sc, 1.0 * sc), trim());
  crest.position.y = 5.6 * sc;
  group.add(crest);
  const plume = new THREE.Mesh(new THREE.ConeGeometry(0.22 * sc, 0.9 * sc, 6), plateMat(mechConfig.plume, 1.0));
  plume.position.set(0, 5.75 * sc, -0.45 * sc);
  plume.rotation.x = -0.7;
  group.add(plume);

  // ── Back: pennant pole + thrusters ──
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * sc, 0.05 * sc, 3.4 * sc, 5), plateMat('#3a3a40'));
  pole.position.set(-0.6 * sc, 5.3 * sc, -0.65 * sc);
  group.add(pole);
  const pennant = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1 * sc, 0.55 * sc),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(mechConfig.plume), roughness: 1, side: THREE.DoubleSide })
  );
  pennant.position.set(-0.6 * sc, 6.6 * sc, -1.2 * sc);
  pennant.userData.isPennant = true;
  group.add(pennant);
  parts.pennant = pennant;

  [-0.45, 0.45].forEach((tx) => {
    const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * sc, 0.38 * sc, 1.3 * sc, 7), plateMat('#3a3a40'));
    thruster.position.set(tx * sc, 3.6 * sc, -0.72 * sc);
    group.add(thruster);
    const boost = new THREE.Mesh(
      new THREE.ConeGeometry(0.32 * sc, 1.2 * sc, 7),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff9a55'), transparent: true, opacity: 0 })
    );
    boost.position.set(tx * sc, 2.85 * sc, -0.72 * sc);
    boost.rotation.x = Math.PI;
    boosterGlows.push(boost);
    group.add(boost);
  });

  const gy = terrainHeight(spawnX, spawnZ);
  group.position.set(spawnX, gy, spawnZ);
  scene.add(group);
  playerMesh = group;

  camTargetPos.set(spawnX, gy + 7, spawnZ + 16);
  camera.position.copy(camTargetPos);
}

// ── Shooting hooks (combat.js consumes these) ──
export function getShootOrigin() {
  if (!playerMesh) return null;
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(cameraPitch, cameraYaw, 0, 'YXZ')).normalize();
  if (cameraMode === 'first') {
    // Shoot straight from the eye so the crosshair is exact
    return { position: camera.position.clone().addScaledVector(dir, 2.4), direction: dir };
  }
  const sc = mechConfig ? mechConfig.scale : 1;
  const localTip = new THREE.Vector3(1.25 * sc, 2.1 * sc, 1.7 * sc);
  const worldTip = localTip.applyMatrix4(playerMesh.matrixWorld);
  return { position: worldTip, direction: dir };
}

export function canShootPrimary() {
  if (!mechConfig) return false;
  if (State.player.ammo <= 0 || fireTimer > 0 || isReloading) return false;
  fireTimer = mechConfig.fireRate;
  State.player.ammo = Math.max(0, State.player.ammo - 1);
  return true;
}

export function canShootHeavy() {
  if (!mechConfig) return false;
  if (State.player.ammo < 5 || heavyTimer > 0 || isReloading) return false;
  heavyTimer = 1.3;
  State.player.ammo = Math.max(0, State.player.ammo - 5);
  return true;
}

export function getAbilityCooldownPercent() {
  if (!mechConfig || abilityCooldownTimer <= 0) return 0;
  return abilityCooldownTimer / mechConfig.abilityCooldown;
}

export function triggerAbility() {
  if (!mechConfig || abilityCooldownTimer > 0 || !playerMesh) return;
  abilityCooldownTimer = mechConfig.abilityCooldown;
  Audio.play('ability');

  switch (mechConfig.ability) {
    case 'DASH_BLINK': {
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, cameraYaw, 0, 'YXZ'));
      const startPos = playerMesh.position.clone();
      playerMesh.position.addScaledVector(forward, 16);
      clampToBounds(playerMesh.position);
      resolveCollisions(playerMesh.position, 1.4);
      playerMesh.position.y = terrainHeight(playerMesh.position.x, playerMesh.position.z) + hoverY;
      spawnExplosion(startPos.add(new THREE.Vector3(0, 2, 0)), mechConfig.color, 10);
      Audio.play('dash');
      triggerCameraShake(0.5);
      break;
    }
    case 'GROUND_SLAM': {
      document.dispatchEvent(new CustomEvent('groundSlam', { detail: { position: playerMesh.position.clone() } }));
      triggerCameraShake(2.0);
      break;
    }
    case 'CLOAK': {
      if (isCloaked) return;
      isCloaked = true;
      cloakTimer = 3.0;
      playerMesh.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.14;
        }
      });
      break;
    }
    case 'SHIELD_WALL': {
      State.player.shield = State.player.maxShield;
      triggerCameraShake(0.8);
      spawnExplosion(playerMesh.position.clone().add(new THREE.Vector3(0, 3, 0)), mechConfig.accentColor, 14);
      break;
    }
  }
}

function endCloak() {
  isCloaked = false;
  if (playerMesh) {
    playerMesh.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = 1.0;
        child.material.transparent = false;
      }
    });
    // Booster glows must stay transparent
    boosterGlows.forEach(bg => { bg.material.transparent = true; });
  }
}

function clampToBounds(pos) {
  const d = Math.hypot(pos.x, pos.z);
  const R = CONFIG.WORLD.bounds;
  if (d > R) {
    pos.x *= R / d;
    pos.z *= R / d;
  }
}

let lastAbilityKey = false;
let lastMeleeKey = false;
let lastCamKey = false;

export function updatePlayer(dt) {
  if (!playerMesh || !mechConfig) return;

  // ── Look ──
  const { dx, dy } = consumeMouseDelta();
  cameraYaw -= dx * 0.0022;
  cameraPitch -= dy * 0.0022;
  if (cameraMode === 'first') {
    cameraPitch = Math.max(-1.15, Math.min(1.05, cameraPitch));
  } else {
    cameraPitch = Math.max(-0.65, Math.min(0.55, cameraPitch));
  }

  // ── Timers ──
  if (fireTimer > 0) fireTimer -= dt;
  if (heavyTimer > 0) heavyTimer -= dt;
  if (abilityCooldownTimer > 0) abilityCooldownTimer = Math.max(0, abilityCooldownTimer - dt);
  if (isCloaked) {
    cloakTimer -= dt;
    if (cloakTimer <= 0) endCloak();
  }

  // ── Reload ──
  if (isReloading) {
    reloadTimer -= dt;
    if (reloadTimer <= 0) {
      State.player.ammo = State.player.maxAmmo;
      isReloading = false;
      Audio.play('reload');
      const ind = document.getElementById('reload-indicator');
      if (ind) ind.style.display = 'none';
    }
  } else if ((isKeyDown('KeyR') || State.player.ammo === 0) && State.player.ammo < State.player.maxAmmo) {
    isReloading = true;
    reloadTimer = 1.8;
    Audio.play('reload');
    const ind = document.getElementById('reload-indicator');
    if (ind) ind.style.display = 'block';
  }

  // ── Ability / melee keys ──
  const abilityKey = isKeyDown('KeyE');
  if (abilityKey && !lastAbilityKey) triggerAbility();
  lastAbilityKey = abilityKey;

  const meleeKey = isKeyDown('KeyQ');
  if (meleeKey && !lastMeleeKey) document.dispatchEvent(new CustomEvent('meleeTriggered'));
  lastMeleeKey = meleeKey;

  // Camera view toggle (V)
  const camKey = isKeyDown('KeyV');
  if (camKey && !lastCamKey) toggleCameraView();
  lastCamKey = camKey;

  // ── Movement ──
  const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
  const moveDir = new THREE.Vector3();
  if (isKeyDown('KeyW')) moveDir.addScaledVector(forward, -1);
  if (isKeyDown('KeyS')) moveDir.addScaledVector(forward, 1);
  if (isKeyDown('KeyA')) moveDir.addScaledVector(right, -1);
  if (isKeyDown('KeyD')) moveDir.addScaledVector(right, 1);
  const moving = moveDir.lengthSq() > 0;
  if (moving) moveDir.normalize();

  const wantsSprint = (isKeyDown('ShiftLeft') || isKeyDown('ShiftRight')) && moving;
  const isSprinting = wantsSprint && State.player.boost > 0;
  const speed = isSprinting ? mechConfig.boostSpeed : mechConfig.speed;

  if (isSprinting) {
    State.player.boost = Math.max(0, State.player.boost - 28 * dt);
  } else {
    State.player.boost = Math.min(State.player.maxBoost, State.player.boost + 16 * dt);
  }

  playerVelocity.x = THREE.MathUtils.lerp(playerVelocity.x, moveDir.x * speed, 9 * dt);
  playerVelocity.z = THREE.MathUtils.lerp(playerVelocity.z, moveDir.z * speed, 9 * dt);

  // ── Hover jets (Space) ──
  const isHovering = isKeyDown('Space') && State.player.boost > 0;
  if (isHovering) {
    hoverVel = THREE.MathUtils.lerp(hoverVel, 9, 5 * dt);
    State.player.boost = Math.max(0, State.player.boost - 14 * dt);
  } else {
    hoverVel -= 24 * dt; // gravity
  }
  hoverY += hoverVel * dt;
  if (hoverY <= 0) {
    if (hoverY < -0.05 && hoverVel < -8) Audio.play('bigStep'); // landing thud
    hoverY = 0;
    hoverVel = Math.max(0, hoverVel);
  }
  hoverY = Math.min(16, hoverY);

  // ── Apply ──
  playerMesh.position.x += playerVelocity.x * dt;
  playerMesh.position.z += playerVelocity.z * dt;
  clampToBounds(playerMesh.position);
  resolveCollisions(playerMesh.position, 1.5);
  const groundLevel = terrainHeight(playerMesh.position.x, playerMesh.position.z);
  playerMesh.position.y = groundLevel + hoverY;

  // ── Facing: toward camera when firing, toward movement otherwise ──
  const combatFacing = State.mouse.leftDown || State.mouse.rightDown;
  let targetAngle = null;
  if (combatFacing) {
    targetAngle = cameraYaw + Math.PI;
  } else if (moving) {
    targetAngle = Math.atan2(moveDir.x, moveDir.z);
  }
  if (targetAngle !== null) {
    let da = targetAngle - playerMesh.rotation.y;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    playerMesh.rotation.y += da * Math.min(1, 10 * dt);
  }

  // ── Walk animation ──
  const horizSpeed = Math.hypot(playerVelocity.x, playerVelocity.z);
  if (parts) {
    if (hoverY > 0.3) {
      // Airborne pose
      const lean = Math.min(0.35, horizSpeed * 0.015);
      [parts.leg0, parts.leg1].forEach((leg, i) => {
        if (leg) leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, 0.25 - i * 0.1, 6 * dt);
      });
      if (parts.torso) parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, lean, 4 * dt);
    } else if (horizSpeed > 0.6) {
      walkPhase += dt * horizSpeed * 0.55;
      const swing = Math.sin(walkPhase) * Math.min(0.55, horizSpeed * 0.035);
      if (parts.leg0) parts.leg0.rotation.x = swing;
      if (parts.leg1) parts.leg1.rotation.x = -swing;
      if (parts.arm0) parts.arm0.rotation.x = -swing * 0.6;
      if (parts.arm1) parts.arm1.rotation.x = swing * 0.35;
      if (parts.torso) parts.torso.rotation.x = 0;
      playerMesh.position.y += Math.abs(Math.cos(walkPhase)) * 0.12;

      // Footfall sound on each stride
      const stepIdx = Math.floor(walkPhase / Math.PI);
      if (stepIdx !== lastStepIdx) {
        lastStepIdx = stepIdx;
        Audio.play(mechConfig.scale > 1.15 ? 'bigStep' : 'step');
      }
    } else {
      // Idle: settle limbs
      ['leg0', 'leg1', 'arm0', 'arm1'].forEach(k => {
        if (parts[k]) parts[k].rotation.x = THREE.MathUtils.lerp(parts[k].rotation.x, 0, 8 * dt);
      });
    }
    // Pennant flutter
    if (parts.pennant) {
      parts.pennant.rotation.y = Math.sin(performance.now() / 280) * 0.4 + horizSpeed * 0.02;
    }
  }

  // ── Booster glow + trail ──
  const showBoost = isSprinting || (isHovering && hoverY > 0.1);
  boosterGlows.forEach(bg => { bg.material.opacity = showBoost ? 0.85 : 0; });
  if (showBoost && Math.random() < 0.55) {
    spawnBoostTrail(playerMesh.position.clone().add(new THREE.Vector3(0, 2.5, 0)), '#ff9a55');
  }

  // ── Camera ──
  const sc = mechConfig.scale;
  if (cameraMode === 'first') {
    // First person: eye at the helm, exact aim, walk bob
    playerMesh.visible = false;
    const bob = (hoverY < 0.3 && horizSpeed > 0.6) ? Math.abs(Math.cos(walkPhase)) * 0.18 : 0;
    camera.position.set(
      playerMesh.position.x,
      playerMesh.position.y + 4.85 * sc + bob,
      playerMesh.position.z
    );
    const lookDir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(cameraPitch, cameraYaw, 0, 'YXZ'));
    camera.lookAt(camera.position.clone().add(lookDir));
  } else {
    // Third person: over-shoulder, mech pushed left so targets stay visible
    playerMesh.visible = true;
    const dist = 12 + sc * 3;
    const cosP = Math.cos(cameraPitch);
    const side = 3.0;
    const camOffset = new THREE.Vector3(
      Math.sin(cameraYaw) * dist * cosP + Math.cos(cameraYaw) * side,
      (4.5 + sc) - Math.sin(cameraPitch) * dist * 0.85,
      Math.cos(cameraYaw) * dist * cosP - Math.sin(cameraYaw) * side
    );
    camTargetPos.copy(playerMesh.position).add(camOffset);
    const minCamY = terrainHeight(camTargetPos.x, camTargetPos.z) + 1.6;
    if (camTargetPos.y < minCamY) camTargetPos.y = minCamY;
    camera.position.lerp(camTargetPos, Math.min(1, 9 * dt));

    const lookTarget = playerMesh.position.clone().add(new THREE.Vector3(
      Math.cos(cameraYaw) * 2.4, 3.2 * sc + cameraPitch * 5, -Math.sin(cameraYaw) * 2.4
    ));
    camera.lookAt(lookTarget);
  }

  // Boost FOV kick
  const targetFov = 70 + (isSprinting ? 7 : 0) + (cameraMode === 'first' ? 5 : 0);
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov += (targetFov - camera.fov) * Math.min(1, 6 * dt);
    camera.updateProjectionMatrix();
  }
}
