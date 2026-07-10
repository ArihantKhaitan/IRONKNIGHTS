// src/ui.js - Screens: menu, campaign map, forge, bounty board, world map, pause
import { CONFIG, missionById } from './config.js';
import { State } from './state.js';
import { getAvailableBounties, acceptBounty } from './quests.js';
import { getPlayerPosition } from './player.js';
import { getObjectiveTarget } from './quests.js';
import { Audio } from './audio.js';

const ALL_SCREENS = [
  'loading-screen', 'main-menu', 'forge-screen', 'controls-screen',
  'campaign-screen', 'game-container', 'mission-complete-screen'
];

export function showScreen(id) {
  ALL_SCREENS.forEach(sid => {
    const el = document.getElementById(sid);
    if (!el) return;
    if (sid === id) {
      el.classList.remove('hidden');
      el.style.display = '';
    } else {
      el.classList.add('hidden');
      el.style.display = 'none';
    }
  });
  State.screen = id;
}

// ────────────────────────────────────────────
// WORLD MAP RENDERER (campaign screen + M overlay)
// ────────────────────────────────────────────
export function renderWorldMap(canvas, opts = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  const toMap = (x, z) => [
    w / 2 + (x / 760) * (w / 2),
    h / 2 + (z / 760) * (h / 2)
  ];

  // Parchment
  const grad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.7);
  grad.addColorStop(0, '#2a221a');
  grad.addColorStop(1, '#17120d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Playable land
  const [lcx, lcy] = toMap(0, 0);
  ctx.beginPath();
  ctx.arc(lcx, lcy, (700 / 760) * (w / 2), 0, Math.PI * 2);
  ctx.fillStyle = '#241d15';
  ctx.fill();
  ctx.strokeStyle = 'rgba(216,201,163,0.25)';
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Regions
  for (const r of Object.values(CONFIG.REGIONS)) {
    const [rx, ry] = toMap(r.center.x, r.center.z);
    const rr = (r.radius / 760) * (w / 2);
    ctx.beginPath();
    ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(216,201,163,0.045)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(216,201,163,0.14)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,221,196,0.75)';
    ctx.font = `700 ${Math.max(10, w * 0.016)}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.fillText(r.name.toUpperCase(), rx, ry - rr - 6);
  }

  // Roads
  ctx.strokeStyle = 'rgba(216,201,163,0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  const roads = [
    [[0, 440], [0, 60], [40, -330], [55, -420]],
    [[0, 60], [-240, 10], [-400, -60]],
    [[0, 60], [240, 70], [400, 70]]
  ];
  for (const road of roads) {
    ctx.beginPath();
    road.forEach(([x, z], i) => {
      const [mx, my] = toMap(x, z);
      if (i === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    });
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Camps
  for (const c of CONFIG.CAMPS) {
    const [mx, my] = toMap(c.x, c.z);
    ctx.fillStyle = State.clearedCamps.includes(c.id) ? 'rgba(140,150,120,0.5)' : '#b3402a';
    ctx.font = `${Math.max(9, w * 0.015)}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('▲', mx, my + 3);
  }

  // Shrines
  for (const s of CONFIG.SHRINES) {
    const [mx, my] = toMap(s.x, s.z);
    ctx.fillStyle = State.discoveredShrines.includes(s.id) ? '#c9a227' : 'rgba(216,201,163,0.35)';
    ctx.fillText('◆', mx, my + 3);
  }

  // Mission node highlight
  if (opts.mission) {
    const region = CONFIG.REGIONS[opts.mission.region];
    if (region) {
      const [mx, my] = toMap(opts.mission.spawn.x, opts.mission.spawn.z);
      ctx.strokeStyle = '#ff8a3d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff8a3d';
      ctx.font = `700 ${Math.max(11, w * 0.018)}px Cinzel, serif`;
      ctx.fillText(opts.mission.num, mx, my + 4);
    }
  }

  // Objective
  const target = getObjectiveTarget && getObjectiveTarget();
  if (opts.live && target) {
    const [mx, my] = toMap(target.x, target.z);
    ctx.fillStyle = '#ffb35c';
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }

  // Player
  const pp = getPlayerPosition && getPlayerPosition();
  if (opts.live && pp) {
    const [mx, my] = toMap(pp.x, pp.z);
    ctx.fillStyle = '#e8ddc4';
    ctx.beginPath();
    ctx.arc(mx, my, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,221,196,0.5)';
    ctx.beginPath();
    ctx.arc(mx, my, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ────────────────────────────────────────────
// CAMPAIGN SCREEN
// ────────────────────────────────────────────
let selectedMissionId = null;

export function updateCampaignUI() {
  const list = document.getElementById('mission-list');
  if (!list) return;
  list.innerHTML = '';

  CONFIG.MISSIONS.forEach(m => {
    const unlocked = State.isMissionUnlocked(m.id);
    const done = State.isMissionComplete(m.id);
    const item = document.createElement('div');
    item.className = 'mission-item' + (done ? ' done' : unlocked ? ' unlocked' : ' locked') + (selectedMissionId === m.id ? ' selected' : '');
    item.innerHTML = `
      <div class="mi-num">${m.num}</div>
      <div class="mi-body">
        <div class="mi-title">${m.title}</div>
        <div class="mi-region">${CONFIG.REGIONS[m.region] ? CONFIG.REGIONS[m.region].name : ''}</div>
      </div>
      <div class="mi-status">${done ? '✓' : unlocked ? '' : '🔒'}</div>
    `;
    if (unlocked) {
      item.addEventListener('click', () => {
        Audio.play('ui');
        selectedMissionId = m.id;
        updateCampaignUI();
      });
    }
    list.appendChild(item);
  });

  // Briefing panel
  const briefTitle = document.getElementById('brief-title');
  const briefDesc = document.getElementById('brief-desc');
  const briefReward = document.getElementById('brief-reward');
  const deployBtn = document.getElementById('deploy-mission-btn');

  const m = selectedMissionId ? missionById(selectedMissionId) : null;
  if (m && State.isMissionUnlocked(m.id)) {
    if (briefTitle) briefTitle.textContent = `${m.num}. ${m.title}`;
    if (briefDesc) briefDesc.textContent = m.brief;
    if (briefReward) {
      briefReward.innerHTML = `<span class="rw-gold">◆ ${m.reward.gold} gold</span>` +
        (m.reward.unlocks ? `<span class="rw-unlock">Unlocks: ${CONFIG.MECHS[m.reward.unlocks].name}</span>` : '');
    }
    if (deployBtn) {
      deployBtn.style.display = 'block';
      deployBtn.dataset.missionId = m.id;
      deployBtn.textContent = State.isMissionComplete(m.id) ? 'RIDE AGAIN ▶' : 'RIDE OUT ▶';
    }
  } else {
    if (briefTitle) briefTitle.textContent = 'SELECT A CHAPTER';
    if (briefDesc) briefDesc.textContent = 'Choose an unlocked chapter of the campaign to read its briefing.';
    if (briefReward) briefReward.innerHTML = '';
    if (deployBtn) deployBtn.style.display = 'none';
  }

  const mapCanvas = document.getElementById('campaign-map-canvas');
  if (mapCanvas) renderWorldMap(mapCanvas, { mission: m && State.isMissionUnlocked(m.id) ? m : null });
}

// ────────────────────────────────────────────
// FORGE (mechs + upgrades)
// ────────────────────────────────────────────
export function updateForgeUI() {
  const goldEl = document.getElementById('forge-gold');
  if (goldEl) goldEl.textContent = State.gold.toLocaleString();

  const selection = document.getElementById('mech-selection');
  if (selection) {
    selection.innerHTML = '';
    Object.values(CONFIG.MECHS).forEach(mech => {
      const isUnlocked = State.isMechUnlocked(mech.id);
      const isSelected = State.selectedMech === mech.id;
      const canAfford = State.gold >= mech.price;

      const card = document.createElement('div');
      card.className = `mech-card${isSelected ? ' selected' : ''}${!isUnlocked ? ' locked' : ''}`;
      card.style.setProperty('--mech-color', mech.color);

      const speedPct = Math.round((mech.speed / 22) * 100);
      const armorPct = Math.round((mech.health / 850) * 100);
      const powerPct = Math.round((mech.damage / 50) * 100);

      card.innerHTML = `
        <div class="mech-name">${mech.name}</div>
        <div class="mech-title">${mech.title}</div>
        <div class="mech-desc">${mech.desc}</div>
        <div class="mech-stats">
          <div class="stat-row"><span class="stat-label">SPEED</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${speedPct}%"></div></div></div>
          <div class="stat-row"><span class="stat-label">HULL</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${armorPct}%"></div></div></div>
          <div class="stat-row"><span class="stat-label">POWER</span><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${powerPct}%"></div></div></div>
        </div>
        <div class="mech-ability"><span class="ability-label">ART:</span> <span class="ability-title">${mech.abilityName}</span> — ${mech.abilityDesc}</div>
        <div class="mech-footer">
          ${isSelected ? '<div class="mech-badge equipped">MOUNTED</div>'
            : isUnlocked ? '<div class="mech-badge unlocked">MOUNT</div>'
            : canAfford ? `<div class="mech-badge buyable">◆ ${mech.price} — FORGE IT</div>`
            : `<div class="mech-badge locked-badge">◆ ${mech.price}</div>`}
        </div>
      `;

      card.addEventListener('click', () => {
        if (isUnlocked) {
          State.selectedMech = mech.id;
          State.save();
          Audio.play('ui');
          updateForgeUI();
        } else if (canAfford && mech.price > 0) {
          State.spendGold(mech.price);
          State.unlockMech(mech.id);
          State.selectedMech = mech.id;
          State.save();
          Audio.play('missionComplete');
          updateForgeUI();
        } else {
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 400);
        }
      });
      selection.appendChild(card);
    });
  }

  // Upgrade tracks
  const upgWrap = document.getElementById('upgrade-tracks');
  if (upgWrap) {
    upgWrap.innerHTML = '';
    Object.values(CONFIG.UPGRADES).forEach(track => {
      const owned = State.upgrades[track.id] || 0;
      const next = owned < track.tiers.length ? track.tiers[owned] : null;
      const el = document.createElement('div');
      el.className = 'upgrade-track';
      el.innerHTML = `
        <div class="ut-head"><span class="ut-icon">${track.icon}</span><span class="ut-name">${track.name}</span></div>
        <div class="ut-desc">${track.desc}</div>
        <div class="ut-pips">${track.tiers.map((_, i) => `<span class="ut-pip${i < owned ? ' owned' : ''}"></span>`).join('')}</div>
        <div class="ut-bonus">${owned > 0 ? track.fmt(track.tiers[owned - 1].bonus) : 'No upgrades'}</div>
        ${next
          ? `<button class="ut-buy${State.gold >= next.cost ? '' : ' cant'}" data-track="${track.id}">◆ ${next.cost} — ${track.fmt(next.bonus)}</button>`
          : '<div class="ut-max">MASTERWORK</div>'}
      `;
      upgWrap.appendChild(el);
    });
    upgWrap.querySelectorAll('.ut-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.track;
        const track = CONFIG.UPGRADES[id];
        const owned = State.upgrades[id] || 0;
        const next = track.tiers[owned];
        if (next && State.spendGold(next.cost)) {
          State.upgrades[id] = owned + 1;
          State.save();
          Audio.play('missionComplete');
        } else {
          Audio.play('ui');
        }
        updateForgeUI();
      });
    });
  }
}

