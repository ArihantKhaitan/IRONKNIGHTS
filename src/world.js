// src/world.js - The open world: terrain, regions, village, keep, forest, battlefield
import * as THREE from 'three';
import { scene } from './engine.js';
import { CONFIG } from './config.js';

let built = false;

export const circleColliders = [];   // { x, z, r }
export const pickups = [];           // { mesh, type, amount, x, z, active, respawn }
export const interactables = [];     // { type, id, name, x, z, mesh }

const animated = {
  flames: [], torchLights: [], banners: [], windmills: [], lanterns: [], runes: [], smokeSources: []
};

export function getSmokeSources() { return animated.smokeSources; }

// ────────────────────────────────────────────
// TERRAIN
// ────────────────────────────────────────────
export function terrainHeight(x, z) {
  let h = Math.sin(x * 0.011) * Math.cos(z * 0.009) * 5
        + Math.sin(x * 0.031 + 1.7) * Math.sin(z * 0.026 + 0.6) * 1.8
        + Math.sin(x * 0.005 - 0.4) * Math.cos(z * 0.004 + 2.1) * 6;

  // Ironspire hill (north)
  const kd = Math.hypot(x - 60, z + 470);
  h += Math.pow(Math.max(0, 1 - kd / 300), 1.4) * 30;

  // Village flatten
  const vd = Math.hypot(x, z - 380);
  const vf = Math.max(0, 1 - vd / 140);
  h *= (1 - vf * 0.92);

  // Keep plateau
  const pf = Math.max(0, 1 - kd / 130);
  h = h * (1 - pf) + 30 * pf;

  // Scarline trench depression
  const sd = Math.hypot(x - 430, (z - 60) * 0.55);
  h -= Math.max(0, 1 - sd / 190) * 5;

  return h;
}

export function resolveCollisions(pos, radius) {
  for (let i = 0; i < circleColliders.length; i++) {
    const c = circleColliders[i];
    const dx = pos.x - c.x;
    const dz = pos.z - c.z;
    const min = c.r + radius;
    const d2 = dx * dx + dz * dz;
    if (d2 < min * min && d2 > 1e-6) {
      const d = Math.sqrt(d2);
      const push = (min - d) / d;
      pos.x += dx * push;
      pos.z += dz * push;
    }
  }
}

// ────────────────────────────────────────────
// MATERIAL HELPERS
// ────────────────────────────────────────────
const mats = {
  stone: () => new THREE.MeshStandardMaterial({ color: 0x5f5a50, roughness: 0.95, metalness: 0.05 }),
  darkStone: () => new THREE.MeshStandardMaterial({ color: 0x403c36, roughness: 0.95, metalness: 0.05 }),
  wood: () => new THREE.MeshStandardMaterial({ color: 0x4a3826, roughness: 0.9, metalness: 0.0 }),
  charredWood: () => new THREE.MeshStandardMaterial({ color: 0x241d16, roughness: 0.95, metalness: 0.0 }),
  rust: () => new THREE.MeshStandardMaterial({ color: 0x6e4530, roughness: 0.8, metalness: 0.5 }),
  oldIron: () => new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.7, metalness: 0.7 }),
  thatch: () => new THREE.MeshStandardMaterial({ color: 0x6b5836, roughness: 1.0, metalness: 0.0 }),
  canvas: () => new THREE.MeshStandardMaterial({ color: 0x8a7a5c, roughness: 1.0, metalness: 0.0 }),
  glow: (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c) })
};

function addCollider(x, z, r) { circleColliders.push({ x, z, r }); }

function groundY(x, z) { return terrainHeight(x, z); }

// ────────────────────────────────────────────
// BUILD WORLD (once)
// ────────────────────────────────────────────
export function buildWorld() {
  if (built) return;
  built = true;

  buildGround();
  buildRoads();
  buildTreesAndScatter();
  buildVillage();
  buildColossusWreck();
  buildKeep();
  buildScarline();
  buildDeadwoodExtras();
  buildCamps();
  buildShrines();
  buildSalvage();
}

// ── Ground with region-tinted vertex colors ──
function buildGround() {
  const size = CONFIG.WORLD.size;
  const segs = 150;
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cPlains = new THREE.Color(0x6e6552);
  const cDead = new THREE.Color(0x3d352b);
  const cScar = new THREE.Color(0x4d423a);
  const cKeep = new THREE.Color(0x5a564e);
  const cVillage = new THREE.Color(0x6b5f4a);
  const cWaste = new THREE.Color(0x4a443a);
  const tmp = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, terrainHeight(x, z));

    // Region-weighted color
    tmp.copy(cPlains);
    const dDead = Math.hypot(x + 430, z + 60);
    const dScar = Math.hypot(x - 430, z - 60);
    const dKeep = Math.hypot(x - 60, z + 470);
    const dVil = Math.hypot(x, z - 380);
    const dCenter = Math.hypot(x, z);

    tmp.lerp(cDead, Math.max(0, 1 - dDead / 280));
    tmp.lerp(cScar, Math.max(0, 1 - dScar / 260));
    tmp.lerp(cKeep, Math.max(0, 1 - dKeep / 240));
    tmp.lerp(cVillage, Math.max(0, 1 - dVil / 160));
    tmp.lerp(cWaste, Math.max(0, (dCenter - 550) / 250));

    // Grain noise
    const n = (Math.sin(x * 0.8) * Math.sin(z * 0.9) + Math.sin(x * 0.13 + z * 0.21)) * 0.04;
    colors[i * 3] = Math.max(0, tmp.r + n);
    colors[i * 3 + 1] = Math.max(0, tmp.g + n);
    colors[i * 3 + 2] = Math.max(0, tmp.b + n);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1.0, metalness: 0.0 });
  const ground = new THREE.Mesh(geo, mat);
  ground.receiveShadow = true;
  scene.add(ground);
}

