// src/input.js - Input handling
import { State } from './state.js';

export function initInput() {
  // Keyboard
  window.addEventListener('keydown', (e) => {
    State.keys[e.code] = true;
    // Prevent default for game keys
    if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      if (State.isPlaying && State.mouse.locked) e.preventDefault();
    }
    if (e.code === 'Escape' && State.isPlaying) {
      document.dispatchEvent(new CustomEvent('togglePause'));
    }
  });

  window.addEventListener('keyup', (e) => {
    State.keys[e.code] = false;
  });

  // Mouse movement
  document.addEventListener('mousemove', (e) => {
    if (State.mouse.locked) {
      State.mouse.dx += e.movementX || 0;
      State.mouse.dy += e.movementY || 0;
    }
  });

  // Mouse buttons
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) State.mouse.leftDown = true;
    if (e.button === 2) State.mouse.rightDown = true;
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button === 0) State.mouse.leftDown = false;
    if (e.button === 2) State.mouse.rightDown = false;
  });

  // Context menu prevention
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Pointer lock change
  document.addEventListener('pointerlockchange', () => {
    State.mouse.locked = document.pointerLockElement != null;
    if (!State.mouse.locked && State.isPlaying && !State.isPaused && !State.isGameOver) {
      // If lock lost without intentional pause, do nothing - player can click to re-lock
    }
  });
}

export function requestPointerLock() {
  const canvas = document.getElementById('game-canvas');
  if (canvas && document.pointerLockElement !== canvas) {
    canvas.requestPointerLock().catch(() => {});
  }
}

export function releasePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock();
  }
}

export function consumeMouseDelta() {
  const delta = { dx: State.mouse.dx, dy: State.mouse.dy };
  State.mouse.dx = 0;
  State.mouse.dy = 0;
  return delta;
}

export function isKeyDown(code) {
  return !!State.keys[code];
}
