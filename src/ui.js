// src/ui.js - UI screens and menus
import { State } from './state.js';
import { CONFIG } from './config.js';

const ALL_SCREENS = [
  'loading-screen',
  'main-menu',
  'hangar-screen',
  'controls-screen',
  'story-map-screen',
  'game-container',
  'mission-complete-screen'
];

export function showScreen(id) {
  ALL_SCREENS.forEach(screenId => {
    const el = document.getElementById(screenId);
    if (el) {
      if (screenId === id) {
        el.classList.remove('hidden');
        el.style.display = '';
      } else {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    }
  });
  State.screen = id;
}

export function updateHangarUI() {
  const goldEl = document.getElementById('hangar-gold');
  if (goldEl) goldEl.textContent = State.gold;

  const selection = document.getElementById('mech-selection');
  if (!selection) return;
  selection.innerHTML = '';

  Object.values(CONFIG.MECHS).forEach(mech => {
    const isUnlocked = State.isMechUnlocked(mech.id);
    const isSelected = State.selectedMech === mech.id;
    const canAfford = State.gold >= mech.price;

    const card = document.createElement('div');
    card.className = `mech-card${isSelected ? ' selected' : ''}${!isUnlocked ? ' locked' : ''}`;
    card.dataset.mechId = mech.id;

    // 3D tilt handler
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${mx * 18}deg) rotateX(${-my * 18}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = isSelected ? 'scale(1.03)' : '';
    });

    // Stat values
    const speedPct = Math.round((mech.speed / 20) * 100);
    const armorPct = Math.round((mech.health / 800) * 100);
    const powerPct = Math.round((mech.damage / 45) * 100);

    card.innerHTML = `
      <div class="mech-preview ${mech.id}" style="--mech-color: ${mech.color}; --mech-accent: ${mech.accentColor};">
        <div class="mech-silhouette"></div>
        <div class="mech-glow-ring"></div>
      </div>
      <div class="mech-info">
        <div class="mech-name" style="color: ${mech.color}; text-shadow: 0 0 10px ${mech.color}">${mech.name}</div>
        <div class="mech-desc">${mech.desc}</div>
        <div class="mech-stats">
          <div class="stat-row">
            <span class="stat-label">SPEED</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${speedPct}%; background:${mech.color}; box-shadow: 0 0 8px ${mech.color}"></div></div>
          </div>
          <div class="stat-row">
            <span class="stat-label">ARMOR</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${armorPct}%; background:${mech.accentColor}; box-shadow: 0 0 8px ${mech.accentColor}"></div></div>
          </div>
          <div class="stat-row">
            <span class="stat-label">POWER</span>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${powerPct}%; background:#ff0044; box-shadow: 0 0 8px #ff0044"></div></div>
          </div>
        </div>
        <div class="mech-ability">
          <span class="ability-label">ABILITY:</span>
          <span class="ability-name" style="color:${mech.color}">${mech.abilityName}</span>
          <span class="ability-cd">${mech.abilityCooldown}s CD</span>
        </div>
        <div class="mech-footer">
          ${isSelected
            ? `<div class="mech-badge equipped">EQUIPPED</div>`
            : isUnlocked
              ? `<div class="mech-badge unlocked">SELECT</div>`
              : canAfford
                ? `<div class="mech-badge buyable"><span class="gold-icon">◆</span>${mech.price} GOLD</div>`
                : `<div class="mech-badge locked-badge"><span class="lock-icon">🔒</span>${mech.price} GOLD</div>`
          }
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (isUnlocked) {
        State.selectedMech = mech.id;
        State.save();
        updateHangarUI();
      } else if (canAfford && mech.price > 0) {
        State.gold -= mech.price;
        State.unlockMech(mech.id);
        State.selectedMech = mech.id;
        State.save();
        updateHangarUI();
      } else {
        // Shake animation
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
      }
    });

    selection.appendChild(card);
  });
}

export function updateStoryMap() {
  // Update level nodes
  document.querySelectorAll('.level-node').forEach(node => {
    const levelId = node.dataset.level;
    if (!levelId) return;
    node.classList.remove('locked', 'unlocked', 'completed');
    if (State.isLevelUnlocked(levelId)) {
      const levelMissions = CONFIG.STORY_MISSIONS.filter(m => m.level === levelId);
      const allComplete = levelMissions.every(m => State.isMissionComplete(m.id));
      if (allComplete && levelMissions.length > 0) {
        node.classList.add('completed');
      } else {
        node.classList.add('unlocked');
      }
    } else {
      node.classList.add('locked');
    }

    // Click handler
    node.addEventListener('click', () => {
      if (!State.isLevelUnlocked(levelId)) return;
      const missionForLevel = CONFIG.STORY_MISSIONS.find(m => m.level === levelId);
      if (!missionForLevel) return;

      document.querySelectorAll('.level-node').forEach(n => n.classList.remove('active-node'));
      node.classList.add('active-node');

      const titleEl = document.getElementById('selected-mission-title');
      const descEl = document.getElementById('selected-mission-desc');
      const rewardEl = document.getElementById('mission-reward');
      const startBtn = document.getElementById('start-mission-btn');

      if (titleEl) titleEl.textContent = missionForLevel.title;
      if (descEl) descEl.textContent = missionForLevel.description;
      if (rewardEl) {
        rewardEl.innerHTML = `
          <div class="reward-gold"><span class="gold-icon">◆</span> ${missionForLevel.reward.gold} Gold</div>
          ${missionForLevel.reward.unlocks ? `<div class="reward-unlock">Unlocks: ${missionForLevel.reward.unlocks.toUpperCase()} Mech</div>` : ''}
        `;
      }
      if (startBtn) {
        startBtn.dataset.level = levelId;
        startBtn.dataset.missionId = missionForLevel.id;
        startBtn.style.display = 'block';
      }
    });
  });

  // Update path elements
  document.querySelectorAll('.map-path').forEach(path => {
    const fromLevel = path.dataset.from;
    const toLevel = path.dataset.to;
    if (fromLevel && toLevel) {
      if (State.isLevelUnlocked(fromLevel) && State.isLevelUnlocked(toLevel)) {
        path.classList.add('unlocked');
      }
    }
  });
}

export function showMissionComplete(stats) {
  const screen = document.getElementById('mission-complete-screen');
  if (!screen) return;
  screen.classList.remove('hidden');
  screen.style.display = '';

  const goldEl = document.getElementById('complete-gold');
  const killsEl = document.getElementById('complete-kills');
  const timeEl = document.getElementById('complete-time');
  const unlockEl = document.getElementById('complete-unlock');

  if (goldEl) goldEl.textContent = `+${stats.goldEarned || 0}`;
  if (killsEl) killsEl.textContent = stats.kills || 0;
  if (timeEl) {
    const secs = Math.floor((stats.time || 0) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }
  if (unlockEl) {
    if (stats.unlocks) {
      unlockEl.textContent = `UNLOCKED: ${stats.unlocks.toUpperCase()} MECH`;
      unlockEl.style.display = 'block';
    } else {
      unlockEl.style.display = 'none';
    }
  }

  State.save();
}

export function initUI() {
  // Attach data-action buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    handleMenuAction(btn.dataset.action, btn);
  });

  // Start mission button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#start-mission-btn');
    if (!btn) return;
    const levelId = btn.dataset.level;
    const missionId = btn.dataset.missionId;
    if (!levelId || !missionId) return;
    const mission = CONFIG.STORY_MISSIONS.find(m => m.id === missionId);
    if (!mission) return;

    // Deep clone mission objectives so we don't mutate CONFIG
    const missionCopy = {
      ...mission,
      objectives: mission.objectives.map(o => ({ ...o, current: 0, complete: false }))
    };

    document.dispatchEvent(new CustomEvent('startMission', {
      detail: { levelId, mission: missionCopy }
    }));
  });

  // Window resize
  window.addEventListener('resize', () => {
    // handled in engine.js
  });

  // Initial screen hide setup - just ensure game-container is hidden
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    gameContainer.style.display = 'none';
    gameContainer.classList.add('hidden');
  }
}

function handleMenuAction(action, btn) {
  switch (action) {
    case 'story-mode':
      State.mode = 'story';
      updateStoryMap();
      showScreen('story-map-screen');
      break;
    case 'free-mode':
      State.mode = 'free';
      document.dispatchEvent(new CustomEvent('startFreeMode'));
      break;
    case 'hangar':
      updateHangarUI();
      showScreen('hangar-screen');
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
      document.dispatchEvent(new CustomEvent('restartGame'));
      break;
    case 'next-mission': {
      const currentMission = State.currentMission;
      if (currentMission) {
        const idx = CONFIG.STORY_MISSIONS.findIndex(m => m.id === currentMission.id);
        if (idx < CONFIG.STORY_MISSIONS.length - 1) {
          const next = CONFIG.STORY_MISSIONS[idx + 1];
          if (State.isLevelUnlocked(next.level)) {
            const nextCopy = {
              ...next,
              objectives: next.objectives.map(o => ({ ...o, current: 0, complete: false }))
            };
            document.dispatchEvent(new CustomEvent('startMission', {
              detail: { levelId: next.level, mission: nextCopy }
            }));
          } else {
            showScreen('story-map-screen');
            updateStoryMap();
          }
        } else {
          showScreen('main-menu');
        }
      }
      break;
    }
    case 'hangar-back':
    case 'controls-back':
    case 'story-back':
      showScreen('main-menu');
      break;
    case 'complete-continue':
      showScreen('story-map-screen');
      updateStoryMap();
      break;
    case 'complete-armory':
      updateHangarUI();
      showScreen('hangar-screen');
      break;
    case 'deploy-again':
      document.dispatchEvent(new CustomEvent('restartGame'));
      break;
  }
}
