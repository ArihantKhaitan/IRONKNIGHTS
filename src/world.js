// src/world.js - Arena construction
import * as THREE from 'three';
import { scene } from './engine.js';
import { CONFIG } from './config.js';

let worldObjects = [];
let colliders = [];

export function getColliders() { return colliders; }

export function clearWorld() {
  worldObjects.forEach(obj => scene.remove(obj));
  worldObjects = [];
  colliders = [];
}

function addToWorld(obj, isCollider = false) {
  scene.add(obj);
  worldObjects.push(obj);
  if (isCollider) colliders.push(obj);
}

function makeMaterial(color, emissive, emissiveIntensity = 0.4) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    roughness: 0.7,
    metalness: 0.8
  });
}

function makeGlowMaterial(color, intensity = 1) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.9 });
}

export function buildArena(levelConfig) {
  clearWorld();

  const skyColor = new THREE.Color(levelConfig.skyColor || '#0a0a1a');
  scene.background = skyColor;
  scene.fog = new THREE.FogExp2(new THREE.Color(levelConfig.fogColor || '#0a0a1a'), levelConfig.fogDensity || 0.008);

  buildGround(levelConfig);
  buildGrid(levelConfig);
  buildCastleWalls(levelConfig);
  buildTowers(levelConfig);
  buildCourtyard(levelConfig);
  buildDecorations(levelConfig);
}

function buildGround(levelConfig) {
  const geo = new THREE.PlaneGeometry(800, 800, 40, 40);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(levelConfig.groundColor || '#1a1a0a'),
    roughness: 0.95,
    metalness: 0.1,
    emissive: new THREE.Color(levelConfig.groundColor || '#1a1a0a'),
    emissiveIntensity: 0.05
  });
  const ground = new THREE.Mesh(geo, mat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  addToWorld(ground);
}

function buildGrid(levelConfig) {
  const grid = new THREE.GridHelper(400, 40, new THREE.Color(levelConfig.accentColor || '#00fff9'), new THREE.Color(levelConfig.accentColor || '#00fff9'));
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  grid.position.y = 0.05;
  addToWorld(grid);
}

function buildCastleWalls(levelConfig) {
  const R = 150;
  const wallH = 18;
  const wallThick = 4;
  const accentColor = levelConfig.accentColor || '#00fff9';
  const segments = 8;

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;
    const midAngle = (angle1 + angle2) / 2;

    const x1 = Math.sin(angle1) * R;
    const z1 = Math.cos(angle1) * R;
    const x2 = Math.sin(angle2) * R;
    const z2 = Math.cos(angle2) * R;

    const segLen = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;

    // Main wall body
    const wallGeo = new THREE.BoxGeometry(segLen, wallH, wallThick);
    const wallMat = makeMaterial('#1a1a2a', '#0a0a15', 0.2);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(cx, wallH / 2, cz);
    wall.rotation.y = -midAngle;
    wall.castShadow = true;
    wall.receiveShadow = true;
    addToWorld(wall, true);

    // Neon top strip
    const topGeo = new THREE.BoxGeometry(segLen, 0.4, wallThick + 0.2);
    const topMat = makeGlowMaterial(accentColor);
    const topStrip = new THREE.Mesh(topGeo, topMat);
    topStrip.position.set(cx, wallH + 0.2, cz);
    topStrip.rotation.y = -midAngle;
    addToWorld(topStrip);

    // Neon bottom strip
    const botGeo = new THREE.BoxGeometry(segLen, 0.4, wallThick + 0.2);
    const botMat = makeGlowMaterial(accentColor);
    const botStrip = new THREE.Mesh(botGeo, botMat);
    botStrip.position.set(cx, 0.5, cz);
    botStrip.rotation.y = -midAngle;
    addToWorld(botStrip);

    // Battlements (merlons)
    const merlonCount = Math.floor(segLen / 5);
    for (let m = 0; m < merlonCount; m++) {
      const t = (m + 0.5) / merlonCount;
      const mx = x1 + (x2 - x1) * t;
      const mz = z1 + (z2 - z1) * t;
      const mGeo = new THREE.BoxGeometry(2, 3, wallThick + 0.5);
      const mMat = makeMaterial('#111120', '#0a0a15', 0.1);
      const merlon = new THREE.Mesh(mGeo, mMat);
      merlon.position.set(mx, wallH + 1.5, mz);
      merlon.rotation.y = -midAngle;
      addToWorld(merlon);
    }
  }
}

