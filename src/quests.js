// src/quests.js - Missions, bounties, camps, objectives
import { CONFIG, missionById } from './config.js';
import { State } from './state.js';
import { spawnSquad, spawnBoss, spawnBeacon, spawnCamp, spawnBountyTarget, clearEnemies, countByTagPrefix, enemies, currentBoss, nullifyBoss } from './enemies.js';
import { spawnPickup, pickups } from './world.js';
import { getPlayerPosition } from './player.js';
import { Audio } from './audio.js';

let missionPickups = [];
let campsSpawned = false;
let availableBounties = [];

export function toast(text, sub = '', kind = 'info') {
  document.dispatchEvent(new CustomEvent('toast', { detail: { text, sub, kind } }));
}

// ────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────
export function initQuests() {
  document.addEventListener('enemyKilled', onEnemyKilled);
  document.addEventListener('bossDefeated', onBossDefeated);
  document.addEventListener('pickupCollected', onPickupCollected);
  document.addEventListener('bossPhaseChange', onBossPhaseChange);
  generateBounties();
}

// Called on first deploy into the world
export function populateWorld() {
  if (campsSpawned) return;
  campsSpawned = true;
  for (const camp of CONFIG.CAMPS) {
    spawnCamp(camp);
  }
}

// ────────────────────────────────────────────
// STORY MISSIONS
// ────────────────────────────────────────────
export function startMission(missionId) {
  const def = missionById(missionId);
  if (!def) return null;

  // Clear any previous mission remnants
  cleanupMission();

  const mission = {
    ...def,
    objectives: def.objectives.map(o => ({ ...o, current: 0, complete: false }))
  };
  State.currentMission = mission;
  State.mode = 'story';

  const setup = def.setup || {};
  (setup.squads || []).forEach(sq => {
    spawnSquad(sq.x, sq.z, sq.types, { tag: 'mission', leash: 160 });
  });
  (setup.beacons || []).forEach(b => {
    spawnBeacon(b.x, b.z, 'mission');
  });
  (setup.relics || []).forEach(r => {
    const p = spawnPickup(r.x, r.z, 'relic', 1, false);
    missionPickups.push(p);
  });
  if (setup.boss) {
    spawnBoss(setup.boss.id, setup.boss.x, setup.boss.z, 'missionBoss');
  }

  return def.spawn;
}

export function cleanupMission() {
  clearEnemies('mission');
  for (const p of missionPickups) {
    p.active = false;
    p.mesh.visible = false;
    p.respawn = -1;
  }
  missionPickups = [];
  State.currentMission = null;
}

export function isMissionComplete() {
  const m = State.currentMission;
  if (!m) return false;
  return m.objectives.every(o => o.complete);
}

// ────────────────────────────────────────────
// EVENT HANDLERS
// ────────────────────────────────────────────
function onEnemyKilled(e) {
  const enemy = e.detail.enemy;
  const mission = State.currentMission;

  // Mission kill / beacon objectives
  if (mission) {
    for (const obj of mission.objectives) {
      if (obj.complete) continue;
      if (obj.type === 'kill' && enemy.kind !== 'structure') {
        obj.current = Math.min(obj.required, obj.current + 1);
        if (obj.current >= obj.required) obj.complete = true;
      }
      if (obj.type === 'beacon' && enemy.type === 'beacon') {
        obj.current = Math.min(obj.required, obj.current + 1);
        if (obj.current >= obj.required) obj.complete = true;
        toast('SIEGE BEACON DESTROYED', `${obj.current} of ${obj.required}`);
      }
    }
  }

  // Bounty claimed
  if (enemy.tag && enemy.tag.startsWith('bounty:') && State.activeBounty) {
    const id = enemy.tag.slice(7);
    if (id === State.activeBounty.id) {
      const b = State.activeBounty;
      State.addGold(b.reward);
      State.activeBounty = null;
      State.save();
      Audio.play('missionComplete');
      toast('BOUNTY CLAIMED', `${b.name} — ${b.reward} gold`, 'gold');
      generateBounties();
    }
  }

  // Camp cleared
  if (enemy.tag && enemy.tag.startsWith('camp:')) {
    const campId = enemy.tag.slice(5);
    if (countByTagPrefix('camp:' + campId) === 0 && !State.clearedCamps.includes(campId)) {
      State.clearedCamps.push(campId);
      const camp = CONFIG.CAMPS.find(c => c.id === campId);
      if (camp) {
        State.addGold(camp.bonus);
        Audio.play('missionComplete');
        toast('CAMP CLEARED', `${camp.name} — ${camp.bonus} gold`, 'gold');
      }
    }
  }
}

function onBossDefeated() {
  nullifyBoss();
  const mission = State.currentMission;
  if (mission) {
    for (const obj of mission.objectives) {
      if (obj.type === 'boss' && !obj.complete) {
        obj.current = 1;
        obj.complete = true;
      }
    }
  }
}

function onPickupCollected(e) {
  const { type, amount } = e.detail;
  if (type === 'gold') {
    State.addGold(amount);
    Audio.play('gold');
  } else if (type === 'repair') {
    State.player.health = Math.min(State.player.maxHealth, State.player.health + amount);
    Audio.play('pickup');
  } else if (type === 'relic') {
    Audio.play('pickup');
    const mission = State.currentMission;
    if (mission) {
      for (const obj of mission.objectives) {
        if (obj.type === 'collect' && !obj.complete) {
          obj.current = Math.min(obj.required, obj.current + 1);
          if (obj.current >= obj.required) obj.complete = true;
          toast('REACTOR CORE RECOVERED', `${obj.current} of ${obj.required}`);
        }
      }
    }
  }
}

