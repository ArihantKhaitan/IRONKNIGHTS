// src/config.js - Game configuration constants

export const CONFIG = {
  MECHS: {
    striker: {
      id: 'striker',
      name: 'STRIKER',
      desc: 'Balanced assault mech with blink dash. Ideal for aggressive hit-and-run tactics.',
      health: 300,
      shield: 150,
      speed: 14,
      boostSpeed: 22,
      damage: 25,
      fireRate: 0.18,
      ammo: 60,
      maxAmmo: 60,
      color: '#00fff9',
      accentColor: '#ffffff',
      scale: 1.0,
      ability: 'DASH_BLINK',
      abilityName: 'BLINK',
      abilityDesc: 'Teleport 15 units forward',
      abilityCooldown: 5,
      price: 0,
      unlocked: true
    },
    titan: {
      id: 'titan',
      name: 'TITAN',
      desc: 'Heavy siege mech. Slow but devastating ground slam ability crushes nearby enemies.',
      health: 600,
      shield: 300,
      speed: 7,
      boostSpeed: 11,
      damage: 45,
      fireRate: 0.35,
      ammo: 40,
      maxAmmo: 40,
      color: '#c9a227',
      accentColor: '#ff6600',
      scale: 1.3,
      ability: 'GROUND_SLAM',
      abilityName: 'SLAM',
      abilityDesc: 'AoE ground slam - 25 unit radius',
      abilityCooldown: 8,
      price: 500,
      unlocked: false
    },
    phantom: {
      id: 'phantom',
      name: 'PHANTOM',
      desc: 'Fast and fragile stealth mech. Cloak renders you invisible for 3 seconds.',
      health: 200,
      shield: 80,
      speed: 20,
      boostSpeed: 30,
      damage: 20,
      fireRate: 0.12,
      ammo: 80,
      maxAmmo: 80,
      color: '#ff00ff',
      accentColor: '#cc00cc',
      scale: 0.9,
      ability: 'CLOAK',
      abilityName: 'CLOAK',
      abilityDesc: 'Become invisible for 3 seconds',
      abilityCooldown: 12,
      price: 400,
      unlocked: false
    },
    paladin: {
      id: 'paladin',
      name: 'PALADIN',
      desc: 'Heavily armored tank mech. Shield Wall instantly restores full shield capacity.',
      health: 800,
      shield: 500,
      speed: 8,
      boostSpeed: 12,
      damage: 35,
      fireRate: 0.28,
      ammo: 50,
      maxAmmo: 50,
      color: '#c9a227',
      accentColor: '#00fff9',
      scale: 1.4,
      ability: 'SHIELD_WALL',
      abilityName: 'SHIELD',
      abilityDesc: 'Instantly refill shield to max',
      abilityCooldown: 10,
      price: 800,
      unlocked: false
    }
  },

  ENEMIES: {
    scout: {
      id: 'scout',
      name: 'Scout',
      health: 80,
      damage: 12,
      speed: 14,
      fireRate: 0.4,
      scale: 0.85,
      color: '#ff4400',
      accentColor: '#ff8800',
      goldReward: 15,
      scoreReward: 100,
      detectionRange: 70,
      chaseRange: 90,
      attackRange: 20,
      desiredDist: 15
    },
    bruiser: {
      id: 'bruiser',
      name: 'Bruiser',
      health: 250,
      damage: 30,
      speed: 7,
      fireRate: 0.7,
      scale: 1.25,
      color: '#cc0033',
      accentColor: '#ff0044',
      goldReward: 30,
      scoreReward: 250,
      detectionRange: 55,
      chaseRange: 70,
      attackRange: 15,
      desiredDist: 10
    },
    archer: {
      id: 'archer',
      name: 'Archer',
      health: 100,
      damage: 20,
      speed: 8,
      fireRate: 1.2,
      scale: 0.95,
      color: '#9900cc',
      accentColor: '#cc00ff',
      goldReward: 25,
      scoreReward: 150,
      detectionRange: 100,
      chaseRange: 120,
      attackRange: 60,
      desiredDist: 50
    }
  },

  BOSSES: {
    FOREST_TROLL: {
      id: 'FOREST_TROLL',
      name: 'Forest Troll',
      health: 600,
      maxHealth: 600,
      damage: 50,
      speed: 8,
      scale: 3.5,
      color: '#228822',
      accentColor: '#44ff44',
      goldReward: 300,
      scoreReward: 2000,
      phases: [
        { threshold: 1.0, speed: 8, damage: 50 },
        { threshold: 0.6, speed: 11, damage: 65 },
        { threshold: 0.3, speed: 15, damage: 80 }
      ]
    },
    BLACK_KNIGHT: {
      id: 'BLACK_KNIGHT',
      name: 'Black Knight',
      health: 900,
      maxHealth: 900,
      damage: 70,
      speed: 10,
      scale: 2.8,
      color: '#111133',
      accentColor: '#4444ff',
      goldReward: 500,
      scoreReward: 3500,
      phases: [
        { threshold: 1.0, speed: 10, damage: 70 },
        { threshold: 0.55, speed: 14, damage: 90 },
        { threshold: 0.25, speed: 18, damage: 115 }
      ]
    },
    DRAGON_MECH: {
      id: 'DRAGON_MECH',
      name: 'Dragon Mech',
      health: 2000,
      maxHealth: 2000,
      damage: 100,
      speed: 9,
      scale: 5,
      color: '#cc2200',
      accentColor: '#ff6600',
      goldReward: 1000,
      scoreReward: 8000,
      phases: [
        { threshold: 1.0, speed: 9, damage: 100 },
        { threshold: 0.65, speed: 12, damage: 130 },
        { threshold: 0.35, speed: 16, damage: 160 },
        { threshold: 0.15, speed: 20, damage: 200 }
      ]
    }
  },

  LEVELS: {
    VILLAGE: {
      id: 'VILLAGE',
      name: 'Iron Village',
      enemies: 8,
      enemyTypes: ['scout', 'bruiser'],
      boss: null,
      goldPerKill: 1.0,
      skyColor: '#0a0a1a',
      groundColor: '#1a1a0a',
      fogColor: '#0a0a1a',
      fogDensity: 0.008,
      ambientColor: '#334455',
      ambientIntensity: 0.4,
      accentColor: '#00fff9'
    },
    FOREST: {
      id: 'FOREST',
      name: 'Neon Forest',
      enemies: 12,
      enemyTypes: ['scout', 'archer'],
      boss: 'FOREST_TROLL',
      goldPerKill: 1.2,
      skyColor: '#050f05',
      groundColor: '#0a1a0a',
      fogColor: '#081208',
      fogDensity: 0.012,
      ambientColor: '#224422',
      ambientIntensity: 0.35,
      accentColor: '#00ff44'
    },
    CASTLE_GATES: {
      id: 'CASTLE_GATES',
      name: 'Castle Gates',
      enemies: 16,
      enemyTypes: ['scout', 'bruiser', 'archer'],
      boss: null,
      goldPerKill: 1.3,
      skyColor: '#0a0510',
      groundColor: '#15101a',
      fogColor: '#0a0510',
      fogDensity: 0.007,
      ambientColor: '#332244',
      ambientIntensity: 0.38,
      accentColor: '#cc00ff'
    },
    CASTLE_KEEP: {
      id: 'CASTLE_KEEP',
      name: 'Castle Keep',
      enemies: 20,
      enemyTypes: ['bruiser', 'archer'],
      boss: 'BLACK_KNIGHT',
      goldPerKill: 1.5,
      skyColor: '#050510',
      groundColor: '#10101a',
      fogColor: '#050510',
      fogDensity: 0.006,
      ambientColor: '#222244',
      ambientIntensity: 0.3,
      accentColor: '#4444ff'
    },
    THRONE_ROOM: {
      id: 'THRONE_ROOM',
      name: 'Throne Room',
      enemies: 25,
      enemyTypes: ['scout', 'bruiser', 'archer'],
      boss: 'DRAGON_MECH',
      goldPerKill: 2.0,
      skyColor: '#100505',
      groundColor: '#1a0a0a',
      fogColor: '#100505',
      fogDensity: 0.005,
      ambientColor: '#442222',
      ambientIntensity: 0.35,
      accentColor: '#ff4400'
    }
  },

  STORY_MISSIONS: [
    {
      id: 'M1',
      level: 'VILLAGE',
      title: 'First Blood',
      description: 'Iron raiders have stormed the outer settlements. Purge them and secure the village.',
      objectives: [
        { id: 'kill_enemies', type: 'kill', required: 8, current: 0, text: 'Destroy 8 enemy mechs', complete: false }
      ],
      reward: { gold: 200, unlocks: null, unlockLevel: 'FOREST' }
    },
    {
      id: 'M2',
      level: 'FOREST',
      title: 'The Awakening',
      description: 'A corrupted Forest Troll guards the woodland path. Defeat it and push forward.',
      objectives: [
        { id: 'kill_enemies', type: 'kill', required: 12, current: 0, text: 'Destroy 12 enemy mechs', complete: false },
        { id: 'kill_boss', type: 'boss', required: 1, current: 0, text: 'Defeat the Forest Troll', complete: false }
      ],
      reward: { gold: 400, unlocks: 'phantom', unlockLevel: 'CASTLE_GATES' }
    },
    {
      id: 'M3',
      level: 'CASTLE_GATES',
      title: 'Breach the Gates',
      description: 'The Black Kingdom\'s front line stands at the castle gates. Break through their defenses.',
      objectives: [
        { id: 'kill_enemies', type: 'kill', required: 16, current: 0, text: 'Destroy 16 enemy mechs', complete: false }
      ],
      reward: { gold: 600, unlocks: 'titan', unlockLevel: 'CASTLE_KEEP' }
    },
    {
      id: 'M4',
      level: 'CASTLE_KEEP',
      title: 'Knight\'s Trial',
      description: 'The Black Knight himself awaits in the keep. Prove your worth in single combat.',
      objectives: [
        { id: 'kill_enemies', type: 'kill', required: 20, current: 0, text: 'Defeat 20 enemy mechs', complete: false },
        { id: 'kill_boss', type: 'boss', required: 1, current: 0, text: 'Defeat the Black Knight', complete: false }
      ],
      reward: { gold: 800, unlocks: 'paladin', unlockLevel: 'THRONE_ROOM' }
    },
    {
      id: 'M5',
      level: 'THRONE_ROOM',
      title: 'Dragon\'s End',
      description: 'The ancient Dragon Mech awaits on the throne. End its reign of terror forever.',
      objectives: [
        { id: 'kill_enemies', type: 'kill', required: 25, current: 0, text: 'Destroy 25 enemy mechs', complete: false },
        { id: 'kill_boss', type: 'boss', required: 1, current: 0, text: 'Defeat the Dragon Mech', complete: false }
      ],
      reward: { gold: 2000, unlocks: null, unlockLevel: null }
    }
  ],

  WORLD: {
    size: 400,
    arenaRadius: 145
  }
};
