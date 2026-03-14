// src/state.js - Central game state management
import { CONFIG } from './config.js';

export const State = {
  // Screen management
  screen: 'loading',
  mode: 'story', // 'story' | 'free'
  selectedMech: 'striker',

  // Progression
  gold: 0,
  unlockedMechs: ['striker'],
  completedMissions: [],
  unlockedLevels: ['VILLAGE'],

  // Level state
  currentLevel: 'VILLAGE',
  currentMission: null,

  // Player runtime stats
  player: {
    health: 300,
    maxHealth: 300,
    shield: 150,
    maxShield: 150,
    boost: 100,
    maxBoost: 100,
    ammo: 60,
    maxAmmo: 60,
    score: 0,
    kills: 0,
    wave: 1
  },

  // Input state
  keys: {},
  mouse: {
    dx: 0,
    dy: 0,
    locked: false,
    leftDown: false,
    rightDown: false
  },

  // Game flow flags
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  isFlying: false,

  save() {
    try {
      const saveData = {
        gold: this.gold,
        unlockedMechs: this.unlockedMechs,
        completedMissions: this.completedMissions,
        unlockedLevels: this.unlockedLevels,
        selectedMech: this.selectedMech
      };
      localStorage.setItem('ironKnights_v2', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem('ironKnights_v2');
      if (raw) {
        const data = JSON.parse(raw);
        this.gold = data.gold || 0;
        this.unlockedMechs = data.unlockedMechs || ['striker'];
        this.completedMissions = data.completedMissions || [];
        this.unlockedLevels = data.unlockedLevels || ['VILLAGE'];
        this.selectedMech = data.selectedMech || 'striker';
      }
      // Apply unlocked status to CONFIG.MECHS
      for (const [id, mech] of Object.entries(CONFIG.MECHS)) {
        mech.unlocked = this.unlockedMechs.includes(id);
      }
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  },

  isMechUnlocked(mechId) {
    return this.unlockedMechs.includes(mechId);
  },

  isLevelUnlocked(levelId) {
    return this.unlockedLevels.includes(levelId);
  },

  isMissionComplete(missionId) {
    return this.completedMissions.includes(missionId);
  },

  unlockMech(mechId) {
    if (!this.unlockedMechs.includes(mechId)) {
      this.unlockedMechs.push(mechId);
      if (CONFIG.MECHS[mechId]) CONFIG.MECHS[mechId].unlocked = true;
    }
  },

  unlockLevel(levelId) {
    if (levelId && !this.unlockedLevels.includes(levelId)) {
      this.unlockedLevels.push(levelId);
    }
  },

  completeMission(missionId) {
    if (!this.completedMissions.includes(missionId)) {
      this.completedMissions.push(missionId);
    }
  },

  resetPlayerStats() {
    const mech = CONFIG.MECHS[this.selectedMech] || CONFIG.MECHS.striker;
    this.player.health = mech.health;
    this.player.maxHealth = mech.health;
    this.player.shield = mech.shield;
    this.player.maxShield = mech.shield;
    this.player.boost = 100;
    this.player.maxBoost = 100;
    this.player.ammo = mech.maxAmmo;
    this.player.maxAmmo = mech.maxAmmo;
    this.player.score = 0;
    this.player.kills = 0;
    this.player.wave = 1;
    this.isGameOver = false;
    this.isPaused = false;
    this.isFlying = false;
  }
};
