// src/main.js - Entry point, game loop, world state orchestration
import * as THREE from 'three';
import { CONFIG, regionAt, missionById } from './config.js';
import { State } from './state.js';
import { initInput, requestPointerLock, releasePointerLock, isKeyDown } from './input.js';
import { initEngine, scene, camera, renderer, clock, updateDayNight } from './engine.js';
import { buildWorld, updateWorldAnim, updatePickups, getNearestInteractable, getSmokeSources } from './world.js';
import { createPlayer, updatePlayer, playerMesh, resetPlayer, getPlayerPosition } from './player.js';
import { clearEnemies, updateEnemies, spawnSquad, enemies, currentBoss } from './enemies.js';
import { clearProjectiles, updateProjectiles, firePlayerPrimary, firePlayerHeavy, tryMeleeAttack, handleGroundSlam } from './combat.js';
import { updateEffects, clearEffects, cameraShake, updateAmbient, updateSmokeSources } from './effects.js';
import { updateHUD, updateMinimap, initHUD, showLocationTitle, setInteractionPrompt } from './hud.js';
import { initUI, showScreen, showMissionComplete, updateCampaignUI, openBountyBoard, toggleMapOverlay } from './ui.js';
import { initQuests, populateWorld, startMission as questStartMission, cleanupMission, isMissionComplete, useShrine, toast } from './quests.js';
import { Audio } from './audio.js';

let loopRunning = false;
let missionStartTime = 0;
let worldBuilt = false;

// Region / weather trackers
let currentRegionId = null;
let currentFogMul = 1.0;
let regionCheckTimer = 0;
let patrolTimer = 12;
let stormTimer = 200 + Math.random() * 180;
let stormActive = false;
let stormDuration = 0;
let lastInteractKey = false;
let lastMapKey = false;
let cinematicActive = false;
let cinematicTimeout = null;

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
function init() {
  State.load();
  initInput();
  initEngine();
  initUI();
  initHUD();
  initQuests();
  setupEventListeners();
  runLoadingSequence();
}

function ensureWorld() {
  if (worldBuilt) return;
  worldBuilt = true;
  buildWorld();
  populateWorld();
}

function runLoadingSequence() {
  const bar = document.getElementById('loading-progress-fill');
  const text = document.getElementById('loading-text');
  const steps = [
    'Stoking the furnace heart...',
    'Riveting the plate...',
    'Raising the dead kingdom...',
    'Waking the wayshrines...',
    'Saddling the engine...',
    'The ash is falling.'
  ];
  let progress = 0;
  let stepIdx = 0;
  let worldStarted = false;

  const interval = setInterval(() => {
    progress += Math.random() * 16 + 6;
    if (!worldStarted && progress > 25) {
      worldStarted = true;
      // Build the open world while the bar fills
      setTimeout(() => ensureWorld(), 30);
    }
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      if (bar) bar.style.width = '100%';
      if (text) text.textContent = steps[steps.length - 1];
      setTimeout(() => {
        ensureWorld();
        showScreen('main-menu');
        maybeAutoboot();
      }, 500);
      return;
    }
    if (bar) bar.style.width = progress + '%';
    const s = Math.floor((progress / 100) * steps.length);
    if (s !== stepIdx && s < steps.length) {
      stepIdx = s;
      if (text) text.textContent = steps[s];
    }
  }, 170);
}

function maybeAutoboot() {
  const params = new URLSearchParams(location.search);
  if (params.get('boot') === 'free') {
    document.dispatchEvent(new CustomEvent('startFreeMode'));
  }
}

