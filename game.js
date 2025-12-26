/**
 * IRON KNIGHTS - Medieval Mech Combat Game
 * Full 3D mech fighting with Tron/Medieval aesthetics
 * Features: Flight boosters, combat, NPCs, vehicles, futuristic medieval city
 */

// ================================
// GAME CONFIGURATION
// ================================

const CONFIG = {
    // NEW: Medieval theme
    GAME_TITLE: 'IRON KNIGHTS',
    SETTING: 'Medieval Fantasy • 1287 AD',

    // Mech Stats (Renamed/Re-themed where appropriate, keeping stats for balance)
    // Mech Stats with PRICES and UNLOCK status
mechs: {
    striker: {
        name: 'STRIKER-X7',
        health: 100,
        shield: 100,
        speed: 12,
        boostSpeed: 25,
        damage: 15,
        fireRate: 150,
        color: 0x00fff9,
        scale: 1.0,
        style: 'balanced',
        price: 0, // Starter mech - FREE
        unlocked: true
    },
    titan: {
        name: 'TITAN-MK3',
        health: 150,
        shield: 150,
        speed: 8,
        boostSpeed: 18,
        damage: 25,
        fireRate: 300,
        color: 0xff6b00,
        scale: 1.3,
        style: 'heavy',
        price: 500,
        unlocked: false
    },
    phantom: {
        name: 'PHANTOM-V',
        health: 80,
        shield: 80,
        speed: 15,
        boostSpeed: 30,
        damage: 12,
        fireRate: 100,
        color: 0x9d00ff,
        scale: 0.85,
        style: 'light',
        price: 400,
        unlocked: false
    },
    juggernaut: {
        name: 'JUGGERNAUT-Z',
        health: 200,
        shield: 200,
        speed: 6,
        boostSpeed: 15,
        damage: 35,
        fireRate: 400,
        color: 0xff0044,
        scale: 1.5,
        style: 'heavy',
        price: 1000,
        unlocked: false
    },
    blade: {
        name: 'BLADE-R9',
        health: 90,
        shield: 70,
        speed: 18,
        boostSpeed: 35,
        damage: 20,
        fireRate: 120,
        color: 0x00ff66,
        scale: 0.9,
        style: 'light',
        price: 600,
        unlocked: false
    },
    paladin: {
        name: 'PALADIN-KN',
        health: 120,
        shield: 180,
        speed: 10,
        boostSpeed: 22,
        damage: 18,
        fireRate: 200,
        color: 0xffff00,
        scale: 1.1,
        style: 'balanced',
        price: 800,
        unlocked: false
    }
},
    
    // World settings (Updated default size)
    world: {
        size: 500,
        buildingCount: 80,
        npcCount: 30,
        vehicleCount: 25,
        treeCount: 50
    },
    
    // Enemy settings
    enemies: {
        baseHealth: 50,
        baseDamage: 10,
        spawnDistance: 100,
        waveMultiplier: 1.2
    },
    
    // Colors
    colors: {
        neonCyan: 0x00fff9,
        neonMagenta: 0xff00ff,
        neonYellow: 0xffff00,
        neonOrange: 0xff6b00,
        neonGreen: 0x00ff66,
        neonBlue: 0x0066ff,
        neonPurple: 0x9d00ff,
        neonRed: 0xff0044,
        ground: 0x0a0a15,
        building: 0x15152a
    },

    /// Unified Level Definitions (Medieval Theme)
    LEVELS: {
        HOME_BASE: { 
            name: 'Ironhold Stronghold', 
            enemies: 0, 
            boss: null, 
            difficulty: 0,
            isHome: true,
            goldPerKill: 0,
            position: { x: 0, z: 0 },
            // Environment settings
            skyColor: 0x2a2a3a,
            groundColor: 0x333333,
            fogColor: 0x1a1a2a,
            fogDensity: 0.01,
            ambientLight: 0x666688,
            structures: [
                { type: 'tower', count: 4 },
                { type: 'wall_segment', count: 12 },
                { type: 'armor_stand', count: 8 }
            ],
            spawnPoints: [{ x: 0, z: 0 }]
        },
        VILLAGE: { 
            name: 'Ravenshollow Village', 
            enemies: 8, 
            boss: null, 
            difficulty: 1,
            goldPerKill: 15,
            position: { x: 800, z: 0 },
            // Environment settings
            skyColor: 0x87ceeb,
            groundColor: 0x567d46,
            fogColor: 0xcccccc,
            fogDensity: 0.01,
            ambientLight: 0xffffff,
            structures: [
                { type: 'house', count: 8 },
                { type: 'well', count: 1 },
                { type: 'cart', count: 3 },
                { type: 'fence', count: 15 }
            ],
            spawnPoints: [
                { x: -30, z: -30 }, { x: 30, z: -30 },
                { x: -30, z: 30 }, { x: 30, z: 30 }
            ]
        },
        FOREST: { 
            name: 'Darkwood Forest', 
            enemies: 12, 
            boss: 'FOREST_TROLL', 
            difficulty: 1.5,
            goldPerKill: 25,
            position: { x: 1600, z: 0 },
            // Environment settings
            skyColor: 0x2d4a3e,
            groundColor: 0x2d4a2d,
            fogColor: 0x1a3320,
            fogDensity: 0.03,
            ambientLight: 0x446644,
            structures: [
                { type: 'tree', count: 50 },
                { type: 'rock', count: 20 },
                { type: 'fallen_log', count: 5 },
                { type: 'clearing', count: 1 }
            ],
            spawnPoints: [
                { x: -40, z: 0 }, { x: 40, z: 0 },
                { x: 0, z: -40 }, { x: 0, z: 40 }
            ]
        },
        CASTLE_GATES: { 
            name: 'Castle Ironspire - Gates', 
            enemies: 15, 
            boss: null, 
            difficulty: 2,
            goldPerKill: 35,
            position: { x: 2400, z: 0 },
            // Environment settings
            skyColor: 0x4a4a6a,
            groundColor: 0x555555,
            fogColor: 0x333344,
            fogDensity: 0.015,
            ambientLight: 0x8888aa,
            structures: [
                { type: 'wall_segment', count: 20 },
                { type: 'tower', count: 4 },
                { type: 'gate', count: 1 },
                { type: 'barricade', count: 10 },
                { type: 'siege_weapon', count: 2 }
            ],
            spawnPoints: [
                { x: -50, z: 0 }, { x: 50, z: 0 }
            ]
        },
        CASTLE_KEEP: { 
            name: 'Castle Ironspire - Keep', 
            enemies: 18, 
            boss: 'BLACK_KNIGHT', 
            difficulty: 2.5,
            goldPerKill: 50,
            position: { x: 2400, z: 800 },
            // Environment settings
            skyColor: 0x2a2a3a,
            groundColor: 0x333333,
            fogColor: 0x1a1a2a,
            fogDensity: 0.02,
            ambientLight: 0x666688,
            structures: [
                { type: 'pillar', count: 12 },
                { type: 'throne_stairs', count: 1 },
                { type: 'chandelier', count: 4 },
                { type: 'banner', count: 8 },
                { type: 'armor_stand', count: 6 }
            ],
            indoor: true,
            spawnPoints: [{ x: 0, z: 0 }]
        },
        THRONE_ROOM: { 
            name: 'Throne Room', 
            enemies: 10, 
            boss: 'DRAGON_MECH', 
            difficulty: 3,
            goldPerKill: 75,
            position: { x: 2400, z: 1600 },
            // Environment settings
            skyColor: 0x1a0a0a,
            groundColor: 0x2a1515,
            fogColor: 0x330000,
            fogDensity: 0.025,
            ambientLight: 0xff4444,
            structures: [
                { type: 'throne', count: 1 },
                { type: 'pillar_large', count: 8 },
                { type: 'dragon_bones', count: 3 },
                { type: 'fire_pit', count: 4 },
                { type: 'royal_banner', count: 6 }
            ],
            indoor: true,
            boss: 'DRAGON_MECH',
            spawnPoints: [{ x: 0, z: 0 }]
        }
    },
    
    // NEW: Mission types
    MISSIONS: {
        RESCUE: 'rescue',
        ELIMINATE: 'eliminate', 
        DEFEND: 'defend',
        ESCORT: 'escort',
        BOSS: 'boss'
    }
};

// Story and progression state
const GameProgression = {
    currentLevel: 'HOME_BASE',
    currentMission: null,
    missionsCompleted: [],
    princesRescued: 0,
    totalPrinces: 3,
    homeBaseUnlocked: true,
    unlockedLevels: ['HOME_BASE', 'VILLAGE'],
    
    // Story missions
    storyMissions: [
        {
            id: 'mission_1',
            level: 'VILLAGE',
            type: 'eliminate',
            title: 'Clear the Village',
            description: 'Bandits have overrun Ravenshollow. Eliminate all hostile mechs.',
            objectives: [{ type: 'kill', count: 5, current: 0 }],
            reward: { gold: 100, unlocks: 'FOREST' }
        },
        {
            id: 'mission_2', 
            level: 'FOREST',
            type: 'rescue',
            title: 'The Lost Princess',
            description: 'Princess Elena is held captive in Darkwood. Find and rescue her.',
            objectives: [
                { type: 'kill', count: 8, current: 0 },
                { type: 'rescue', target: 'princess_elena', complete: false }
            ],
            boss: 'FOREST_TROLL',
            reward: { gold: 250, unlocks: 'CASTLE_GATES', princess: 'elena' }
        },
        {
            id: 'mission_3',
            level: 'CASTLE_GATES',
            type: 'defend',
            title: 'Siege the Castle',
            description: 'Break through Castle Ironspire\'s outer defenses.',
            objectives: [{ type: 'survive_waves', count: 3, current: 0 }],
            reward: { gold: 300, unlocks: 'CASTLE_KEEP' }
        },
        {
            id: 'mission_4',
            level: 'CASTLE_KEEP', 
            type: 'boss',
            title: 'The Black Knight',
            description: 'Defeat the legendary Black Knight and free Princess Aria.',
            objectives: [
                { type: 'boss', target: 'BLACK_KNIGHT', complete: false },
                { type: 'rescue', target: 'princess_aria', complete: false }
            ],
            reward: { gold: 500, unlocks: 'THRONE_ROOM', princess: 'aria' }
        },
        {
            id: 'mission_5',
            level: 'THRONE_ROOM',
            type: 'boss', 
            title: 'Dragon\'s Wrath',
            description: 'The Dragon Mech guards Princess Seraphina. End this war.',
            objectives: [
                { type: 'boss', target: 'DRAGON_MECH', complete: false },
                { type: 'rescue', target: 'princess_seraphina', complete: false }
            ],
            reward: { gold: 1000, ending: true, princess: 'seraphina' }
        }
    ]
};

class Boss {
    constructor(type, position) {
        this.type = type;
        this.isBoss = true;
        this.phaseIndex = 0;
        
        // Define Boss Data
        const bossData = {
            'FOREST_TROLL': {
                name: 'Thornback the Terrible',
                health: 500,
                maxHealth: 500,
                damage: 25,
                speed: 2,
                scale: 3,
                color: 0x4a7c4e,
                phases: [
                    { healthPercent: 100, attack: 'smash', speed: 2 },
                    { healthPercent: 60, attack: 'rage', speed: 3, summonMinions: true },
                    { healthPercent: 30, attack: 'frenzy', speed: 4, damage: 35 }
                ],
                rewards: { gold: 200, xp: 500 }
            },
            'BLACK_KNIGHT': {
                name: 'Sir Malachar the Fallen',
                health: 800,
                maxHealth: 800,
                damage: 35,
                speed: 3,
                scale: 2.5,
                color: 0x1a1a2e,
                phases: [
                    { healthPercent: 100, attack: 'sword_combo', shield: true },
                    { healthPercent: 70, attack: 'dark_magic', speed: 3.5 },
                    { healthPercent: 40, attack: 'shadow_clones', cloneCount: 2 },
                    { healthPercent: 20, attack: 'desperation', damage: 50, speed: 5 }
                ],
                rewards: { gold: 400, xp: 1000 }
            },
            'DRAGON_MECH': {
                name: 'Infernox the Destroyer',
                health: 1500,
                maxHealth: 1500,
                damage: 50,
                speed: 2.5,
                scale: 5,
                color: 0x8b0000,
                phases: [
                    { healthPercent: 100, attack: 'fire_breath', flying: true },
                    { healthPercent: 75, attack: 'tail_swipe', grounded: true },
                    { healthPercent: 50, attack: 'meteor_rain', flying: true, aoe: true },
                    { healthPercent: 25, attack: 'meltdown', allAttacks: true, enraged: true }
                ],
                rewards: { gold: 1000, xp: 3000, ending: true }
            }
        };
        
        const data = bossData[type];
        Object.assign(this, data);

        // Create Mesh Manually (Since we don't extend Enemy)
        this.mesh = this.createMesh();
        this.mesh.position.set(position.x, 0, position.z);
        scene.add(this.mesh);
        
        // Important: Link Boss Data to Mesh for Collision System
        this.mesh.userData = {
            type: 'boss',
            parent: this, // Reference back to this class
            health: this.health,
            maxHealth: this.maxHealth,
            damage: this.damage,
            speed: this.speed,
            lastShot: 0,
            fireRate: 1000
        };
        
        // Add to global enemies array so projectiles hit it
        enemies.push(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();
        
        // Boss Body (Large Box)
        const bodyGeo = new THREE.BoxGeometry(2 * this.scale, 3 * this.scale, 1.5 * this.scale);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            roughness: 0.3, 
            metalness: 0.8 
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = (3 * this.scale) / 2;
        group.add(body);

        // Boss Head
        const headGeo = new THREE.BoxGeometry(1 * this.scale, 1 * this.scale, 1 * this.scale);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = (3 * this.scale) + (0.5 * this.scale);
        group.add(head);

        // Glowing Core
        const coreGeo = new THREE.SphereGeometry(0.5 * this.scale, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, (2 * this.scale), 0.5 * this.scale);
        group.add(core);

        return group;
    }
    
    updatePhase() {
        // Sync health from mesh (collision system updates mesh.userData.health)
        if (this.mesh.userData.health < this.health) {
            this.health = this.mesh.userData.health;
        }

        const healthPercent = (this.health / this.maxHealth) * 100;
        for (let i = this.phases.length - 1; i >= 0; i--) {
            if (healthPercent <= this.phases[i].healthPercent) {
                if (this.phaseIndex !== i) {
                    this.phaseIndex = i;
                    this.onPhaseChange(this.phases[i]);
                }
                break;
            }
        }
    }
    
    onPhaseChange(phase) {
        this.currentAttack = phase.attack;
        if (phase.speed) this.mesh.userData.speed = phase.speed;
        if (phase.damage) this.mesh.userData.damage = phase.damage;
        
        // Visual Feedback (Flash Red)
        if(this.mesh.children[0]) {
            const originalColor = this.mesh.children[0].material.emissive.getHex();
            this.mesh.children[0].material.emissive.setHex(0xff0000);
            setTimeout(() => { 
                if(this.mesh && this.mesh.children[0]) 
                    this.mesh.children[0].material.emissive.setHex(originalColor); 
            }, 500);
        }

        showBossPhaseAlert(this.name, this.phaseIndex + 1);
        
        // Summon Minions
        if (phase.summonMinions) {
            for(let k=0; k<3; k++) {
                createEnemy(); // Use standard enemy spawner
                // Move the newly created enemy near boss
                const minion = enemies[enemies.length-1];
                if(minion) {
                    minion.position.copy(this.mesh.position);
                    minion.position.x += (Math.random() - 0.5) * 30;
                    minion.position.z += (Math.random() - 0.5) * 30;
                }
            }
        }
    }
}

// Helper function for boss phase alerts
function showBossPhaseAlert(bossName, phase) {
    const alert = document.createElement('div');
    alert.className = 'boss-phase-alert';
    alert.innerHTML = `<span>${bossName}</span><br>PHASE ${phase}`;
    document.getElementById('game-container').appendChild(alert);
    setTimeout(() => alert.remove(), 2000);
}

// ADD: Rescuable NPCs class
class RescueTarget {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.rescued = false;
        this.interactionRadius = 5;
        
