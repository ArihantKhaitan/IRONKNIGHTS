// src/engine.js - Renderer, camera, day/night sky and lighting
import * as THREE from 'three';

export let scene = null;
export let camera = null;
export let renderer = null;
export let clock = null;

// Sky / lighting handles
let hemiLight = null;
let sunLight = null;
let sunMesh = null;
let moonMesh = null;
let stars = null;
let clouds = [];

// Palette keyframes across the day (t: 0 = midnight, 0.5 = noon)
const SKY_STOPS = [
  { t: 0.00, sky: 0x07070d, fog: 0x0a0a12, sun: 0x223244, amb: 0.16 }, // midnight
  { t: 0.22, sky: 0x0d0c12, fog: 0x121017, sun: 0x33333f, amb: 0.20 }, // pre-dawn
  { t: 0.28, sky: 0x6b3a2a, fog: 0x74452f, sun: 0xff9a55, amb: 0.45 }, // dawn
  { t: 0.38, sky: 0x9c7f5e, fog: 0xa08663, sun: 0xffe6bf, amb: 0.72 }, // morning
  { t: 0.50, sky: 0xa89a80, fog: 0xa89878, sun: 0xfff2dc, amb: 0.85 }, // noon (ashy, overcast)
  { t: 0.66, sky: 0x9c7452, fog: 0x9c7048, sun: 0xffd9a0, amb: 0.70 }, // afternoon
  { t: 0.76, sky: 0x8a4a2b, fog: 0x8f4c28, sun: 0xff8a3d, amb: 0.55 }, // golden hour
  { t: 0.84, sky: 0x3d2230, fog: 0x40242e, sun: 0xb35a4a, amb: 0.30 }, // dusk
  { t: 0.92, sky: 0x0e0d16, fog: 0x12101a, sun: 0x2a3448, amb: 0.18 }, // night
  { t: 1.00, sky: 0x07070d, fog: 0x0a0a12, sun: 0x223244, amb: 0.16 }  // midnight
];

const _c1 = new THREE.Color();
const _c2 = new THREE.Color();

function sampleSky(t) {
  t = ((t % 1) + 1) % 1;
  let a = SKY_STOPS[0], b = SKY_STOPS[SKY_STOPS.length - 1];
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    if (t >= SKY_STOPS[i].t && t <= SKY_STOPS[i + 1].t) {
      a = SKY_STOPS[i]; b = SKY_STOPS[i + 1];
      break;
    }
  }
  const span = Math.max(1e-5, b.t - a.t);
  const f = (t - a.t) / span;
  return {
    sky: _c1.setHex(a.sky).clone().lerp(_c2.setHex(b.sky), f),
    fog: _c1.setHex(a.fog).clone().lerp(_c2.setHex(b.fog), f),
    sun: _c1.setHex(a.sun).clone().lerp(_c2.setHex(b.sun), f),
    amb: a.amb + (b.amb - a.amb) * f
  };
}

export function initEngine() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8a4a2b);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 10, 24);

  const canvas = document.getElementById('game-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  clock = new THREE.Clock();

  scene.fog = new THREE.FogExp2(new THREE.Color(0x8f4c28), 0.0028);

  buildLighting();
  buildSky();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, clock };
}

function buildLighting() {
  hemiLight = new THREE.HemisphereLight(0xa89878, 0x2b2018, 0.7);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xffd9a0, 1.3);
  sunLight.position.set(120, 160, 60);
  sunLight.castShadow = true;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 600;
  sunLight.shadow.camera.left = -160;
  sunLight.shadow.camera.right = 160;
  sunLight.shadow.camera.top = 160;
  sunLight.shadow.camera.bottom = -160;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.bias = -0.0015;
  scene.add(sunLight);
  scene.add(sunLight.target);
}

