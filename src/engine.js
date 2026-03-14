// src/engine.js - Three.js scene, camera, renderer setup
import * as THREE from 'three';

export let scene = null;
export let camera = null;
export let renderer = null;
export let clock = null;

export function initEngine() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.position.set(0, 8, 20);

  // Renderer
  const canvas = document.getElementById('game-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Clock
  clock = new THREE.Clock();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, clock };
}

export function setupLighting(levelConfig) {
  // Remove all existing lights
  const lightsToRemove = [];
  scene.traverse((obj) => {
    if (obj.isLight) lightsToRemove.push(obj);
  });
  lightsToRemove.forEach(l => scene.remove(l));

  // Ambient light
  const ambient = new THREE.AmbientLight(
    new THREE.Color(levelConfig.ambientColor || '#334455'),
    levelConfig.ambientIntensity || 0.4
  );
  scene.add(ambient);

  // Main directional light with shadows
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 100, 50);
  dirLight.castShadow = true;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 500;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.right = 200;
  dirLight.shadow.camera.top = 200;
  dirLight.shadow.camera.bottom = -200;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.bias = -0.001;
  scene.add(dirLight);

  // Accent point lights using level color
  const accentColor = new THREE.Color(levelConfig.accentColor || '#00fff9');
  const positions = [
    [0, 30, 0],
    [80, 15, 80],
    [-80, 15, -80],
    [80, 15, -80]
  ];
  positions.forEach(([x, y, z], i) => {
    const light = new THREE.PointLight(i === 0 ? accentColor : (i % 2 === 0 ? accentColor : 0xff6600), 1.5, 200);
    light.position.set(x, y, z);
    scene.add(light);
  });

  // Rim light for atmosphere
  const rimLight = new THREE.DirectionalLight(new THREE.Color(levelConfig.accentColor || '#00fff9'), 0.3);
  rimLight.position.set(-50, 20, -100);
  scene.add(rimLight);
}
