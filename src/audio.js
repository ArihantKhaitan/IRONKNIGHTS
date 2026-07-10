// src/audio.js - Procedural WebAudio sound engine (no asset files)
import { State } from './state.js';

let ctx = null;
let master = null;
let sfxBus = null;
let ambBus = null;

// Ambient nodes
let windSrc = null, windGain = null, windFilter = null;
let droneOscA = null, droneOscB = null, droneGain = null;
let stormTarget = 0;

function ensureCtx() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = State.soundOn ? 0.8 : 0;
    master.connect(ctx.destination);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.9;
    sfxBus.connect(master);

    ambBus = ctx.createGain();
    ambBus.gain.value = 0.55;
    ambBus.connect(master);
  } catch (e) {
    console.warn('WebAudio unavailable:', e);
    return false;
  }
  return true;
}

function noiseBuffer(seconds = 1) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

let cachedNoise = null;
function getNoise() {
  if (!cachedNoise) cachedNoise = noiseBuffer(2);
  return cachedNoise;
}

// ── One-shot synthesis helpers ─────────────────────────────
function envGain(peak, attack, decay, when = 0) {
  const g = ctx.createGain();
  const t = ctx.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

function playNoiseBurst({ peak = 0.5, attack = 0.005, decay = 0.15, filterType = 'lowpass', freq = 1200, q = 1, when = 0, rate = 1 }) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise();
  src.playbackRate.value = rate;
  const filt = ctx.createBiquadFilter();
  filt.type = filterType;
  filt.frequency.value = freq;
  filt.Q.value = q;
  const g = envGain(peak, attack, decay, when);
  src.connect(filt); filt.connect(g); g.connect(sfxBus);
  const t = ctx.currentTime + when;
  src.start(t);
  src.stop(t + attack + decay + 0.05);
}

