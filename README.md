# ⚔ IRON KNIGHTS: ASHFALL

**An open-world mech action game set in a broken medieval kingdom.**

The kingdom died a generation ago, when the great war-engines — the Colossi — turned the land to ash. You are a Rider: a drifter piloting a salvaged knight-engine through the ruins, taking bounties, clearing bandit camps, and hunting the thing that killed the kingdom.

Built with vanilla JavaScript and [Three.js](https://threejs.org/). No build step, no frameworks, no asset files — every model is procedural geometry and every sound is synthesized live with WebAudio.

---

## 🎮 How to Play

The game runs in a browser but must be served over HTTP (ES modules don't work from `file://`).

```bash
# from the project folder — any static server works:
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000` (or whatever port your server prints) in Chrome/Edge/Firefox.

### Controls

| Key | Action |
|---|---|
| `W A S D` | Walk the engine |
| Mouse | Look / aim |
| Left Click | Arm cannon |
| Right Click | Heavy shot (5 shells, splash damage) |
| `Q` | Sword swing |
| `E` | War art (your mech's ability) |
| `Shift` | Boost (burns furnace) |
| `Space` | Hover jets |
| `R` | Reload |
| `F` | Interact — wayshrines, bounty board |
| `V` | Toggle first / third person view |
| `M` | Kingdom map |
| `Esc` | Pause / close |

---

## 🗺 The World

One seamless open world with a full day/night cycle, ash storms, and five regions:

- **Emberfall Village** — the half-burnt hub. Bounty board, wayshrine, campfires.
- **The Ashen Plains** — open fields where a dead Colossus lies half-buried, its sword still planted.
- **The Deadwood** — a fog-choked burnt forest. The Flayed Knight nails the armor of travellers to the trees.
- **The Scarline** — the old front line. Craters, trenches, and the wrecks of ten thousand engines.
- **Ironspire Keep** — the dead king's seat, on the northern hill, behind a gate that hasn't opened in twenty years.

### Things to do

- **Campaign** — six story chapters ending at the Iron Throne, with three bosses.
- **Bounties** — read the board in Emberfall, hunt named outlaws across the map.
- **Camps** — four bandit camps to clear for gold.
- **Wayshrines** — five shrines that heal you and set your respawn point.
- **Salvage** — glowing scrap piles scattered across the wastes.
- **Ambient patrols** — raider packs roam the roads. Or the roads roam toward you.
- **Repair scrap** — fallen enemies have a chance to drop teal repair scrap that patches your hull; bosses always drop it.

## 🤖 The Engines

| Engine | Style | War Art |
|---|---|---|
| **SQUIRE** | Balanced starter | Lunge — burst dash |
| **WRAITH** | Fast, fragile | Shroud — 3s invisibility |
| **WARDEN** | Heavy siege | Quake — ground slam |
| **PALADIN** | Sanctified tank | Aegis — full ward restore |

Engines are unlocked through the campaign or bought with gold in **The Forge**, which also sells three upgrade tracks (Gunworks / Plating / Furnace), three tiers each.

---

## 🔧 Tech Notes

```
index.html          entry + all screens/HUD markup
css/                ash-and-ember UI theme (Cinzel / Spectral / Rajdhani)
src/
  config.js         all game data: mechs, enemies, bosses, missions, regions
  state.js          central state + localStorage save
  engine.js         renderer, day/night sky, sun/moon/stars, lighting
  world.js          procedural open world: terrain, village, keep, forest
  player.js         player mech model, walk animation, camera
  enemies.js        AI archetypes (walkers, hounds, structures), bosses
  combat.js         projectiles, heavy shot, melee, damage
  effects.js        particles, muzzle flash, embers, smoke
  quests.js         missions, bounties, camps, objectives
  hud.js            compass, radar, toasts, markers, region reveals
  ui.js             menus, campaign map, forge, bounty board
  audio.js          procedural WebAudio SFX + ambient wind/drone
  main.js           game loop and orchestration
```

- Terrain is an analytic heightfield (`terrainHeight(x,z)`) shared by every system — no physics engine.
- Trees, rocks, and grass are `InstancedMesh` batches; the whole world is a few hundred draw calls.
- Progress (gold, engines, upgrades, campaign, shrines) saves to `localStorage` automatically.
- `?boot=free` on the URL skips the menu straight into free roam (used for automated testing).

---

*The kingdom died a generation ago. The vultures never left.*
