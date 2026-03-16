// src/main.js - Game entry point and main loop
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { State } from './state.js';
import { initInput, requestPointerLock, releasePointerLock } from './input.js';
import { initEngine, scene, camera, renderer, clock, setupLighting } from './engine.js';
import { buildArena, clearWorld } from './world.js';
import { createPlayer, updatePlayer, playerMesh, resetPlayer } from './player.js';
import { clearEnemies, spawnEnemies, spawnBoss, updateEnemies, enemies, currentBoss, nullifyBoss } from './enemies.js';
import { clearProjectiles, updateProjectiles, firePlayerProjectile, tryMeleeAttack, handleGroundSlam } from './combat.js';
import { updateEffects, clearEffects, cameraShake } from './effects.js';
import { updateHUD, updateMinimap, initHUD } from './hud.js';
import { initUI, showScreen, showMissionComplete, updateStoryMap, updateHangarUI } from './ui.js';

let loopRunning = false;
let missionStartTime = 0;
let currentLevelKey = 'VILLAGE';
let objectivesInitialized = false;

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
function init() {
  State.load();
  initInput();
  initEngine();
  initUI();
  initHUD();
  simulateLoading();
  setupEventListeners();
}

function simulateLoading() {
  const bar = document.getElementById('loading-progress-fill');
  const text = document.getElementById('loading-text');
  let progress = 0;

  const steps = [
    'Initializing neural cores...',
    'Loading weapon systems...',
    'Building the arena...',
    'Calibrating mechs...',
    'Charging reactors...',
    'Ready for combat!'
  ];
  let stepIdx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      if (bar) bar.style.width = '100%';
      if (text) text.textContent = 'Ready for combat!';
      setTimeout(() => showScreen('main-menu'), 600);
      return;
    }
    if (bar) bar.style.width = progress + '%';
    const newStep = Math.floor((progress / 100) * steps.length);
    if (newStep !== stepIdx && newStep < steps.length) {
      stepIdx = newStep;
      if (text) text.textContent = steps[stepIdx];
    }
  }, 180);
}

// ─────────────────────────────────────────────────────────────
// START GAME
// ─────────────────────────────────────────────────────────────
function startGame(levelKey, mission) {
  currentLevelKey = levelKey || 'VILLAGE';
  State.currentLevel = currentLevelKey;
  State.currentMission = mission || null;
  objectivesInitialized = false;

  // Reset player stats
  State.resetPlayerStats();

  // Reinit HUD with current mech
  initHUD();

  // Show game screen
  showScreen('game-container');

  // Hide sub-screens
  const pauseMenu = document.getElementById('pause-menu');
  const gameOver = document.getElementById('game-over-screen');
  const missionComplete = document.getElementById('mission-complete-screen');
  if (pauseMenu) pauseMenu.classList.add('hidden');
  if (gameOver) gameOver.classList.add('hidden');
  if (missionComplete) { missionComplete.classList.add('hidden'); missionComplete.style.display = 'none'; }

  const levelConfig = CONFIG.LEVELS[currentLevelKey] || CONFIG.LEVELS.VILLAGE;

  setupLighting(levelConfig);
  buildArena(levelConfig);

  resetPlayer();
  createPlayer();

  clearEnemies();
  clearProjectiles();
  clearEffects();

  spawnEnemies(levelConfig.enemies, levelConfig.enemyTypes);
  if (levelConfig.boss) {
    spawnBoss(levelConfig.boss);
  } else {
    const bossContainer = document.getElementById('boss-health-container');
    if (bossContainer) bossContainer.classList.add('hidden');
  }

  // Mission objectives visibility
  const objContainer = document.getElementById('mission-objectives');
  if (objContainer) {
    if (mission) {
      objContainer.classList.remove('hidden');
    } else {
      objContainer.classList.add('hidden');
    }
  }

  State.isPlaying = true;
  State.isPaused = false;
  State.isGameOver = false;
  missionStartTime = Date.now();

  requestPointerLock();

  if (!loopRunning) {
    loopRunning = true;
    gameLoop();
  }
}