// ── Roads: dark packed-dirt ribbons following terrain ──
const ROADS = [
  [[0, 440], [0, 300], [0, 150], [0, 60], [20, -80], [30, -200], [40, -330], [55, -420]],
  [[0, 60], [-120, 30], [-240, 10], [-330, -30], [-400, -60]],
  [[0, 60], [120, 50], [240, 70], [330, 80], [400, 70]]
];

function buildRoads() {
  const mat = new THREE.MeshStandardMaterial({ color: 0x4a4136, roughness: 1.0, metalness: 0.0 });
  const lampMat = mats.charredWood();
  const lanternGeo = new THREE.BoxGeometry(0.7, 0.9, 0.7);
  const postGeo = new THREE.CylinderGeometry(0.18, 0.24, 5.5, 6);
  let lampCounter = 0;

  for (const road of ROADS) {
    for (let i = 0; i < road.length - 1; i++) {
      const [x1, z1] = road[i];
      const [x2, z2] = road[i + 1];
      const len = Math.hypot(x2 - x1, z2 - z1);
      const steps = Math.max(2, Math.floor(len / 10));
      const dirX = (x2 - x1) / len, dirZ = (z2 - z1) / len;
      const perpX = -dirZ, perpZ = dirX;
      const w = 4.2;

      const verts = [];
      const idx = [];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const cx = x1 + (x2 - x1) * t;
        const cz = z1 + (z2 - z1) * t;
        const yL = groundY(cx + perpX * w, cz + perpZ * w) + 0.18;
        const yR = groundY(cx - perpX * w, cz - perpZ * w) + 0.18;
        verts.push(cx + perpX * w, yL, cz + perpZ * w);
        verts.push(cx - perpX * w, yR, cz - perpZ * w);
        if (s > 0) {
          const a = (s - 1) * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      scene.add(new THREE.Mesh(geo, mat));

      // Lamp posts every other segment point
      for (let s = 1; s < steps; s += 4) {
        lampCounter++;
        if (lampCounter % 2 !== 0) continue;
        const t = s / steps;
        const lx = x1 + (x2 - x1) * t + perpX * 7;
        const lz = z1 + (z2 - z1) * t + perpZ * 7;
        const ly = groundY(lx, lz);
        const post = new THREE.Mesh(postGeo, lampMat);
        post.position.set(lx, ly + 2.75, lz);
        post.castShadow = true;
        scene.add(post);
        const lantern = new THREE.Mesh(lanternGeo, new THREE.MeshStandardMaterial({
          color: 0x2b2620, emissive: 0xff8a3d, emissiveIntensity: 0.4, roughness: 0.8
        }));
        lantern.position.set(lx, ly + 5.4, lz);
        lantern.userData.isLantern = true;
        scene.add(lantern);
        animated.lanterns.push(lantern);
        addCollider(lx, lz, 0.6);
      }
    }
  }
}

// ── Instanced dead trees, rocks, grass ──
function buildTreesAndScatter() {
  const dummy = new THREE.Object3D();

  // Collect tree transforms
  const treeSpots = [];
  // Deadwood forest
  for (let i = 0; i < 240; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * 250;
    const x = -430 + Math.cos(a) * r;
    const z = -60 + Math.sin(a) * r * 0.9;
    // Keep the west road clear
    if (Math.abs(z - 10 - (x + 240) * -0.15) < 14 && x > -410 && x < 0) continue;
    treeSpots.push({ x, z, s: 0.8 + Math.random() * 1.3 });
  }
  // Scattered lone trees
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 100 + Math.random() * 550;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x, z - 380) < 160) continue;      // not in village
    if (Math.hypot(x - 60, z + 470) < 200) continue; // not in keep
    treeSpots.push({ x, z, s: 0.7 + Math.random() * 1.1 });
  }

  const n = treeSpots.length;
  const trunkGeo = new THREE.CylinderGeometry(0.28, 0.85, 11, 6);
  trunkGeo.translate(0, 5.5, 0);
  const branchGeo = new THREE.CylinderGeometry(0.08, 0.3, 5.5, 5);
  branchGeo.translate(0, 2.75, 0);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2b241c, roughness: 1.0 });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, n);
  const branchesA = new THREE.InstancedMesh(branchGeo, trunkMat, n);
  const branchesB = new THREE.InstancedMesh(branchGeo, trunkMat, n);
  trunks.castShadow = true;
  branchesA.castShadow = true;
  branchesB.castShadow = true;

  const branchLocalA = new THREE.Matrix4()
    .makeRotationZ(0.7)
    .setPosition(0.5, 7.2, 0);
  const branchLocalB = new THREE.Matrix4()
    .makeRotationZ(-0.9)
    .setPosition(-0.4, 8.4, 0.2);
  const tmpMat = new THREE.Matrix4();

  treeSpots.forEach((t, i) => {
    dummy.position.set(t.x, groundY(t.x, t.z), t.z);
    dummy.rotation.set((Math.random() - 0.5) * 0.14, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.14);
    dummy.scale.setScalar(t.s);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    branchesA.setMatrixAt(i, tmpMat.multiplyMatrices(dummy.matrix, branchLocalA));
    branchesB.setMatrixAt(i, tmpMat.multiplyMatrices(dummy.matrix, branchLocalB));
    addCollider(t.x, t.z, 1.1 * t.s);
  });
  scene.add(trunks, branchesA, branchesB);

  // Rocks
  const rockGeo = new THREE.DodecahedronGeometry(1.6, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x555049, roughness: 1.0 });
  const rockCount = 130;
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  rocks.castShadow = true;
  for (let i = 0; i < rockCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 60 + Math.random() * 600;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const s = 0.5 + Math.random() * 2.2;
    dummy.position.set(x, groundY(x, z) + s * 0.2, z);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
    if (s > 1.4) addCollider(x, z, s * 1.4);
  }
  scene.add(rocks);

  // Ash-grass tufts
  const tuftGeo = new THREE.ConeGeometry(0.5, 1.6, 4);
  tuftGeo.translate(0, 0.8, 0);
  const tuftMat = new THREE.MeshStandardMaterial({ color: 0x746a50, roughness: 1.0 });
  const tuftCount = 900;
  const tufts = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
  for (let i = 0; i < tuftCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 640;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    dummy.position.set(x, groundY(x, z), z);
    dummy.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5);
    dummy.scale.set(0.7 + Math.random(), 0.6 + Math.random() * 1.2, 0.7 + Math.random());
    dummy.updateMatrix();
    tufts.setMatrixAt(i, dummy.matrix);
  }
  scene.add(tufts);
}