function buildSky() {
  // Sun disc
  const sunGeo = new THREE.CircleGeometry(38, 24);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffb35c, fog: false, transparent: true, opacity: 0.95 });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sunMesh);

  // Moon disc
  const moonGeo = new THREE.CircleGeometry(22, 24);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xcfd8e6, fog: false, transparent: true, opacity: 0.9 });
  moonMesh = new THREE.Mesh(moonGeo, moonMat);
  scene.add(moonMesh);

  // Stars
  const starCount = 700;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    // Random points on upper hemisphere at large radius
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.95); // bias upward
    const r = 1200;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) + 40;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xcdd6e8, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0 });
  stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Drifting ash-cloud slabs, high above
  const cloudMat = () => new THREE.MeshBasicMaterial({ color: 0x554438, transparent: true, opacity: 0.35, fog: false, depthWrite: false });
  for (let i = 0; i < 16; i++) {
    const w = 180 + Math.random() * 320;
    const d = 90 + Math.random() * 180;
    const geo = new THREE.PlaneGeometry(w, d);
    const cloud = new THREE.Mesh(geo, cloudMat());
    cloud.rotation.x = -Math.PI / 2;
    cloud.position.set((Math.random() - 0.5) * 1800, 320 + Math.random() * 140, (Math.random() - 0.5) * 1800);
    cloud.userData.driftSpeed = 2 + Math.random() * 4;
    scene.add(cloud);
    clouds.push(cloud);
  }
}

/**
 * Advance the sky for the current time of day.
 * @param {number} timeOfDay 0..1 (0 = midnight, 0.5 = noon)
 * @param {number} fogMul    regional fog multiplier
 * @param {number} storm     0..1 ash storm intensity
 * @param {THREE.Vector3} playerPos  shadow camera + sky follow the player
 * @param {number} dt
 */
export function updateDayNight(timeOfDay, fogMul, storm, playerPos, dt) {
  const s = sampleSky(timeOfDay);
  const px = playerPos ? playerPos.x : 0;
  const pz = playerPos ? playerPos.z : 0;

  // Sky, fog
  scene.background.copy(s.sky);
  if (scene.fog) {
    scene.fog.color.copy(s.fog);
    const base = 0.0028;
    scene.fog.density = base * fogMul * (1 + storm * 2.4);
  }

  // Sun position: angle from time. Noon = overhead-south.
  const sunAngle = (timeOfDay - 0.25) * Math.PI * 2; // rises at 0.25
  const sunY = Math.sin(sunAngle);
  const sunX = Math.cos(sunAngle);
  const R = 900;

  sunMesh.position.set(px + sunX * R, sunY * R * 0.65, pz - 320);
  sunMesh.lookAt(camera.position);
  sunMesh.material.color.copy(s.sun);
  sunMesh.material.opacity = Math.max(0, Math.min(1, sunY * 3 + 0.15)) * (1 - storm * 0.7);

  moonMesh.position.set(px - sunX * R, -sunY * R * 0.65, pz + 300);
  moonMesh.lookAt(camera.position);
  moonMesh.material.opacity = Math.max(0, Math.min(0.9, -sunY * 2.4)) * (1 - storm * 0.7);

  // Directional light follows sun by day, dim moonlight by night
  const dayFactor = Math.max(0, Math.min(1, sunY * 2.2 + 0.1));
  sunLight.color.copy(s.sun);
  sunLight.intensity = 0.15 + dayFactor * 1.25 * (1 - storm * 0.45);
  const lightY = Math.max(0.12, Math.abs(sunY));
  const lx = dayFactor > 0.05 ? sunX : -sunX;
  sunLight.position.set(px + lx * 220, lightY * 260, pz + 80);
  sunLight.target.position.set(px, 0, pz);

  // Hemisphere ambient
  hemiLight.color.copy(s.sky).lerp(_c2.setHex(0xffffff), 0.25);
  hemiLight.intensity = 0.25 + s.amb * 0.75;

  // Stars fade in at night
  const night = Math.max(0, Math.min(1, -sunY * 2.2));
  stars.material.opacity = night * (1 - storm * 0.8);
  stars.position.set(px, 0, pz);

  // Clouds drift, tinted by sky
  for (const cloud of clouds) {
    cloud.position.x += cloud.userData.driftSpeed * dt;
    if (cloud.position.x - px > 1100) cloud.position.x = px - 1100;
    if (px - cloud.position.x > 1400) cloud.position.x = px + 1100;
    cloud.material.color.copy(s.fog).multiplyScalar(0.7);
    cloud.material.opacity = 0.22 + storm * 0.3;
  }
}