// ─────────────────────────────────────────────────────────────
// GAME LOOP
// ─────────────────────────────────────────────────────────────
function gameLoop() {
  requestAnimationFrame(gameLoop);

  const dt = Math.min(clock.getDelta(), 0.05);

  if (!State.isPlaying || State.isPaused) {
    renderer.render(scene, camera);
    return;
  }

  // ── Update player position global ref for enemies ──
  if (playerMesh) {
    window.__playerPosition = playerMesh.position;
  }

  // ── Input ──
  if (State.mouse.leftDown) {
    firePlayerProjectile();
  }

  // ── Update ──
  updatePlayer(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateEffects(dt);

  // ── World animations ──
  animateWorld(dt);

  // ── Check mission progress ──
  checkMissionProgress();

  // ── HUD ──
  updateHUD();
  if (playerMesh) {
    updateMinimap(playerMesh.position, enemies, currentBoss ? currentBoss.mesh.position : null);
  }

  // ── Camera shake ──
  if (cameraShake > 0) {
    camera.position.x += (Math.random() - 0.5) * cameraShake * 0.1;
    camera.position.y += (Math.random() - 0.5) * cameraShake * 0.05;
  }

  renderer.render(scene, camera);
}

let _lastTime = 0;
function animateWorld(dt) {
  _lastTime += dt;
  const t = _lastTime;

  scene.traverse(obj => {
    if (obj.userData.isRune) {
      obj.position.y = (obj.userData.baseY || (obj.userData.baseY = obj.position.y)) + Math.sin(t + obj.userData.floatOffset) * 0.8;
      obj.rotation.y += dt * 0.5;
      obj.rotation.x += dt * 0.3;
    }
    if (obj.userData.isFlame) {
      const f = 0.8 + Math.sin(t * 8 + obj.userData.flickerOffset) * 0.2;
      obj.scale.setScalar(f);
    }
    if (obj.userData.isTorchLight) {
      obj.intensity = 1.5 + Math.sin(t * 7 + obj.userData.flickerOffset) * 0.5;
    }
  });
}

// ─────────────────────────────────────────────────────────────
// MISSION PROGRESS
// ─────────────────────────────────────────────────────────────
function checkMissionProgress() {
  const mission = State.currentMission;

  if (State.mode === 'free') {
    // Free mode: spawn next wave when all enemies gone
    if (enemies.length === 0 && !currentBoss) {
      const levelConfig = CONFIG.LEVELS[currentLevelKey] || CONFIG.LEVELS.VILLAGE;
      State.player.wave += 1;
      const waveCount = Math.min(6 + State.player.wave * 2, 30);
      setTimeout(() => {
        if (State.isPlaying) {
          spawnEnemies(waveCount, levelConfig.enemyTypes);
        }
      }, 2000);
    }
    return;
  }

  if (!mission) return;

  // Check all objectives
  const allComplete = mission.objectives.every(obj => obj.complete);
  if (allComplete && !State.isGameOver) {
    endMission();
  }
}

// ─────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────
function setupEventListeners() {
  // Enemy killed
  document.addEventListener('enemyKilled', (e) => {
    const mission = State.currentMission;
    if (!mission) return;
    mission.objectives.forEach(obj => {
      if (obj.type === 'kill' && !obj.complete) {
        obj.current += 1;
        if (obj.current >= obj.required) {
          obj.complete = true;
          obj.current = obj.required;
        }
      }
    });
  });

  // Boss defeated
  document.addEventListener('bossDefeated', (e) => {
    // Null out the currentBoss reference in enemies module
    nullifyBoss();
    const mission = State.currentMission;
    if (mission) {
      mission.objectives.forEach(obj => {
        if (obj.type === 'boss' && !obj.complete) {
          obj.current = 1;
          obj.complete = true;
        }
      });
    }
  });

  // Player died
  document.addEventListener('playerDied', () => {
    handlePlayerDeath();
  });

  // Start mission (from UI)
  document.addEventListener('startMission', (e) => {
    const { levelId, mission } = e.detail;
    startGame(levelId, mission);
  });

  // Start free mode
  document.addEventListener('startFreeMode', () => {
    startGame('VILLAGE', null);
  });

  // Ground slam
  document.addEventListener('groundSlam', (e) => {
    handleGroundSlam(e.detail.position);
  });

  // Melee triggered from player.js
  document.addEventListener('meleeTriggered', () => {
    tryMeleeAttack();
  });

  // Toggle pause
  document.addEventListener('togglePause', () => {
    if (State.isPaused) unpause();
    else handlePause();
  });

  // Resume
  document.addEventListener('resumeGame', () => {
    unpause();
  });

  // Restart
  document.addEventListener('restartGame', () => {
    startGame(currentLevelKey, State.currentMission ? cloneMission(State.currentMission) : null);
  });

  // Return to menu
  document.addEventListener('returnToMenu', () => {
    returnToMenu();
  });

  // Canvas click to re-acquire pointer lock
  const canvas = document.getElementById('game-canvas');
  if (canvas) {
    canvas.addEventListener('click', () => {
      if (State.isPlaying && !State.isPaused) {
        requestPointerLock();
      }
    });
  }
}

function cloneMission(mission) {
  const orig = CONFIG.STORY_MISSIONS.find(m => m.id === mission.id);
  if (!orig) return mission;
  return {
    ...orig,
    objectives: orig.objectives.map(o => ({ ...o, current: 0, complete: false }))
  };
}

// ─────────────────────────────────────────────────────────────
// PAUSE / UNPAUSE
// ─────────────────────────────────────────────────────────────
function handlePause() {
  if (!State.isPlaying || State.isGameOver) return;
  State.isPaused = true;
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) pauseMenu.classList.remove('hidden');
  releasePointerLock();
}

