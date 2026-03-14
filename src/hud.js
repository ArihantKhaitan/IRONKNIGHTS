// src/hud.js - HUD rendering
import { State } from './state.js';
import { CONFIG } from './config.js';
import { getAbilityCooldownPercent } from './player.js';
import { currentBoss } from './enemies.js';

export function initHUD() {
  // Set ability icon/name from selected mech
  const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
  const abilityName = document.getElementById('ability-name');
  if (abilityName) abilityName.textContent = mechCfg.abilityName || mechCfg.ability;

  const abilityIcon = document.getElementById('ability-icon-inner');
  if (abilityIcon) {
    abilityIcon.style.background = mechCfg.color;
    abilityIcon.style.boxShadow = `0 0 12px ${mechCfg.color}`;
  }

  // Init kill feed
  let feed = document.getElementById('kill-feed');
  if (!feed) {
    feed = document.createElement('div');
    feed.id = 'kill-feed';
    feed.className = 'kill-feed';
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.appendChild(feed);
  }
}

export function updateHUD() {
  const p = State.player;

  // Health
  const healthBar = document.getElementById('health-bar-fill');
  const healthText = document.getElementById('health-text');
  if (healthBar) healthBar.style.width = Math.max(0, (p.health / p.maxHealth) * 100) + '%';
  if (healthText) healthText.textContent = `${Math.ceil(p.health)} / ${p.maxHealth}`;

  // Shield
  const shieldBar = document.getElementById('shield-bar-fill');
  const shieldText = document.getElementById('shield-text');
  if (shieldBar) shieldBar.style.width = Math.max(0, (p.shield / p.maxShield) * 100) + '%';
  if (shieldText) shieldText.textContent = `${Math.ceil(p.shield)} / ${p.maxShield}`;

  // Boost
  const boostBar = document.getElementById('boost-bar-fill');
  if (boostBar) boostBar.style.width = Math.max(0, (p.boost / p.maxBoost) * 100) + '%';

  // Ammo
  const ammoCurrent = document.getElementById('ammo-current');
  const ammoMax = document.getElementById('ammo-max');
  if (ammoCurrent) ammoCurrent.textContent = p.ammo;
  if (ammoMax) ammoMax.textContent = p.maxAmmo;

  // Score
  const scoreEl = document.getElementById('score-value');
  if (scoreEl) scoreEl.textContent = p.score.toLocaleString();

  // Kills
  const killsEl = document.getElementById('kills-value');
  if (killsEl) killsEl.textContent = p.kills;

  // Wave
  const waveEl = document.getElementById('wave-value');
  if (waveEl) waveEl.textContent = p.wave;

  // Gold
  const goldEl = document.getElementById('hud-gold-value');
  if (goldEl) goldEl.textContent = State.gold;

  // Ability cooldown
  const cdOverlay = document.getElementById('ability-cooldown');
  const cdText = document.getElementById('ability-cooldown-text');
  const cdPercent = getAbilityCooldownPercent();
  if (cdOverlay) {
    if (cdPercent > 0) {
      cdOverlay.classList.remove('hidden');
      const mechCfg = CONFIG.MECHS[State.selectedMech] || CONFIG.MECHS.striker;
      const secondsLeft = cdPercent * mechCfg.abilityCooldown;
      if (cdText) cdText.textContent = Math.ceil(secondsLeft);
    } else {
      cdOverlay.classList.add('hidden');
    }
  }

  // Boss health bar
  const bossContainer = document.getElementById('boss-health-container');
  if (currentBoss && bossContainer) {
    bossContainer.classList.remove('hidden');
    const bossFill = document.getElementById('boss-health-fill');
    if (bossFill) {
      const pct = Math.max(0, currentBoss.health / currentBoss.maxHealth) * 100;
      bossFill.style.width = pct + '%';
    }
    // Phase indicators
    const phaseIndicators = bossContainer.querySelectorAll('.phase-pip');
    if (phaseIndicators.length > 0) {
      phaseIndicators.forEach((pip, idx) => {
        pip.classList.toggle('active', idx <= currentBoss.currentPhase);
      });
    }
  }

  // Mission objectives
  updateObjectives();
}

function updateObjectives() {
  const mission = State.currentMission;
  if (!mission) return;

  const objContainer = document.getElementById('mission-objectives');
  const objList = document.getElementById('objective-list');
  if (!objContainer || !objList) return;

  objContainer.classList.remove('hidden');
  const items = objList.querySelectorAll('li');
  if (items.length !== mission.objectives.length) {
    // Rebuild
    objList.innerHTML = '';
    mission.objectives.forEach(obj => {
      const li = document.createElement('li');
      li.dataset.objId = obj.id;
      li.textContent = obj.text;
      if (obj.complete) li.classList.add('complete');
      objList.appendChild(li);
    });
  } else {
    // Update existing
    mission.objectives.forEach((obj, idx) => {
      if (items[idx]) {
        items[idx].classList.toggle('complete', obj.complete);
        if (obj.type === 'kill' && !obj.complete) {
          items[idx].textContent = `${obj.text} (${obj.current}/${obj.required})`;
        }
      }
    });
  }
}

export function updateMinimap(playerPos, enemyList, bossPos) {
  const canvas = document.getElementById('minimap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = cx / 145; // arena radius 145 maps to half canvas

  // Clear
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, w, h);

  // Arena boundary
  ctx.strokeStyle = 'rgba(0,255,249,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
  ctx.stroke();

  // Enemies as red dots
  if (enemyList) {
    enemyList.forEach(e => {
      if (!e || !e.mesh) return;
      const ex = cx + e.mesh.position.x * scale;
      const ey = cy + e.mesh.position.z * scale;
      ctx.fillStyle = e.isBoss ? '#ff4400' : '#ff0044';
      ctx.beginPath();
      ctx.arc(ex, ey, e.isBoss ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Boss as larger red X
  if (bossPos) {
    const bx = cx + bossPos.x * scale;
    const by = cy + bossPos.z * scale;
    ctx.strokeStyle = '#ff4400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 5, by - 5); ctx.lineTo(bx + 5, by + 5);
    ctx.moveTo(bx + 5, by - 5); ctx.lineTo(bx - 5, by + 5);
    ctx.stroke();
  }

  // Player as cyan triangle at center
  if (playerPos) {
    const px = cx + playerPos.x * scale;
    const py = cy + playerPos.z * scale;
    ctx.fillStyle = '#00fff9';
    ctx.beginPath();
    ctx.moveTo(px, py - 5);
    ctx.lineTo(px + 4, py + 4);
    ctx.lineTo(px - 4, py + 4);
    ctx.closePath();
    ctx.fill();
  }
}