// ─────────────────────────────────────────────
// DEPLOYMENT
// ─────────────────────────────────────────────
function commonDeploy(spawnX, spawnZ) {
  ensureWorld();
  State.resetPlayerStats();
  initHUD();
  showScreen('game-container');

  ['pause-menu', 'game-over-screen', 'bounty-overlay', 'map-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const mc = document.getElementById('mission-complete-screen');
  if (mc) { mc.classList.add('hidden'); mc.style.display = 'none'; }

  resetPlayer();
  createPlayer(spawnX, spawnZ);
  clearProjectiles();
  clearEffects();

  State.isPlaying = true;
  State.isPaused = false;
  State.isGameOver = false;
  missionStartTime = Date.now();
  currentRegionId = null; // force region title reveal

  if (!loopRunning) {
    loopRunning = true;
    gameLoop();
  }
}

function startFreeRoam() {
  cleanupMission();
  State.mode = 'free';
  const sp = State.respawnPoint || { x: 0, z: 420 };
  commonDeploy(sp.x, sp.z);
  requestPointerLock();
}

function startMissionFlow(missionId) {
  const def = missionById(missionId);
  if (!def) return;
  State.mode = 'story';
  const spawn = questStartMission(missionId);
  commonDeploy(spawn.x, spawn.z);
  showCinematic(def);
}

// Mission intro cinematic (letterbox)
function showCinematic(def) {
  const el = document.getElementById('cinematic');
  if (!el) { requestPointerLock(); return; }
  cinematicActive = true;
  State.isPaused = true;
  el.classList.remove('hidden');
  el.querySelector('.cin-chapter').textContent = `CHAPTER ${def.num}`;
  el.querySelector('.cin-title').textContent = def.title.toUpperCase();
  el.querySelector('.cin-lines').innerHTML = def.lines.map(l => `<div>${l}</div>`).join('');

  const finish = () => {
    if (!cinematicActive) return;
    cinematicActive = false;
    el.classList.add('hidden');
    el.removeEventListener('click', finish);
    if (cinematicTimeout) { clearTimeout(cinematicTimeout); cinematicTimeout = null; }
    State.isPaused = false;
    requestPointerLock();
  };
  el.addEventListener('click', finish);
  cinematicTimeout = setTimeout(finish, 4500);
}

// ─────────────────────────────────────────────
// GAME LOOP
// ─────────────────────────────────────────────
function gameLoop() {
  requestAnimationFrame(gameLoop);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = performance.now() / 1000;

  if (!State.isPlaying && !cinematicActive) {
    renderer.render(scene, camera);
    return;
  }

  // Day/night advances even in cinematics
  State.timeOfDay = (State.timeOfDay + dt / CONFIG.WORLD.dayLength) % 1;
  const playerPos = getPlayerPosition();
  updateDayNight(State.timeOfDay, currentFogMul, State.storm, playerPos, dt);

  const sunY = Math.sin((State.timeOfDay - 0.25) * Math.PI * 2);
  const night = Math.max(0, Math.min(1, -sunY * 2));
  Audio.setNight(night);

  updateWorldAnim(dt, t, night);

  if (State.isPaused) {
    renderer.render(scene, camera);
    return;
  }

  // ── Combat input ──
  if (State.mouse.leftDown) firePlayerPrimary();
  if (State.mouse.rightDown) firePlayerHeavy();

  // ── Core updates ──
  updatePlayer(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateEffects(dt);
  updatePickups(dt, playerPos);
  updateAmbient(dt, playerPos, State.storm);
  updateSmokeSources(dt, getSmokeSources(), playerPos);

  // ── World systems ──
  updateRegion(dt, playerPos);
  updateWeather(dt);
  updatePatrols(dt, playerPos);
  updateInteraction(playerPos);
  updateMapKey();

  // ── Mission progress ──
  if (State.currentMission && isMissionComplete() && !State.isGameOver) {
    endMission();
  }

  // ── HUD ──
  updateHUD();
  updateMinimap();

  // ── Camera shake ──
  if (cameraShake > 0) {
    camera.position.x += (Math.random() - 0.5) * cameraShake * 0.12;
    camera.position.y += (Math.random() - 0.5) * cameraShake * 0.06;
  }

  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────
// REGION TRACKING + FOG
// ─────────────────────────────────────────────
function updateRegion(dt, playerPos) {
  if (!playerPos) return;
  regionCheckTimer -= dt;
  if (regionCheckTimer <= 0) {
    regionCheckTimer = 0.5;
    const region = regionAt(playerPos.x, playerPos.z);
    if (region.id !== currentRegionId) {
      currentRegionId = region.id;
      State.currentRegion = region.id;
      showLocationTitle(region.name, region.sub || '');
      const regionEl = document.getElementById('region-value');
      if (regionEl) regionEl.textContent = region.name.toUpperCase();
    }
    // Smooth fog toward the region's mood
    const region2 = regionAt(playerPos.x, playerPos.z);
    const targetFog = region2.fogMul || 1;
    currentFogMul += (targetFog - currentFogMul) * 0.15;
  }
}

// ─────────────────────────────────────────────
// ASH STORMS
// ─────────────────────────────────────────────
function updateWeather(dt) {
  if (stormActive) {
    stormDuration -= dt;
    State.storm = Math.min(1, State.storm + dt * 0.15);
    if (stormDuration <= 0) {
      stormActive = false;
      stormTimer = 240 + Math.random() * 240;
      Audio.setStorm(0);
    }
  } else {
    State.storm = Math.max(0, State.storm - dt * 0.1);
    stormTimer -= dt;
    if (stormTimer <= 0) {
      stormActive = true;
      stormDuration = 50 + Math.random() * 35;
      Audio.setStorm(1);
      toast('ASH STORM', 'The dead kingdom is breathing. Keep your bearings.');
    }
  }
}

// ─────────────────────────────────────────────
// AMBIENT PATROLS (free roam)
// ─────────────────────────────────────────────
const PATROL_PACKS = [
  ['marauder', 'marauder'],
  ['marauder', 'hound', 'hound'],
  ['longbow', 'marauder'],
  ['ironclad', 'marauder'],
  ['hound', 'hound', 'hound']
];

function updatePatrols(dt, playerPos) {
  if (State.currentMission || !playerPos) return;
  patrolTimer -= dt;
  if (patrolTimer > 0) return;
  patrolTimer = CONFIG.WORLD.patrolInterval * (0.8 + Math.random() * 0.6);

  const ambientCount = enemies.filter(e => e.tag === 'ambient').length;
  if (ambientCount >= CONFIG.WORLD.maxAmbientEnemies) return;

  const a = Math.random() * Math.PI * 2;
  const r = 140 + Math.random() * 110;
  let x = playerPos.x + Math.cos(a) * r;
  let z = playerPos.z + Math.sin(a) * r;
  const d = Math.hypot(x, z);
  if (d > CONFIG.WORLD.bounds - 30) {
    x *= (CONFIG.WORLD.bounds - 30) / d;
    z *= (CONFIG.WORLD.bounds - 30) / d;
  }
  // Never spawn patrols inside the village
  if (Math.hypot(x, z - 380) < 160) return;

  const pack = PATROL_PACKS[Math.floor(Math.random() * PATROL_PACKS.length)];
  spawnSquad(x, z, pack, { tag: 'ambient', leash: 200 });
}

// ─────────────────────────────────────────────
// INTERACTION (F key: bounty board, shrines)
// ─────────────────────────────────────────────
function updateInteraction(playerPos) {
  if (!playerPos) return;
  const it = getNearestInteractable(playerPos, 10);
  if (it) {
    setInteractionPrompt(it.type === 'board' ? 'PRESS [F] — READ THE BOUNTY BOARD' : `PRESS [F] — REST AT ${it.name.toUpperCase()}`);
    const fNow = isKeyDown('KeyF');
    if (fNow && !lastInteractKey) {
      if (it.type === 'board') {
        releasePointerLock();
        openBountyBoard();
      } else if (it.type === 'shrine') {
        useShrine(it);
      }
    }
    lastInteractKey = fNow;
  } else {
    setInteractionPrompt(null);
    lastInteractKey = isKeyDown('KeyF');
  }
}

function updateMapKey() {
  const mNow = isKeyDown('KeyM');
  if (mNow && !lastMapKey) {
    const opened = toggleMapOverlay();
    if (opened) releasePointerLock();
    else requestPointerLock();
  }
  lastMapKey = mNow;
}

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────
function setupEventListeners() {
  document.addEventListener('startMission', (e) => {
    startMissionFlow(e.detail.missionId);
  });

  document.addEventListener('startFreeMode', () => {
    startFreeRoam();
  });

  document.addEventListener('playerDied', () => handlePlayerDeath());

  document.addEventListener('groundSlam', (e) => handleGroundSlam(e.detail.position));
  document.addEventListener('meleeTriggered', () => tryMeleeAttack());

  document.addEventListener('togglePause', () => {
    // Close overlays first
    const bounty = document.getElementById('bounty-overlay');
    if (bounty && !bounty.classList.contains('hidden')) {
      bounty.classList.add('hidden');
      requestPointerLock();
      return;
    }
    const mapO = document.getElementById('map-overlay');
    if (mapO && !mapO.classList.contains('hidden')) {
      mapO.classList.add('hidden');
      requestPointerLock();
      return;
    }
    if (cinematicActive) return;
    if (State.isPaused) unpause();
    else pause();
  });

  document.addEventListener('resumeGame', () => unpause());

  document.addEventListener('restartGame', () => {
    if (State.mode === 'story' && State.currentMission) {
      startMissionFlow(State.currentMission.id);
    } else if (State.mode === 'story' && State.lastMissionId) {
      startMissionFlow(State.lastMissionId);
    } else {
      startFreeRoam();
    }
  });

  document.addEventListener('returnToMenu', () => returnToMenu());

  document.addEventListener('overlayClosed', () => {
    if (State.isPlaying && !State.isPaused) requestPointerLock();
  });

  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    canvas.addEventListener('click', () => {
      if (State.isPlaying && !State.isPaused && !cinematicActive) requestPointerLock();
    });
  }
}

// ─────────────────────────────────────────────
// PAUSE
// ─────────────────────────────────────────────
function pause() {
  if (!State.isPlaying || State.isGameOver) return;
  State.isPaused = true;
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) {
    pauseMenu.classList.remove('hidden');
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) soundBtn.textContent = State.soundOn ? '♪ SOUND: ON' : '♪ SOUND: OFF';
    const restartBtn = document.getElementById('pause-restart-btn');
    if (restartBtn) restartBtn.style.display = State.currentMission ? 'block' : 'none';
  }
  releasePointerLock();
}