function unpause() {
  State.isPaused = false;
  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) pauseMenu.classList.add('hidden');
  requestPointerLock();
}

// ─────────────────────────────────────────────────────────────
// PLAYER DEATH
// ─────────────────────────────────────────────────────────────
function handlePlayerDeath() {
  if (State.isGameOver) return;
  State.isPlaying = false;
  State.isGameOver = true;
  releasePointerLock();

  setTimeout(() => {
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.classList.remove('hidden');
      // Populate stats
      const scoreEl = document.getElementById('final-score');
      const killsEl = document.getElementById('final-kills');
      const waveEl = document.getElementById('final-wave');
      if (scoreEl) scoreEl.textContent = State.player.score.toLocaleString();
      if (killsEl) killsEl.textContent = State.player.kills;
      if (waveEl) waveEl.textContent = State.player.wave;
    }
  }, 1000);
}

// ─────────────────────────────────────────────────────────────
// MISSION END
// ─────────────────────────────────────────────────────────────
function endMission() {
  State.isPlaying = false;
  releasePointerLock();

  const mission = State.currentMission;
  if (!mission) return;

  const elapsed = Date.now() - missionStartTime;

  // Mark mission complete
  State.completeMission(mission.id);

  // Apply reward
  State.gold += mission.reward.gold || 0;
  if (mission.reward.unlocks) {
    State.unlockMech(mission.reward.unlocks);
  }
  if (mission.reward.unlockLevel) {
    State.unlockLevel(mission.reward.unlockLevel);
  }
  State.save();

  const stats = {
    goldEarned: mission.reward.gold || 0,
    kills: State.player.kills,
    time: elapsed,
    unlocks: mission.reward.unlocks || null
  };

  setTimeout(() => {
    showMissionComplete(stats);
  }, 800);
}

// ─────────────────────────────────────────────────────────────
// RETURN TO MENU
// ─────────────────────────────────────────────────────────────
function returnToMenu() {
  State.isPlaying = false;
  State.isPaused = false;
  releasePointerLock();

  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) pauseMenu.classList.add('hidden');

  showScreen('main-menu');
}

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);