// ── Building helpers ──
function makeHouse(x, z, rot, ruined) {
  const g = new THREE.Group();
  const y = groundY(x, z);
  g.position.set(x, y, z);
  g.rotation.y = rot;

  const w = 8 + Math.random() * 3, d = 6 + Math.random() * 2, h = 4;
  const wallMat = ruined ? mats.darkStone() : mats.stone();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  walls.position.y = h / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  g.add(walls);

  // Timber corner posts
  const postGeo = new THREE.BoxGeometry(0.4, h + 0.2, 0.4);
  const pm = ruined ? mats.charredWood() : mats.wood();
  [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeo, pm);
    post.position.set(px, h / 2, pz);
    g.add(post);
  });

  // Roof: diamond prism (box rotated 45°)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(d * 0.95, d * 0.95, w + 1), ruined ? mats.charredWood() : mats.thatch());
  roof.rotation.z = Math.PI / 4;
  roof.rotation.y = Math.PI / 2;
  roof.position.y = h + 0.4;
  roof.scale.y = 0.6;
  roof.castShadow = true;
  if (ruined) {
    // Collapsed roof: tilted, half-sunk
    roof.position.y = h - 1.2;
    roof.rotation.x = 0.35;
    roof.scale.setScalar(0.8);
    // Rubble
    for (let i = 0; i < 4; i++) {
      const rb = new THREE.Mesh(new THREE.BoxGeometry(1 + Math.random() * 1.5, 0.8, 1 + Math.random()), mats.darkStone());
      rb.position.set((Math.random() - 0.5) * w, 0.4, (Math.random() - 0.5) * (d + 4));
      rb.rotation.y = Math.random() * Math.PI;
      g.add(rb);
    }
  }
  g.add(roof);

  scene.add(g);
  addCollider(x, z, Math.max(w, d) * 0.62);
  return g;
}

function makeCampfire(x, z, big = false) {
  const y = groundY(x, z);
  const g = new THREE.Group();
  g.position.set(x, y, z);

  // Stone ring
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), mats.stone());
    st.position.set(Math.cos(a) * 1.2, 0.2, Math.sin(a) * 1.2);
    g.add(st);
  }
  // Logs
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.6, 5), mats.charredWood());
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 3) * Math.PI;
    log.position.y = 0.25;
    g.add(log);
  }
  // Flames
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 7), new THREE.MeshBasicMaterial({ color: 0xff7a2f, transparent: true, opacity: 0.9 }));
  flame.position.y = 1.0;
  flame.userData.flickerOffset = Math.random() * 10;
  g.add(flame);
  animated.flames.push(flame);
  const inner = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 6), new THREE.MeshBasicMaterial({ color: 0xffcf7a }));
  inner.position.y = 1.0;
  g.add(inner);

  const light = new THREE.PointLight(0xff8a3d, big ? 2.6 : 1.8, big ? 40 : 26);
  light.position.y = 2;
  light.userData.flickerOffset = Math.random() * 10;
  light.userData.baseIntensity = light.intensity;
  g.add(light);
  animated.torchLights.push(light);

  animated.smokeSources.push({ x, y: y + 2, z });
  scene.add(g);
  return g;
}

