// src/hud.js - HUD: bars, compass ribbon, radar, toasts, markers, location titles
import * as THREE from 'three';
import { State } from './state.js';
import { CONFIG } from './config.js';
import { camera } from './engine.js';
import { getAbilityCooldownPercent, cameraYaw, getPlayerPosition } from './player.js';
import { currentBoss, enemies } from './enemies.js';
import { getObjectiveTarget } from './quests.js';

const ABILITY_ICONS = {
  DASH_BLINK: '⇻',
  GROUND_SLAM: '⛒',
  CLOAK: '◍',
  SHIELD_WALL: '⛨'
};

export function initHUD() {
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.squire;
  const abilityName = document.getElementById('ability-name');
  if (abilityName) abilityName.textContent = mechCfg.abilityName;
  const abilityIcon = document.getElementById('ability-icon-inner');
  if (abilityIcon) {
    abilityIcon.textContent = ABILITY_ICONS[mechCfg.ability] || '✦';
    abilityIcon.style.color = mechCfg.color;
    abilityIcon.style.textShadow = `0 0 12px ${mechCfg.color}`;
  }

  let feed = document.getElementById('kill-feed');
  if (!feed) {
    feed = document.createElement('div');
    feed.id = 'kill-feed';
    feed.className = 'kill-feed';
    const gc = document.getElementById('game-container');
    if (gc) gc.appendChild(feed);
  }

  // Toast listener (bind once)
  if (!window.__toastBound) {
    window.__toastBound = true;
    document.addEventListener('toast', (e) => showToast(e.detail));
  }
}

// ────────────────────────────────────────────
// TOASTS
// ────────────────────────────────────────────
function showToast({ text, sub, kind }) {
  const wrap = document.getElementById('toast-container');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'gold' ? ' toast-gold' : '');
  el.innerHTML = `<div class="toast-title">${text}</div>${sub ? `<div class="toast-sub">${sub}</div>` : ''}`;
  wrap.appendChild(el);
  while (wrap.children.length > 3) wrap.removeChild(wrap.firstChild);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 600);
  }, 3600);
}

// ────────────────────────────────────────────
// LOCATION TITLE (RDR-style region reveal)
// ────────────────────────────────────────────
export function showLocationTitle(name, sub) {
  const el = document.getElementById('location-title');
  if (!el) return;
  el.querySelector('.loc-name').textContent = name;
  el.querySelector('.loc-sub').textContent = sub || '';
  el.classList.remove('show');
  void el.offsetWidth; // restart animation
  el.classList.add('show');
}