// ────────────────────────────────────────────
// BOUNTY BOARD OVERLAY
// ────────────────────────────────────────────
export function openBountyBoard() {
  const overlay = document.getElementById('bounty-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  renderBounties();
  document.exitPointerLock && document.exitPointerLock();
}

export function closeBountyBoard() {
  const overlay = document.getElementById('bounty-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function renderBounties() {
  const wrap = document.getElementById('bounty-posters');
  if (!wrap) return;
  wrap.innerHTML = '';

  if (State.activeBounty) {
    const b = State.activeBounty;
    const el = document.createElement('div');
    el.className = 'bounty-poster active-hunt';
    el.innerHTML = `
      <div class="bp-wanted">ACTIVE HUNT</div>
      <div class="bp-name">${b.name}</div>
      <div class="bp-crime">${b.crime}</div>
      <div class="bp-reward">◆ ${b.reward} GOLD</div>
      <div class="bp-hint">Last seen: ${b.regionHint}</div>
    `;
    wrap.appendChild(el);
  }

  getAvailableBounties().forEach(b => {
    const el = document.createElement('div');
    el.className = 'bounty-poster';
    el.innerHTML = `
      <div class="bp-wanted">WANTED — DEAD</div>
      <div class="bp-name">${b.name}</div>
      <div class="bp-crime">${b.crime}</div>
      <div class="bp-reward">◆ ${b.reward} GOLD</div>
      <div class="bp-hint">Last seen: ${b.regionHint}</div>
      <button class="bp-accept" data-bounty="${b.id}">TAKE THE CONTRACT</button>
    `;
    wrap.appendChild(el);
  });

  wrap.querySelectorAll('.bp-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      acceptBounty(btn.dataset.bounty);
      renderBounties();
    });
  });
}

