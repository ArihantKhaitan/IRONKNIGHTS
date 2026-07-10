// src/state.js - Central game state and save/load
import { CONFIG } from './config.js';

const SAVE_KEY = 'ironKnights_ashfall_v3';

export const State = {
  // Screen / mode
  screen: 'loading',
  mode: 'free',            // 'story' | 'free'
  selectedMech: 'squire',

  // Progression
  gold: 0,
  unlockedMechs: ['squire'],
  completedMissions: [],
  unlockedMissions: ['M1'],
  upgrades: { damage: 0, armor: 0, boost: 0 },   // tier owned per track (0-3)
  discoveredShrines: [],
  soundOn: true,

  // World / runtime
  currentMission: null,     // live mission object (cloned)
  currentRegion: 'EMBERFALL',
  timeOfDay: CONFIG.WORLD.startTime, // 0..1 (0 = midnight)
  storm: 0,                 // 0..1 ash-storm intensity
  respawnPoint: { x: 0, z: 420 },
  activeBounty: null,       // { id, name, crime, x, z, reward }
  clearedCamps: [],         // camp ids cleared this session

  // Player runtime stats
  player: {
    health: 320, maxHealth: 320,
    shield: 140, maxShield: 140,
    boost: 100, maxBoost: 100,
    ammo: 60, maxAmmo: 60,
    score: 0, kills: 0
  },

  // Input
  keys: {},
  mouse: { dx: 0, dy: 0, locked: false, leftDown: false, rightDown: false },

  // Flow flags
  isPlaying: false,
  isPaused: false,
  isGameOver: false,

  // ── Derived stat helpers ──────────────────
  damageMultiplier() {
    const t = this.upgrades.damage;
    return 1 + (t > 0 ? CONFIG.UPGRADES.damage.tiers[t - 1].bonus : 0);
  },
  armorMultiplier() {
    const t = this.upgrades.armor;
    return 1 + (t > 0 ? CONFIG.UPGRADES.armor.tiers[t - 1].bonus : 0);
  },
  boostMultiplier() {
    const t = this.upgrades.boost;
    return 1 + (t > 0 ? CONFIG.UPGRADES.boost.tiers[t - 1].bonus : 0);
  },

  // ── Persistence ───────────────────────────
  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        gold: this.gold,
        unlockedMechs: this.unlockedMechs,
        completedMissions: this.completedMissions,
        unlockedMissions: this.unlockedMissions,
        selectedMech: this.selectedMech,
        upgrades: this.upgrades,
        discoveredShrines: this.discoveredShrines,
        soundOn: this.soundOn
      }));
    } catch (e) { console.warn('Save failed:', e); }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      this.gold = d.gold ?? 0;
      this.unlockedMechs = d.unlockedMechs ?? ['squire'];
      this.completedMissions = d.completedMissions ?? [];
      this.unlockedMissions = d.unlockedMissions ?? ['M1'];
      this.selectedMech = CONFIG.MECHS[d.selectedMech] ? d.selectedMech : 'squire';
      this.upgrades = { damage: 0, armor: 0, boost: 0, ...(d.upgrades || {}) };
      this.discoveredShrines = d.discoveredShrines ?? [];
      this.soundOn = d.soundOn ?? true;
      if (!this.unlockedMechs.includes('squire')) this.unlockedMechs.push('squire');
      if (!this.unlockedMissions.includes('M1')) this.unlockedMissions.push('M1');
    } catch (e) { console.warn('Load failed:', e); }
  },

  // ── Progression helpers ───────────────────
  isMechUnlocked(id) { return this.unlockedMechs.includes(id); },
  isMissionUnlocked(id) { return this.unlockedMissions.includes(id); },
  isMissionComplete(id) { return this.completedMissions.includes(id); },

  unlockMech(id) {
    if (id && !this.unlockedMechs.includes(id)) this.unlockedMechs.push(id);
  },
  unlockMission(id) {
    if (id && !this.unlockedMissions.includes(id)) this.unlockedMissions.push(id);
  },
  completeMission(id) {
    if (id && !this.completedMissions.includes(id)) this.completedMissions.push(id);
  },
  addGold(n) {
    this.gold += Math.max(0, Math.floor(n));
  },
  spendGold(n) {
    if (this.gold < n) return false;
    this.gold -= n;
    return true;
  },

  resetPlayerStats() {
    const mech = CONFIG.MECHS[this.selectedMech] || CONFIG.MECHS.squire;
    const armorMul = this.armorMultiplier();
    const boostMul = this.boostMultiplier();
    this.player.maxHealth = Math.round(mech.health * armorMul);
    this.player.health = this.player.maxHealth;
    this.player.maxShield = Math.round(mech.shield * armorMul);
    this.player.shield = this.player.maxShield;
    this.player.maxBoost = Math.round(100 * boostMul);
    this.player.boost = this.player.maxBoost;
    this.player.maxAmmo = mech.maxAmmo;
    this.player.ammo = mech.maxAmmo;
    this.player.score = 0;
    this.player.kills = 0;
    this.isGameOver = false;
    this.isPaused = false;
  }
};