// ────────────────────────────────────────────
// INTERACTION PROMPT
// ────────────────────────────────────────────
export function setInteractionPrompt(text) {
  const el = document.getElementById('interaction-prompt');
  if (!el) return;
  if (text) {
    el.textContent = text;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

// ────────────────────────────────────────────
// MAIN HUD UPDATE
// ────────────────────────────────────────────
export function updateHUD() {
  const p = State.player;

  setBar('health-bar-fill', 'health-text', p.health, p.maxHealth);
  setBar('shield-bar-fill', 'shield-text', p.shield, p.maxShield);
  const boostBar = document.getElementById('boost-bar-fill');
  if (boostBar) boostBar.style.width = Math.max(0, (p.boost / p.maxBoost) * 100) + '%';

  setText('ammo-current', p.ammo);
  setText('ammo-max', p.maxAmmo);
  setText('score-value', p.score.toLocaleString());
  setText('kills-value', p.kills);
  setText('hud-gold-value', State.gold.toLocaleString());

  // Ability cooldown
  const cdOverlay = document.getElementById('ability-cooldown');
  const cdText = document.getElementById('ability-cooldown-text');
  const cdPercent = getAbilityCooldownPercent();
  if (cdOverlay) {
    if (cdPercent > 0) {
      cdOverlay.classList.remove('hidden');
      const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.squire;
      if (cdText) cdText.textContent = Math.ceil(cdPercent * mechCfg.abilityCooldown);
    } else {
      cdOverlay.classList.add('hidden');
    }
  }

  // Boss bar
  const bossContainer = document.getElementById('boss-health-container');
  if (bossContainer && currentBoss) {
    bossContainer.classList.remove('hidden');
    const fill = document.getElementById('boss-health-fill');
    if (fill) fill.style.width = Math.max(0, (currentBoss.health / currentBoss.maxHealth) * 100) + '%';
    const pips = bossContainer.querySelectorAll('.phase-pip');
    pips.forEach((pip, idx) => pip.classList.toggle('active', idx <= (currentBoss.currentPhase || 0)));
  }

  updateObjectivesPanel();
  updateCompass();
  updateObjectiveMarker();
}

function setBar(barId, textId, val, max) {
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);
  if (bar) bar.style.width = Math.max(0, (val / max) * 100) + '%';
  if (text) text.textContent = `${Math.ceil(val)} / ${max}`;
}
function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

// ────────────────────────────────────────────
// OBJECTIVES PANEL
// ────────────────────────────────────────────
function updateObjectivesPanel() {
  const objContainer = document.getElementById('mission-objectives');
  const objList = document.getElementById('objective-list');
  const objTitle = document.getElementById('objective-panel-title');
  if (!objContainer || !objList) return;

  const mission = State.currentMission;
  if (mission) {
    objContainer.classList.remove('hidden');
    if (objTitle) objTitle.textContent = mission.title.toUpperCase();
    renderObjList(objList, mission.objectives.map(o => ({
      text: o.type === 'kill' || o.type === 'collect' || o.type === 'beacon'
        ? `${o.text} (${o.current}/${o.required})`
        : o.text,
      complete: o.complete
    })));
  } else if (State.activeBounty) {
    objContainer.classList.remove('hidden');
    if (objTitle) objTitle.textContent = 'BOUNTY';
    renderObjList(objList, [{ text: `Hunt down ${State.activeBounty.name}`, complete: false }]);
  } else {
    objContainer.classList.add('hidden');
  }
}

function renderObjList(objList, items) {
  if (objList.children.length !== items.length) {
    objList.innerHTML = '';
    items.forEach(() => objList.appendChild(document.createElement('li')));
  }
  items.forEach((item, i) => {
    const li = objList.children[i];
    li.textContent = item.text;
    li.classList.toggle('complete', item.complete);
  });
}

// ────────────────────────────────────────────
// COMPASS RIBBON
// ────────────────────────────────────────────
const CARDINALS = [
  { b: 0, l: 'N' }, { b: Math.PI / 4, l: 'NE' }, { b: Math.PI / 2, l: 'E' }, { b: 3 * Math.PI / 4, l: 'SE' },
  { b: Math.PI, l: 'S' }, { b: -3 * Math.PI / 4, l: 'SW' }, { b: -Math.PI / 2, l: 'W' }, { b: -Math.PI / 4, l: 'NW' }
];

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function updateCompass() {
  const canvas = document.getElementById('compass-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const heading = -cameraYaw; // bearing the camera faces (0 = north)
  const pxPerRad = w / (Math.PI * 0.9);

  // Minor ticks every 15°
  ctx.strokeStyle = 'rgba(216,201,163,0.35)';
  ctx.lineWidth = 1;
  for (let deg = 0; deg < 360; deg += 15) {
    const b = (deg / 180) * Math.PI;
    const dx = wrapAngle(b - heading) * pxPerRad;
    if (Math.abs(dx) > w / 2) continue;
    const x = w / 2 + dx;
    ctx.beginPath();
    ctx.moveTo(x, h - 12);
    ctx.lineTo(x, h - 5);
    ctx.stroke();
  }

  // Cardinal letters
  ctx.font = '700 13px Cinzel, serif';
  ctx.textAlign = 'center';
  for (const c of CARDINALS) {
    const dx = wrapAngle(c.b - heading) * pxPerRad;
    if (Math.abs(dx) > w / 2) continue;
    ctx.fillStyle = c.l === 'N' ? '#ff8a3d' : 'rgba(232,221,196,0.9)';
    ctx.fillText(c.l, w / 2 + dx, h - 16);
  }

  // Objective tick
  const playerPos = getPlayerPosition();
  const target = getObjectiveTarget();
  if (target && playerPos) {
    const b = Math.atan2(target.x - playerPos.x, -(target.z - playerPos.z));
    const dx = wrapAngle(b - heading) * pxPerRad;
    const x = Math.max(8, Math.min(w - 8, w / 2 + dx));
    ctx.fillStyle = '#ffb35c';
    ctx.beginPath();
    ctx.moveTo(x, h - 30);
    ctx.lineTo(x + 5, h - 22);
    ctx.lineTo(x, h - 26);
    ctx.lineTo(x - 5, h - 22);
    ctx.closePath();
    ctx.fill();
  }

  // Center needle
  ctx.strokeStyle = '#e8ddc4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 12);
  ctx.lineTo(w / 2, h - 2);
  ctx.stroke();
}

// ────────────────────────────────────────────
// OBJECTIVE WORLD MARKER (projected diamond)
// ────────────────────────────────────────────
const _proj = new THREE.Vector3();

function updateObjectiveMarker() {
  const marker = document.getElementById('objective-marker');
  if (!marker) return;
  const playerPos = getPlayerPosition();
  const target = getObjectiveTarget();

  if (!target || !playerPos || !camera) {
    marker.classList.add('hidden');
    return;
  }

  const dist = Math.hypot(target.x - playerPos.x, target.z - playerPos.z);
  if (dist < 12) {
    marker.classList.add('hidden');
    return;
  }

  _proj.set(target.x, (playerPos.y || 0) + 6, target.z);
  _proj.project(camera);

  const behind = _proj.z > 1;
  let sx = (_proj.x * 0.5 + 0.5) * window.innerWidth;
  let sy = (-_proj.y * 0.5 + 0.5) * window.innerHeight;
  if (behind) {
    sx = window.innerWidth - sx;
    sy = window.innerHeight - 40;
  }
  sx = Math.max(40, Math.min(window.innerWidth - 40, sx));
  sy = Math.max(60, Math.min(window.innerHeight - 90, sy));

  marker.classList.remove('hidden');
  marker.style.left = sx + 'px';
  marker.style.top = sy + 'px';
  marker.querySelector('.om-label').textContent = target.label || '';
  marker.querySelector('.om-dist').textContent = Math.round(dist) + 'm';
}

// ────────────────────────────────────────────
// RADAR MINIMAP
// ────────────────────────────────────────────
export function updateMinimap() {
  const canvas = document.getElementById('minimap-canvas');
  if (!canvas) return;
  const playerPos = getPlayerPosition();
  if (!playerPos) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const range = 220; // world units shown
  const scale = (w / 2) / range;

  ctx.fillStyle = 'rgba(12,10,8,0.78)';
  ctx.fillRect(0, 0, w, h);

  // Range rings
  ctx.strokeStyle = 'rgba(216,201,163,0.18)';
  ctx.lineWidth = 1;
  [0.5, 1].forEach(f => {
    ctx.beginPath();
    ctx.arc(cx, cy, (w / 2 - 2) * f, 0, Math.PI * 2);
    ctx.stroke();
  });

  const dot = (x, z, color, r = 2.5) => {
    const dx = (x - playerPos.x) * scale;
    const dz = (z - playerPos.z) * scale;
    if (dx * dx + dz * dz > (w / 2 - 3) ** 2) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dz, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // Shrines (discovered gold, undiscovered dim)
  for (const s of CONFIG.SHRINES) {
    dot(s.x, s.z, State.discoveredShrines.includes(s.id) ? '#c9a227' : 'rgba(216,201,163,0.3)', 3);
  }

  // Enemies
  for (const e of enemies) {
    if (!e.mesh) continue;
    dot(e.mesh.position.x, e.mesh.position.z, e.tag && e.tag.startsWith('bounty:') ? '#ff3322' : '#ff5533', e.kind === 'structure' ? 4 : 2.5);
  }
  if (currentBoss && currentBoss.mesh) {
    const dx = (currentBoss.mesh.position.x - playerPos.x) * scale;
    const dz = (currentBoss.mesh.position.z - playerPos.z) * scale;
    if (dx * dx + dz * dz < (w / 2 - 4) ** 2) {
      ctx.strokeStyle = '#ff3322';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + dx - 5, cy + dz - 5); ctx.lineTo(cx + dx + 5, cy + dz + 5);
      ctx.moveTo(cx + dx + 5, cy + dz - 5); ctx.lineTo(cx + dx - 5, cy + dz + 5);
      ctx.stroke();
    }
  }

  // Objective (edge-clamped diamond)
  const target = getObjectiveTarget();
  if (target) {
    let dx = (target.x - playerPos.x) * scale;
    let dz = (target.z - playerPos.z) * scale;
    const d = Math.hypot(dx, dz);
    const maxR = w / 2 - 8;
    if (d > maxR) { dx *= maxR / d; dz *= maxR / d; }
    ctx.fillStyle = '#ffb35c';
    ctx.save();
    ctx.translate(cx + dx, cy + dz);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.5, -3.5, 7, 7);
    ctx.restore();
  }

  // Player: triangle pointing toward heading
  const heading = -cameraYaw;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(heading);
  ctx.fillStyle = '#e8ddc4';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(4.5, 5);
  ctx.lineTo(-4.5, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