function makeBanner(x, y, z, rotY, color) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 5), mats.oldIron());
  pole.position.set(x, y + 3.5, z);
  scene.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 3.6, 4, 6),
    new THREE.MeshStandardMaterial({ color, roughness: 1.0, side: THREE.DoubleSide })
  );
  cloth.position.set(x, y + 5.2, z);
  cloth.rotation.y = rotY;
  cloth.userData.swayOffset = Math.random() * 10;
  cloth.userData.baseRotY = rotY;
  scene.add(cloth);
  animated.banners.push(cloth);
}

// ── Emberfall Village ──
function buildVillage() {
  const VX = 0, VZ = 380;

  // Houses (mix of standing and ruined)
  const housePlots = [
    [-45, 355, 0.3, false], [-25, 400, -0.5, true], [35, 350, 2.6, false],
    [50, 400, 1.2, true], [-60, 420, 0.9, false], [20, 430, -2.2, true],
    [70, 360, -0.8, false], [-30, 330, 1.8, true], [0, 450, 0.1, false]
  ];
  housePlots.forEach(([x, z, r, ruined]) => makeHouse(x, z, r, ruined));

  // Well
  const wellY = groundY(VX, VZ);
  const wellRing = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.2, 10), mats.stone());
  wellRing.position.set(VX, wellY + 0.6, VZ);
  scene.add(wellRing);
  addCollider(VX, VZ, 2.0);

  // Windmill on the east edge
  const wmX = 105, wmZ = 385;
  const wmY = groundY(wmX, wmZ);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.6, 16, 8), mats.stone());
  tower.position.set(wmX, wmY + 8, wmZ);
  tower.castShadow = true;
  scene.add(tower);
  addCollider(wmX, wmZ, 4);
  const hub = new THREE.Group();
  hub.position.set(wmX, wmY + 15, wmZ - 3.2);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9, 0.15), mats.wood());
    blade.position.y = 5.2;
    const arm = new THREE.Group();
    arm.rotation.z = (i / 4) * Math.PI * 2;
    arm.add(blade);
    hub.add(arm);
  }
  scene.add(hub);
  animated.windmills.push(hub);

  // Chapel ruin + graveyard (west edge)
  const chX = -85, chZ = 395;
  const chY = groundY(chX, chZ);
  const chapelWalls = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 8), mats.darkStone());
  chapelWalls.position.set(chX, chY + 3.5, chZ);
  chapelWalls.castShadow = true;
  scene.add(chapelWalls);
  addCollider(chX, chZ, 8);
  // Broken arch
  [[-3, 0], [3, 0]].forEach(([ox]) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), mats.darkStone());
    pillar.position.set(chX + ox, chY + 4.5, chZ + 7);
    scene.add(pillar);
  });
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 1.2), mats.darkStone());
  archTop.position.set(chX - 1.2, chY + 9.1, chZ + 7);
  archTop.rotation.z = 0.22;
  scene.add(archTop);
  // Gravestones
  const graveGeo = new THREE.BoxGeometry(0.9, 1.4, 0.25);
  const graveMat = mats.stone();
  const graves = new THREE.InstancedMesh(graveGeo, graveMat, 26);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 26; i++) {
    const gx = chX - 14 + (i % 6) * 3.4 + (Math.random() - 0.5);
    const gz = chZ - 14 + Math.floor(i / 6) * 3.8 + (Math.random() - 0.5);
    dummy.position.set(gx, groundY(gx, gz) + 0.6, gz);
    dummy.rotation.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.25);
    dummy.updateMatrix();
    graves.setMatrixAt(i, dummy.matrix);
  }
  scene.add(graves);

  // Bounty board near the well
  const bbX = 12, bbZ = 372;
  const bbY = groundY(bbX, bbZ);
  const bGroup = new THREE.Group();
  bGroup.position.set(bbX, bbY, bbZ);
  [[-1.4], [1.4]].forEach(([ox]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.4, 0.35), mats.wood());
    post.position.set(ox, 2.2, 0);
    bGroup.add(post);
  });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 0.2), mats.wood());
  panel.position.y = 3;
  bGroup.add(panel);
  // Parchment posters
  for (let i = 0; i < 3; i++) {
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.95),
      new THREE.MeshStandardMaterial({ color: 0xd8c9a3, emissive: 0x554a30, emissiveIntensity: 0.25, roughness: 1 })
    );
    paper.position.set(-1 + i, 3 + (Math.random() - 0.5) * 0.4, 0.12);
    paper.rotation.z = (Math.random() - 0.5) * 0.2;
    bGroup.add(paper);
  }
  scene.add(bGroup);
  addCollider(bbX, bbZ, 1.4);
  interactables.push({ type: 'board', id: 'BOUNTY_BOARD', name: 'Bounty Board', x: bbX, z: bbZ, mesh: bGroup });

  // Village campfire + palisade fragments
  makeCampfire(-12, 368);
  for (let i = 0; i < 24; i++) {
    const a = Math.PI * 0.7 + (i / 24) * Math.PI * 1.1;
    const px = VX + Math.cos(a) * 130;
    const pz = VZ + Math.sin(a) * 130;
    if (Math.abs(px) < 12 && pz < 380) continue; // road gap
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 5 + Math.random() * 1.5, 5), mats.charredWood());
    stake.position.set(px, groundY(px, pz) + 2.4, pz);
    stake.rotation.set((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2);
    scene.add(stake);
  }
}