function buildTowers(levelConfig) {
  const R = 150;
  const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
  const accentColor = levelConfig.accentColor || '#00fff9';

  angles.forEach((angle) => {
    const tx = Math.sin(angle) * R;
    const tz = Math.cos(angle) * R;
    const towerGroup = new THREE.Group();
    towerGroup.position.set(tx, 0, tz);

    // Tower body
    const bodyGeo = new THREE.CylinderGeometry(6, 8, 28, 8);
    const bodyMat = makeMaterial('#161622', '#0a0a18', 0.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 14;
    body.castShadow = true;
    towerGroup.add(body);

    // Battlements crown (8 small boxes)
    for (let b = 0; b < 8; b++) {
      const ba = (b / 8) * Math.PI * 2;
      const bx = Math.sin(ba) * 6;
      const bz = Math.cos(ba) * 6;
      const bGeo = new THREE.BoxGeometry(2, 4, 2);
      const bMat = makeMaterial('#121220', '#08080f', 0.1);
      const battlement = new THREE.Mesh(bGeo, bMat);
      battlement.position.set(bx, 30, bz);
      towerGroup.add(battlement);
    }

    // Cone roof
    const roofGeo = new THREE.ConeGeometry(7, 10, 8);
    const roofMat = makeMaterial('#0d0d1a', accentColor, 0.15);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 38;
    towerGroup.add(roof);

    // 3 glowing rings on shaft
    [10, 18, 26].forEach((ry) => {
      const ringGeo = new THREE.TorusGeometry(8, 0.3, 8, 24);
      const ringMat = makeGlowMaterial(accentColor);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = ry;
      ring.rotation.x = Math.PI / 2;
      towerGroup.add(ring);
    });

    // Point light at top
    const towerLight = new THREE.PointLight(new THREE.Color(accentColor), 2, 80);
    towerLight.position.y = 40;
    towerGroup.add(towerLight);

    scene.add(towerGroup);
    worldObjects.push(towerGroup);
  });
}

function buildCourtyard(levelConfig) {
  const accentColor = levelConfig.accentColor || '#00fff9';

  // Central raised platform
  const platGeo = new THREE.CylinderGeometry(15, 18, 1.5, 16);
  const platMat = makeMaterial('#1a1a28', '#0a0a18', 0.3);
  const platform = new THREE.Mesh(platGeo, platMat);
  platform.position.y = 0.75;
  platform.castShadow = true;
  platform.receiveShadow = true;
  addToWorld(platform, true);

  // Glowing ring at platform edge
  const ringGeo = new THREE.TorusGeometry(16.5, 0.4, 8, 48);
  const ringMat = makeGlowMaterial(accentColor);
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 1.5;
  ring.rotation.x = Math.PI / 2;
  addToWorld(ring);

  // 8 pillars at r=60
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = Math.sin(angle) * 60;
    const pz = Math.cos(angle) * 60;

    const pillarGeo = new THREE.CylinderGeometry(1.5, 2, 16, 8);
    const pillarMat = makeMaterial('#141420', '#0a0a18', 0.2);
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, 8, pz);
    pillar.castShadow = true;
    addToWorld(pillar, true);

    // Glow ring on pillar
    const pRingGeo = new THREE.TorusGeometry(2.5, 0.2, 6, 16);
    const pRingMat = makeGlowMaterial(accentColor);
    const pRing = new THREE.Mesh(pRingGeo, pRingMat);
    pRing.position.set(px, 14, pz);
    pRing.rotation.x = Math.PI / 2;
    addToWorld(pRing);
  }

  // Scattered cover objects - stone blocks at various positions
  const coverPositions = [
    [30, 0, 30], [-30, 0, 30], [30, 0, -30], [-30, 0, -30],
    [55, 0, 10], [-55, 0, 10], [55, 0, -10], [-55, 0, -10],
    [10, 0, 55], [-10, 0, 55], [10, 0, -55], [-10, 0, -55],
    [40, 0, -60], [-40, 0, 60], [70, 0, -40], [-70, 0, 40]
  ];

  coverPositions.forEach(([cx, cy, cz], idx) => {
    if (idx < 8) {
      // Stone blocks
      const bGeo = new THREE.BoxGeometry(
        4 + Math.random() * 3,
        3 + Math.random() * 2,
        4 + Math.random() * 3
      );
      const bMat = makeMaterial('#181820', '#0c0c18', 0.1);
      const block = new THREE.Mesh(bGeo, bMat);
      block.position.set(cx, 1.5, cz);
      block.rotation.y = Math.random() * Math.PI;
      block.castShadow = true;
      block.receiveShadow = true;
      addToWorld(block, true);
    } else if (idx < 12) {
      // Arch structures
      const archGroup = new THREE.Group();
      archGroup.position.set(cx, 0, cz);
      archGroup.rotation.y = Math.random() * Math.PI;

      const leftGeo = new THREE.BoxGeometry(1.5, 8, 1.5);
      const archMat = makeMaterial('#161620', '#0a0a18', 0.15);
      const leftPillar = new THREE.Mesh(leftGeo, archMat);
      leftPillar.position.set(-4, 4, 0);
      leftPillar.castShadow = true;
      archGroup.add(leftPillar);

      const rightGeo = new THREE.BoxGeometry(1.5, 8, 1.5);
      const rightPillar = new THREE.Mesh(rightGeo, archMat.clone());
      rightPillar.position.set(4, 4, 0);
      rightPillar.castShadow = true;
      archGroup.add(rightPillar);

      const topGeo = new THREE.BoxGeometry(10, 1.5, 1.5);
      const topBeam = new THREE.Mesh(topGeo, archMat.clone());
      topBeam.position.set(0, 8.75, 0);
      archGroup.add(topBeam);

      // Arch glow
      const glowGeo = new THREE.BoxGeometry(10.5, 0.3, 1.6);
      const glowMat = makeGlowMaterial(accentColor);
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(0, 9.6, 0);
      archGroup.add(glow);

      scene.add(archGroup);
      worldObjects.push(archGroup);
    } else {
      // Barrel clusters
      for (let b = 0; b < 3; b++) {
        const bGeo = new THREE.CylinderGeometry(0.8, 0.9, 2.5, 10);
        const bMat = makeMaterial('#201810', '#180e06', 0.1);
        const barrel = new THREE.Mesh(bGeo, bMat);
        barrel.position.set(cx + (Math.random() - 0.5) * 4, 1.25, cz + (Math.random() - 0.5) * 4);
        barrel.castShadow = true;
        addToWorld(barrel, true);

        // Barrel ring glow
        const brGeo = new THREE.TorusGeometry(0.9, 0.1, 6, 12);
        const brMat = makeGlowMaterial(accentColor, 0.6);
        const bRing = new THREE.Mesh(brGeo, brMat);
        bRing.position.set(barrel.position.x, barrel.position.y, barrel.position.z);
        bRing.rotation.x = Math.PI / 2;
        addToWorld(bRing);
      }
    }
  });
}