// ────────────────────────────────────────────
// WORLD MAP OVERLAY (M key)
// ────────────────────────────────────────────
export function toggleMapOverlay(forceClose = false) {
  const overlay = document.getElementById('map-overlay');
  if (!overlay) return false;
  const isOpen = !overlay.classList.contains('hidden');
  if (isOpen || forceClose) {
    overlay.classList.add('hidden');
    return false;
  }
  overlay.classList.remove('hidden');
  const canvas = document.getElementById('world-map-canvas');
  if (canvas) renderWorldMap(canvas, { live: true, mission: State.currentMission });
  return true;
}

// ────────────────────────────────────────────
// MISSION COMPLETE
// ────────────────────────────────────────────
export function showMissionComplete(stats) {
  const screen = document.getElementById('mission-complete-screen');
  if (!screen) return;
  screen.classList.remove('hidden');
  screen.style.display = '';

  setText('complete-gold', `+${stats.goldEarned || 0}`);
  setText('complete-kills', stats.kills || 0);
  const timeEl = document.getElementById('complete-time');
  if (timeEl) {
    const secs = Math.floor((stats.time || 0) / 1000);
    timeEl.textContent = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  }
  const unlockEl = document.getElementById('complete-unlock');
  if (unlockEl) {
    if (stats.unlocks) {
      unlockEl.textContent = `NEW ENGINE FORGED: ${CONFIG.MECHS[stats.unlocks] ? CONFIG.MECHS[stats.unlocks].name : stats.unlocks}`;
      unlockEl.style.display = 'block';
    } else {
      unlockEl.style.display = 'none';
    }
  }
  State.save();
}