// ── The fallen Colossus (plains landmark) ──
function buildColossusWreck() {
  const CX = -140, CZ = 40;
  const y = groundY(CX, CZ);

  // Half-buried helm
  const helm = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 10), mats.rust());
  helm.position.set(CX, y - 4, CZ);
  helm.rotation.z = 0.5;
  helm.castShadow = true;
  scene.add(helm);
  addCollider(CX, CZ, 14);

  // Eye socket ember
  const eye = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), mats.glow('#ff5522'));
  eye.position.set(CX + 8, y + 4, CZ + 7);
  scene.add(eye);
  const eyeLight = new THREE.PointLight(0xff5522, 1.6, 40);
  eyeLight.position.copy(eye.position);
  eyeLight.userData.flickerOffset = 3;
  eyeLight.userData.baseIntensity = 1.6;
  scene.add(eyeLight);
  animated.torchLights.push(eyeLight);

  // Shoulder / chest plate rising from the ash
  const chest = new THREE.Mesh(new THREE.BoxGeometry(30, 16, 18), mats.rust());
  chest.position.set(CX - 30, y - 2, CZ + 18);
  chest.rotation.set(0.3, 0.6, -0.25);
  chest.castShadow = true;
  scene.add(chest);
  addCollider(CX - 30, CZ + 18, 17);

  // Hand: finger columns curling out of the ground
  const fingerMat = mats.rust();
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(2.4, 12 - i * 1.5, 2.4), fingerMat);
    f.position.set(CX + 34 + i * 4, y + (12 - i * 1.5) / 2 - 2, CZ - 12);
    f.rotation.x = -0.5 + i * 0.12;
    f.castShadow = true;
    scene.add(f);
  }
  addCollider(CX + 40, CZ - 12, 8);

  // The great sword, planted
  const blade = new THREE.Mesh(new THREE.BoxGeometry(3.2, 42, 0.8), mats.oldIron());
  blade.position.set(CX + 60, y + 16, CZ + 30);
  blade.rotation.z = 0.16;
  blade.castShadow = true;
  scene.add(blade);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 1.6), mats.rust());
  guard.position.set(CX + 57, y + 34, CZ + 30);
  guard.rotation.z = 0.16;
  scene.add(guard);
  addCollider(CX + 60, CZ + 30, 2.5);
}