        const princessData = {
            'princess_elena': {
                name: 'Princess Elena',
                dialogue: [
                    "Thank the heavens! I knew a knight would come!",
                    "The Black Knight... he's taken my sisters to the castle!",
                    "Please, you must save them!"
                ],
                reward: { gold: 100, healthBoost: 20 }
            },
            'princess_aria': {
                name: 'Princess Aria',
                dialogue: [
                    "You defeated Sir Malachar! Incredible!",
                    "My youngest sister Seraphina is still held by the Dragon...",
                    "He guards the throne room. Be careful!"
                ],
                reward: { gold: 150, shieldBoost: 25 }
            },
            'princess_seraphina': {
                name: 'Princess Seraphina',
                dialogue: [
                    "You've done it! The kingdom is saved!",
                    "My father the King will reward you greatly.",
                    "You are the greatest Iron Knight who ever lived!"
                ],
                reward: { gold: 500, ending: true }
            }
        };
        
        const data = princessData[type];
        Object.assign(this, data);
        this.createMesh();
    }
    
    createMesh() {
        // Create a simple princess mesh (cage + character)
        const group = new THREE.Group();
        
        // Cage bars
        const cageGeom = new THREE.CylinderGeometry(2, 2, 4, 8, 1, true);
        const cageMat = new THREE.MeshStandardMaterial({ 
            color: 0x444444, 
            wireframe: true,
            wireframeLinewidth: 2
        });
        const cage = new THREE.Mesh(cageGeom, cageMat);
        cage.position.y = 2;
        group.add(cage);
        
        // Princess figure (simple)
        const bodyGeom = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 1.5;
        group.add(body);
        
        // Floating indicator
        const indicatorGeom = new THREE.ConeGeometry(0.5, 1, 4);
        const indicatorMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
        indicator.position.y = 5;
        indicator.rotation.x = Math.PI;
        group.add(indicator);
        
        group.position.set(this.position.x, 0, this.position.z);
        this.mesh = group;
        scene.add(this.mesh);
    }
    
    update() {
        if (this.rescued) return;
        
        // Bob the indicator up and down
        if (this.mesh.children[2]) {
            this.mesh.children[2].position.y = 5 + Math.sin(Date.now() * 0.003) * 0.5;
        }
        
        // Check if player is close enough to rescue
        const dist = playerMech ? playerMech.position.distanceTo(this.mesh.position) : Infinity;
        if (dist < this.interactionRadius) {
            showInteractionPrompt('Press E to Rescue');
            if (GameState.keys['KeyE'] && !this.rescueTriggered) {
                this.rescue();
            }
        } else {
            // Hide prompt when player moves away
            const prompt = document.getElementById('interaction-prompt');
            if (prompt) prompt.classList.add('hidden');
        }
    }
    
    rescue() {
        this.rescued = true;
        this.rescueTriggered = true;
        
        // Remove cage, play celebration
        scene.remove(this.mesh);
        
        // Show dialogue
        showDialogue(this.name, this.dialogue);
        
        // Apply rewards
        if (this.reward.gold) player.gold += this.reward.gold;
        if (this.reward.healthBoost) player.maxHealth += this.reward.healthBoost;
        if (this.reward.shieldBoost) player.maxShield += this.reward.shieldBoost;
        
        // Update progression
        GameProgression.princesRescued++;
        updateMissionObjective('rescue', this.type);
        
        if (this.reward.ending) {
            triggerEnding();
        }
    }
}

function showDialogue(speaker, lines) {
    const dialogueBox = document.getElementById('dialogue-box');
    if (!dialogueBox) return;
    dialogueBox.classList.remove('hidden');
    let lineIndex = 0;
    
    function showNextLine() {
        if (lineIndex < lines.length) {
            document.getElementById('dialogue-speaker').textContent = speaker;
            document.getElementById('dialogue-text').textContent = lines[lineIndex];
            lineIndex++;
        } else {
            dialogueBox.classList.add('hidden');
            gameState.paused = false;
        }
    }
    
    gameState.paused = true;
    showNextLine();
    dialogueBox.onclick = showNextLine;
}

function showInteractionPrompt(text) {
    const prompt = document.getElementById('interaction-prompt');
    if (!prompt) return;
    const span = prompt.querySelector('span') || prompt;
    span.textContent = text;
    prompt.classList.remove('hidden');
}

// LevelEnvironments removed - now using unified CONFIG.LEVELS

// ADD: Structure generators
function generateStructure(type, position) {
    const group = new THREE.Group();
    
    switch(type) {
        case 'house':
            // Simple medieval house
            const houseBase = new THREE.Mesh(
                new THREE.BoxGeometry(6, 4, 5),
                new THREE.MeshStandardMaterial({ color: 0x8b7355 })
            );
            houseBase.position.y = 2;
            group.add(houseBase);
            
            const roof = new THREE.Mesh(
                new THREE.ConeGeometry(5, 3, 4),
                new THREE.MeshStandardMaterial({ color: 0x4a3728 })
            );
            roof.position.y = 5.5;
            roof.rotation.y = Math.PI / 4;
            group.add(roof);
            break;
            
        case 'tree':
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.7, 4, 8),
                new THREE.MeshStandardMaterial({ color: 0x4a3728 })
            );
            trunk.position.y = 2;
            group.add(trunk);
            
            const leaves = new THREE.Mesh(
                new THREE.SphereGeometry(3, 8, 6),
                new THREE.MeshStandardMaterial({ color: 0x228b22 })
            );
            leaves.position.y = 5;
            group.add(leaves);
            break;
            
        case 'tower':
            const towerBase = new THREE.Mesh(
                new THREE.CylinderGeometry(4, 5, 15, 8),
                new THREE.MeshStandardMaterial({ color: 0x666666 })
            );
            towerBase.position.y = 7.5;
            group.add(towerBase);
            
            const towerTop = new THREE.Mesh(
                new THREE.ConeGeometry(5, 5, 8),
                new THREE.MeshStandardMaterial({ color: 0x4a3728 })
            );
            towerTop.position.y = 17.5;
            group.add(towerTop);
            break;
            
        case 'wall_segment':
            const wall = new THREE.Mesh(
                new THREE.BoxGeometry(10, 8, 2),
                new THREE.MeshStandardMaterial({ color: 0x555555 })
            );
            wall.position.y = 4;
            group.add(wall);
            
            // Battlements
            for (let i = -4; i <= 4; i += 2) {
                const battlement = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 1.5, 2),
                    new THREE.MeshStandardMaterial({ color: 0x555555 })
                );
                battlement.position.set(i, 8.75, 0);
                group.add(battlement);
            }
            break;
            
        case 'throne':
            const throneBase = new THREE.Mesh(
                new THREE.BoxGeometry(4, 0.5, 3),
                new THREE.MeshStandardMaterial({ color: 0x8b0000 })
            );
            group.add(throneBase);
            
            const throneBack = new THREE.Mesh(
                new THREE.BoxGeometry(4, 6, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x8b0000 })
            );
            throneBack.position.set(0, 3, -1.25);
            group.add(throneBack);
            break;
    }
    
    group.position.set(position.x, 0, position.z);
    group.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    return group;
}

function loadLevel(levelName) {
    // Clear existing level
    clearCurrentLevel();
    
    const level = CONFIG.LEVELS[levelName];
    if (!level) {
        console.error(`Level ${levelName} not found!`);
        return;
    }
    
    // Set sky and fog
    scene.background = new THREE.Color(level.skyColor);
    scene.fog = new THREE.FogExp2(level.fogColor, level.fogDensity);
    
    // Create ground with grid
    const groundGeom = new THREE.PlaneGeometry(CONFIG.world.size * 2, CONFIG.world.size * 2);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: level.groundColor,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    levelObjects.push(ground);
    
    // Add neon grid
    const gridHelper = new THREE.GridHelper(CONFIG.world.size * 2, 100, 0x00fff9, 0x001a1a);
    gridHelper.position.y = 0.1;
    scene.add(gridHelper);
    levelObjects.push(gridHelper);
    
    // Create roads
    createRoads();
    
    // Create buildings
    createBuildings();
    
    // Create NPCs
    createNPCs();
    
    // Create vehicles
    createVehicles();
    
    // Create decorations
    createDecorations();
    
    // Generate level-specific structures
    level.structures.forEach(structDef => {
        for (let i = 0; i < structDef.count; i++) {
            const pos = {
                x: (Math.random() - 0.5) * 300,
                z: (Math.random() - 0.5) * 300
            };
            const structure = generateStructure(structDef.type, pos);
            if (structure) {
                scene.add(structure);
                levelObjects.push(structure);
                colliders.push(structure);
            }
        }
    });
    
    // Update lighting
    if(ambientLight) ambientLight.color.setHex(level.ambientLight);
    
    // Store spawn points
    currentSpawnPoints = level.spawnPoints;
    
    // Spawn Boss if level has one
    if (level.boss) {
        currentBoss = new Boss(level.boss, { x: 0, z: -100 });
    } else {
        currentBoss = null;
    }
    
    // Spawn rescue targets if mission requires it
    rescueTargets = [];
    if (GameProgression.currentMission) {
        const mission = GameProgression.currentMission;
        mission.objectives.forEach(obj => {
            if (obj.type === 'rescue' && obj.target) {
                const target = new RescueTarget(obj.target, { x: 50, z: -50 });
                rescueTargets.push(target);
            }
        });
    }

    GameProgression.currentLevel = levelName;
    
    // Set current mission
    const mission = GameProgression.storyMissions.find(m => m.level === levelName && !GameProgression.missionsCompleted.includes(m.id));
    if (mission) {
        GameProgression.currentMission = mission;
        // Reset mission objectives
        mission.objectives.forEach(obj => {
            if (obj.type === 'kill') obj.current = 0;
            if (obj.complete !== undefined) obj.complete = false;
        });
        updateMissionTitle(mission.title);
    }
    
    // Spawn enemies for the level
    const enemyCount = CONFIG.LEVELS[levelName].enemies || 5;
    spawnEnemies(enemyCount);
}

function clearCurrentLevel() {
    // Remove Level Objects
    levelObjects.forEach(obj => scene.remove(obj));
    levelObjects = [];
    
    // Clear Colliders
    colliders = [];

    // Remove Enemies
    // FIX: enemies array holds 3D objects, so we remove 'e' directly, not 'e.mesh'
    enemies.forEach(e => scene.remove(e)); 
    enemies = [];
    
    // Remove Projectiles
    projectiles.forEach(p => scene.remove(p));
    projectiles = [];
    
    // Remove Boss
    if (currentBoss && currentBoss.mesh) {
        scene.remove(currentBoss.mesh);
        currentBoss = null;
    }
}

// ADD: Home Base
const HomeBase = {
    unlocked: true,
    upgrades: {
        healthStation: { level: 1, maxLevel: 5, cost: [100, 200, 400, 800, 1600] },
        armorStation: { level: 0, maxLevel: 5, cost: [150, 300, 600, 1200, 2400] },
        weaponForge: { level: 1, maxLevel: 5, cost: [200, 400, 800, 1600, 3200] },
    },
    
    enterBase() {
        gameState.inHomeBase = true;
        GameState.isPaused = false;
        showHomeBaseUI();
        // Heal player to full
        GameState.player.health = GameState.player.maxHealth;
        GameState.player.shield = GameState.player.maxShield;
        GameState.player.boost = GameState.player.maxBoost;
        GameState.player.ammo = GameState.player.maxAmmo;
    },
    
    leaveBase() {
        gameState.inHomeBase = false;
        hideHomeBaseUI();
    },
    
    upgrade(station) {
        const upgrade = this.upgrades[station];
        if (upgrade.level >= upgrade.maxLevel) return false;
        
        const cost = upgrade.cost[upgrade.level];
        if (GameState.player.gold < cost) return false;
        
        GameState.player.gold -= cost;
        upgrade.level++;
        
        // Apply upgrade effects
        switch(station) {
            case 'healthStation':
                GameState.player.maxHealth += 20;
                break;
            case 'armorStation':
                GameState.player.maxShield += 25;
                break;
            case 'weaponForge':
                // Increase damage for current mech
                break;
        }
        
        updateHomeBaseUI();
        return true;
    },
    
    buyMech(mechId) {
        const mech = CONFIG.mechs[mechId];
        if (!mech || mech.unlocked) return false;
        if (GameState.player.gold < mech.price) return false;
        
        GameState.player.gold -= mech.price;
        mech.unlocked = true;
        
        updateHomeBaseUI();
        return true;
    },
    
    selectMech(mechId) {
        const mech = CONFIG.mechs[mechId];
        if (!mech || !mech.unlocked) return false;
        
        GameState.selectedMech = mechId;
        updateHomeBaseUI();
        return true;
    },
    
    getAvailableMissions() {
        return GameProgression.storyMissions.filter(m => 
            !GameProgression.missionsCompleted.includes(m.id) &&
            GameProgression.unlockedLevels.includes(m.level)
        );
    }
};