function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

// ────────────────────────────────────────────
// GLOBAL UI WIRING
// ────────────────────────────────────────────
export function initUI() {
  // First user gesture unlocks audio
  document.addEventListener('pointerdown', () => Audio.unlock(), { once: true });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    Audio.play('ui');
    handleMenuAction(btn.dataset.action, btn);
  });

  // Deploy mission
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#deploy-mission-btn');
    if (!btn || !btn.dataset.missionId) return;
    document.dispatchEvent(new CustomEvent('startMission', { detail: { missionId: btn.dataset.missionId } }));
  });

  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.style.display = 'none';
    gameContainer.classList.add('hidden');
  }
}

function handleMenuAction(action) {
  switch (action) {
    case 'free-mode':
      document.dispatchEvent(new CustomEvent('startFreeMode'));
      break;
    case 'campaign':
      updateCampaignUI();
      showScreen('campaign-screen');
      break;
    case 'forge':
      updateForgeUI();
      showScreen('forge-screen');
      break;
    case 'controls':
      showScreen('controls-screen');
      break;
    case 'menu':
      document.dispatchEvent(new CustomEvent('returnToMenu'));
      break;
    case 'resume':
      document.dispatchEvent(new CustomEvent('resumeGame'));
      break;
    case 'restart':
    case 'deploy-again':
      document.dispatchEvent(new CustomEvent('restartGame'));
      break;
    case 'sound-toggle': {
      Audio.setEnabled(!State.soundOn);
      const btn = document.getElementById('sound-toggle-btn');
      if (btn) btn.textContent = State.soundOn ? '♪ SOUND: ON' : '♪ SOUND: OFF';
      break;
    }
    case 'close-bounty':
      closeBountyBoard();
      document.dispatchEvent(new CustomEvent('overlayClosed'));
      break;
    case 'close-map':
      toggleMapOverlay(true);
      document.dispatchEvent(new CustomEvent('overlayClosed'));
      break;
    case 'next-mission': {
      const cur = State.currentMission;
      const curId = cur ? cur.id : (State.lastMissionId || State.completedMissions[State.completedMissions.length - 1] || null);
      const idx = CONFIG.MISSIONS.findIndex(m => m.id === curId);
      const next = idx >= 0 && idx < CONFIG.MISSIONS.length - 1 ? CONFIG.MISSIONS[idx + 1] : null;
      if (next && State.isMissionUnlocked(next.id)) {
        document.dispatchEvent(new CustomEvent('startMission', { detail: { missionId: next.id } }));
      } else {
        updateCampaignUI();
        showScreen('campaign-screen');
      }
      break;
    }
    case 'complete-forge':
      updateForgeUI();
      showScreen('forge-screen');
      break;
  }
}