function playTone({ type = 'sine', from = 440, to = null, peak = 0.3, attack = 0.005, decay = 0.2, when = 0 }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  const t = ctx.currentTime + when;
  osc.frequency.setValueAtTime(from, t);
  if (to != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + attack + decay);
  const g = envGain(peak, attack, decay, when);
  osc.connect(g); g.connect(sfxBus);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

// ── Public SFX vocabulary ──────────────────────────────────
const SFX = {
  shot() {
    playNoiseBurst({ peak: 0.35, attack: 0.002, decay: 0.09, filterType: 'bandpass', freq: 1600, q: 0.8 });
    playTone({ type: 'square', from: 320, to: 90, peak: 0.16, attack: 0.002, decay: 0.08 });
  },
  heavyShot() {
    playNoiseBurst({ peak: 0.5, attack: 0.004, decay: 0.3, filterType: 'lowpass', freq: 900 });
    playTone({ type: 'sawtooth', from: 160, to: 40, peak: 0.3, attack: 0.004, decay: 0.28 });
  },
  enemyShot() {
    playNoiseBurst({ peak: 0.15, attack: 0.002, decay: 0.08, filterType: 'bandpass', freq: 1100, q: 1 });
  },
  explosion() {
    playNoiseBurst({ peak: 0.7, attack: 0.005, decay: 0.7, filterType: 'lowpass', freq: 450 });
    playTone({ type: 'sine', from: 110, to: 28, peak: 0.5, attack: 0.005, decay: 0.6 });
  },
  bigExplosion() {
    playNoiseBurst({ peak: 0.9, attack: 0.008, decay: 1.2, filterType: 'lowpass', freq: 320 });
    playTone({ type: 'sine', from: 80, to: 20, peak: 0.7, attack: 0.008, decay: 1.1 });
    playNoiseBurst({ peak: 0.3, attack: 0.05, decay: 0.9, filterType: 'highpass', freq: 3000, when: 0.05 });
  },
  hit() {
    playNoiseBurst({ peak: 0.2, attack: 0.001, decay: 0.05, filterType: 'highpass', freq: 2500 });
  },
  hurt() {
    playTone({ type: 'sawtooth', from: 220, to: 70, peak: 0.25, attack: 0.003, decay: 0.18 });
    playNoiseBurst({ peak: 0.2, attack: 0.003, decay: 0.15, filterType: 'lowpass', freq: 800 });
  },
  melee() {
    playNoiseBurst({ peak: 0.3, attack: 0.01, decay: 0.12, filterType: 'bandpass', freq: 600, q: 2, rate: 0.7 });
  },
  meleeHit() {
    playTone({ type: 'square', from: 180, to: 60, peak: 0.25, attack: 0.002, decay: 0.12 });
    playNoiseBurst({ peak: 0.35, attack: 0.002, decay: 0.2, filterType: 'bandpass', freq: 3200, q: 4 });
  },
  step() {
    playNoiseBurst({ peak: 0.09, attack: 0.002, decay: 0.09, filterType: 'lowpass', freq: 250, rate: 0.6 });
  },
  bigStep() {
    playNoiseBurst({ peak: 0.16, attack: 0.003, decay: 0.14, filterType: 'lowpass', freq: 160, rate: 0.5 });
  },
  dash() {
    playNoiseBurst({ peak: 0.3, attack: 0.01, decay: 0.25, filterType: 'bandpass', freq: 900, q: 1.5, rate: 1.4 });
  },
  pickup() {
    playTone({ type: 'sine', from: 620, to: 920, peak: 0.18, attack: 0.005, decay: 0.12 });
    playTone({ type: 'sine', from: 930, to: 1240, peak: 0.14, attack: 0.005, decay: 0.16, when: 0.07 });
  },
  gold() {
    playTone({ type: 'triangle', from: 1180, to: 1180, peak: 0.14, attack: 0.002, decay: 0.1 });
    playTone({ type: 'triangle', from: 1560, to: 1560, peak: 0.12, attack: 0.002, decay: 0.14, when: 0.05 });
  },
  ui() {
    playNoiseBurst({ peak: 0.08, attack: 0.001, decay: 0.04, filterType: 'highpass', freq: 2000 });
    playTone({ type: 'sine', from: 500, to: 400, peak: 0.06, attack: 0.002, decay: 0.05 });
  },
  reload() {
    playNoiseBurst({ peak: 0.15, attack: 0.002, decay: 0.06, filterType: 'bandpass', freq: 2000, q: 3 });
    playNoiseBurst({ peak: 0.18, attack: 0.002, decay: 0.08, filterType: 'bandpass', freq: 1400, q: 3, when: 0.16 });
  },
  ability() {
    playTone({ type: 'sawtooth', from: 200, to: 800, peak: 0.2, attack: 0.02, decay: 0.3 });
  },
  shrine() {
    [392, 494, 587, 784].forEach((f, i) => {
      playTone({ type: 'sine', from: f, to: f, peak: 0.15, attack: 0.02, decay: 0.9, when: i * 0.16 });
    });
  },
  missionComplete() {
    [262, 330, 392, 523].forEach((f, i) => {
      playTone({ type: 'triangle', from: f, to: f, peak: 0.22, attack: 0.01, decay: 0.7, when: i * 0.14 });
    });
  },
  missionFail() {
    [330, 262, 196, 131].forEach((f, i) => {
      playTone({ type: 'sawtooth', from: f, to: f * 0.97, peak: 0.16, attack: 0.02, decay: 0.8, when: i * 0.22 });
    });
  },
  bossRoar() {
    playTone({ type: 'sawtooth', from: 65, to: 45, peak: 0.5, attack: 0.05, decay: 1.4 });
    playNoiseBurst({ peak: 0.35, attack: 0.06, decay: 1.2, filterType: 'lowpass', freq: 400, rate: 0.5 });
  }
};

// ── Ambient bed: wind + low drone ──────────────────────────
function startAmbientNodes() {
  if (windSrc) return;

  // Wind: looped noise through a wandering lowpass
  windSrc = ctx.createBufferSource();
  windSrc.buffer = getNoise();
  windSrc.loop = true;
  windFilter = ctx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 400;
  windGain = ctx.createGain();
  windGain.gain.value = 0.12;
  windSrc.connect(windFilter); windFilter.connect(windGain); windGain.connect(ambBus);
  windSrc.start();

  // Wind LFO on filter frequency
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain); lfoGain.connect(windFilter.frequency);
  lfo.start();

  // Drone: two detuned lows, very quiet — the dead-kingdom hum
  droneOscA = ctx.createOscillator();
  droneOscA.type = 'sawtooth';
  droneOscA.frequency.value = 55;   // A1
  droneOscB = ctx.createOscillator();
  droneOscB.type = 'sawtooth';
  droneOscB.frequency.value = 55.6;
  const droneFilt = ctx.createBiquadFilter();
  droneFilt.type = 'lowpass';
  droneFilt.frequency.value = 140;
  droneGain = ctx.createGain();
  droneGain.gain.value = 0.035;
  droneOscA.connect(droneFilt); droneOscB.connect(droneFilt);
  droneFilt.connect(droneGain); droneGain.connect(ambBus);
  droneOscA.start(); droneOscB.start();
}

// ── Public API ─────────────────────────────────────────────
export const Audio = {
  unlock() {
    // Call on first user gesture
    if (!ensureCtx()) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    startAmbientNodes();
  },

  play(name) {
    if (!ctx || !State.soundOn) return;
    if (ctx.state === 'suspended') { ctx.resume().catch(() => {}); }
    const fn = SFX[name];
    if (fn) { try { fn(); } catch (e) { /* ignore audio hiccups */ } }
  },

  setEnabled(on) {
    State.soundOn = on;
    if (master) master.gain.value = on ? 0.8 : 0;
    State.save();
  },

  // storm ∈ [0,1] — thickens the wind
  setStorm(v) {
    stormTarget = Math.max(0, Math.min(1, v));
    if (windGain) {
      const t = ctx.currentTime;
      windGain.gain.cancelScheduledValues(t);
      windGain.gain.linearRampToValueAtTime(0.12 + stormTarget * 0.35, t + 2.0);
    }
    if (windFilter) {
      const t = ctx.currentTime;
      windFilter.frequency.cancelScheduledValues(t);
      windFilter.frequency.linearRampToValueAtTime(400 + stormTarget * 700, t + 2.0);
    }
  },

  // night ∈ [0,1] — deepens the drone slightly at night
  setNight(v) {
    if (droneGain && ctx) {
      droneGain.gain.setTargetAtTime(0.035 + v * 0.025, ctx.currentTime, 3);
    }
  }
};