function unpause() {
  State.isPaused = false;
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) pauseMenu.classList.add('hidden');
  requestPointerLock();
}

// ─────────────────────────────────────────────
// DEATH
// ─────────────────────────────────────────────
function handlePlayerDeath() {
  if (State.isGameOver) return;

  if (State.mode === 'free') {
    // RDR-style: wake at the last wayshrine, lighter in the pockets
    const penalty = Math.min(State.gold, Math.max(25, Math.floor(State.gold * 0.1)));
    State.gold -= penalty;
    State.save();
    const sp = State.respawnPoint || { x: 0, z: 420 };
    State.resetPlayerStats();
    resetPlayer();
    createPlayer(sp.x, sp.z);
    clearProjectiles();
    toast('YOUR ENGINE FELL', `Dragged to the wayshrine — lost ${penalty} gold`, 'info');
    Audio.play('missionFail');
    return;
  }

  // Story: mission failed
  State.isPlaying = false;
  State.isGameOver = true;
  State.lastMissionId = State.currentMission ? State.currentMission.id : null;
  releasePointerLock();
  Audio.play('missionFail');

  setTimeout(() => {
    const screen = document.getElementById('game-over-screen');
    if (screen) {
      screen.classList.remove('hidden');
      setTextById('final-score', State.player.score.toLocaleString());
      setTextById('final-kills', State.player.kills);
    }
  }, 900);
}

function setTextById(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

// ─────────────────────────────────────────────
// MISSION COMPLETE
// ─────────────────────────────────────────────
function endMission() {
  const mission = State.currentMission;
  if (!mission) return;

  State.isPlaying = false;
  releasePointerLock();
  Audio.play('missionComplete');

  const elapsed = Date.now() - missionStartTime;

  State.completeMission(mission.id);
  State.addGold(mission.reward.gold || 0);
  if (mission.reward.unlocks) State.unlockMech(mission.reward.unlocks);
  if (mission.reward.unlockMission) State.unlockMission(mission.reward.unlockMission);
  State.lastMissionId = mission.id;
  State.save();

  const stats = {
    goldEarned: mission.reward.gold || 0,
    kills: State.player.kills,
    time: elapsed,
    unlocks: mission.reward.unlocks || null
  };

  cleanupMission();

  setTimeout(() => showMissionComplete(stats), 800);
}

// ─────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────
function returnToMenu() {
  State.isPlaying = false;
  State.isPaused = false;
  cleanupMission();
  State.save();
  releasePointerLock();
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) pauseMenu.classList.add('hidden');
  showScreen('main-menu');
}

// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