function showHomeBaseUI() {
    const screen = document.getElementById('home-base-screen');
    screen.classList.remove('hidden');
    screen.innerHTML = `
        <div class="home-base-bg"></div>
        <div class="home-base-content">
            <h2>IRON KNIGHT STRONGHOLD</h2>
            
            <div class="gold-display">
                ⬡ <span id="gold-amount">${GameState.player.gold}</span> GOLD
            </div>
            
            <div class="princesses-display">
                PRINCESSES RESCUED: <span>${GameProgression.princesRescued}/${GameProgression.totalPrinces}</span>
            </div>
            
            <div class="base-sections">
                <!-- MECH SHOP -->
                <div class="shop-section">
                    <h3>⚔️ MECH HANGAR</h3>
                    <div class="mech-shop-grid" id="mech-shop-grid"></div>
                </div>
                
                <!-- MISSIONS -->
                <div class="mission-section">
                    <h3>📋 MISSION BOARD</h3>
                    <div id="mission-list"></div>
                </div>
            </div>
            
            <button class="deploy-btn" onclick="startMissionFromBase()">DEPLOY TO BATTLE</button>
        </div>
    `;
    
    // Populate mech shop
    const mechGrid = document.getElementById('mech-shop-grid');
    Object.keys(CONFIG.mechs).forEach(mechId => {
        const mech = CONFIG.mechs[mechId];
        const isSelected = GameState.selectedMech === mechId;
        const canBuy = !mech.unlocked && GameState.player.gold >= mech.price;
        
        const mechCard = document.createElement('div');
        mechCard.className = `mech-shop-card ${mech.unlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`;
        mechCard.innerHTML = `
            <div class="mech-shop-preview" style="background: linear-gradient(135deg, #${mech.color.toString(16).padStart(6, '0')}33, transparent);"></div>
            <h4>${mech.name}</h4>
            <div class="mech-shop-stats">
                <span>HP: ${mech.health}</span>
                <span>DMG: ${mech.damage}</span>
                <span>SPD: ${mech.speed}</span>
            </div>
            ${mech.unlocked 
                ? `<button class="select-mech-btn" onclick="HomeBase.selectMech('${mechId}')">${isSelected ? '✓ SELECTED' : 'SELECT'}</button>`
                : `<button class="buy-mech-btn ${canBuy ? '' : 'disabled'}" onclick="HomeBase.buyMech('${mechId}')">BUY - ${mech.price} GOLD</button>`
            }
        `;
        mechGrid.appendChild(mechCard);
    });
    
    // Populate missions
    const missionList = document.getElementById('mission-list');
    const missions = HomeBase.getAvailableMissions();
    
    if (missions.length === 0) {
        missionList.innerHTML = '<p style="color: #666;">No missions available</p>';
    } else {
        missions.forEach(mission => {
            const missionEl = document.createElement('div');
            missionEl.className = 'mission-item';
            missionEl.innerHTML = `
                <h4>${mission.title}</h4>
                <p>${mission.description}</p>
                <span class="reward">Reward: ${mission.reward.gold} Gold</span>
                <button onclick="startMission('${mission.id}')">START MISSION</button>
            `;
            missionList.appendChild(missionEl);
        });
    }
}

function hideHomeBaseUI() {
    document.getElementById('home-base-screen').classList.add('hidden');
}

function startMission(missionId) {
    const mission = GameProgression.storyMissions.find(m => m.id === missionId);
    if (!mission) return;
    
    GameProgression.currentMission = mission;
    // Reset objectives
    mission.objectives.forEach(obj => {
        if (obj.type === 'kill') obj.current = 0;
        if (obj.complete !== undefined) obj.complete = false;
    });
    
    HomeBase.leaveBase();
    loadLevel(mission.level);
    
    // Show mission start overlay
    showMissionStartOverlay(mission);
}

function startMissionFromBase() {
    const missions = HomeBase.getAvailableMissions();
    if (missions.length > 0) {
        startMission(missions[0].id);
    } else {
        alert('No missions available! You have completed all missions!');
    }
}

function showMissionStartOverlay(mission) {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
        <div style="text-align: center; color: #00fff9; font-family: 'Orbitron', sans-serif;">
            <h2 style="font-size: 2rem; color: #ffff00; margin-bottom: 1rem;">${mission.title}</h2>
            <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">${mission.description}</p>
            <p style="color: #ff6b00;">Level: ${CONFIG.LEVELS[mission.level].name}</p>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
        document.getElementById('game-canvas').requestPointerLock();
    }, 2500);
}

function updateHomeBaseUI() {
    // Update gold display - FIXED: was using .score, now using .gold
    const goldDisplay = document.getElementById('gold-display');
    if (goldDisplay) goldDisplay.textContent = persistentGold;
    
    // Update upgrade buttons
    Object.keys(HomeBase.upgrades).forEach(station => {
        const upgrade = HomeBase.upgrades[station];
        const btn = document.getElementById(`upgrade-${station}`);
        if (btn) {
            const cost = upgrade.level < upgrade.maxLevel ? upgrade.cost[upgrade.level] : 'MAX';
            btn.textContent = `${station} (Lv.${upgrade.level}) - ${cost} Gold`;
            btn.disabled = upgrade.level >= upgrade.maxLevel || persistentGold < upgrade.cost[upgrade.level];
        }
    });
    
    // Update mission list
    const missionList = document.getElementById('mission-list');
    if (missionList) {
        missionList.innerHTML = '';
        HomeBase.getAvailableMissions().forEach(mission => {
            const missionEl = document.createElement('div');
            missionEl.className = 'mission-item';
            missionEl.innerHTML = `
                <h4>${mission.title}</h4>
                <p>${mission.description}</p>
                <span class="reward">Reward: ${mission.reward.gold} Gold</span>
                <button onclick="startMission('${mission.id}')">START</button>
            `;
            missionList.appendChild(missionEl);
        });
    }
    
    // Update rescued princesses display
    const princessDisplay = document.getElementById('princesses-rescued');
    if (princessDisplay) {
        princessDisplay.textContent = `${GameProgression.princesRescued}/${GameProgression.totalPrinces}`;
    }
}

// ================================
// GAME STATE
// ================================

const GameState = {
    screen: 'loading',
    selectedMech: 'striker',
    isPaused: false,
    isPlaying: false,
    
    // Player stats
    player: {
        health: 100,
        maxHealth: 100,
        shield: 100,
        maxShield: 100,
        boost: 100,
        maxBoost: 100,
        ammo: 30,
        maxAmmo: 30,
        score: 0,
        kills: 0,
        wave: 1
    },
    
    // Combat
    isFlying: false,
    isBoosting: false,
    isShooting: false,
    lastShot: 0,
    abilityCooldown: 0,
    
    // Input
    keys: {},
    mouse: { x: 0, y: 0, locked: false },
    cameraMode: 'thirdPerson', 
    cameraPitch: 0,
    cameraYaw: 0
};

const gameState = {
    inHomeBase: false,
    paused: false
};

// Game Mode System
const GameMode = {
    current: 'story', // 'story' or 'free'
    missionStartTime: 0,
    sessionKills: 0,
    sessionGold: 0
};

// ================================
// THREE.JS SETUP
// ================================

let scene, camera, renderer, clock;
let playerMech, playerVelocity, playerRotation;
let enemies = [];
let projectiles = [];
let buildings = [];
let npcs = [];
let vehicles = [];
let particles = [];
let cameraShake = 0;

// NEW: Global variables for Level System (Required for black screen fix)
let ambientLight; 
let colliders = [];
let currentBoss = null;
let rescueTargets = [];
let levelObjects = [];
let currentSpawnPoints = [];
let player = {
    mesh: null,
    gold: 0,
    maxHealth: 100,
    maxShield: 100,
    health: 100,
    shield: 100,
    damage: 15
};

// Persistent gold storage (survives game restarts)
let persistentGold = 0;

// Save/Load system
const SaveSystem = {
    save() {
        const data = {
            gold: persistentGold,
            unlockedMechs: Object.keys(CONFIG.mechs).filter(id => CONFIG.mechs[id].unlocked),
            missionsCompleted: GameProgression.missionsCompleted,
            unlockedLevels: GameProgression.unlockedLevels,
            princessesRescued: GameProgression.princesRescued
        };
        localStorage.setItem('ironKnightsSave', JSON.stringify(data));
    },
    
    load() {
        const saved = localStorage.getItem('ironKnightsSave');
        if (saved) {
            const data = JSON.parse(saved);
            persistentGold = data.gold || 0;
            GameProgression.missionsCompleted = data.missionsCompleted || [];
            GameProgression.unlockedLevels = data.unlockedLevels || ['HOME_BASE', 'VILLAGE'];
            GameProgression.princesRescued = data.princessesRescued || 0;
            
            // Restore mech unlocks
            if (data.unlockedMechs) {
                data.unlockedMechs.forEach(mechId => {
                    if (CONFIG.mechs[mechId]) CONFIG.mechs[mechId].unlocked = true;
                });
            }
        }
    }
};

// Helper function for lerp (linear interpolation)
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// ================================
// INITIALIZATION
// ================================

function init() {
    SaveSystem.load(); // Load saved progress
    setupEventListeners();
    simulateLoading();
}

function simulateLoading() {
    const progressBar = document.querySelector('.loading-progress');
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                showScreen('main-menu');
            }, 500);
        }
        progressBar.style.width = `${progress}%`;
    }, 200);
}

function setupEventListeners() {
    // Menu buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleMenuAction);
    });
    
    // Mech selection
    document.querySelectorAll('.mech-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.mech-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            GameState.selectedMech = card.dataset.mech;
        });
    });
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
        GameState.keys[e.code] = true;
        
        if (e.code === 'Escape' && GameState.isPlaying) {
            togglePause();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        GameState.keys[e.code] = false;
    });
    
    // Mouse
    document.addEventListener('mousemove', (e) => {
        if (GameState.mouse.locked) {
            GameState.mouse.x += e.movementX * 0.002;
            GameState.mouse.y += e.movementY * 0.002;
            GameState.mouse.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, GameState.mouse.y));
        }
    });
    
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) GameState.isShooting = true;
        if (e.button === 2) GameState.isSecondaryFire = true;
    });
    
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) GameState.isShooting = false;
        if (e.button === 2) GameState.isSecondaryFire = false;
    });
    
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Pointer lock
    document.getElementById('game-canvas').addEventListener('click', () => {
        if (GameState.isPlaying && !GameState.isPaused) {
            document.getElementById('game-canvas').requestPointerLock();
        }
    });
    
    document.addEventListener('pointerlockchange', () => {
        GameState.mouse.locked = document.pointerLockElement === document.getElementById('game-canvas');
    });

    // --- ADD THIS INSIDE setupEventListeners ---
    document.querySelectorAll('.mech-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
        
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
        
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
        
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
    
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
}

function handleMenuAction(e) {
    const action = e.currentTarget.dataset.action;
    
    switch (action) {
        case 'story-mode':
            showScreen('story-map-screen');
            updateStoryMap();
            break;
        case 'free-mode':
            GameMode.current = 'free';
            GameProgression.currentMission = null;
            startGame();
            break;
        case 'start':
            startGame();
            break;
        case 'hangar':
            document.getElementById('mission-complete-screen')?.classList.add('hidden');
            showScreen('hangar-screen');
            updateHangarUI();
            break;
        case 'controls':
            showScreen('controls-screen');
            break;
        case 'menu':
            if (GameState.isPlaying) {
                endGame();
            }
            document.getElementById('mission-complete-screen')?.classList.add('hidden');
            showScreen('main-menu');
            updateMenuGold();
            break;
        case 'resume':
            togglePause();
            break;
        case 'restart':
            document.getElementById('game-over').classList.add('hidden');
            if (GameMode.current === 'story' && GameProgression.currentMission) {
                startStoryMission(GameProgression.currentMission);
            } else {
                GameMode.current = 'free';
                startGame();
            }
            break;
        case 'next-mission':
            document.getElementById('mission-complete-screen').classList.add('hidden');
            showScreen('story-map-screen');
            updateStoryMap();
            break;
    }
}