function buildDecorations(levelConfig) {
  const accentColor = levelConfig.accentColor || '#00fff9';

  // 12 floating rune stones
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
    const r = 40 + Math.random() * 70;
    const rx = Math.sin(angle) * r;
    const rz = Math.cos(angle) * r;

    const runeGeo = new THREE.OctahedronGeometry(1.5 + Math.random() * 1, 0);
    const runeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      emissive: new THREE.Color(accentColor),
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.position.set(rx, 6 + Math.random() * 8, rz);
    rune.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rune.userData.floatOffset = Math.random() * Math.PI * 2;
    rune.userData.isRune = true;
    addToWorld(rune);
  }

  // 6 torches with flame
  const torchPositions = [
    [0, 0, 20], [0, 0, -20], [20, 0, 0], [-20, 0, 0], [14, 0, 14], [-14, 0, -14]
  ];

  torchPositions.forEach(([tx, ty, tz]) => {
    // Torch pole
    const poleGeo = new THREE.CylinderGeometry(0.2, 0.25, 5, 6);
    const poleMat = makeMaterial('#2a1a0a', '#180e06', 0.1);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(tx, 2.5, tz);
    addToWorld(pole);

    // Flame cone
    const flameGeo = new THREE.ConeGeometry(0.4, 1.2, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.9 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(tx, 5.6, tz);
    flame.userData.isFlame = true;
    flame.userData.flickerOffset = Math.random() * Math.PI * 2;
    addToWorld(flame);

    // Inner flame
    const innerGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.set(tx, 5.8, tz);
    addToWorld(inner);

    // Torch point light
    const torchLight = new THREE.PointLight(0xff6600, 1.8, 25);
    torchLight.position.set(tx, 5.5, tz);
    torchLight.userData.isTorchLight = true;
    torchLight.userData.flickerOffset = Math.random() * Math.PI * 2;
    scene.add(torchLight);
    worldObjects.push(torchLight);
  });
}