// ── Ironspire Keep ──
function buildKeep() {
  const KX = 60, KZ = -470;
  const baseY = 30; // plateau height

  // Curtain wall ring with broken segments
  const R = 150;
  const segments = 14;
  const brokenIdx = new Set([3, 8, 11]);
  const halfIdx = new Set([2, 9]);
  for (let i = 0; i < segments; i++) {
    if (brokenIdx.has(i)) {
      // Rubble pile in the gap
      const a = ((i + 0.5) / segments) * Math.PI * 2;
      const rx = KX + Math.cos(a) * R;
      const rz = KZ + Math.sin(a) * R;
      for (let b = 0; b < 5; b++) {
        const rb = new THREE.Mesh(new THREE.BoxGeometry(2 + Math.random() * 3, 1.5 + Math.random() * 2, 2 + Math.random() * 3), mats.darkStone());
        rb.position.set(rx + (Math.random() - 0.5) * 14, groundY(rx, rz) + 0.8, rz + (Math.random() - 0.5) * 14);
        rb.rotation.y = Math.random() * Math.PI;
        scene.add(rb);
      }
      continue;
    }
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;
    const x1 = KX + Math.cos(a1) * R, z1 = KZ + Math.sin(a1) * R;
    const x2 = KX + Math.cos(a2) * R, z2 = KZ + Math.sin(a2) * R;
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const len = Math.hypot(x2 - x1, z2 - z1);
    const h = halfIdx.has(i) ? 7 : 14;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, h, 4), mats.stone());
    const wy = groundY(cx, cz);
    wall.position.set(cx, wy + h / 2, cz);
    wall.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    addCollider(cx, cz, len * 0.32);

    // Battlements on full-height segments
    if (!halfIdx.has(i)) {
      const merlons = Math.floor(len / 6);
      for (let m = 0; m < merlons; m++) {
        const t = (m + 0.5) / merlons;
        const mx = x1 + (x2 - x1) * t;
        const mz = z1 + (z2 - z1) * t;
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 4.2), mats.stone());
        merlon.position.set(mx, wy + h + 1.1, mz);
        merlon.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
        scene.add(merlon);
      }
    }
  }

  // Gatehouse (south side, facing the road)
  const gx = 40, gz = KZ + R - 6;
  [[-11], [11]].forEach(([ox]) => {
    const ty = groundY(gx + ox, gz);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7, 26, 8), mats.stone());
    tower.position.set(gx + ox, ty + 13, gz);
    tower.castShadow = true;
    scene.add(tower);
    addCollider(gx + ox, gz, 6.5);
    // Crown
    for (let b = 0; b < 6; b++) {
      const ba = (b / 6) * Math.PI * 2;
      const mb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 1.6), mats.stone());
      mb.position.set(gx + ox + Math.cos(ba) * 5, ty + 27, gz + Math.sin(ba) * 5);
      scene.add(mb);
    }
    // Brazier
    makeCampfire(gx + ox, gz + 8, true);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 6), mats.stone());
  lintel.position.set(gx, groundY(gx, gz) + 18, gz);
  scene.add(lintel);
  makeBanner(gx - 6, groundY(gx - 6, gz + 3), gz + 3, Math.PI, 0x7c1f1f);
  makeBanner(gx + 6, groundY(gx + 6, gz + 3), gz + 3, Math.PI, 0x7c1f1f);

  // Great hall (roofless shell, throne at north end)
  const hx = 60, hz = KZ - 40;
  const hy = baseY;
  const hallW = 34, hallD = 60, wallH = 12;
  // Side walls
  [[-hallW / 2, 0, 1.5, hallD], [hallW / 2, 0, 1.5, hallD]].forEach(([ox, oz, tw, td]) => {
    const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(tw, wallH, td), mats.stone());
    wallMesh.position.set(hx + ox, hy + wallH / 2, hz + oz);
    wallMesh.castShadow = true;
    scene.add(wallMesh);
  });
  addCollider(hx - hallW / 2, hz, 3);
  addCollider(hx + hallW / 2, hz, 3);
  // North wall (behind throne)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(hallW, wallH + 4, 1.5), mats.stone());
  northWall.position.set(hx, hy + (wallH + 4) / 2, hz - hallD / 2);
  northWall.castShadow = true;
  scene.add(northWall);
  addCollider(hx, hz - hallD / 2, hallW * 0.35);
  // Broken roof beams
  for (let i = 0; i < 5; i++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(hallW + 2, 0.8, 1.2), mats.charredWood());
    beam.position.set(hx, hy + wallH + 0.5, hz - hallD / 2 + 8 + i * 11);
    beam.rotation.z = (Math.random() - 0.5) * 0.3;
    if (i === 2) { beam.rotation.z = 0.5; beam.position.y -= 3; }
    scene.add(beam);
  }
  // Dais + throne
  const dais = new THREE.Mesh(new THREE.BoxGeometry(14, 1.6, 10), mats.darkStone());
  dais.position.set(hx, hy + 0.8, hz - hallD / 2 + 7);
  scene.add(dais);
  const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3, 3.5), mats.oldIron());
  throneSeat.position.set(hx, hy + 3.1, hz - hallD / 2 + 6);
  scene.add(throneSeat);
  const throneBack = new THREE.Mesh(new THREE.BoxGeometry(4.5, 8, 1), mats.oldIron());
  throneBack.position.set(hx, hy + 6, hz - hallD / 2 + 4.6);
  scene.add(throneBack);
  // Throne spikes
  for (let i = 0; i < 5; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.6 + (i === 2 ? 1.6 : 0), 5), mats.oldIron());
    spike.position.set(hx - 2 + i, hy + 10.5 + (i === 2 ? 0.8 : 0), hz - hallD / 2 + 4.6);
    scene.add(spike);
  }
  makeCampfire(hx - 10, hz - hallD / 2 + 12, true);
  makeCampfire(hx + 10, hz - hallD / 2 + 12, true);
  makeBanner(hx - 14, hy, hz - 10, Math.PI / 2, 0x7c1f1f);
  makeBanner(hx + 14, hy, hz - 10, -Math.PI / 2, 0x2b2b30);

  // Corner towers
  [[KX - 100, KZ - 90], [KX + 120, KZ - 60]].forEach(([tx, tz]) => {
    const ty = groundY(tx, tz);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 30, 8), mats.stone());
    t.position.set(tx, ty + 15, tz);
    t.castShadow = true;
    scene.add(t);
    addCollider(tx, tz, 7.5);
  });
  // Collapsed tower
  const ctx0 = KX + 90, ctz0 = KZ + 80;
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(7, 8, 9, 8), mats.darkStone());
  stump.position.set(ctx0, groundY(ctx0, ctz0) + 4.5, ctz0);
  scene.add(stump);
  addCollider(ctx0, ctz0, 8);
  const fallen = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.5, 20, 8), mats.darkStone());
  fallen.position.set(ctx0 + 16, groundY(ctx0 + 16, ctz0 + 6) + 4, ctz0 + 6);
  fallen.rotation.z = Math.PI / 2 - 0.15;
  scene.add(fallen);
}

