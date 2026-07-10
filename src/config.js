// src/config.js - Game configuration: mechs, enemies, bosses, missions, regions, upgrades

export const CONFIG = {

  // ────────────────────────────────────────────
  // PLAYER MECHS ("Engines")
  // ────────────────────────────────────────────
  MECHS: {
    squire: {
      id: 'squire',
      name: 'SQUIRE',
      title: 'The Drifter\'s Engine',
      desc: 'A salvaged war-frame held together by rivets and stubbornness. Balanced, dependable, quick on the dash.',
      health: 320,
      shield: 140,
      speed: 15,
      boostSpeed: 24,
      damage: 26,
      fireRate: 0.17,
      heavyDamage: 90,
      ammo: 60,
      maxAmmo: 60,
      color: '#ffb35c',
      accentColor: '#7fd4c1',
      plume: '#b3402a',
      scale: 1.0,
      ability: 'DASH_BLINK',
      abilityName: 'LUNGE',
      abilityDesc: 'Burst-dash 16 units forward',
      abilityCooldown: 5,
      price: 0
    },
    wraith: {
      id: 'wraith',
      name: 'WRAITH',
      title: 'The Pale Rider',
      desc: 'A gutted scout-frame wrapped in grave-cloth plating. Fragile, viciously fast, and able to fade from sight.',
      health: 210,
      shield: 90,
      speed: 21,
      boostSpeed: 32,
      damage: 21,
      fireRate: 0.11,
      heavyDamage: 70,
      ammo: 80,
      maxAmmo: 80,
      color: '#9fb8ad',
      accentColor: '#d6e5df',
      plume: '#3d4a44',
      scale: 0.9,
      ability: 'CLOAK',
      abilityName: 'SHROUD',
      abilityDesc: 'Fade from sight for 3 seconds',
      abilityCooldown: 12,
      price: 600
    },
    warden: {
      id: 'warden',
      name: 'WARDEN',
      title: 'The Wall That Walks',
      desc: 'A siege-breaker forged for the old wars. Slow as judgement and twice as heavy. Its slam splits the earth.',
      health: 640,
      shield: 280,
      speed: 8,
      boostSpeed: 13,
      damage: 48,
      fireRate: 0.34,
      heavyDamage: 160,
      ammo: 40,
      maxAmmo: 40,
      color: '#c9a227',
      accentColor: '#ff7a2f',
      plume: '#1f1c14',
      scale: 1.3,
      ability: 'GROUND_SLAM',
      abilityName: 'QUAKE',
      abilityDesc: 'Shatter the ground - 25 unit radius',
      abilityCooldown: 8,
      price: 900
    },
    paladin: {
      id: 'paladin',
      name: 'PALADIN',
      title: 'The Last Oath',
      desc: 'The final consecrated engine of the fallen order. Sanctified plate, and a ward that mends itself whole.',
      health: 820,
      shield: 480,
      speed: 9,
      boostSpeed: 14,
      damage: 38,
      fireRate: 0.27,
      heavyDamage: 130,
      ammo: 50,
      maxAmmo: 50,
      color: '#e8ddc4',
      accentColor: '#c9a227',
      plume: '#7c1f1f',
      scale: 1.35,
      ability: 'SHIELD_WALL',
      abilityName: 'AEGIS',
      abilityDesc: 'Instantly restore the ward to full',
      abilityCooldown: 11,
      price: 1400
    }
  },

  // ────────────────────────────────────────────
  // UPGRADE TRACKS (bought in the Forge)
  // ────────────────────────────────────────────
  UPGRADES: {
    damage: {
      id: 'damage', name: 'GUNWORKS', icon: '✸',
      desc: 'Rebored barrels and hotter powder.',
      tiers: [{ cost: 300, bonus: 0.15 }, { cost: 700, bonus: 0.30 }, { cost: 1400, bonus: 0.50 }],
      fmt: (b) => `+${Math.round(b * 100)}% damage`
    },
    armor: {
      id: 'armor', name: 'PLATING', icon: '⛨',
      desc: 'Layered iron scavenged from dead colossi.',
      tiers: [{ cost: 300, bonus: 0.15 }, { cost: 700, bonus: 0.30 }, { cost: 1400, bonus: 0.50 }],
      fmt: (b) => `+${Math.round(b * 100)}% hull & ward`
    },
    boost: {
      id: 'boost', name: 'FURNACE', icon: '♨',
      desc: 'An overfed reactor heart. Runs hotter, longer.',
      tiers: [{ cost: 250, bonus: 0.25 }, { cost: 600, bonus: 0.50 }, { cost: 1200, bonus: 0.80 }],
      fmt: (b) => `+${Math.round(b * 100)}% boost reserve`
    }
  },

  // ────────────────────────────────────────────
  // ENEMIES
  // ────────────────────────────────────────────
  ENEMIES: {
    marauder: {
      id: 'marauder', name: 'Marauder',
      kind: 'walker',
      health: 90, damage: 12, speed: 13, fireRate: 0.5,
      scale: 0.9, color: '#b3402a', accentColor: '#ff7a2f',
      goldReward: 18, scoreReward: 100,
      detectionRange: 70, chaseRange: 110, attackRange: 26, desiredDist: 18
    },
    ironclad: {
      id: 'ironclad', name: 'Ironclad',
      kind: 'walker',
      health: 280, damage: 26, speed: 7, fireRate: 0.8,
      scale: 1.25, color: '#6e6a5e', accentColor: '#c9a227',
      goldReward: 35, scoreReward: 250,
      detectionRange: 60, chaseRange: 90, attackRange: 18, desiredDist: 12
    },
    longbow: {
      id: 'longbow', name: 'Longbow',
      kind: 'walker',
      health: 110, damage: 22, speed: 8, fireRate: 1.4,
      scale: 0.95, color: '#4a5d43', accentColor: '#9fd47f',
      goldReward: 28, scoreReward: 150,
      detectionRange: 110, chaseRange: 140, attackRange: 75, desiredDist: 55
    },
    hound: {
      id: 'hound', name: 'Scrap Hound',
      kind: 'hound',
      health: 60, damage: 16, speed: 19, fireRate: 0,
      melee: true, meleeRange: 5, meleeRate: 1.1,
      scale: 0.8, color: '#5a4632', accentColor: '#ff5533',
      goldReward: 12, scoreReward: 80,
      detectionRange: 85, chaseRange: 130, attackRange: 6, desiredDist: 3
    },
    beacon: {
      id: 'beacon', name: 'Siege Beacon',
      kind: 'structure',
      health: 420, damage: 0, speed: 0, fireRate: 0,
      immobile: true,
      scale: 1.6, color: '#7c1f1f', accentColor: '#ff4422',
      goldReward: 80, scoreReward: 500,
      detectionRange: 0, chaseRange: 0, attackRange: 0, desiredDist: 0
    }
  },

  // ────────────────────────────────────────────
  // BOSSES
  // ────────────────────────────────────────────
  BOSSES: {
    FLAYED_KNIGHT: {
      id: 'FLAYED_KNIGHT', name: 'The Flayed Knight',
      health: 750, maxHealth: 750, damage: 45, speed: 9, fireRate: 0.7,
      scale: 2.4, color: '#8c3b22', accentColor: '#ff5533',
      goldReward: 350, scoreReward: 2000,
      phases: [
        { threshold: 1.0, speed: 9, damage: 45 },
        { threshold: 0.6, speed: 12, damage: 60 },
        { threshold: 0.3, speed: 16, damage: 75 }
      ]
    },
    WARDEN_COLOSSUS: {
      id: 'WARDEN_COLOSSUS', name: 'Warden Colossus',
      health: 1400, maxHealth: 1400, damage: 65, speed: 7, fireRate: 0.9,
      scale: 3.6, color: '#5a5a66', accentColor: '#c9a227',
      goldReward: 600, scoreReward: 4000,
      phases: [
        { threshold: 1.0, speed: 7, damage: 65 },
        { threshold: 0.55, speed: 10, damage: 85 },
        { threshold: 0.25, speed: 13, damage: 110 }
      ]
    },
    ASHEN_KING: {
      id: 'ASHEN_KING', name: 'The Ashen King',
      health: 2400, maxHealth: 2400, damage: 90, speed: 8, fireRate: 0.6,
      scale: 4.4, color: '#2b2b30', accentColor: '#ff7a2f',
      goldReward: 1500, scoreReward: 10000,
      phases: [
        { threshold: 1.0, speed: 8, damage: 90 },
        { threshold: 0.65, speed: 11, damage: 115 },
        { threshold: 0.35, speed: 14, damage: 140 },
        { threshold: 0.15, speed: 18, damage: 170 }
      ]
    }
  },

  // ────────────────────────────────────────────
  // WORLD REGIONS (one seamless map)
  // ────────────────────────────────────────────
  REGIONS: {
    EMBERFALL: {
      id: 'EMBERFALL', name: 'Emberfall Village',
      center: { x: 0, z: 380 }, radius: 150,
      fogMul: 1.0, sub: 'What is left of it'
    },
    PLAINS: {
      id: 'PLAINS', name: 'The Ashen Plains',
      center: { x: 0, z: 0 }, radius: 280,
      fogMul: 1.0, sub: 'Where the Colossus fell'
    },
    DEADWOOD: {
      id: 'DEADWOOD', name: 'The Deadwood',
      center: { x: -430, z: -60 }, radius: 250,
      fogMul: 2.6, sub: 'The trees remember the fire'
    },
    SCARLINE: {
      id: 'SCARLINE', name: 'The Scarline',
      center: { x: 430, z: 60 }, radius: 240,
      fogMul: 1.5, sub: 'The old front line'
    },
    KEEP: {
      id: 'KEEP', name: 'Ironspire Keep',
      center: { x: 60, z: -470 }, radius: 220,
      fogMul: 1.3, sub: 'Seat of the dead king'
    }
  },

  // ────────────────────────────────────────────
  // CAMPS (bandit strongholds in free roam)
  // ────────────────────────────────────────────
  CAMPS: [
    { id: 'CAMP_FORD', name: 'Ford Camp', x: -180, z: 210, guards: ['marauder', 'marauder', 'hound', 'longbow'], bonus: 120 },
    { id: 'CAMP_HOLLOW', name: 'Hollow Camp', x: -420, z: -230, guards: ['hound', 'hound', 'marauder', 'ironclad'], bonus: 160 },
    { id: 'CAMP_TRENCH', name: 'Trench Camp', x: 430, z: 240, guards: ['longbow', 'longbow', 'ironclad', 'marauder'], bonus: 180 },
    { id: 'CAMP_GALLOWS', name: 'Gallows Camp', x: 300, z: -300, guards: ['ironclad', 'ironclad', 'longbow', 'marauder', 'hound'], bonus: 240 }
  ],

  // ────────────────────────────────────────────
  // WAYSHRINES (rest points / respawn)
  // ────────────────────────────────────────────
  SHRINES: [
    { id: 'SHRINE_VILLAGE', name: 'Emberfall Shrine', x: 30, z: 350 },
    { id: 'SHRINE_CROSSROADS', name: 'Crossroads Shrine', x: -20, z: 60 },
    { id: 'SHRINE_DEADWOOD', name: 'Deadwood Shrine', x: -330, z: -30 },
    { id: 'SHRINE_SCARLINE', name: 'Scarline Shrine', x: 330, z: 80 },
    { id: 'SHRINE_KEEP', name: 'Gatehouse Shrine', x: 40, z: -330 }
  ],

  // ────────────────────────────────────────────
  // STORY CAMPAIGN
  // ────────────────────────────────────────────
  MISSIONS: [
    {
      id: 'M1', region: 'EMBERFALL', num: 'I',
      title: 'Ash and Iron',
      brief: 'You rode into Emberfall at dusk, and the raiders rode in behind you. The villagers have nothing left to give them but their lives. Give the raiders iron instead.',
      lines: ['The kingdom died a generation ago.', 'The vultures never left.'],
      spawn: { x: 0, z: 470 },
      setup: { squads: [{ x: -60, z: 300, types: ['marauder', 'marauder', 'hound'] }, { x: 70, z: 290, types: ['marauder', 'hound', 'hound'] }, { x: 0, z: 240, types: ['marauder', 'marauder', 'longbow', 'hound'] }] },
      objectives: [
        { id: 'kill', type: 'kill', required: 10, text: 'Destroy the raiders' }
      ],
      reward: { gold: 250, unlocks: null, unlockMission: 'M2' }
    },
    {
      id: 'M2', region: 'DEADWOOD', num: 'II',
      title: 'The Deadwood Toll',
      brief: 'Something is skinning travellers on the forest road and nailing the plate to the trees. The locals call it the Flayed Knight. Collect the toll it owes.',
      lines: ['The trees here burned standing.', 'They never fell. Neither did he.'],
      spawn: { x: -240, z: 40 },
      setup: {
        squads: [{ x: -360, z: -20, types: ['hound', 'hound', 'marauder'] }, { x: -430, z: -100, types: ['hound', 'hound', 'longbow'] }, { x: -500, z: -40, types: ['marauder', 'hound'] }],
        boss: { id: 'FLAYED_KNIGHT', x: -460, z: -140 }
      },
      objectives: [
        { id: 'kill', type: 'kill', required: 8, text: 'Cull the pack' },
        { id: 'boss', type: 'boss', required: 1, text: 'Slay the Flayed Knight' }
      ],
      reward: { gold: 450, unlocks: 'wraith', unlockMission: 'M3' }
    },
    {
      id: 'M3', region: 'SCARLINE', num: 'III',
      title: 'Scarline Salvage',
      brief: 'Three reactor cores still burn in the wrecks of the old front line. A dead man\'s fortune, if you can pry it from the scavengers who found it first.',
      lines: ['Ten thousand engines died in this trench.', 'Their hearts are still warm.'],
      spawn: { x: 260, z: 90 },
      setup: {
        squads: [{ x: 380, z: 40, types: ['marauder', 'longbow'] }, { x: 460, z: 120, types: ['ironclad', 'marauder', 'hound'] }, { x: 500, z: 0, types: ['longbow', 'longbow', 'marauder'] }, { x: 420, z: -80, types: ['ironclad', 'hound', 'hound'] }],
        relics: [{ x: 390, z: 50 }, { x: 490, z: 110 }, { x: 450, z: -70 }]
      },
      objectives: [
        { id: 'relics', type: 'collect', required: 3, text: 'Recover the reactor cores' },
        { id: 'kill', type: 'kill', required: 10, text: 'Clear the scavengers' }
      ],
      reward: { gold: 600, unlocks: null, unlockMission: 'M4' }
    },
    {
      id: 'M4', region: 'PLAINS', num: 'IV',
      title: 'The Long Road',
      brief: 'The warlord who wears the old king\'s crown has raised siege beacons along the north road, calling every blade in the wastes to Ironspire. Snuff them out before the host gathers.',
      lines: ['Every fire on the horizon', 'is an invitation to a war.'],
      spawn: { x: 0, z: 180 },
      setup: {
        beacons: [{ x: -70, z: -40 }, { x: 60, z: -160 }, { x: -20, z: -280 }],
        squads: [{ x: -70, z: -60, types: ['marauder', 'longbow'] }, { x: 60, z: -180, types: ['ironclad', 'marauder'] }, { x: -20, z: -300, types: ['ironclad', 'longbow', 'hound'] }]
      },
      objectives: [
        { id: 'beacons', type: 'beacon', required: 3, text: 'Destroy the siege beacons' }
      ],
      reward: { gold: 800, unlocks: 'warden', unlockMission: 'M5' }
    },
    {
      id: 'M5', region: 'KEEP', num: 'V',
      title: 'Gates of Ironspire',
      brief: 'The gatehouse of Ironspire has not opened for twenty years. The Warden Colossus that sealed it still stands its post, rusted into its oath. Break the gate. Break the Warden.',
      lines: ['The last order it received', 'was to let no one pass.'],
      spawn: { x: 40, z: -260 },
      setup: {
        squads: [{ x: 20, z: -360, types: ['ironclad', 'longbow', 'marauder'] }, { x: 90, z: -380, types: ['marauder', 'marauder', 'hound', 'hound'] }, { x: -30, z: -400, types: ['ironclad', 'longbow'] }],
        boss: { id: 'WARDEN_COLOSSUS', x: 60, z: -430 }
      },
      objectives: [
        { id: 'kill', type: 'kill', required: 12, text: 'Break the garrison' },
        { id: 'boss', type: 'boss', required: 1, text: 'Fell the Warden Colossus' }
      ],
      reward: { gold: 1000, unlocks: 'paladin', unlockMission: 'M6' }
    },
    {
      id: 'M6', region: 'KEEP', num: 'VI',
      title: 'The Iron Throne',
      brief: 'In the roofless great hall sits the thing that killed the kingdom — a king who welded himself into his engine rather than die with his people. End the reign of ash.',
      lines: ['A crown of rust.', 'A throne of bones.', 'One last ride.'],
      spawn: { x: 60, z: -380 },
      setup: {
        boss: { id: 'ASHEN_KING', x: 60, z: -510 },
        squads: [{ x: 30, z: -470, types: ['ironclad', 'longbow'] }]
      },
      objectives: [
        { id: 'boss', type: 'boss', required: 1, text: 'Destroy the Ashen King' }
      ],
      reward: { gold: 2500, unlocks: null, unlockMission: null }
    }
  ],

  // ────────────────────────────────────────────
  // BOUNTIES (free roam)
  // ────────────────────────────────────────────
  BOUNTY_NAMES: [
    'Aldric the Red', 'Blacktooth Merrin', 'The Widow of Fen', 'Ser Coldwater',
    'Half-Hand Hob', 'The Tally Man', 'Greta Ironmaw', 'The Pale Butcher',
    'Old Cinder Jack', 'Marrow the Kind', 'Two-Grave Tomas', 'The Rust Prophet'
  ],
  BOUNTY_CRIMES: [
    'Burned three grain wagons on the south road',
    'Skinned a wayshrine keeper for his lanterns',
    'Sells children\'s ransom back to their graves',
    'Broke oath and blade at the Ford',
    'Feeds travellers to his scrap hounds',
    'Melted down the chapel bells for shot',
    'Took forty heads and kept a tally',
    'Poisons wells and charges for clean water'
  ],

  // ────────────────────────────────────────────
  // WORLD CONSTANTS
  // ────────────────────────────────────────────
  WORLD: {
    size: 1600,           // ground plane size
    bounds: 700,          // playable radius
    dayLength: 480,       // seconds for a full day/night cycle
    startTime: 0.72,      // start in late-afternoon golden hour
    maxAmbientEnemies: 10,
    patrolInterval: 30    // seconds between ambient patrol spawns
  }
};

// Convenience lookups
export function missionById(id) {
  return CONFIG.MISSIONS.find(m => m.id === id) || null;
}
export function regionAt(x, z) {
  let best = null, bestD = Infinity;
  for (const r of Object.values(CONFIG.REGIONS)) {
    const d = Math.hypot(x - r.center.x, z - r.center.z) - r.radius;
    if (d < bestD) { bestD = d; best = r; }
  }
  // Only "inside" a named region if within its radius; otherwise the wastes
  if (best && Math.hypot(x - best.center.x, z - best.center.z) <= best.radius) return best;
  return { id: 'WASTES', name: 'The Ash Wastes', sub: 'No roads. No mercy.', fogMul: 1.2, center: { x: 0, z: 0 }, radius: 9999 };
}