function showScreen(screenId) {
    ['loading-screen', 'main-menu', 'hangar-screen', 'controls-screen', 'game-container', 'story-map-screen', 'mission-complete-screen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    GameState.screen = screenId;
    
    if (screenId === 'main-menu') updateMenuGold();
}

function updateHangarUI() {
    const hangarGold = document.getElementById('hangar-gold');
    if (hangarGold) hangarGold.textContent = persistentGold;
    
    const mechSelection = document.getElementById('mech-selection');
    if (!mechSelection) return;
    
    mechSelection.innerHTML = '';
    
    Object.keys(CONFIG.mechs).forEach(mechId => {
        const mech = CONFIG.mechs[mechId];
        const isSelected = GameState.selectedMech === mechId;
        const isUnlocked = mech.unlocked;
        const canBuy = !isUnlocked && persistentGold >= mech.price;
        
        const card = document.createElement('div');
        card.className = `mech-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        card.dataset.mech = mechId;
        
        card.innerHTML = `
            <div class="mech-preview ${mechId}"></div>
            <div class="mech-info">
                <h3>${mech.name}</h3>
                <div class="stat-bar"><span>SPEED</span><div class="bar"><div style="width:${mech.speed * 5}%"></div></div></div>
                <div class="stat-bar"><span>ARMOR</span><div class="bar"><div style="width:${mech.health / 2}%"></div></div></div>
                <div class="stat-bar"><span>POWER</span><div class="bar"><div style="width:${mech.damage * 3}%"></div></div></div>
                ${!isUnlocked ? `<div class="mech-price">${mech.price} GOLD</div>` : ''}
                ${isSelected ? '<div class="mech-selected-badge">EQUIPPED</div>' : ''}
            </div>
        `;
        
        // --- 1. CLICK LOGIC ---
        card.onclick = () => {
            if (isUnlocked) {
                GameState.selectedMech = mechId;
                updateHangarUI();
            } else if (canBuy) {
                persistentGold -= mech.price;
                mech.unlocked = true;
                GameState.selectedMech = mechId;
                SaveSystem.save();
                updateHangarUI();
            }
        };

        // --- 2. RESTORED 3D TILT EFFECT LOGIC ---
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate rotation based on mouse position
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset position on leave
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });

        mechSelection.appendChild(card);
    });
}

// ================================
// GAME INITIALIZATION
// ================================

function startGame() {
    showScreen('game-container');
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('mission-objectives').classList.add('hidden');
    
    // Reset game state but PRESERVE gold
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    const currentGold = persistentGold; // Preserve gold!
    
    GameState.player = {
        health: mechConfig.health,
        maxHealth: mechConfig.health,
        shield: mechConfig.shield,
        maxShield: mechConfig.shield,
        boost: 100,
        maxBoost: 100,
        ammo: 100,
        maxAmmo: 100,
        gold: currentGold, // Use preserved gold
        score: 0,
        kills: 0,
        wave: 1
    };
    
    // Reset session tracking
    GameMode.sessionKills = 0;
    GameMode.sessionGold = 0;
    GameMode.missionStartTime = Date.now();
    
    GameState.isPlaying = true;
    GameState.isPaused = false;
    
    // Initialize Three.js
    initThreeJS();
    createWorld();
    createPlayer();
    
    // Spawn enemies based on mode
    if (GameMode.current === 'story' && GameProgression.currentMission) {
        const enemyCount = GameProgression.currentMission.objectives.find(o => o.type === 'kill')?.count || 5;
        spawnEnemies(enemyCount);
        document.getElementById('mission-objectives').classList.remove('hidden');
        updateObjectivesUI();
    } else {
        spawnEnemies(5);
    }
    
    // Update HUD gold display
    updateHUDGold();
    
    // Start game loop
    clock = new THREE.Clock();
    animate();
    
    // Request pointer lock
    setTimeout(() => {
        document.getElementById('game-canvas').requestPointerLock();
    }, 100);
}

function updateHUDGold() {
    const el = document.getElementById('hud-gold-value');
    if (el) el.textContent = GameState.player.gold || 0;
}

function initThreeJS() {
    const canvas = document.getElementById('game-canvas');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.003);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting
    ambientLight = new THREE.AmbientLight(0x111122, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add neon point lights
    const pointLight1 = new THREE.PointLight(0x00fff9, 2, 100);
    pointLight1.position.set(0, 30, 0);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 80);
    pointLight2.position.set(50, 20, 50);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xffff00, 1, 80);
    pointLight3.position.set(-50, 20, -50);
    scene.add(pointLight3);
}

// ================================
// WORLD CREATION
// ================================

function createWorld() {
    // Load the initial level defined in progression
    loadLevel(GameProgression.currentLevel || 'HOME_BASE');
    
    // Add skybox (global)
    createSkybox();
}

function createGround() {
    // Main ground
    const groundGeometry = new THREE.PlaneGeometry(CONFIG.world.size * 2, CONFIG.world.size * 2);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.ground,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Neon grid lines
    const gridHelper = new THREE.GridHelper(CONFIG.world.size * 2, 100, 0x00fff9, 0x001a1a);
    gridHelper.position.y = 0.1;
    scene.add(gridHelper);
    
    // Glowing road lines
    createRoads();
}

function createRoads() {
    const roadMaterial = new THREE.MeshBasicMaterial({
        color: 0x00fff9,
        transparent: true,
        opacity: 0.3
    });
    
    // Main roads
    for (let i = -200; i <= 200; i += 100) {
        const roadGeometry = new THREE.PlaneGeometry(10, CONFIG.world.size * 2);
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.set(i, 0.2, 0);
        scene.add(road);
        
        const roadCross = road.clone();
        roadCross.rotation.z = Math.PI / 2;
        roadCross.position.set(0, 0.2, i);
        scene.add(roadCross);
    }
}

function createBuildings() {
    buildings = [];
    
    for (let i = 0; i < CONFIG.world.buildingCount; i++) {
        const building = createBuilding();
        buildings.push(building);
        scene.add(building);
    }
}

function createNPCs() {
    npcs = [];
    for (let i = 0; i < CONFIG.world.npcCount; i++) {
        const npc = createNPC();
        npcs.push(npc);
        scene.add(npc);
    }
}

function createVehicles() {
    vehicles = [];
    for (let i = 0; i < CONFIG.world.vehicleCount; i++) {
        const vehicle = createVehicle();
        vehicles.push(vehicle);
        scene.add(vehicle);
    }
}

function createBuilding() {
    const group = new THREE.Group();
    
    // Random position avoiding center
    let x, z;
    do {
        x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
        z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    } while (Math.abs(x) < 50 && Math.abs(z) < 50);
    
    // Random building size
    const width = 15 + Math.random() * 30;
    const depth = 15 + Math.random() * 30;
    const height = 30 + Math.random() * 100;
    
    // Main building body - Dark with metallic finish
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a1a,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x050510,
        emissiveIntensity: 0.2
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);
    
    // Neon accent lines
    const accentColor = [0x00fff9, 0xff00ff, 0xffff00, 0x00ff66][Math.floor(Math.random() * 4)];
    
    // Horizontal neon lines
    const lineCount = Math.floor(height / 20);
    for (let j = 0; j < lineCount; j++) {
        const lineGeometry = new THREE.BoxGeometry(width + 0.5, 0.5, depth + 0.5);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: 0.8
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.y = 10 + j * 20;
        group.add(line);
    }
    
    // Vertical neon edges
    const edgeGeometry = new THREE.BoxGeometry(0.5, height, 0.5);
    const edgeMaterial = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.6
    });
    
    const corners = [
        [-width/2, 0, -depth/2],
        [width/2, 0, -depth/2],
        [-width/2, 0, depth/2],
        [width/2, 0, depth/2]
    ];
    
    corners.forEach(([cx, cy, cz]) => {
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.set(cx, height/2, cz);
        group.add(edge);
    });
    
    // Windows (emissive neon panels)
    const windowColors = [0x00fff9, 0xff00ff, 0xffff00, 0x00ff66, 0x0066ff];
    const windowRows = Math.floor(height / 8);
    const windowCols = Math.floor(width / 6);
    
    for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
            if (Math.random() > 0.25) { // More windows
                const windowGeometry = new THREE.BoxGeometry(3, 4, 0.5);
                const windowColor = windowColors[Math.floor(Math.random() * windowColors.length)];
                const windowMaterial = new THREE.MeshBasicMaterial({
                    color: windowColor,
                    transparent: true,
                    opacity: Math.random() * 0.6 + 0.4
                });
                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(
                    -width/2 + 4 + col * 6,
                    5 + row * 8,
                    depth/2 + 0.3
                );
                group.add(windowMesh);
                
                // Back windows too
                const backWindow = windowMesh.clone();
                backWindow.position.z = -depth/2 - 0.3;
                group.add(backWindow);
            }
        }
    }
    
    // Side windows
    const sideWindowRows = Math.floor(height / 8);
    const sideWindowCols = Math.floor(depth / 6);
    for (let row = 0; row < sideWindowRows; row++) {
        for (let col = 0; col < sideWindowCols; col++) {
            if (Math.random() > 0.35) {
                const windowGeometry = new THREE.BoxGeometry(0.5, 4, 3);
                const windowColor = windowColors[Math.floor(Math.random() * windowColors.length)];
                const windowMaterial = new THREE.MeshBasicMaterial({
                    color: windowColor,
                    transparent: true,
                    opacity: Math.random() * 0.5 + 0.3
                });
                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(
                    width/2 + 0.3,
                    5 + row * 8,
                    -depth/2 + 4 + col * 6
                );
                group.add(windowMesh);
                
                // Other side
                const otherSide = windowMesh.clone();
                otherSide.position.x = -width/2 - 0.3;
                group.add(otherSide);
            }
        }
    }
    
    // Add medieval-futuristic spires on some buildings
    if (Math.random() > 0.6) {
        const spireGeometry = new THREE.ConeGeometry(width * 0.2, height * 0.3, 4);
        const spireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.8,
            roughness: 0.2
        });
        const spire = new THREE.Mesh(spireGeometry, spireMaterial);
        spire.position.y = height + (height * 0.15);
        spire.rotation.y = Math.PI / 4;
        group.add(spire);
        
        // Spire glow
        const glowGeometry = new THREE.SphereGeometry(2, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: accentColor,
            transparent: true,
            opacity: 0.8
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = height + (height * 0.3);
        group.add(glow);
    }
    
    group.position.set(x, 0, z);
    group.userData = { type: 'building', width, depth, height };
    
    return group;
}

function createNPC() {
    const group = new THREE.Group();
    
    // Random color
    const npcColor = [0x00fff9, 0xff00ff, 0x00ff66, 0xffff00][Math.floor(Math.random() * 4)];
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.5,
        roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    group.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.3,
        roughness: 0.7
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7;
    group.add(head);
    
    // Glowing visor
    const visorGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.1);
    const visorMaterial = new THREE.MeshBasicMaterial({ color: npcColor });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 1.7, 0.25);
    group.add(visor);
    
    // Position
    const x = (Math.random() - 0.5) * CONFIG.world.size;
    const z = (Math.random() - 0.5) * CONFIG.world.size;
    group.position.set(x, 0, z);
    
    // Movement data
    group.userData = {
        type: 'npc',
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        ),
        walkSpeed: 1 + Math.random() * 2
    };
    
    return group;
}

function createVehicle() {
    const group = new THREE.Group();
    
    const vehicleColor = [0x00fff9, 0xff00ff, 0xffff00][Math.floor(Math.random() * 3)];
    const isHoverBike = Math.random() > 0.5;
    
    if (isHoverBike) {
        // Hover bike (digital horse replacement)
        const bikeBody = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 3);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bikeBody.add(body);
        
        // Front shield
        const shieldGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const shieldMaterial = new THREE.MeshBasicMaterial({
            color: vehicleColor,
            transparent: true,
            opacity: 0.5
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.set(0, 0.4, 1.5);
        shield.rotation.x = -0.3;
        bikeBody.add(shield);
        
        // Neon trails
        const trailGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
        const trailMaterial = new THREE.MeshBasicMaterial({ color: vehicleColor });
        
        const leftTrail = new THREE.Mesh(trailGeometry, trailMaterial);
        leftTrail.position.set(-0.5, -0.3, -0.5);
        bikeBody.add(leftTrail);
        
        const rightTrail = leftTrail.clone();
        rightTrail.position.x = 0.5;
        bikeBody.add(rightTrail);
        
        bikeBody.position.y = 1;
        group.add(bikeBody);
        
    } else {
        // Hover car
        const carBody = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.add(body);
        
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.8, 0.6, 1.5);
        const windshieldMaterial = new THREE.MeshBasicMaterial({
            color: vehicleColor,
            transparent: true,
            opacity: 0.4
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 0.7, 0.5);
        carBody.add(windshield);
        
        // Neon underlight
        const underlightGeometry = new THREE.BoxGeometry(1.8, 0.1, 3.8);
        const underlightMaterial = new THREE.MeshBasicMaterial({ color: vehicleColor });
        const underlight = new THREE.Mesh(underlightGeometry, underlightMaterial);
        underlight.position.y = -0.5;
        carBody.add(underlight);
        
        // Headlights
        const headlightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        const leftLight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftLight.position.set(-0.6, 0, 2);
        carBody.add(leftLight);
        
        const rightLight = leftLight.clone();
        rightLight.position.x = 0.6;
        carBody.add(rightLight);
        
        carBody.position.y = 1;
        group.add(carBody);
    }
    
    // Position on road
    const roadPos = [-200, -100, 0, 100, 200][Math.floor(Math.random() * 5)];
    const isHorizontal = Math.random() > 0.5;
    
    if (isHorizontal) {
        group.position.set((Math.random() - 0.5) * CONFIG.world.size, 0, roadPos);
        group.rotation.y = Math.PI / 2;
    } else {
        group.position.set(roadPos, 0, (Math.random() - 0.5) * CONFIG.world.size);
    }
    
    group.userData = {
        type: 'vehicle',
        isHorizontal,
        speed: 5 + Math.random() * 10,
        direction: Math.random() > 0.5 ? 1 : -1
    };
    
    return group;
}

function createDecorations() {
    // Holographic signs
    for (let i = 0; i < 40; i++) {
        const sign = createHoloSign();
        scene.add(sign);
    }
    
    // Light pillars
    for (let i = 0; i < 50; i++) {
        const pillar = createLightPillar();
        scene.add(pillar);
    }
    
    // Energy crystals
    for (let i = 0; i < 60; i++) {
        const crystal = createEnergyCrystal();
        scene.add(crystal);
    }
    
    // Floating platforms
    for (let i = 0; i < 20; i++) {
        const platform = createFloatingPlatform();
        scene.add(platform);
    }
    
    // Neon arches
    for (let i = 0; i < 15; i++) {
        const arch = createNeonArch();
        scene.add(arch);
    }
    
    // Power conduits
    for (let i = 0; i < 30; i++) {
        const conduit = createPowerConduit();
        scene.add(conduit);
    }
}

function createHoloSign() {
    const group = new THREE.Group();
    
    const signColor = [0x00fff9, 0xff00ff, 0xffff00, 0x00ff66][Math.floor(Math.random() * 4)];
    
    const signGeometry = new THREE.PlaneGeometry(10 + Math.random() * 10, 5 + Math.random() * 5);
    const signMaterial = new THREE.MeshBasicMaterial({
        color: signColor,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    
    // Position above buildings
    const x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const y = 40 + Math.random() * 40;
    
    group.position.set(x, y, z);
    group.rotation.y = Math.random() * Math.PI;
    group.add(sign);
    
    // Border
    const borderGeometry = new THREE.EdgesGeometry(signGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({ color: signColor });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    group.add(border);
    
    group.userData = { type: 'sign', floatOffset: Math.random() * Math.PI * 2 };
    
    return group;
}

function createLightPillar() {
    const group = new THREE.Group();
    
    const pillarColor = [0x00fff9, 0xff00ff][Math.floor(Math.random() * 2)];
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 8, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.2
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 4;
    group.add(pole);
    
    // Light orb
    const orbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({ color: pillarColor });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.y = 8.5;
    group.add(orb);
    
    // Light cone
    const pointLight = new THREE.PointLight(pillarColor, 0.5, 20);
    pointLight.position.y = 8;
    group.add(pointLight);
    
    // Position along roads
    const roadPos = [-200, -100, 100, 200][Math.floor(Math.random() * 4)];
    const alongRoad = (Math.random() - 0.5) * CONFIG.world.size;
    
    if (Math.random() > 0.5) {
        group.position.set(roadPos + 8, 0, alongRoad);
    } else {
        group.position.set(alongRoad, 0, roadPos + 8);
    }
    
    return group;
}

function createEnergyCrystal() {
    const group = new THREE.Group();
    const crystalColor = [0x00fff9, 0xff00ff, 0xffff00, 0x00ff66][Math.floor(Math.random() * 4)];
    
    // Crystal geometry
    const crystalGeometry = new THREE.ConeGeometry(0.5, 2, 6);
    const crystalMaterial = new THREE.MeshBasicMaterial({
        color: crystalColor,
        transparent: true,
        opacity: 0.7
    });
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.position.y = 1;
    crystal.rotation.y = Math.random() * Math.PI;
    group.add(crystal);
    
    // Glow
    const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: crystalColor,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.5;
    group.add(glow);
    
    // Position
    const x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    group.position.set(x, 0, z);
    
    group.userData = { type: 'crystal', floatOffset: Math.random() * Math.PI * 2 };
    
    return group;
}

function createFloatingPlatform() {
    const group = new THREE.Group();
    const platformColor = [0x00fff9, 0xff00ff, 0xffff00][Math.floor(Math.random() * 3)];
    
    const size = 5 + Math.random() * 10;
    const height = 10 + Math.random() * 30;
    
    // Platform base
    const platformGeometry = new THREE.BoxGeometry(size, 0.5, size);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.7,
        roughness: 0.3
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = height;
    group.add(platform);
    
    // Neon edges
    const edgeMaterial = new THREE.MeshBasicMaterial({
        color: platformColor,
        transparent: true,
        opacity: 0.8
    });
    const edges = [
        { pos: [0, height, size/2], size: [size, 0.1, 0.1] },
        { pos: [0, height, -size/2], size: [size, 0.1, 0.1] },
        { pos: [size/2, height, 0], size: [0.1, 0.1, size] },
        { pos: [-size/2, height, 0], size: [0.1, 0.1, size] }
    ];
    
    edges.forEach(edge => {
        const edgeGeometry = new THREE.BoxGeometry(...edge.size);
        const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edgeMesh.position.set(...edge.pos);
        group.add(edgeMesh);
    });
    
    // Position
    const x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    group.position.set(x, 0, z);
    
    group.userData = { type: 'platform', floatOffset: Math.random() * Math.PI * 2, height, size };
    
    return group;
}

function createNeonArch() {
    const group = new THREE.Group();
    const archColor = [0x00fff9, 0xff00ff, 0xffff00][Math.floor(Math.random() * 3)];
    
    const width = 8 + Math.random() * 12;
    const height = 10 + Math.random() * 15;
    
    // Arch sides
    const sideGeometry = new THREE.BoxGeometry(0.3, height, 0.3);
    const sideMaterial = new THREE.MeshBasicMaterial({
        color: archColor,
        transparent: true,
        opacity: 0.8
    });
    
    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSide.position.set(-width/2, height/2, 0);
    group.add(leftSide);
    
    const rightSide = leftSide.clone();
    rightSide.position.x = width/2;
    group.add(rightSide);
    
    // Arch top
    const topGeometry = new THREE.TorusGeometry(width/2, 0.3, 8, 16, Math.PI);
    const topMaterial = new THREE.MeshBasicMaterial({
        color: archColor,
        transparent: true,
        opacity: 0.8
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height;
    top.rotation.z = Math.PI;
    group.add(top);
    
    // Position
    const x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    
    return group;
}

function createPowerConduit() {
    const group = new THREE.Group();
    const conduitColor = [0x00fff9, 0xff00ff][Math.floor(Math.random() * 2)];
    
    const length = 5 + Math.random() * 15;
    
    // Conduit pipe
    const conduitGeometry = new THREE.CylinderGeometry(0.2, 0.2, length, 8);
    const conduitMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.2
    });
    const conduit = new THREE.Mesh(conduitGeometry, conduitMaterial);
    conduit.rotation.z = Math.PI / 2;
    group.add(conduit);
    
    // Energy glow inside
    const glowGeometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: conduitColor,
        transparent: true,
        opacity: 0.6
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.z = Math.PI / 2;
    group.add(glow);
    
    // Position
    const x = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const z = (Math.random() - 0.5) * CONFIG.world.size * 1.5;
    const y = 2 + Math.random() * 8;
    group.position.set(x, y, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    
    return group;
}

function createSkybox() {
    // Distant city silhouette
    const skyGeometry = new THREE.CylinderGeometry(400, 400, 200, 64, 1, true);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x0a0a15,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.8
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.position.y = 100;
    scene.add(sky);
    
    // Add some floating particles/stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 800;
        positions[i + 1] = 50 + Math.random() * 200;
        positions[i + 2] = (Math.random() - 0.5) * 800;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0x00fff9,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// ================================
// PLAYER MECH
// ================================

function createPlayer() {
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    playerMech = new THREE.Group();
    const scale = mechConfig.scale || 1.0;
    const style = mechConfig.style || 'balanced';
    
    // Store references for visual effects
    playerMech.userData.boosters = [];
    playerMech.userData.weapon = null;
    playerMech.userData.weaponGlow = null;
    playerMech.userData.boosterParticles = [];
    
    // Adjust dimensions based on style
    let bodyWidth = 2, bodyHeight = 3, bodyDepth = 1.5;
    let armWidth = 0.6, armHeight = 2.5;
    let legWidth = 0.8, legHeight = 2;
    
    if (style === 'heavy') {
        bodyWidth *= 1.3;
        bodyHeight *= 1.2;
        bodyDepth *= 1.2;
        armWidth *= 1.2;
        armHeight *= 1.1;
        legWidth *= 1.3;
        legHeight *= 1.2;
    } else if (style === 'light') {
        bodyWidth *= 0.85;
        bodyHeight *= 0.9;
        bodyDepth *= 0.9;
        armWidth *= 0.85;
        legWidth *= 0.85;
        legHeight *= 0.9;
    }
    
    // Apply scale
    bodyWidth *= scale;
    bodyHeight *= scale;
    bodyDepth *= scale;
    armWidth *= scale;
    armHeight *= scale;
    legWidth *= scale;
    legHeight *= scale;
    
    // Core body
    const bodyGeometry = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.7,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = bodyHeight / 2;
    playerMech.add(body);
    
    // Chest armor (varied by style)
    const chestWidth = bodyWidth * 1.1;
    const chestHeight = bodyHeight * 0.5;
    const chestDepth = bodyDepth * 1.13;
    const chestGeometry = new THREE.BoxGeometry(chestWidth, chestHeight, chestDepth);
    const chestMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.8,
        roughness: 0.2
    });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.y = bodyHeight * 0.83;
    playerMech.add(chest);
    
    // Neon core (center of chest)
    const coreSize = 0.3 * scale;
    const coreGeometry = new THREE.SphereGeometry(coreSize, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: mechConfig.color });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, bodyHeight * 0.83, bodyDepth * 0.6);
    playerMech.add(core);
    
    // Head/Cockpit (varied by style)
    let headWidth = 1.2 * scale;
    let headHeight = 0.8 * scale;
    let headDepth = 1.0 * scale;
    if (style === 'heavy') {
        headWidth *= 1.2;
        headHeight *= 1.1;
    } else if (style === 'light') {
        headWidth *= 0.9;
    }
    const headGeometry = new THREE.BoxGeometry(headWidth, headHeight, headDepth);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.6,
        roughness: 0.4
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = bodyHeight + headHeight / 2;
    playerMech.add(head);
    
    // Visor
    const visorWidth = headWidth * 0.83;
    const visorGeometry = new THREE.BoxGeometry(visorWidth, headHeight * 0.375, 0.1 * scale);
    const visorMaterial = new THREE.MeshBasicMaterial({
        color: mechConfig.color,
        transparent: true,
        opacity: 0.8
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, bodyHeight + headHeight / 2, headDepth * 0.55);
    playerMech.add(visor);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(armWidth, armHeight, armWidth);
    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-bodyWidth * 0.75, bodyHeight * 0.67, 0);
    playerMech.add(leftArm);
    
    const rightArm = leftArm.clone();
    rightArm.position.x = bodyWidth * 0.75;
    playerMech.add(rightArm);
    
    // Shoulder pads (medieval knight style - larger for heavy)
    let shoulderSize = 1.0 * scale;
    if (style === 'heavy') shoulderSize *= 1.3;
    if (style === 'light') shoulderSize *= 0.9;
    
    const shoulderGeometry = new THREE.BoxGeometry(shoulderSize, shoulderSize * 0.5, shoulderSize);
    const shoulderMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-bodyWidth * 0.75, bodyHeight * 1.1, 0);
    playerMech.add(leftShoulder);
    
    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = bodyWidth * 0.75;
    playerMech.add(rightShoulder);
    
    // Neon shoulder accents
    const shoulderAccentGeometry = new THREE.BoxGeometry(shoulderSize * 1.1, shoulderSize * 0.1, shoulderSize * 1.1);
    const shoulderAccentMaterial = new THREE.MeshBasicMaterial({ color: mechConfig.color });
    
    const leftAccent = new THREE.Mesh(shoulderAccentGeometry, shoulderAccentMaterial);
    leftAccent.position.set(-bodyWidth * 0.75, bodyHeight * 1.18, 0);
    playerMech.add(leftAccent);
    
    const rightAccent = leftAccent.clone();
    rightAccent.position.x = bodyWidth * 0.75;
    playerMech.add(rightAccent);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legWidth);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-bodyWidth * 0.3, legHeight / 2, 0);
    playerMech.add(leftLeg);
    
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = bodyWidth * 0.3;
    playerMech.add(rightLeg);
    
    // Boosters on back (varied by style)
    let boosterRadius = 0.3 * scale;
    let boosterHeight = 1.0 * scale;
    if (style === 'heavy') {
        boosterRadius *= 1.2;
        boosterHeight *= 1.2;
    }
    const boosterGeometry = new THREE.CylinderGeometry(boosterRadius, boosterRadius * 1.33, boosterHeight, 8);
    const boosterMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const leftBooster = new THREE.Mesh(boosterGeometry, boosterMaterial);
    leftBooster.position.set(-bodyWidth * 0.35, bodyHeight * 0.83, -bodyDepth * 0.6);
    playerMech.add(leftBooster);
    playerMech.userData.boosters.push(leftBooster);
    
    const rightBooster = leftBooster.clone();
    rightBooster.position.x = bodyWidth * 0.35;
    playerMech.add(rightBooster);
    playerMech.userData.boosters.push(rightBooster);
    
    // Additional boosters for heavy mechs
    if (style === 'heavy') {
        const extraLeft = leftBooster.clone();
        extraLeft.position.set(-bodyWidth * 0.35, bodyHeight * 0.5, -bodyDepth * 0.6);
        playerMech.add(extraLeft);
        playerMech.userData.boosters.push(extraLeft);
        
        const extraRight = rightBooster.clone();
        extraRight.position.set(bodyWidth * 0.35, bodyHeight * 0.5, -bodyDepth * 0.6);
        playerMech.add(extraRight);
        playerMech.userData.boosters.push(extraRight);
    }
    
    // Booster nozzles with glow
    const nozzleRadius = boosterRadius * 0.83;
    const nozzleGeometry = new THREE.CylinderGeometry(nozzleRadius, nozzleRadius * 1.4, boosterHeight * 0.3, 8);
    const nozzleMaterial = new THREE.MeshBasicMaterial({ color: mechConfig.color });
    
    const leftNozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    leftNozzle.position.set(-bodyWidth * 0.35, bodyHeight * 0.73, -bodyDepth * 0.6);
    playerMech.add(leftNozzle);
    
    const rightNozzle = leftNozzle.clone();
    rightNozzle.position.x = bodyWidth * 0.35;
    playerMech.add(rightNozzle);
    
    // Weapon (varies by style)
    let weaponWidth = 0.4 * scale;
    let weaponLength = 1.5 * scale;
    if (style === 'heavy') {
        weaponWidth *= 1.5;
        weaponLength *= 1.3;
    } else if (style === 'light') {
        weaponWidth *= 0.8;
        weaponLength *= 0.9;
    }
    const weaponGeometry = new THREE.BoxGeometry(weaponWidth, weaponWidth, weaponLength);
    const weaponMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.2
    });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.position.set(bodyWidth * 0.75, bodyHeight * 0.67, bodyDepth * 0.8);
    weapon.rotation.x = -0.2;
    playerMech.add(weapon);
    playerMech.userData.weapon = weapon;
    
    // Weapon glow (for shooting feedback)
    const weaponGlowGeometry = new THREE.BoxGeometry(weaponWidth * 1.125, weaponWidth * 1.125, weaponLength * 1.067);
    const weaponGlowMaterial = new THREE.MeshBasicMaterial({
        color: mechConfig.color,
        transparent: true,
        opacity: 0.3
    });
    const weaponGlow = new THREE.Mesh(weaponGlowGeometry, weaponGlowMaterial);
    weaponGlow.position.copy(weapon.position);
    weaponGlow.rotation.copy(weapon.rotation);
    playerMech.add(weaponGlow);
    playerMech.userData.weaponGlow = weaponGlow;
    
    // Apply overall scale
    playerMech.scale.set(scale, scale, scale);
    
    // Position player
    playerMech.position.set(0, 0, 0);
    playerMech.userData.type = 'player';
    playerMech.userData.flyingHeight = 0;
    // Attach the Sword to the Mech
    const sword = createMeleeSword(mechConfig.color);
    sword.position.set(-bodyWidth, bodyHeight * 0.6, 1); // Position near the left arm
    sword.rotation.x = Math.PI / 2; // Point forward
    sword.visible = false;
    playerMech.add(sword);
    playerMech.userData.meleeSword = sword;
    sword.visible = false; // Ensure hidden by default
    scene.add(playerMech);
    
    // Initialize player movement
    playerVelocity = new THREE.Vector3();
    playerRotation = new THREE.Euler();
    player.mesh = playerMech;

}

// ================================
// ENEMIES
// ================================

function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        createEnemy();
    }
}

function createEnemy() {
    const group = new THREE.Group();
    
    // Get level difficulty multiplier
    const levelConfig = CONFIG.LEVELS[GameProgression.currentLevel];
    const difficultyMult = levelConfig ? levelConfig.difficulty || 1 : 1;
    const waveMultiplier = 1 + (GameState.player.wave - 1) * 0.1;
    
    // Enemy color (red/orange variants)
    const enemyColor = Math.random() > 0.5 ? 0xff0044 : 0xff6b00;
    
    // Smaller, more aggressive design
    const bodyGeometry = new THREE.BoxGeometry(1.5, 2.5, 1.2);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1a1a,
        metalness: 0.6,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    group.add(body);
    
    // Enemy core
    const coreGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: enemyColor });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 1.5, 0.7);
    group.add(core);
    
    // Head
    const headGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a2a2a,
        metalness: 0.5,
        roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    group.add(head);
    
    // Red visor
    const visorGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.1);
    const visorMaterial = new THREE.MeshBasicMaterial({ color: enemyColor });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 3, 0.45);
    group.add(visor);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.4, 1.8, 0.4);
    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1a1a,
        metalness: 0.6,
        roughness: 0.4
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1, 1.5, 0);
    group.add(leftArm);
    
    const rightArm = leftArm.clone();
    rightArm.position.x = 1;
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.6);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a1a1a,
        metalness: 0.6,
        roughness: 0.4
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.5, 0, 0);
    group.add(leftLeg);
    
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.5;
    group.add(rightLeg);
    
    // Weapon
    const weaponGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.2);
    const weaponMaterial = new THREE.MeshBasicMaterial({ color: enemyColor });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.position.set(1, 1.5, 1);
    group.add(weapon);
    
    // Spawn position (around player at distance)
    const angle = Math.random() * Math.PI * 2;
    const distance = CONFIG.enemies.spawnDistance + Math.random() * 50;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    group.position.set(x, 0, z);
    
    // Enemy stats - BALANCED with level difficulty
    group.userData = {
        type: 'enemy',
        health: CONFIG.enemies.baseHealth * difficultyMult * waveMultiplier,
        maxHealth: CONFIG.enemies.baseHealth * difficultyMult * waveMultiplier,
        damage: (CONFIG.enemies.baseDamage * difficultyMult * waveMultiplier) * 0.3, // Reduced damage
        speed: 2 + difficultyMult + Math.random() * 2, // Scales with level
        lastShot: 0,
        fireRate: Math.max(1500, 2500 - (difficultyMult * 200)), // Faster shooting in harder levels
        target: null
    };
    
    enemies.push(group);
    scene.add(group);
    
    return group;
}

function updateEnemies(delta) {
    if (!playerMech) return;
    
    enemies.forEach((enemy, index) => {
        if (!enemy.parent) {
            enemies.splice(index, 1);
            return;
        }
        
        // Move toward player
        const direction = new THREE.Vector3();
        direction.subVectors(playerMech.position, enemy.position);
        direction.y = 0;
        direction.normalize();
        
        enemy.position.add(direction.multiplyScalar(enemy.userData.speed * delta));
        enemy.lookAt(playerMech.position);
        
        // Shooting logic
        const now = Date.now();
        if (now - enemy.userData.lastShot > enemy.userData.fireRate) {
            const distToPlayer = enemy.position.distanceTo(playerMech.position);
            if (distToPlayer < 80) {
                shootEnemyProjectile(enemy);
                enemy.userData.lastShot = now;
            }
        }
        
        // Check if enemy is too far, remove
        if (enemy.position.distanceTo(playerMech.position) > 300) {
            scene.remove(enemy);
            enemies.splice(index, 1);
        }
    });
    
    // Spawn new enemies if needed
    if (enemies.length < 3 + GameState.player.wave) {
        createEnemy();
    }
}

function shootEnemyProjectile(enemy) {
    const direction = new THREE.Vector3();
    direction.subVectors(playerMech.position, enemy.position);
    direction.normalize();
    
    const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0044 
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    const startPos = enemy.position.clone();
    startPos.y += 2;
    startPos.add(direction.clone().multiplyScalar(2));
    projectile.position.copy(startPos);
    
    projectile.userData = {
        type: 'enemy-projectile',
        velocity: direction.clone().multiplyScalar(30),
        damage: enemy.userData.damage,
        lifetime: 5000
    };
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0044,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    projectile.add(glow);
    
    projectiles.push(projectile);
    scene.add(projectile);
}

// ================================
// PROJECTILES
// ================================

function shootProjectile() {
    if (!playerMech) return;
    if (GameState.player.ammo <= 0) {
        // Auto reload
        GameState.player.ammo = GameState.player.maxAmmo;
        return;
    }
    
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    const now = Date.now();
    if (now - GameState.lastShot < mechConfig.fireRate) return;
    
    GameState.lastShot = now;
    GameState.player.ammo--;
    cameraShake = 0.2; // Trigger recoil

    // Weapon "Kickback" animation
    if (playerMech.userData.weapon) {
        playerMech.userData.weapon.position.z -= 0.5;
        setTimeout(() => { if(playerMech.userData.weapon) playerMech.userData.weapon.position.z += 0.5; }, 50);
        createMuzzleFlash();
    }
    
    const projectileGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: mechConfig.color });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    const weaponPos = new THREE.Vector3();
    playerMech.userData.weapon.getWorldPosition(weaponPos);
    projectile.position.copy(weaponPos);
    
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    
    projectile.userData = {
        type: 'player-projectile',
        velocity: direction.clone().multiplyScalar(60),
        damage: mechConfig.damage,
        lifetime: 3000
    };
    
    projectiles.push(projectile);
    scene.add(projectile);
}

function createMuzzleFlash() {
    if (!playerMech || !playerMech.userData.weapon) return;
    
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    const weaponPos = new THREE.Vector3();
    playerMech.userData.weapon.getWorldPosition(weaponPos);
    const weaponDirection = new THREE.Vector3(0, 0, 1);
    weaponDirection.applyQuaternion(playerMech.userData.weapon.quaternion);
    weaponPos.add(weaponDirection.multiplyScalar(0.75));
    
    // Create flash geometry
    const flashGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: mechConfig.color,
        transparent: true,
        opacity: 0.9
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(weaponPos);
    flash.lookAt(weaponPos.clone().add(weaponDirection));
    flash.rotateX(Math.PI);
    scene.add(flash);
    
    // Remove after short time
    setTimeout(() => {
        if (flash.parent) {
            scene.remove(flash);
        }
    }, 50);
    
    // Add bright flash particles
    for (let i = 0; i < 5; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: mechConfig.color,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(weaponPos);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        particle.userData = {
            velocity: weaponDirection.clone().multiplyScalar(speed).add(
                new THREE.Vector3(
                    Math.cos(angle) * 2,
                    (Math.random() - 0.5) * 2,
                    Math.sin(angle) * 2
                )
            ),
            lifetime: 200,
            maxLifetime: 200
        };
        
        particles.push(particle);
        scene.add(particle);
    }
}

function updateProjectiles(delta) {
    projectiles.forEach((projectile, index) => {
        if (!projectile.parent) {
            projectiles.splice(index, 1);
            return;
        }
        
        // Move projectile
        const velocity = projectile.userData.velocity;
        projectile.position.add(velocity.clone().multiplyScalar(delta));
        
        // Check lifetime
        projectile.userData.lifetime -= delta * 1000;
        if (projectile.userData.lifetime <= 0) {
            scene.remove(projectile);
            projectiles.splice(index, 1);
            return;
        }
        
        // --- PLAYER PROJECTILES HIT ENEMIES ---
        if (projectile.userData.type === 'player-projectile') {
            enemies.forEach((enemy, enemyIndex) => {
                if (projectile.position.distanceTo(enemy.position) < 2.5) { // Slightly increased hit radius for better feel
                    
                    // 1. VISUAL HIT CONFIRMATION (HUD Flash)
                    const crosshair = document.querySelector('.crosshair-ring');
                    if (crosshair) {
                        crosshair.style.borderColor = '#ff0044';
                        crosshair.style.transform = 'scale(1.4)';
                        setTimeout(() => {
                            crosshair.style.borderColor = 'rgba(0, 255, 249, 0.5)';
                            crosshair.style.transform = 'scale(1)';
                        }, 100);
                    }

                    // 2. DAMAGE CALCULATION
                    enemy.userData.health -= projectile.userData.damage;
                    
                    // 3. CREATE HIT EFFECTS
                    createHitEffect(enemy.position, CONFIG.mechs[GameState.selectedMech].color);
                    
                    // 4. CLEANUP PROJECTILE
                    scene.remove(projectile);
                    projectiles.splice(index, 1);

                    // 5. CHECK ENEMY DEATH
                    if (enemy.userData.health <= 0) {
                        // Create explosion
                        createExplosion(enemy.position);
                        scene.remove(enemy);
                        enemies.splice(enemyIndex, 1);
                        
                        // Award points
                        GameState.player.score += 100 * GameState.player.wave;
                        GameState.player.kills++;
                        GameMode.sessionKills++;

                        // Award gold based on level
                        const levelConfig = CONFIG.LEVELS[GameProgression.currentLevel];
                        const goldEarned = levelConfig?.goldPerKill || 15;
                        GameState.player.gold += goldEarned;
                        persistentGold += goldEarned; // Also add to persistent
                        GameMode.sessionGold += goldEarned;
                        
                        // Update HUD
                        updateHUDGold();
                        
                        // Show floating gold text
                        showFloatingText(`+${goldEarned}`, enemy.position);

                        // Update mission objective
                        updateMissionObjective('kill', null);

                        // Check for wave/mission completion
                        if (GameMode.current === 'free') {
                            // Free mode - always spawn more enemies, never end
                            if (enemies.length < 5) {
                                spawnEnemies(3);
                            }
                        } else if (enemies.length === 0 && GameProgression.currentMission) {
                            // Story mode - check if mission objectives complete
                            checkMissionObjectives();
                        } else if (enemies.length < 3 && !GameProgression.currentMission) {
                            spawnEnemies(3);
                        }
                    }
                }
            });
        }
        
        // --- ENEMY PROJECTILES HIT PLAYER ---
        if (projectile.userData.type === 'enemy-projectile') {
            if (playerMech && projectile.position.distanceTo(playerMech.position) < 3) {
                // Hit player
                takeDamage(projectile.userData.damage);
                
                // Create red hit effect on player
                createHitEffect(playerMech.position, 0xff0044);
                
                // Remove projectile
                scene.remove(projectile);
                projectiles.splice(index, 1);
            }
        }
    });
}

// ================================
// PARTICLE EFFECTS
// ================================

function createHitEffect(position, color) {
    for (let i = 0; i < 10; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        particle.position.y += Math.random() * 2;
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        particle.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 5,
                Math.sin(angle) * speed
            ),
            lifetime: 500,
            maxLifetime: 500
        };
        
        particles.push(particle);
        scene.add(particle);
    }
}

function showFloatingText(text, position) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = `
        position: fixed;
        color: #ffff00;
        font-family: 'Orbitron', sans-serif;
        font-size: 1.2rem;
        font-weight: bold;
        text-shadow: 0 0 10px #ffff00;
        pointer-events: none;
        z-index: 100;
        animation: floatUp 1s ease-out forwards;
    `;
    
    // Convert 3D position to screen position
    const screenPos = position.clone().project(camera);
    div.style.left = ((screenPos.x + 1) / 2 * window.innerWidth) + 'px';
    div.style.top = ((-screenPos.y + 1) / 2 * window.innerHeight) + 'px';
    
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 1000);
}

function createExplosion(position) {
    // Big flash
    const flashGeometry = new THREE.SphereGeometry(5, 16, 16);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    scene.add(flash);
    
    setTimeout(() => {
        scene.remove(flash);
    }, 100);
    
    // Particles
    for (let i = 0; i < 30; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.2, 4, 4);
        const colors = [0xff0044, 0xff6b00, 0xffff00];
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 20;
        particle.userData = {
            velocity: new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 10 - 5,
                Math.sin(angle) * speed
            ),
            lifetime: 1000,
            maxLifetime: 1000
        };
        
        particles.push(particle);
        scene.add(particle);
    }
}

function updateParticles(delta) {
    particles.forEach((particle, index) => {
        if (!particle.parent) {
            particles.splice(index, 1);
            return;
        }
        
        // Move particle
        particle.position.add(particle.userData.velocity.clone().multiplyScalar(delta));
        
        // Fade out
        particle.userData.lifetime -= delta * 1000;
        const lifePercent = particle.userData.lifetime / particle.userData.maxLifetime;
        particle.material.opacity = lifePercent;
        particle.userData.velocity.y -= 20 * delta; // Gravity
        
        if (particle.userData.lifetime <= 0 || particle.position.y < -10) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
}

// ================================
// PLAYER MOVEMENT & CONTROLS
// ================================

function updatePlayer(delta) {
    if (!playerMech || !camera) return;
    
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    
    // 1. POV TOGGLE (Press V)
    if (GameState.keys['KeyV'] && !GameState.povCooldown) {
        GameState.cameraMode = GameState.cameraMode === 'thirdPerson' ? 'firstPerson' : 'thirdPerson';
        GameState.povCooldown = true;
        
        // Hide/show mech in first person
        playerMech.visible = GameState.cameraMode === 'thirdPerson';
        
        setTimeout(() => { GameState.povCooldown = false; }, 300);
    }

    // 2. MOVEMENT SPEEDS
    const baseSpeed = GameState.isBoosting ? mechConfig.boostSpeed : mechConfig.speed;
    const currentSpeed = GameState.keys['ShiftLeft'] ? baseSpeed * 1.5 : baseSpeed;

    // 3. MECH ROTATION - Always follows mouse horizontal look
    playerMech.rotation.y = -GameState.mouse.x;
    
    // 4. DIRECTIONAL INPUT - Get raw input
    let inputX = 0;
    let inputZ = 0;
    if (GameState.keys['KeyW']) inputZ = -1;
    if (GameState.keys['KeyS']) inputZ = 1;
    if (GameState.keys['KeyA']) inputX = -1;
    if (GameState.keys['KeyD']) inputX = 1;

    // 5. CREATE MOVEMENT VECTOR RELATIVE TO MECH'S FACING DIRECTION
    // This ensures WASD always moves relative to where the mech is facing
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    
    // Apply mech's rotation to get world-space directions
    forward.applyQuaternion(playerMech.quaternion);
    right.applyQuaternion(playerMech.quaternion);
    
    // Calculate final movement direction
    const moveDirection = new THREE.Vector3();
    moveDirection.addScaledVector(forward, -inputZ); // W/S
    moveDirection.addScaledVector(right, inputX);    // A/D
    
    if (moveDirection.length() > 0) {
        moveDirection.normalize();
    }

    // 6. FLIGHT/HEIGHT LOGIC
    let verticalVelocity = 0;
    if (GameState.keys['Space'] && GameState.player.boost > 0) {
        GameState.isBoosting = true;
        GameState.isFlying = true;
        verticalVelocity = 15;
        GameState.player.boost = Math.max(0, GameState.player.boost - 30 * delta);
        createBoostParticle();
    } else {
        GameState.isBoosting = false;
        if (playerMech.userData.flyingHeight > 0) {
            verticalVelocity = -10; // Gravity
        } else {
            GameState.isFlying = false;
        }
    }
    
    // Regenerate boost when grounded
    if (!GameState.isFlying && GameState.player.boost < GameState.player.maxBoost) {
        GameState.player.boost = Math.min(GameState.player.maxBoost, GameState.player.boost + 20 * delta);
    }
    
    // Update flying height
    playerMech.userData.flyingHeight = Math.max(0, Math.min(50, 
        playerMech.userData.flyingHeight + verticalVelocity * delta
    ));
    
    // 7. APPLY MOVEMENT WITH COLLISION DETECTION
    const newX = playerMech.position.x + moveDirection.x * currentSpeed * delta;
    const newZ = playerMech.position.z + moveDirection.z * currentSpeed * delta;
    
    // Check building collisions
    let canMoveX = true;
    let canMoveZ = true;
    const playerRadius = 2; // Player collision radius
    
    buildings.forEach(building => {
        if (!building.userData) return;
        const bData = building.userData;
        const bPos = building.position;
        const halfW = (bData.width || 20) / 2 + playerRadius;
        const halfD = (bData.depth || 20) / 2 + playerRadius;
        const bHeight = bData.height || 50;
        
        // Only collide if player is below building height
        if (playerMech.userData.flyingHeight < bHeight) {
            // Check X collision
            if (newX > bPos.x - halfW && newX < bPos.x + halfW &&
                playerMech.position.z > bPos.z - halfD && playerMech.position.z < bPos.z + halfD) {
                canMoveX = false;
            }
            // Check Z collision
            if (playerMech.position.x > bPos.x - halfW && playerMech.position.x < bPos.x + halfW &&
                newZ > bPos.z - halfD && newZ < bPos.z + halfD) {
                canMoveZ = false;
            }
        }
    });
    
    // Check platform collisions (land on top)
    let onPlatform = false;
    let platformHeight = 0;
    scene.children.forEach(obj => {
        if (obj.userData && obj.userData.type === 'platform') {
            const pPos = obj.position;
            const pHeight = obj.userData.height || 20;
            const pSize = 10; // Platform size
            
            if (Math.abs(playerMech.position.x - pPos.x) < pSize &&
                Math.abs(playerMech.position.z - pPos.z) < pSize) {
                // Player is above platform
                if (playerMech.userData.flyingHeight >= pHeight - 1 && 
                    playerMech.userData.flyingHeight <= pHeight + 2) {
                    onPlatform = true;
                    platformHeight = pHeight;
                }
                // Player trying to go through platform from below
                if (playerMech.userData.flyingHeight < pHeight && 
                    playerMech.userData.flyingHeight > pHeight - 3) {
                    platformHeight = pHeight;
                }
            }
        }
    });
    
    // Apply movement if no collision
    if (canMoveX) playerMech.position.x = newX;
    if (canMoveZ) playerMech.position.z = newZ;
    
    // Handle platform landing
    if (onPlatform && !GameState.keys['Space']) {
        playerMech.userData.flyingHeight = platformHeight;
    }
    
    playerMech.position.y = playerMech.userData.flyingHeight;

    // 8. MELEE (Q) - Deals damage
    const sword = playerMech.userData.meleeSword;
    if (GameState.keys['KeyQ']) {
        if (sword) {
            sword.visible = true;
            sword.rotation.x = Math.PI/2 + Math.sin(Date.now() * 0.015) * 1.5;
            
            // Check for enemies in melee range
            enemies.forEach((enemy, index) => {
                const dist = playerMech.position.distanceTo(enemy.position);
                if (dist < 5) {
                    enemy.userData.health -= mechConfig.damage * 2 * delta;
                    
                    if (Math.random() > 0.7) {
                        createHitEffect(enemy.position, mechConfig.color);
                    }
                    
                    if (enemy.userData.health <= 0) {
                        createExplosion(enemy.position);
                        scene.remove(enemy);
                        enemies.splice(index, 1);
                        GameState.player.score += 150 * GameState.player.wave;
                        GameState.player.kills++;
                        const goldEarned = CONFIG.LEVELS[GameProgression.currentLevel]?.goldPerKill || 15;
                        GameState.player.gold = (GameState.player.gold || 0) + goldEarned;
                        persistentGold += goldEarned;
                        GameMode.sessionKills++;
                        GameMode.sessionGold += goldEarned;
                        updateHUDGold();
                        updateMissionObjective('kill', null);
                    }
                }
            });
        }
    } else if (sword) {
        sword.visible = false;
    }

    // ABILITY (E)
    if (GameState.keys['KeyE'] && GameState.abilityCooldown <= 0) {
        createExplosion(playerMech.position); 
        GameState.abilityCooldown = 5; 
    }

    // 9. CAMERA POSITIONING
    const pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, -GameState.mouse.y)); // Clamp pitch
    
    if (GameState.cameraMode === 'firstPerson') {
        // FIRST PERSON - Camera inside cockpit, mech hidden
        const cockpitOffset = new THREE.Vector3(0, 3.5, 0.8);
        cockpitOffset.applyQuaternion(playerMech.quaternion);
        
        const targetCamPos = playerMech.position.clone().add(cockpitOffset);
        camera.position.lerp(targetCamPos, 0.3);
        
        // Look direction based on mech facing + pitch
        const lookDistance = 50;
        const lookTarget = new THREE.Vector3(0, 0, -lookDistance);
        lookTarget.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
        lookTarget.applyQuaternion(playerMech.quaternion);
        lookTarget.add(playerMech.position);
        lookTarget.y += 3.5; // Match cockpit height
        
        camera.lookAt(lookTarget);
        
    } else {
        // THIRD PERSON - Over the shoulder view
        const cameraDistance = 12;
        const cameraHeight = 6;
        const cameraOffset = 2; // Shoulder offset
        
        // Calculate camera position behind and above the mech
        const backOffset = new THREE.Vector3(cameraOffset, cameraHeight, cameraDistance);
        backOffset.applyQuaternion(playerMech.quaternion);
        
        const targetCamPos = playerMech.position.clone().add(backOffset);
        camera.position.lerp(targetCamPos, 0.15);
        
        // Look at point in front of mech, adjusted for pitch
        const lookTarget = playerMech.position.clone();
        lookTarget.y += 4 + Math.sin(pitch) * 8;
        
        camera.lookAt(lookTarget);
    }

    // 10. SHOOTING
    if (GameState.isShooting) shootProjectile();
}

function createBoostParticle() {
    if (!playerMech || !playerMech.userData.boosters) return;
    
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    
    // Create particles from each booster
    playerMech.userData.boosters.forEach(booster => {
        const boosterPos = new THREE.Vector3();
        booster.getWorldPosition(boosterPos);
        boosterPos.y -= 0.5;
        
        for (let i = 0; i < 2; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.2, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: mechConfig.color,
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(boosterPos);
            particle.position.x += (Math.random() - 0.5) * 0.3;
            
            const backDirection = new THREE.Vector3(0, -0.5, 1).normalize();
            const angle = Math.random() * Math.PI * 0.5;
            const speed = 5 + Math.random() * 8;
            
            particle.userData = {
                velocity: backDirection.clone().multiplyScalar(speed).add(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 3,
                        -Math.random() * 2,
                        Math.random() * 2
                    )
                ),
                lifetime: 400,
                maxLifetime: 400
            };
            
            particles.push(particle);
            scene.add(particle);
        }
    });
}

// ================================
// DAMAGE & HEALTH
// ================================

function takeDamage(amount) {
    // Damage shield first
    if (GameState.player.shield > 0) {
        GameState.player.shield = Math.max(0, GameState.player.shield - amount);
    } else {
        GameState.player.health = Math.max(0, GameState.player.health - amount);
    }
    
    // Show damage indicator
    showDamageIndicator();
    
    // Check for death
    if (GameState.player.health <= 0) {
        endGame();
    }
}

function showDamageIndicator() {
    const directions = ['left', 'right', 'top', 'bottom'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const indicator = document.querySelector(`.damage-indicator.${direction}`);
    
    indicator.classList.add('active');
    setTimeout(() => {
        indicator.classList.remove('active');
    }, 200);
}

// ================================
// NPCs & VEHICLES UPDATE
// ================================

function updateNPCs(delta) {
    npcs.forEach(npc => {
        if (!npc.parent) return;
        
        // Simple wandering AI
        npc.position.add(npc.userData.velocity.clone().multiplyScalar(npc.userData.walkSpeed * delta));
        
        // Bounce off boundaries
        const maxDist = CONFIG.world.size * 0.9;
        if (Math.abs(npc.position.x) > maxDist || Math.abs(npc.position.z) > maxDist) {
            npc.userData.velocity.negate();
            npc.userData.velocity.x += (Math.random() - 0.5) * 2;
            npc.userData.velocity.z += (Math.random() - 0.5) * 2;
        }
    });
}

function updateVehicles(delta) {
    vehicles.forEach(vehicle => {
        if (!vehicle.parent) return;
        
        const userData = vehicle.userData;
        const speed = userData.speed * userData.direction * delta;
        
        if (userData.isHorizontal) {
            vehicle.position.x += speed;
            if (Math.abs(vehicle.position.x) > CONFIG.world.size) {
                vehicle.position.x = -Math.sign(vehicle.position.x) * CONFIG.world.size;
            }
        } else {
            vehicle.position.z += speed;
            if (Math.abs(vehicle.position.z) > CONFIG.world.size) {
                vehicle.position.z = -Math.sign(vehicle.position.z) * CONFIG.world.size;
            }
        }
    });
}

// ================================
// HUD UPDATES
// ================================

function updateHUD() {
    // Health
    const healthPercent = (GameState.player.health / GameState.player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = Math.ceil(GameState.player.health);
    
    // Shield
    const shieldPercent = (GameState.player.shield / GameState.player.maxShield) * 100;
    document.getElementById('shield-fill').style.width = `${shieldPercent}%`;
    document.getElementById('shield-text').textContent = Math.ceil(GameState.player.shield);
    
    // Boost
    const boostPercent = (GameState.player.boost / GameState.player.maxBoost) * 100;
    document.getElementById('boost-fill').style.width = `${boostPercent}%`;
    
    // Ammo
    document.getElementById('ammo-current').textContent = GameState.player.ammo;
    document.getElementById('ammo-max').textContent = GameState.player.maxAmmo;
    
    // Score, Kills, Wave
    document.getElementById('score-value').textContent = GameState.player.score;
    document.getElementById('kills-value').textContent = GameState.player.kills;
    document.getElementById('wave-value').textContent = GameState.player.wave;
    
    // Ability cooldown
    const abilityCooldownEl = document.getElementById('ability-cooldown');
    if (GameState.abilityCooldown > 0) {
        abilityCooldownEl.textContent = Math.ceil(GameState.abilityCooldown);
        abilityCooldownEl.style.display = 'flex';
    } else {
        abilityCooldownEl.style.display = 'none';
    }
    
    // Weapon name
    const mechConfig = CONFIG.mechs[GameState.selectedMech];
    document.getElementById('weapon-name').textContent = mechConfig.name;
}

// ================================
// MINIMAP
// ================================

let minimapCanvas, minimapCtx;

function initMinimap() {
    minimapCanvas = document.getElementById('minimap-canvas');
    minimapCtx = minimapCanvas.getContext('2d');
    minimapCanvas.width = 180;
    minimapCanvas.height = 180;
}

function updateMinimap() {
    if (!minimapCanvas || !minimapCtx || !playerMech) return;
    
    const ctx = minimapCtx;
    const size = minimapCanvas.width;
    const scale = size / (CONFIG.world.size * 2);
    
    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, size, size);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 249, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        const pos = i * (size / 10);
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(size, pos);
        ctx.stroke();
    }
    
    // Draw buildings
    ctx.fillStyle = 'rgba(100, 100, 150, 0.5)';
    buildings.forEach(building => {
        const x = (building.position.x + CONFIG.world.size) * scale;
        const z = (building.position.z + CONFIG.world.size) * scale;
        ctx.fillRect(x - 2, z - 2, 4, 4);
    });
    
    // Draw enemies
    ctx.fillStyle = '#ff0044';
    enemies.forEach(enemy => {
        const x = (enemy.position.x + CONFIG.world.size) * scale;
        const z = (enemy.position.z + CONFIG.world.size) * scale;
        ctx.beginPath();
        ctx.arc(x, z, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw player
    ctx.fillStyle = '#00fff9';
    const playerX = (playerMech.position.x + CONFIG.world.size) * scale;
    const playerZ = (playerMech.position.z + CONFIG.world.size) * scale;
    ctx.beginPath();
    ctx.arc(playerX, playerZ, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw direction indicator
    ctx.strokeStyle = '#00fff9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX, playerZ);
    const angle = playerMech.rotation.y;
    ctx.lineTo(
        playerX + Math.sin(angle) * 8,
        playerZ + Math.cos(angle) * 8
    );
    ctx.stroke();
}

// ================================
// GAME LOOP
// ================================

function animate() {
    if (!GameState.isPlaying) return;
    
    requestAnimationFrame(animate);
    
    // Check pause or home base state
    if (GameState.isPaused || gameState.inHomeBase) return;
    
    const delta = clock.getDelta();
    
    // Update standard game systems
    updatePlayer(delta);
    updateEnemies(delta);
    updateProjectiles(delta);
    updateParticles(delta);
    updateNPCs(delta);
    updateVehicles(delta);
    
    // --- NEW: Update Medieval Features ---
    
    // 1. Update Boss Logic
    if (currentBoss) {
        // Assuming your Boss class has an update method (Enemy class usually handles movement)
        // If Boss extends Enemy, updateEnemies() might already move it, but we need phase logic:
        if (currentBoss.updatePhase) currentBoss.updatePhase(); 
        updateBossHealthUI(); // Update HTML UI
    }
    
    // 2. Update Rescue Targets (Princesses)
    rescueTargets.forEach(target => target.update());
    
    // 3. Check Mission Progress
    checkMissionObjectives();
    
    // -------------------------------------

    // Apply Camera Shake
    if (cameraShake > 0) {
        camera.position.x += (Math.random() - 0.5) * cameraShake;
        camera.position.y += (Math.random() - 0.5) * cameraShake;
        cameraShake *= 0.9; // Decay
    }
    
    if (GameState.abilityCooldown > 0) GameState.abilityCooldown -= delta;
    
    updateHUD();
    updateMinimap();
    renderer.render(scene, camera);
}

// --- ADD THESE HELPER FUNCTIONS AFTER animate() ---

function updateBossHealthUI() {
    if (!currentBoss) {
         document.getElementById('boss-health-container').classList.add('hidden');
         return;
    }
    document.getElementById('boss-health-container').classList.remove('hidden');
    document.getElementById('boss-name').textContent = currentBoss.name;
    
    const healthPercent = (currentBoss.health / currentBoss.maxHealth) * 100;
    document.getElementById('boss-health-fill').style.width = `${healthPercent}%`;
    
    // Update phase indicators
    const phases = document.querySelectorAll('.boss-phase-indicators .phase');
    phases.forEach((p, i) => {
        if (i <= currentBoss.phaseIndex) p.classList.add('active');
        else p.classList.remove('active');
    });
}

function checkMissionObjectives() {
    // Don't check objectives in free mode
    if (GameMode.current === 'free') return;
    
    if (!GameProgression.currentMission) return;
    
    const mission = GameProgression.currentMission;
    let allComplete = true;
    
    mission.objectives.forEach(obj => {
        if (obj.type === 'kill') {
            if ((obj.current || 0) < obj.count) allComplete = false;
        }
        if (obj.type === 'rescue' && !obj.complete) allComplete = false;
        if (obj.type === 'boss' && !obj.complete) allComplete = false;
        if (obj.type === 'survive_waves' && (obj.current || 0) < obj.count) allComplete = false;
    });
    
    if (allComplete) {
        // Small delay before showing complete screen
        setTimeout(() => {
            showMissionComplete();
        }, 1000);
    }
    
    updateObjectivesUI();
}

function updateObjectivesUI() {
    const list = document.getElementById('objective-list');
    if (!list || !GameProgression.currentMission) return;
    
    list.innerHTML = '';
    GameProgression.currentMission.objectives.forEach(obj => {
        const li = document.createElement('li');
        let text = '';
        if (obj.type === 'kill') text = `Eliminate Enemies: ${obj.current}/${obj.count}`;
        if (obj.type === 'rescue') text = `Rescue Target: ${obj.complete ? 'Safe' : 'Pending'}`;
        if (obj.type === 'boss') text = `Defeat Boss: ${obj.complete ? 'Victory' : 'Pending'}`;
        
        li.textContent = text;
        if ((obj.type === 'kill' && obj.current >= obj.count) || obj.complete) {
            li.classList.add('complete');
        }
        list.appendChild(li);
    });
}

function updateMissionTitle(title) {
    const missionTitle = document.getElementById('mission-title');
    if (missionTitle) {
        missionTitle.textContent = title || 'MISSION';
    }
}

function updateMissionObjective(type, target) {
    if (!GameProgression.currentMission) return;
    
    GameProgression.currentMission.objectives.forEach(obj => {
        if (obj.type === type) {
            if (type === 'kill') {
                obj.current++;
            } else if (obj.target === target) {
                obj.complete = true;
            }
        }
    });
    updateObjectivesUI();
}

function completeMission(mission) {
    // Prevent multiple triggers
    if (GameProgression.missionsCompleted.includes(mission.id)) return;
    
    GameProgression.missionsCompleted.push(mission.id);
    
    // Grant rewards
    GameState.player.gold += mission.reward.gold;
    GameState.player.score += mission.reward.gold;
    
    // Unlock next level
    if (mission.reward.unlocks) {
        GameProgression.unlockedLevels.push(mission.reward.unlocks);
    }
    
    // Check for ending
    if (mission.reward.ending) {
        showMissionCompleteOverlay('VICTORY! Kingdom Saved!', true);
        return;
    }
    
    // Show smooth mission complete overlay (not alert!)
    showMissionCompleteOverlay(`Mission Complete!\n+${mission.reward.gold} Gold`, false);
}

function showMissionCompleteOverlay(message, isEnding) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'mission-complete-overlay';
    overlay.innerHTML = `
        <div class="mission-complete-content">
            <h2>${isEnding ? '🏆 VICTORY!' : '✓ MISSION COMPLETE'}</h2>
            <p>${message}</p>
            <div class="mission-complete-rewards">
                <span>Total Gold: ${GameState.player.gold}</span>
            </div>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.5s ease;
    `;
    overlay.querySelector('.mission-complete-content').style.cssText = `
        text-align: center;
        color: #00fff9;
        font-family: 'Orbitron', sans-serif;
    `;
    overlay.querySelector('h2').style.cssText = `
        font-size: 3rem;
        color: #ffff00;
        text-shadow: 0 0 30px #ffff00;
        margin-bottom: 1rem;
    `;
    overlay.querySelector('p').style.cssText = `
        font-size: 1.5rem;
        white-space: pre-line;
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-transition after 3 seconds
    setTimeout(() => {
        overlay.remove();
        GameProgression.currentMission = null;
        
        // Go to home base
        HomeBase.enterBase();
    }, 3000);
}

function triggerEnding() {
    GameState.isPlaying = false;
    document.exitPointerLock();
    
    // Show victory screen
    const overlay = document.createElement('div');
    overlay.innerHTML = `
        <div style="text-align: center; color: #ffd700; font-family: 'Orbitron', sans-serif;">
            <h1 style="font-size: 4rem; text-shadow: 0 0 50px #ffd700;">VICTORY!</h1>
            <h2 style="color: #00fff9; margin: 2rem 0;">The Kingdom is Saved!</h2>
            <p style="font-size: 1.5rem;">All Princesses Rescued</p>
            <p style="margin-top: 2rem; color: #ffd700;">Total Gold: ${persistentGold}</p>
            <button onclick="this.parentElement.parentElement.remove(); showScreen('main-menu'); updateMenuGold();" 
                style="margin-top: 2rem; padding: 1rem 3rem; font-family: 'Orbitron'; font-size: 1.2rem; 
                background: linear-gradient(135deg, #ffd700, #ff6b00); border: none; cursor: pointer;">
                RETURN TO MENU
            </button>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.95);
        display: flex; justify-content: center; align-items: center; z-index: 1000;
    `;
    document.body.appendChild(overlay);
    
    SaveSystem.save();
}

// ================================
// GAME STATE MANAGEMENT
// ================================

function togglePause() {
    GameState.isPaused = !GameState.isPaused;
    const pauseMenu = document.getElementById('pause-menu');
    
    if (GameState.isPaused) {
        pauseMenu.classList.remove('hidden');
        document.exitPointerLock();
    } else {
        pauseMenu.classList.add('hidden');
        document.getElementById('game-canvas').requestPointerLock();
    }
}

function restartGame() {
    endGame();
    setTimeout(() => {
        startGame();
    }, 100);
}

function endGame() {
    GameState.isPlaying = false;
    
    // Clean up scene
    if (scene) {
        while(scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }
    
    // Clear arrays
    enemies = [];
    projectiles = [];
    particles = [];
    npcs = [];
    vehicles = [];
    buildings = [];
    
    // Show game over screen
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').textContent = GameState.player.score;
    document.getElementById('final-kills').textContent = GameState.player.kills;
    document.getElementById('final-waves').textContent = GameState.player.wave;
    
    document.exitPointerLock();
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createMeleeSword(color) {
    const swordGroup = new THREE.Group();
    
    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.1, 5, 0.5);
    const bladeMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 2.5;
    swordGroup.add(blade);
    
    // Crossguard
    const guardGeo = new THREE.BoxGeometry(1.5, 0.2, 0.4);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.y = 0.5;
    swordGroup.add(guard);

    return swordGroup;
}

// ================================
// GAME MODE & UI FUNCTIONS
// ================================

function updateMenuGold() {
    const el = document.getElementById('menu-gold');
    if (el) el.textContent = persistentGold;
    
    const hangarGold = document.getElementById('hangar-gold');
    if (hangarGold) hangarGold.textContent = persistentGold;
}


function updateStoryMap() {
    // Update nodes
    document.querySelectorAll('.level-node').forEach(node => {
        const levelId = node.dataset.level;
        const isUnlocked = GameProgression.unlockedLevels.includes(levelId) || levelId === 'HOME_BASE';
        const mission = GameProgression.storyMissions.find(m => m.level === levelId);
        const isCompleted = mission && GameProgression.missionsCompleted.includes(mission.id);
        
        node.classList.remove('unlocked', 'locked', 'completed');
        
        if (levelId === 'HOME_BASE') {
            node.classList.add('unlocked');
        } else if (isCompleted) {
            node.classList.add('completed', 'unlocked');
        } else if (isUnlocked) {
            node.classList.add('unlocked');
        } else {
            node.classList.add('locked');
        }
        
        // Hide/show lock icon
        const lockIcon = node.querySelector('.node-lock-icon');
        if (lockIcon) lockIcon.style.display = isUnlocked ? 'none' : 'block';
        
        // Update status text
        const statusEl = node.querySelector('.node-status');
        if (statusEl) {
            if (isCompleted) statusEl.textContent = 'COMPLETE';
            else if (isUnlocked && levelId !== 'HOME_BASE') statusEl.textContent = 'AVAILABLE';
            else statusEl.textContent = '';
        }
    });
    
    // Update connection lines (paths)
    const pathConnections = [
        { path: '1', requires: 'VILLAGE' },
        { path: '2', requires: 'FOREST' },
        { path: '3', requires: 'CASTLE_GATES' },
        { path: '4', requires: 'CASTLE_KEEP' },
        { path: '5', requires: 'THRONE_ROOM' }
    ];
    
    pathConnections.forEach(({ path, requires }) => {
        const pathEl = document.querySelector(`.map-path[data-path="${path}"]`);
        if (pathEl && GameProgression.unlockedLevels.includes(requires)) {
            pathEl.classList.add('unlocked');
        } else if (pathEl) {
            pathEl.classList.remove('unlocked');
        }
    });
    
    // Setup click handlers
    document.querySelectorAll('.level-node').forEach(node => {
        node.onclick = () => {
            if (node.classList.contains('unlocked') || node.classList.contains('completed')) {
                selectLevel(node.dataset.level);
            }
        };
    });
}

function selectLevel(levelId) {
    const title = document.getElementById('selected-mission-title');
    const desc = document.getElementById('selected-mission-desc');
    const reward = document.getElementById('mission-reward');
    const btn = document.getElementById('start-mission-btn');
    
    // Handle HOME_BASE - show description instead of returning
    if (levelId === 'HOME_BASE') {
        title.textContent = 'Ironhold Stronghold';
        desc.textContent = 'Your home base and headquarters. Here you can repair your mech, resupply ammunition, and plan your next mission. The ancient stronghold has stood for centuries, protecting the realm from invaders.';
        reward.textContent = '';
        btn.classList.add('hidden');
        return;
    }
    
    const mission = GameProgression.storyMissions.find(m => 
        m.level === levelId && !GameProgression.missionsCompleted.includes(m.id)
    );
    
    if (mission) {
        title.textContent = mission.title;
        desc.textContent = mission.description;
        reward.textContent = 'REWARD: ' + mission.reward.gold + ' GOLD';
        btn.classList.remove('hidden');
        btn.onclick = () => startStoryMission(mission);
    } else {
        title.textContent = CONFIG.LEVELS[levelId]?.name || levelId;
        desc.textContent = 'Mission completed! This area has been secured.';
        reward.textContent = '';
        btn.classList.add('hidden');
    }
}

function startStoryMission(mission) {
    GameMode.current = 'story';
    GameMode.missionStartTime = Date.now();
    GameMode.sessionKills = 0;
    GameMode.sessionGold = 0;
    
    GameProgression.currentMission = mission;
    GameProgression.currentLevel = mission.level;
    
    // Reset objectives
    mission.objectives.forEach(obj => {
        if (obj.current !== undefined) obj.current = 0;
        if (obj.complete !== undefined) obj.complete = false;
    });
    
    startGame();
    
    // Show mission objectives HUD
    document.getElementById('mission-objectives').classList.remove('hidden');
    updateObjectivesUI();
}

function showMissionComplete() {
    const mission = GameProgression.currentMission;
    if (!mission) return;
    
    GameState.isPlaying = false;
    document.exitPointerLock();
    
    // Calculate time
    const elapsed = Math.floor((Date.now() - GameMode.missionStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    
    // Update UI
    document.getElementById('complete-gold').textContent = '+' + mission.reward.gold;
    document.getElementById('complete-kills').textContent = GameMode.sessionKills;
    document.getElementById('complete-time').textContent = mins + ':' + secs.toString().padStart(2, '0');
    
    // Unlock info
    const unlockEl = document.getElementById('complete-unlock');
    if (mission.reward.unlocks) {
        unlockEl.textContent = 'NEW AREA UNLOCKED: ' + (CONFIG.LEVELS[mission.reward.unlocks]?.name || mission.reward.unlocks);
        unlockEl.style.display = 'block';
        if (!GameProgression.unlockedLevels.includes(mission.reward.unlocks)) {
            GameProgression.unlockedLevels.push(mission.reward.unlocks);
        }
    } else {
        unlockEl.style.display = 'none';
    }
    
    // Award gold to PERSISTENT storage
    persistentGold += mission.reward.gold;
    GameState.player.gold = persistentGold;
    
    // Mark complete
    if (!GameProgression.missionsCompleted.includes(mission.id)) {
        GameProgression.missionsCompleted.push(mission.id);
    }
    
    // Save progress
    SaveSystem.save();
    
    document.getElementById('mission-complete-screen').classList.remove('hidden');
}

// ================================
// INITIALIZATION
// ================================

window.addEventListener('load', () => {
    init();
    initMinimap();
});