// ── The Scarline (old battlefield) ──
function buildScarline() {
  const SX = 430, SZ = 60;

  // Craters
  for (let i = 0; i < 9; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 200;
    const x = SX + Math.cos(a) * r, z = SZ + Math.sin(a) * r * 0.7;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(5 + Math.random() * 6, 1.6, 6, 14), mats.darkStone());
    rim.position.set(x, groundY(x, z) + 0.2, z);
    rim.rotation.x = Math.PI / 2;
    rim.scale.y = 1;
    rim.scale.z = 1;
    scene.add(rim);
  }

  // Wreck clusters: dead mech limbs and shells
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 30 + Math.random() * 200;
    const x = SX + Math.cos(a) * r, z = SZ + Math.sin(a) * r * 0.75;
    const y = groundY(x, z);
    const cluster = new THREE.Group();
    cluster.position.set(x, y, z);
    cluster.rotation.y = Math.random() * Math.PI * 2;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(4 + Math.random() * 4, 3 + Math.random() * 3, 3.5), mats.rust());
    torso.position.y = 0.8;
    torso.rotation.set((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8);
    torso.castShadow = true;
    cluster.add(torso);

    if (Math.random() > 0.4) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8, 1.6), mats.oldIron());
      leg.position.set(2.5, 3, 1);
      leg.rotation.z = -0.5 + Math.random() * 0.4;
      cluster.add(leg);
    }
    if (Math.random() > 0.5) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 1.8), mats.rust());
      head.position.set(-3, 0.6, -1.5);
      head.rotation.y = Math.random();
      cluster.add(head);
    }
    scene.add(cluster);
    addCollider(x, z, 4);
  }

  // Stake rows (anti-cavalry, now anti-nothing)
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 10; i++) {
      const x = SX - 120 + i * 24 + row * 6;
      const z = SZ - 90 + row * 60 + (Math.random() - 0.5) * 10;
      const stake = new THREE.Mesh(new THREE.ConeGeometry(0.35, 4.5, 5), mats.charredWood());
      stake.position.set(x, groundY(x, z) + 1.8, z);
      stake.rotation.set(0.6, Math.random() * Math.PI, 0);
      scene.add(stake);
    }
  }
}

// ── Deadwood extras: hanging cages, mist stones ──
function buildDeadwoodExtras() {
  const DX = -430, DZ = -60;
  // Flayed Knight's trophies: armor plates nailed to posts
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 160;
    const x = DX + Math.cos(a) * r, z = DZ + Math.sin(a) * r;
    const y = groundY(x, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 6, 5), mats.charredWood());
    post.position.set(x, y + 3, z);
    scene.add(post);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 0.2), mats.rust());
    plate.position.set(x, y + 4, z + 0.4);
    plate.rotation.z = (Math.random() - 0.5) * 0.4;
    scene.add(plate);
  }
  // Standing stones
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const x = DX + Math.cos(a) * 30, z = DZ - 140 + Math.sin(a) * 30;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7 + Math.random() * 2, 1.6), mats.darkStone());
    stone.position.set(x, groundY(x, z) + 3.5, z);
    stone.rotation.y = Math.random();
    stone.rotation.z = (Math.random() - 0.5) * 0.15;
    scene.add(stone);
    addCollider(x, z, 1.8);
  }
}

// ── Bandit camps ──
export const campProps = {}; // campId -> { center }

function buildCamps() {
  for (const camp of CONFIG.CAMPS) {
    const { x, z } = camp;
    campProps[camp.id] = { center: { x, z } };

    makeCampfire(x, z, true);

    // Tents
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const tx = x + Math.cos(a) * 12, tz = z + Math.sin(a) * 12;
      const tent = new THREE.Mesh(new THREE.ConeGeometry(3.4, 4.2, 4), mats.canvas());
      tent.position.set(tx, groundY(tx, tz) + 2, tz);
      tent.rotation.y = Math.random() * Math.PI;
      tent.castShadow = true;
      scene.add(tent);
      addCollider(tx, tz, 3);
    }

    // Palisade arc
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 1.2 + 2;
      const px = x + Math.cos(a) * 22, pz = z + Math.sin(a) * 22;
      const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 4.5, 5), mats.charredWood());
      stake.position.set(px, groundY(px, pz) + 2, pz);
      stake.rotation.set((Math.random() - 0.5) * 0.15, 0, (Math.random() - 0.5) * 0.15);
      scene.add(stake);
    }

    // Banner
    makeBanner(x + 6, groundY(x + 6, z - 6), z - 6, Math.random() * Math.PI, 0xb3402a);

    // Loot crates (salvage pickups)
    for (let i = 0; i < 3; i++) {
      const cx = x + (Math.random() - 0.5) * 16;
      const cz = z + (Math.random() - 0.5) * 16;
      spawnPickup(cx, cz, 'gold', 40 + Math.floor(Math.random() * 30), true);
    }
  }
}