function onBossPhaseChange(e) {
  const { boss } = e.detail;
  // The Ashen King calls his dead court
  if (boss.type === 'ASHEN_KING') {
    spawnSquad(boss.mesh.position.x + 15, boss.mesh.position.z + 10, ['marauder', 'hound'], { tag: 'mission', leash: 200 });
  }
}

// ────────────────────────────────────────────
// BOUNTIES
// ────────────────────────────────────────────
const BOUNTY_SPOTS = [
  { x: -260, z: 220, region: 'The Ash Wastes' },
  { x: 200, z: -160, region: 'The Ashen Plains' },
  { x: -380, z: 120, region: 'Deadwood fringe' },
  { x: 480, z: -60, region: 'The Scarline' },
  { x: -120, z: -260, region: 'The north road' },
  { x: 320, z: 320, region: 'The south fields' }
];

export function generateBounties() {
  availableBounties = [];
  const usedNames = new Set();
  for (let i = 0; i < 3; i++) {
    let name;
    do {
      name = CONFIG.BOUNTY_NAMES[Math.floor(Math.random() * CONFIG.BOUNTY_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    const spot = BOUNTY_SPOTS[Math.floor(Math.random() * BOUNTY_SPOTS.length)];
    availableBounties.push({
      id: 'B' + Date.now().toString(36) + i,
      name,
      crime: CONFIG.BOUNTY_CRIMES[Math.floor(Math.random() * CONFIG.BOUNTY_CRIMES.length)],
      x: spot.x + (Math.random() - 0.5) * 60,
      z: spot.z + (Math.random() - 0.5) * 60,
      regionHint: spot.region,
      reward: 150 + Math.floor(Math.random() * 4) * 50
    });
  }
}

export function getAvailableBounties() { return availableBounties; }

export function acceptBounty(bountyId) {
  const b = availableBounties.find(x => x.id === bountyId);
  if (!b) return false;
  // Abandon a previous hunt
  if (State.activeBounty) {
    clearEnemies('bounty:' + State.activeBounty.id);
    clearEnemies('bountyGuard:' + State.activeBounty.id);
  }
  State.activeBounty = b;
  availableBounties = availableBounties.filter(x => x.id !== bountyId);
  spawnBountyTarget(b);
  Audio.play('ui');
  toast('BOUNTY ACCEPTED', `${b.name} — last seen near ${b.regionHint}`);
  return true;
}

// ────────────────────────────────────────────
// SHRINES
// ────────────────────────────────────────────
export function useShrine(shrine) {
  State.player.health = State.player.maxHealth;
  State.player.shield = State.player.maxShield;
  State.player.ammo = State.player.maxAmmo;
  State.respawnPoint = { x: shrine.x, z: shrine.z + 6 };
  Audio.play('shrine');

  if (!State.discoveredShrines.includes(shrine.id)) {
    State.discoveredShrines.push(shrine.id);
    State.addGold(50);
    State.save();
    toast('WAYSHRINE DISCOVERED', `${shrine.name} — +50 gold · Engine restored`, 'gold');
  } else {
    toast('REST AT THE WAYSHRINE', 'Engine restored · Respawn point set');
  }
}

// ────────────────────────────────────────────
// OBJECTIVE MARKER TARGET (for HUD)
// ────────────────────────────────────────────
export function getObjectiveTarget() {
  const playerPos = getPlayerPosition();
  const mission = State.currentMission;

  if (mission) {
    const obj = mission.objectives.find(o => !o.complete);
    if (!obj) return null;

    if (obj.type === 'boss' && currentBoss && currentBoss.mesh) {
      return { x: currentBoss.mesh.position.x, z: currentBoss.mesh.position.z, label: 'BOSS' };
    }
    if (obj.type === 'kill') {
      let best = null, bestD = Infinity;
      for (const e of enemies) {
        if (e.tag !== 'mission' || e.kind === 'structure') continue;
        const d = playerPos ? Math.hypot(e.mesh.position.x - playerPos.x, e.mesh.position.z - playerPos.z) : 0;
        if (d < bestD) { bestD = d; best = e; }
      }
      if (best) return { x: best.mesh.position.x, z: best.mesh.position.z, label: 'TARGET' };
      if (currentBoss && currentBoss.mesh) return { x: currentBoss.mesh.position.x, z: currentBoss.mesh.position.z, label: 'BOSS' };
      const region = CONFIG.REGIONS[mission.region];
      if (region) return { x: region.center.x, z: region.center.z, label: 'AREA' };
    }
    if (obj.type === 'beacon') {
      let best = null, bestD = Infinity;
      for (const e of enemies) {
        if (e.type !== 'beacon') continue;
        const d = playerPos ? Math.hypot(e.mesh.position.x - playerPos.x, e.mesh.position.z - playerPos.z) : 0;
        if (d < bestD) { bestD = d; best = e; }
      }
      if (best) return { x: best.mesh.position.x, z: best.mesh.position.z, label: 'BEACON' };
    }
    if (obj.type === 'collect') {
      let best = null, bestD = Infinity;
      for (const p of pickups) {
        if (p.type !== 'relic' || !p.active) continue;
        const d = playerPos ? Math.hypot(p.x - playerPos.x, p.z - playerPos.z) : 0;
        if (d < bestD) { bestD = d; best = p; }
      }
      if (best) return { x: best.x, z: best.z, label: 'CORE' };
    }
    return null;
  }

  // Free roam: track the active bounty
  if (State.activeBounty) {
    const target = enemies.find(e => e.tag === 'bounty:' + State.activeBounty.id);
    if (target) return { x: target.mesh.position.x, z: target.mesh.position.z, label: 'BOUNTY' };
    return { x: State.activeBounty.x, z: State.activeBounty.z, label: 'BOUNTY' };
  }
  return null;
}