// ── Wayshrines ──
function buildShrines() {
  for (const shrine of CONFIG.SHRINES) {
    const { x, z } = shrine;
    const y = groundY(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);

    const step = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 0.7, 8), mats.stone());
    step.position.y = 0.35;
    g.add(step);

    const obelisk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7, 1.6), mats.darkStone());
    obelisk.position.y = 4;
    obelisk.castShadow = true;
    g.add(obelisk);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 4), mats.darkStone());
    cap.position.y = 8.2;
    cap.rotation.y = Math.PI / 4;
    g.add(cap);

    // Floating rune ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.12, 6, 24),
      new THREE.MeshBasicMaterial({ color: 0xffb35c, transparent: true, opacity: 0.7 })
    );
    ring.position.y = 5.2;
    ring.rotation.x = Math.PI / 2;
    ring.userData.floatOffset = Math.random() * 10;
    ring.userData.baseY = 5.2;
    g.add(ring);
    animated.runes.push(ring);

    scene.add(g);
    addCollider(x, z, 2.2);
    interactables.push({ type: 'shrine', id: shrine.id, name: shrine.name, x, z, mesh: g });
  }
}

// ── Salvage pickups scattered across the map ──
function buildSalvage() {
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 80 + Math.random() * 560;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x, z - 380) < 60) continue;
    spawnPickup(x, z, 'gold', 15 + Math.floor(Math.random() * 25), true);
  }
}

export function spawnPickup(x, z, type, amount, permanentRespawn = false) {
  const y = groundY(x, z);
  const g = new THREE.Group();
  g.position.set(x, y, z);

  if (type === 'relic') {
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff7a2f, emissive: 0xff5522, emissiveIntensity: 1.2, roughness: 0.3, metalness: 0.6 })
    );
    core.position.y = 1.6;
    g.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 6, 20), mats.glow('#ffb35c'));
    ring.position.y = 1.6;
    g.add(ring);
    const light = new THREE.PointLight(0xff7a2f, 1.6, 22);
    light.position.y = 2.4;
    g.add(light);
  } else {
    // Scrap heap with a glowing heart
    for (let i = 0; i < 4; i++) {
      const bit = new THREE.Mesh(new THREE.BoxGeometry(0.7 + Math.random() * 0.6, 0.4 + Math.random() * 0.5, 0.6 + Math.random() * 0.5), mats.rust());
      bit.position.set((Math.random() - 0.5) * 1.6, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 1.6);
      bit.rotation.y = Math.random() * Math.PI;
      g.add(bit);
    }
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), mats.glow('#ffb35c'));
    heart.position.y = 1.2;
    heart.userData.isHeart = true;
    g.add(heart);
  }

  scene.add(g);
  const p = { mesh: g, type, amount, x, z, active: true, respawn: permanentRespawn ? 0 : -1 };
  pickups.push(p);
  return p;
}

// ── Per-frame pickup + animation updates ──
export function updatePickups(dt, playerPos) {
  for (const p of pickups) {
    if (!p.active) {
      if (p.respawn > 0) {
        p.respawn -= dt;
        if (p.respawn <= 0) {
          p.active = true;
          p.mesh.visible = true;
        }
      }
      continue;
    }
    // Bob & spin the glowing bits
    p.mesh.rotation.y += dt * 1.2;
    if (playerPos) {
      const d = Math.hypot(playerPos.x - p.x, playerPos.z - p.z);
      if (d < 6) {
        p.active = false;
        p.mesh.visible = false;
        if (p.respawn === 0) p.respawn = 150;
        document.dispatchEvent(new CustomEvent('pickupCollected', { detail: { type: p.type, amount: p.amount, x: p.x, z: p.z } }));
      }
    }
  }
}

export function getNearestInteractable(pos, maxDist = 9) {
  let best = null, bestD = maxDist;
  for (const it of interactables) {
    const d = Math.hypot(pos.x - it.x, pos.z - it.z);
    if (d < bestD) { bestD = d; best = it; }
  }
  return best;
}

// ── World ambient animation ──
export function updateWorldAnim(dt, t, night) {
  for (const f of animated.flames) {
    const s = 0.85 + Math.sin(t * 9 + f.userData.flickerOffset) * 0.18;
    f.scale.set(s, 0.9 + Math.sin(t * 7 + f.userData.flickerOffset) * 0.25, s);
  }
  for (const l of animated.torchLights) {
    l.intensity = l.userData.baseIntensity * (0.85 + Math.sin(t * 8 + l.userData.flickerOffset) * 0.25);
  }
  for (const b of animated.banners) {
    b.rotation.y = b.userData.baseRotY + Math.sin(t * 1.4 + b.userData.swayOffset) * 0.18;
    b.rotation.x = Math.sin(t * 2.2 + b.userData.swayOffset) * 0.07;
  }
  for (const w of animated.windmills) {
    w.rotation.z += dt * 0.5;
  }
  for (const l of animated.lanterns) {
    l.material.emissiveIntensity = 0.15 + night * 1.3 + Math.sin(t * 6 + l.position.x) * 0.08;
  }
  for (const r of animated.runes) {
    r.position.y = r.userData.baseY + Math.sin(t * 1.5 + r.userData.floatOffset) * 0.4;
    r.rotation.z += dt * 0.8;
  }
}
