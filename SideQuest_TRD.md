# SideQuest — Grade 8 · Finding Unknown Sides (Pythagoras' Theorem) (TRD)

**Companion to:** `SideQuest_PRD.md` · **Repo name:** `G8-SideQuest-main`
**Clone source:** `angle-on-line-g7-main` (the shipped AngleQuest build, user-supplied). It overrides the default `G2-Money-Money-main` under the TRD blueprint's "newer sibling as clone source" clause.
**Section order (per blueprint):** 1 Reference Analysis Notes → 2 Tech Stack → 3 Folder Structure → 4 State Management → 5 Component Specs → 6 Data Layer → 7 Simulate Station Specs → 8 Audio Pipeline → 9 Gamification → 10 Design Tokens & Viewport → 11 Build/Deploy → 12 QA Plan → 13 Delivery Checklist → 14 Risks → Appendix A Evidence log.

**How to read the code in this document.** Every code block marked ✅ *executed* was run during authoring (Node 18+, results in Appendix A) and can be copied into the repo as-is. Blocks marked *spec* are patterns to implement; the nav and Wonder-card CSS patterns were also applied to a copy of the reference and measured in headless Chromium.

---

## 1. Reference Analysis Notes

The reference was read file by file, then **installed, built, bank-tested, linted and driven in headless Chromium** (Appendix A). Rule applied throughout: *take UI/UX, layout, viewport and component-chrome patterns from the reference; where it contradicts a fixed rule in the PRD/TRD blueprints or fails a check, the blueprint or the fix wins and the defect is not cloned.*

### 1.1 Blueprint §1 gotcha check — results against the actual repo

| # | Gotcha | Finding in reference | Action |
|---|---|---|---|
| 1 | Dead duplicate `src/features/*` | **Not present.** `App.jsx` imports only from `./components/*`. | Do not create one. |
| 2 | Hard-coded story-panel count | **Mostly fixed.** Reducer and `StoryPhase.jsx` use `STORY_PANELS.length`. Remaining magic numbers: `ADVANCE_SIM_STATION` uses `Math.min(3, …)`; `simCompleted` and `worldResults` are literal `[false×4]` / `Array(10)`. | SideQuest has **6 panels**. Replace literals with `STATION_COUNT` / `WORLD_COUNT` constants (§4); unit-test that changing `STORY_PANELS.length` changes behaviour. |
| 3 | Static vs procedural bank | **Procedural**, seeded (`mulberry32`), `generateBank(seed)` + `generateQuestion(world, i, rng)`. But `PlayPhase` builds each session by calling `generateQuestion` in a loop with no de-duplication, and the stress test only requires ≥ 7 distinct texts per world and never recomputes answers. | Keep both exports; add `generateSession()` with de-duplication (§6.5) and a stricter stress test (§12). |
| 4 | Viewport clipping | **Partly fixed**: `100dvh` on body/app, `--header-h` measured by `ResizeObserver`. **Still present:** `w-screen h-screen` on `.app-container` and the celebration screen; `max-h-[94vh]` / `92vh` / `90vh` / `62vh` / `32vh` in Simulate, Practice, Reflect, Story, Badges, KingdomMap and QuestionRenderer; no inner scroll on the Wonder card; nav overflow (§1.2 #5). | Fix per §10. |
| 4b | `zoom` on short viewports | Not used (replaced by compact `@media (max-height: 800px)` rules). | Keep that approach; extend (§10). |
| 5 | Leftover branding | Title/OG already say AngleQuest. | Replace with SideQuest; `grep -ri "angle\|amirah\|wei jie\|detective\|inspector tally"` must return nothing in `src/`, `index.html`, `README.md` except deliberate geometry words. |

### 1.2 Defects found in the shipped reference (not in the blueprint list) — do not clone

| # | Defect | Evidence | Fix in SideQuest |
|---|---|---|---|
| 1 | **Boss Battle cannot start.** `startWorldSession` for mode `boss` only calls `setShowBossIntro(true)`; `activeWorld` stays `null`, so `BossBattleModal` receives `boss={undefined}` and returns `null`. | Code reading + browser: selecting a world in Boss mode shows no modal and no quiz. | §5.5 (state machine with explicit `bossIntroFor`). |
| 2 | **Error-Detective station not wired.** `SimulatePhase` lists `RadiantPointLab` as Station D; `CaseFileDetective.jsx` has no importer. | `grep -rn CaseFileDetective src` → only its own file. | `STATIONS` is exactly [Discovery, Build-to-Target, Composite, Error-Detective]; test asserts it (§12). |
| 3 | **Badges starved of state.** `checkBadges` is called only in `PlayPhase` with `{totalCorrect, streak, bestStreak, totalAnswered, badges}`; it never sees `simCompleted`, `worldResults` or `bossesDefeated`, so `sim_all`, `world_3star`, `boss_won` can never fire there. `totalCorrect` is read as `onUpdateScore.totalCorrect` — a property of a *function* — so it is always `undefined` (+1 each time). | `PlayPhase.jsx` lines 117–123; `App.jsx` `handleUpdateScore`. | Badge evaluation moves into the reducer and runs on the full next state (§4, ✅ tested: all 8 unlock). |
| 4 | **Stations ignore `audioEnabled`** (declared, unused in all five station files) so no station ever speaks. | `oxlint` warnings; `grep narrate src/components/simulations` → none. | `useStationNarration` hook (§7.0). |
| 5 | **Top nav overflows.** Labels show from `sm` (640 px) up, so the right-hand controls fall off-screen below ≈ 1300 px; on phones 4 of 5 pills and mute/close are unreachable. | Measured: 844×390 → 2 pills off-screen; 390×844 → 4 pills + mute + close off-screen; at 1280 px the label variant overflows by 8 px. | §10.3 (✅ measured fitting at 10 viewports, 360×740 → 1920×1080). |
| 6 | **Wonder CTA unreachable on phones.** The glass card has no scroll and `main` is `overflow:hidden`. | 390×844, 360×640, 844×390: button below the fold, no scrollable ancestor. | §10.4 (✅ button reachable after the patch). |
| 7 | **Simulate stacks badly on narrow screens** (four 70 px tabs above the workspace; 844×390 workspace text overlaps the tabs). | Screenshots at 844×390 and 390×844. | Chip strip below 768 px (§5.3). |
| 8 | **Narration breaks above 999 and for decimals.** `numberToWords` returns `String(num)` for ≥ 1000; `speak()` handles only integer `°` and `x = n`. | `narration.js` lines 14–57. | `speak.js` (§8.2, ✅ tested). |
| 9 | **Weak stress test** (`texts.size < 7`; no answer recomputation; no distractor checks despite the success message). | `scripts/stress_test_bank.js`. | §12.1. |
| 10 | **A real-looking ElevenLabs key is committed** in `.env.local.example`. | File contents (prefix `sk_14…`). | Placeholder only; rotate the exposed key; serverless proxy in production (§8.4, §14 R3). |
| 11 | **Story images are JPEG data named `.png`, duplicated as `.jpg`** (~800 KB each, 12 files). | `file story_1.png` → "JPEG image data, 1024x1024"; identical sizes. | One correctly-typed set, ≤ 300 KB each. |
| 12 | **Lint is not runnable**: `.oxlintrc.json` exists but `oxlint` and a `lint` script are absent from `package.json`; 30 unused-variable/parameter warnings once run. | `npx oxlint` output. | Add dev-dependency and script; zero warnings gate. |
| 13 | **Touch/type floors:** `AngleSlider` −/+ buttons are `w-8 h-8` (32 px); `text-[11px]` labels in `SimulatePhase`. | `kit.jsx`, `SimulatePhase.jsx`. | 44 px / 14 px floors (§10.5). |
| 14 | **Reducer actions that do nothing:** `ADVANCE_SIM_STATION`, `PREV_SIM_STATION`, `USE_HINT`, `LOAD_QUESTIONS`, `NEXT_QUESTION`, `PREV_QUESTION` exist but `SimulatePhase`/`PlayPhase` keep local state. | `App.jsx` vs phases. | Keep the blueprint's action names (so shared callers work) but only where used; see §4. |

### 1.3 Deviations from the blueprint — decisions

| Area | Reference does | SideQuest decision |
|---|---|---|
| Stack | React 18.3, Vite 5.4, framer-motion 11, lucide 0.475, plugin-react 4, no oxlint | **Blueprint versions** (React 19, Vite 8, framer-motion 12, lucide 1.x, plugin-react 6, Tailwind 3). ✅ Verified: the reference installs, builds and passes its bank test on these (§2). Plan B pins listed. |
| Folder layout | `src/hooks/` (no `core/hooks/`), `TopNav.jsx`, `BadgesModal.jsx`, `rng.js`, no `ProgressMap.jsx` | **Follow the reference layout** (it is the clone source). `KingdomMap.jsx` is the world map; no `ProgressMap.jsx`. |
| Simulate stations | 4 stations, but D is not the Error-Detective; stations do not narrate | Blueprint archetypes, wired and narrating (§7). |
| Reducer | Present, but scoring/badges split between reducer and `PlayPhase` | Reducer is the single source of truth (§4). `UPDATE_WORLD_RESULT` (a reference extension) is kept and documented. |
| Audio | Already **no** `speechSynthesis` anywhere (✅ grep) | Keep it that way; CI grep (§12). |
| `scoring.js` | `calcStars` (9/7/5) and `calcXP` present | **Reuse verbatim** — the older TRD's "copy from G2" caveat is resolved. |
| `vercel.json` | Regex rewrite that excludes `assets/` and `api/` | **Better than the blueprint's plain rewrite — adopt as-is.** |
| `generate_audio.js` | Derives phrases from `getAllNarration()` | Adopt (better than a hand-kept array). |

### 1.4 Reference patterns adopted unchanged
Glass-card / phase-band system and fluid `clamp()` token scale; `TopNav` capsule (with the §10.3 responsive changes); `FloatingSymbols`; Story carousel with progress row in the nav; Simulate 2-column shell and `kit.jsx` chrome (`Panel / Node / Msg / GoldBtn / GhostBtn`); practice stats pills; world grid with unlock rule; `canvas-confetti` on Reflect; `say/ask/cheer/emphasize/think/instruct` segment helpers and the static-map → live-fetch → preload queue in `utils/audio.js`; `createRNG` (mulberry32); `getScreenCTM()` pointer maths in station drag handlers; home-confirmation modal.

---

## 2. Tech Stack

```json
{
  "name": "side-quest",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "generate-audio": "node scripts/generate_audio.js",
    "clean-audio": "node scripts/clean_audio.js",
    "test:bank": "node scripts/stress_test_bank.js",
    "test:units": "node --test tests/",
    "test:e2e": "node scripts/e2e_journey.mjs",
    "lint": "oxlint"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "framer-motion": "^12.42.0",
    "lucide-react": "^1.22.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.2",
    "autoprefixer": "^10.5.2",
    "dotenv": "^17.4.2",
    "node-fetch": "^3.3.2",
    "oxlint": "^1.69.0",
    "playwright-core": "^1.56.0",
    "postcss": "^8.5.16",
    "tailwindcss": "^3.4.4",
    "vite": "^8.1.0"
  }
}
```

✅ **Verified resolution** (reference copied, dependencies swapped to these ranges, `npm install`, `npm run build`, `npm run test:bank`): react 19.3.0, react-dom 19.3.0, vite 8.3.3, @vitejs/plugin-react 6.1.2, framer-motion 12.43.0, lucide-react 1.52.0, tailwindcss 3.4.19, oxlint 1.87.0, postcss 8.5.29, autoprefixer 10.6.1, canvas-confetti 1.9.4 — build in ~1 s, bank test passed 30 000/30 000.

- **Keep Tailwind on v3.** npm's latest is 4.x; the `^3.4.4` range correctly stays on 3.4.x. Tailwind 4 changes the config and PostCSS plugin and would break the reference's setup.
- **Plan B** (only if a package conflict appears later): pin to the reference's tested set — react 18.3.1, vite 5.4.14, @vitejs/plugin-react 4.3.4, framer-motion 11.18.2, lucide-react 0.475.0 — and log it in the README.
- `vite.config.js`: `base: '/'`, `server.port: 3000`, `open: false` (as reference). `postcss.config.js`, `tailwind.config.js` (fonts `display`/`body`, phase and `world0…world9` colours): reuse; add the §10.1 triangle colours.
- `vercel.json`: reuse the reference file: `{"rewrites":[{"source":"/((?!assets/|api/).*)","destination":"/"}]}`.
- `.oxlintrc.json`: reuse and add `"no-console": "warn"` for `src/`.

---

## 3. Folder Structure

Tags: **NEW**, **MODIFY**, **REUSE** (copy verbatim), **DELETE** (do not carry over).

```
G8-SideQuest-main/
├── api/elevenlabs.js                      # NEW: serverless TTS proxy holding the key (§8.4)
├── docs/                                  # SideQuest_PRD.md, SideQuest_TRD.md, audio_generation_pipeline.md (REUSE, re-voiced)
├── public/
│   ├── favicon.svg                        # NEW art (reference references one)
│   └── assets/{audio/(.gitkeep), story/}  # story_1.png … story_6.png, 1024×1024, real PNG
├── scripts/
│   ├── generate_audio.js                  # REUSE (phrases = getAllNarration())
│   ├── clean_audio.js                     # REUSE
│   ├── stress_test_bank.js                # REWRITE (§12.1)
│   ├── e2e_journey.mjs                    # NEW (§12.4)
│   ├── viewport_matrix.mjs                # NEW (§12.5)
│   └── generate_story_art.js              # DELETE (placeholder art is produced by a one-off script; do not ship 683 lines of AngleQuest art code)
├── tests/                                 # NEW (node:test): pythagorasMath, stationD, appReducer, speak, stations.wiring
├── src/
│   ├── App.jsx                            # MODIFY: reducer extracted/fixed (§4); constants; w-full h-full
│   ├── App.css  main.jsx  index.css       # REUSE
│   ├── components/
│   │   ├── TopNav.jsx                     # MODIFY: responsive (§10.3)
│   │   ├── IntroScreen.jsx                # MODIFY: copy only
│   │   ├── gamification/ KingdomMap.jsx (MODIFY: dvh)  StarRating.jsx (REUSE)  BadgesModal.jsx (MODIFY: copy)
│   │   ├── quiz/ QuestionRenderer.jsx (MODIFY: TriangleVisual, dvh)  BossBattleModal.jsx (MODIFY: copy only)
│   │   ├── phases/
│   │   │   ├── WonderPhase.jsx            # MODIFY: content + scroll fix
│   │   │   ├── StoryPhase.jsx             # MODIFY: copy ("Job Panel"), image sizing
│   │   │   ├── SimulatePhase.jsx          # MODIFY: STATIONS, chip strip, 11 px → 14 px
│   │   │   ├── PlayPhase.jsx              # MODIFY: Boss fix, dispatch-based scoring, generateSession
│   │   │   └── ReflectPhase.jsx           # MODIFY: RECAP_QUESTIONS, copy, dvh
│   │   ├── shared/ TriangleVisual.jsx (NEW, replaces AngleVisual.jsx)  Mascot.jsx FeedbackOverlay.jsx (REUSE)  FloatingSymbols.jsx (MODIFY: symbol set)
│   │   └── simulations/
│   │       ├── SquareSecretLab.jsx        # NEW  Station A · Concept Discovery
│   │       ├── LadderLockIn.jsx           # NEW  Station B · Build-to-Target
│   │       ├── BlueprintBuilder.jsx       # NEW  Station C · Composite
│   │       ├── SiteReportDetective.jsx    # NEW  Station D · Error-Detective
│   │       ├── kit.jsx                    # MODIFY: NumberSlider (44 px controls), StationSuccess
│   │       └── Stations.css               # MODIFY
│   │       # DELETE: ProtractorWorkshop, MatchTheMissingAngle, IntersectionPuzzle, CaseFileDetective, RadiantPointLab
│   ├── config/ worlds.config.js characters.config.js (MODIFY)  audio.config.js (REUSE)
│   ├── hooks/ useViewport.js (MODIFY: flags)  useHeaderHeight.js useAudio.js (REUSE)  useStationNarration.js (NEW)
│   ├── data/ storyContent.js (MODIFY)  questionBank.js (REWRITE)
│   ├── state/ appReducer.js               # NEW (extracted from App.jsx, §4)
│   ├── utils/ audio.js (REUSE)  audioMap.js (auto)  narration.js (MODIFY)  speak.js (NEW)
│   │          badgeEngine.js (MODIFY: strings)  scoring.js shuffle.js rng.js (REUSE)
│   │          pythagorasMath.js (NEW)  stationCases.js (NEW: Station C/D builders)
│   └── styles/ design-tokens.css (MODIFY: +triangle tokens)  globals.css (MODIFY: viewport fixes)
├── index.html  package.json  vite.config.js  tailwind.config.js  postcss.config.js
├── vercel.json  .oxlintrc.json  .gitignore  .env.local.example (placeholder only)  README.md
```

Do **not** create `src/features/`. Do **not** ship both `.png` and `.jpg` story sets.

---

## 4. State Management

The reference reducer is kept, with these changes: (1) it is extracted to `src/state/appReducer.js` so it can be unit-tested; (2) **it evaluates badges on the full next state** after every action that can earn one (fixes §1.2 #3); (3) station and world counts are constants; (4) `badgeToast` queues newly earned badge ids for the overlay (cleared by the existing `CLEAR_FEEDBACK` action); (5) `journey_complete` is awarded by `checkBadges`, not by a manual array push.

✅ *executed* — `src/state/appReducer.js` (test: a scripted journey unlocks all 8 badges, no duplicates, streak resets without touching `bestStreak`, the panel-count argument drives `NEXT_STORY_PANEL`):

```js
// App reducer for SideQuest — single source of truth for scoring AND badges (fixes reference defect: badges starved of state)
import { checkBadges } from './badgeEngine.js';

export const STATION_COUNT = 4;
export const WORLD_COUNT = 10;
export const INITIAL_STATE = {
  phase: 'intro', storyPanel: 0, simStation: 0, simCompleted: Array(STATION_COUNT).fill(false),
  worldResults: Array(WORLD_COUNT).fill(null),
  xp: 0, streak: 0, bestStreak: 0, totalCorrect: 0, totalAnswered: 0, bossesDefeated: 0,
  badges: [], badgeToast: [], audioEnabled: true, journeyComplete: false,
};

/** Evaluate every trigger against the FULL next state; append newly earned badges and queue a toast. */
const withBadges = next => {
  const fresh = checkBadges(next).map(b => b.id);
  return fresh.length ? { ...next, badges: [...next.badges, ...fresh], badgeToast: [...next.badgeToast, ...fresh] } : next;
};

export function appReducer(state, action, panelCount = 6) {
  switch (action.type) {
    case 'SET_PHASE': return { ...state, phase: action.payload };
    case 'NEXT_STORY_PANEL':
      return state.storyPanel >= panelCount - 1 ? { ...state, phase: 'simulate', storyPanel: 0 } : { ...state, storyPanel: state.storyPanel + 1 };
    case 'PREV_STORY_PANEL': return { ...state, storyPanel: Math.max(0, state.storyPanel - 1) };
    case 'ADVANCE_SIM_STATION': return { ...state, simStation: Math.min(STATION_COUNT - 1, state.simStation + 1) };
    case 'PREV_SIM_STATION': return { ...state, simStation: Math.max(0, state.simStation - 1) };
    case 'COMPLETE_SIM_STATION': {
      const idx = action.payload ?? state.simStation; const simCompleted = [...state.simCompleted]; simCompleted[idx] = true;
      return withBadges({ ...state, simCompleted });
    }
    case 'ANSWER_CORRECT': {
      const streak = state.streak + 1;
      return withBadges({ ...state, xp: state.xp + (action.payload?.xpDelta ?? 10), streak, bestStreak: Math.max(state.bestStreak, streak),
        totalCorrect: state.totalCorrect + 1, totalAnswered: state.totalAnswered + 1 });
    }
    case 'ANSWER_INCORRECT': return withBadges({ ...state, streak: 0, totalAnswered: state.totalAnswered + 1 });
    case 'UPDATE_WORLD_RESULT': { // reference extension, retained: end-of-session result for a world
      const { worldIdx, stars, bossWon } = action.payload; const worldResults = [...state.worldResults];
      worldResults[worldIdx] = Math.max(worldResults[worldIdx] ?? 0, stars ?? 0);
      return withBadges({ ...state, worldResults, bossesDefeated: state.bossesDefeated + (bossWon ? 1 : 0) });
    }
    case 'CLEAR_FEEDBACK': return { ...state, badgeToast: [] };
    case 'COMPLETE_PHASE':
      if (action.payload === 'practice') return { ...state, phase: 'reflect' };
      if (action.payload === 'reflect') return withBadges({ ...state, journeyComplete: true });
      return state;
    case 'RESET_SESSION': return { ...INITIAL_STATE, audioEnabled: state.audioEnabled };
    default: return state;
  }
}
```

Wiring in `App.jsx`: `const [state, dispatch] = useReducer((s, a) => appReducer(s, a, STORY_PANELS.length), INITIAL_STATE)`; pass `simCompleted`, `worldResults`, `badges`, `badgeToast`, `streak`, `bestStreak`, `xp` to `PlayPhase`; `PlayPhase` dispatches `ANSWER_CORRECT` / `ANSWER_INCORRECT` / `UPDATE_WORLD_RESULT` / `CLEAR_FEEDBACK` and **never calls `checkBadges`**. `TOGGLE_AUDIO` keeps its call to `setMuted()` — do that in a `useEffect` on `state.audioEnabled` rather than inside the reducer (reducers must be pure; the reference calls `setMuted` inside the reducer, which double-fires in React StrictMode).

Other rules: `worldResults` keeps the best star count per world; the world-unlock rule lives in one exported function `isWorldUnlocked(worldResults, idx)` (used by `KingdomMap`); Home/✕ keep the existing confirmation modal when `hasProgress`.

---

## 5. Component Specs

### 5.1 `TopNav.jsx` — see §10.3 (responsive nav, header-height measurement unchanged).
### 5.2 `WonderPhase.jsx`
Content per PRD §7.1: a `TriangleVisual type="ladder"` with `{ ladder: 5, foot: 3, unknown: 'height' }`, key line "Ladder = 5 m · Foot = 3 m · Height = ?", Tally speech bubble, button "Open the Job File →". The card gets `overflow-y-auto max-h-[calc(100dvh-var(--header-h)-1rem)]` (§10.4). `FloatingSymbols` set: `√`, `a²`, `3-4-5`, `△`, `⊾`, `c² = a² + b²`.

### 5.3 `StoryPhase.jsx` and `SimulatePhase.jsx`
- **Story:** keep the reference carousel (6 panels). Copy changes: "Case File n of N" → "Job Panel n of N"; button labels "Next Clue" → "Next Step", last = "Enter the Site Lab". Below 768 px the illustration height is `clamp(160px, 28dvh, 420px)` and the text column scrolls inside the card. `onError` falls back to `imageBg` + `imageEmoji`.
- **Simulate:** the 12-column shell stays for ≥ 768 px. Below 768 px the station list becomes a horizontal chip strip (`flex gap-2 overflow-x-auto snap-x`, each chip 44 px tall: icon + "A", "B", "C", "D" + ✅/🔓), the workspace gets the full width, and the "Go to Practice" button sits in the footer row. All text ≥ 14 px (replace `text-[11px]`).

```jsx
// SimulatePhase.jsx — spec (the four archetypes, in this order; asserted by tests/stations.wiring.test.js)
import { SquareSecretLab } from '../simulations/SquareSecretLab.jsx';
import { LadderLockIn } from '../simulations/LadderLockIn.jsx';
import { BlueprintBuilder } from '../simulations/BlueprintBuilder.jsx';
import { SiteReportDetective } from '../simulations/SiteReportDetective.jsx';

export const STATIONS = [
  { id: 0, archetype: 'discovery',       icon: '🟦', name: 'Station A: The Square Secret Lab', sub: 'Squares on the sides prove the rule',    Comp: SquareSecretLab },
  { id: 1, archetype: 'build-to-target', icon: '🪜', name: 'Station B: Ladder Lock-In',        sub: 'Place the ladder to reach the ledge',     Comp: LadderLockIn },
  { id: 2, archetype: 'composite',       icon: '🏗️', name: 'Station C: Blueprint Builder',     sub: 'Two right triangles, one solution',       Comp: BlueprintBuilder },
  { id: 3, archetype: 'error-detective', icon: '📋', name: "Station D: Foreman Tally's Site Report", sub: 'Find the slip in the working',      Comp: SiteReportDetective },
];
```
The tab list stays freely clickable (reference behaviour); the "Go to Practice" CTA is gated on `simCompleted.every(Boolean)`; `simStationIntro(i)` narrates when a station is opened.

### 5.4 `QuestionRenderer.jsx`
Same layout as the reference (concept pill → question → diagram panel → optional hint banner → 2×2 options → hint button). Changes: `AngleVisual` → `TriangleVisual`; the diagram panel uses `max-h-[32dvh]`; options `min-h-[52px]`, `text-base` minimum; the concept pill shows the world concept (never the reason for the answer); hint banner text `text-sm` minimum. In `compact` contexts the diagram carries a "not to scale" caption.

### 5.5 `PlayPhase.jsx` — Boss Battle fix and scoring through the reducer
The session state machine becomes explicit. *(spec)*

```jsx
// state: mode, activeWorld (null = map), bossIntroFor (null | worldIdx), questions, qIdx, lives, correctInSession…
const startWorldSession = (worldIdx, modeId = selectedMode) => {
  const cfg = MODES.find(m => m.id === modeId);
  setQuestions(generateSession(worldIdx, cfg.questions, rngRef.current));   // §6.5, de-duplicated
  setQIdx(0); setSelectedOption(null); setFeedback(null); setHintLevel(0);
  setCorrectInSession(0); setTimeLeft(60); setLives(cfg.lives ?? 3);
  if (modeId === 'boss') setBossIntroFor(worldIdx);   // quiz stays hidden until the player confirms
  else setActiveWorld(worldIdx);
};

{bossIntroFor !== null && (
  <BossBattleModal
    boss={DISTRICTS[bossIntroFor].boss}              // <- was DISTRICTS[activeWorld]?.boss, always undefined
    lives={3}
    onStart={() => { setActiveWorld(bossIntroFor); setBossIntroFor(null); }}
    onClose={() => setBossIntroFor(null)} />
)}
```
Boss rules: a wrong answer costs a life; at 0 lives the session ends immediately with a "The boss got away — try again" overlay (no star update); surviving all 5 questions with ≥ 1 life is a win → `dispatch({type:'UPDATE_WORLD_RESULT', payload:{worldIdx, stars: calcStars(correct), bossWon:true}})`. Timed mode: effect depends on `[activeWorld, selectedMode, feedback]` and uses a ref for `correctInSession`; the interval callback must not call `finishQuizSession` from inside a state updater (side-effect in an updater double-fires in StrictMode).
Scoring: `onAnswer(isCorrect, xpDelta)` → `dispatch`. The badge overlay shows `state.badgeToast[0]` and calls `CLEAR_FEEDBACK` on dismiss. Copy: "Clue Solved! 🎯" → "Length Found! 📏", "Not Quite! 🔍" → "Check the working! 🔧", "Out of Detective Lives!" → "Out of Safety Lives!".

### 5.6 `ReflectPhase.jsx`
`RECAP_QUESTIONS` per PRD §7.5 (ids `r1…r3`, `correct` as the option text). Scorecard: XP / `⭐ n / 30` / best streak / badges. Reflection placeholder: "Dear Foreman Tally, the hypotenuse is always… because…" (min 10 characters). Replace `max-h-[94vh]` and `w-screen h-screen` (celebration) with the dvh classes of §10.2.

### 5.7 Other components
`IntroScreen` (copy: "SideQuest — Grade 8 Maths", "Start the Job"), `BadgesModal` (copy), `BossBattleModal` ("🚨 BOSS ON SITE", "This boss has scrambled the measurements across the site! Answer 5 questions with 3 lives to earn the … badge!"), `FeedbackOverlay` and `Mascot` reuse. `useViewport` gains `isNarrow` (< 480), `isCompactHeight` (< 520) alongside the existing flags.

---

## 6. Data Layer

### 6.1 `config/worlds.config.js`
Ten entries in the fixed shape `{ id, name, emoji, accent, description, conceptFocus, boss: { name, emoji, reward } }`, copied from PRD §8 (accents unchanged from the product palette):

```js
export const WORLDS = [
  { id: 0, name: 'Square Station',        emoji: '🟦', accent: '#f472b6', conceptFocus: 'squares-and-roots',        description: 'Squares to 20², square roots of perfect squares, √ estimated between whole numbers.', boss: { name: 'Rootless Rex',        emoji: '🦖', reward: 'Root Ranger' } },
  { id: 1, name: 'Hypotenuse Harbour',    emoji: '⚓', accent: '#fb923c', conceptFocus: 'identify-hypotenuse',      description: 'Name the right angle, hypotenuse and legs in any orientation and labelling.',          boss: { name: 'The Mix-Up Mimic',    emoji: '🎭', reward: 'Hypotenuse Hunter' } },
  { id: 2, name: 'Longest-Side Lane',     emoji: '📏', accent: '#fbbf24', conceptFocus: 'find-hypotenuse-exact',    description: 'Add the squares, then square root — whole-number answers.',                          boss: { name: 'Long-Shot Larry',     emoji: '🏹', reward: 'Add-and-Root Ace' } },
  { id: 3, name: 'Shorter-Side Street',   emoji: '🧱', accent: '#4ade80', conceptFocus: 'find-leg-exact',           description: 'Subtract the squares, then square root — whole-number answers.',                     boss: { name: 'The Shortchanger',    emoji: '🪙', reward: 'Leg-Length Legend' } },
  { id: 4, name: 'Triple Tower',          emoji: '🗼', accent: '#38bdf8', conceptFocus: 'triples-and-method',       description: 'Pythagorean triples and their multiples; choosing add vs subtract.',                 boss: { name: 'Triple Trouble Trio', emoji: '🎲', reward: 'Triple Tracker' } },
  { id: 5, name: 'Decimal Docks',         emoji: '🚢', accent: '#818cf8', conceptFocus: 'decimal-answers',          description: 'Non-perfect-square answers, correct to 1 decimal place.',                            boss: { name: 'The Decimal Dodger',  emoji: '🎯', reward: 'Precision Pilot' } },
  { id: 6, name: 'Double-Triangle Depot', emoji: '🔺', accent: '#c084fc', conceptFocus: 'composite-two-triangles',  description: 'Two right triangles in one figure: isosceles height, rectangle diagonals, chains.',  boss: { name: 'The Double Decker',   emoji: '🚌', reward: 'Two-Triangle Tamer' } },
  { id: 7, name: 'Ladder & Ramp Yard',    emoji: '🪜', accent: '#22d3ee', conceptFocus: 'real-world-structures',    description: 'Ladders, ramps, stay-wires, flagpoles, roof trusses.',                              boss: { name: 'The Ramp Raider',     emoji: '🚧', reward: 'Site Safety Star' } },
  { id: 8, name: 'Shortcut City',         emoji: '🌆', accent: '#facc15', conceptFocus: 'real-world-distance',      description: 'Diagonals, TV screens, grid distances, shortcut-versus-detour, drone routes.',      boss: { name: 'Shortcut Shifty',     emoji: '🧭', reward: 'Shortcut Specialist' } },
  { id: 9, name: 'Grand Skyline Finale',  emoji: '🏙️', accent: '#f43f5e', conceptFocus: 'mixed-review',             description: 'Hardest boss; mixes every question type from worlds 0–8.',                          boss: { name: 'The Skyline Saboteur', emoji: '🦹', reward: 'Master Surveyor' } },
];
```

### 6.2 `config/characters.config.js`
```js
export const CHARACTERS = {
  priya: { name: 'Priya',  role: 'Junior Surveyor', emoji: '👧', colour: '#f472b6', mascotEmoji: '🦉', bio: 'Tiles, sketches and checks every answer twice.' },
  hafiz: { name: 'Hafiz',  role: 'Junior Surveyor', emoji: '👦', colour: '#38bdf8', mascotEmoji: '🦉', bio: 'Loves tape measures, ramps and shortcuts.' },
  tally: { name: 'Foreman Tally', role: 'Site Foreman & Mentor', emoji: '🦉', colour: '#facc15', mascotEmoji: '🦉', bio: 'Hard hat, measuring tape, and a nose for the hypotenuse.' },
};
export const MASCOT = { name: 'Tally', title: 'Foreman Tally', emoji: '🦉', badge: 'Skyline Survey Crew' };
```

### 6.3 `data/storyContent.js`
`STORY_PANELS` — **length 6**, shape `{ panel, id, title, text, highlight, character, characterEmoji, image, imageBg, imageEmoji, bubble }` (the reference's shape; `image` and `bubble` are retained because `StoryPhase` renders them). Everything shown on screen has a spoken equivalent in `narration.js` via `speak()`.

| panel | title | text (on-screen) | highlight | character · bubble |
|---|---|---|---|---|
| 1 | The Length You Can't Measure | "Priya and Hafiz start on Foreman Tally's Skyline Survey Crew. First job: a 5 m ladder rests on an HDB wall, its foot 3 m from the wall. The top is out of reach — how high does it go without anyone climbing up?" | "Surveyors don't climb — they calculate." | Priya · "Two lengths we can measure, one we can't. There must be a rule!" |
| 2 | Meet the Right-Angled Triangle | "The wall, the ground and the ladder make a right-angled triangle. The side opposite the right angle is the hypotenuse — always the longest side. The other two sides are the legs. Turn the triangle any way you like: in triangle PQR with the right angle at Q, the hypotenuse is PR." | "The hypotenuse always sits opposite the right angle." | Foreman Tally · "Don't look for the slanted side — look for the right angle, then go straight across!" |
| 3 | The Square Secret | "Build a square on each side of a 3-4-5 triangle. The small squares hold 9 and 16 tiles; the big square holds 25. Nine plus sixteen is twenty-five! This is Pythagoras' theorem: a² + b² = c², where c is the hypotenuse. It only works when there is a right angle." | "a² + b² = c² — squares on the legs fill the square on the hypotenuse." | Hafiz · "The two small squares exactly fill the big one. That's no accident!" |
| 4 | Finding the Longest Side | "To find the hypotenuse, add the squares of the legs, then take the square root. Legs 5 and 12: 25 + 144 = 169, and √169 = 13. Not every answer is a whole number: legs 4 and 6 give 16 + 36 = 52, so the hypotenuse is √52 ≈ 7.2 (correct to 1 decimal place)." | "Add the squares, then take the square root." | Priya · "Use the exact 52 until the very end — round once, at the last step!" |
| 5 | Finding a Shorter Side | "To find a leg, subtract instead. Hypotenuse 13, one leg 5: 169 − 25 = 144, and √144 = 12. Back to our ladder: 25 − 9 = 16, √16 = 4, so it reaches 4 m! Quick check: the hypotenuse must be the longest side — if your 'shorter' side comes out longer, something went wrong." | "Hypotenuse unknown? Add. A leg unknown? Subtract." | Hafiz · "4 metres. Nobody climbed a thing!" |
| 6 | Job Done… For Now | "You can name the hypotenuse, choose add or subtract, and take the square root. But how do you know a triangle is right-angled in the first place? And what if you only know one side and an angle? Those are jobs for another day. Grab your hard hat — the Site Lab is open!" | "Name the hypotenuse, add or subtract the squares, take the root." | Foreman Tally · "Hard hats on — into the Site Lab!" |

`imageBg`/`imageEmoji` fallbacks: `#1e143c 🪜`, `#180c3c 📐`, `#201040 🟦`, `#160a36 🚩`, `#1f1048 📏`, `#221150 🏗️`.

### 6.4 `utils/pythagorasMath.js` — single source of maths truth

✅ *executed* — pools and validators below were run in a 300-seed prototype (18 000 generated questions, 0 failures; sizes: 17 triples with c ≤ 41, 156 decimal-hypotenuse pairs, 213 decimal-leg pairs). The prototype also showed why the checks exist: floating-point scaling, `.0`-looking answers and boundary roundings are all excluded by construction.

```js
// utils/pythagorasMath.js — single source of maths truth (pure functions, no React).
// Used by the question generator, the four Simulate stations and the stress test.

export const sum = arr => arr.reduce((s, x) => s + x, 0);
export const sq = n => n * n;

/** Integer square root if n is a perfect square, else null (safe for n up to ~1e6). */
export const intSqrt = n => {
  if (!Number.isInteger(n) || n < 0) return null;
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : null;
};
export const isPerfectSquare = n => intSqrt(n) !== null;

/** Round to 1 d.p. from an exact squared value — never from an already-rounded intermediate. */
export const root1dp = n2 => Math.round(Math.sqrt(n2) * 10) / 10;
export const fmt1 = x => x.toFixed(1);
/** Minimal-decimals formatter for exact answers: 6 → "6", 2.5 → "2.5" */
export const fmtExact = x => (Number.isInteger(x) ? String(x) : String(Math.round(x * 10) / 10));

/* ------------------------------------------------------------------ pools */

/** All integer triples a<b<c with c <= limit, sorted by c then a. */
export function buildTriples(limit) {
  const out = [];
  for (let a = 3; a < limit; a++) {
    for (let b = a + 1; b < limit; b++) {
      const c = intSqrt(a * a + b * b);
      if (c !== null && c <= limit) out.push([a, b, c]);
    }
  }
  return out.sort((x, y) => x[2] - y[2] || x[0] - y[0]);
}
export const TRIPLES = buildTriples(41); // 17 triples — the curated "clean" pool for exact worlds

/** Scale factors allowed in real-world worlds (contexts such as 2.5 m, 6.5 m). */
export const REAL_WORLD_SCALES = [1, 0.5, 0.1, 10];
export const scaleTriple = ([a, b, c], s) => [a, b, c].map(v => Math.round(v * s * 10) / 10);

/** Exact check in tenths so 0.1/0.5 scaling never suffers floating-point error. */
export function isExactTriangle({ a, b, c }) {
  const [ta, tb, tc] = [a, b, c].map(v => Math.round(v * 10));
  return ta > 0 && tb > 0 && tc > ta && tc > tb && ta * ta + tb * tb === tc * tc;
}

/** True when rounding √n2 to 1 d.p. is unambiguous (not within 0.005 of an xx.x5 boundary)
 *  and the 1 d.p. result does not look like an integer (no "7.0"). */
export function isClean1dp(n2) {
  const x = Math.sqrt(n2) * 10;
  const frac = x - Math.floor(x);
  const robust = Math.abs(frac - 0.5) > 0.05;
  const looksInteger = Math.round(x) % 10 === 0;
  return robust && !looksInteger && !isPerfectSquare(n2);
}

/** Decimal-hypotenuse pool: legs 2..20 (a<=b), c² not a perfect square, clean 1 d.p. */
export function buildDecimalHyp(maxLeg = 20) {
  const out = [];
  for (let a = 2; a <= maxLeg; a++) for (let b = a; b <= maxLeg; b++) {
    const c2 = a * a + b * b;
    if (isClean1dp(c2)) out.push({ a, b, c2, answer: root1dp(c2) });
  }
  return out;
}
/** Decimal-leg pool: hypotenuse c <= maxC, known leg b < c, c²−b² not a perfect square, clean 1 d.p. */
export function buildDecimalLeg(maxC = 25) {
  const out = [];
  for (let c = 4; c <= maxC; c++) for (let b = 2; b < c; b++) {
    const d2 = c * c - b * b;
    if (isClean1dp(d2)) out.push({ c, b, d2, answer: root1dp(d2) });
  }
  return out;
}
export const DECIMAL_HYP = buildDecimalHyp(20); // 156 entries
export const DECIMAL_LEG = buildDecimalLeg(25); // 213 entries

/* ------------------------------------------------- orientation & labelling */

export const LABEL_SETS = [['P','Q','R'], ['A','B','C'], ['X','Y','Z'], ['L','M','N'], ['D','E','F']];
export const ROTATIONS = [0, 90, 180, 270, 25, -25, 155, 205]; // degrees; hypotenuse is NOT always the bottom-right slant

/** Pick vertex letters and put the right angle at a random vertex.
 *  hypotenuse = the side joining the two non-right vertices. */
export function genLabels(rng) {
  const set = rng.pick(LABEL_SETS);
  const rightIdx = rng.int(0, 2);
  const right = set[rightIdx];
  const others = set.filter((_, i) => i !== rightIdx);
  return {
    vertices: set, right,
    hyp: others.join(''),
    legs: others.map(v => [right, v].join('')).map(s => s),
    rotation: rng.pick(ROTATIONS),
  };
}

/* --------------------------------------------------------------- options */

/**
 * Build 4 distinct options: 1 correct + 3 distractors.
 * misconceptions: values in priority order (already numeric); fillers are offsets.
 * mode 'int'   → integer-valued options only (exact triangle questions)
 * mode 'mixed' → any positive value, minimal decimals (World 0 number-fluency items, e.g. a halved 84.5)
 * mode 'dec1'  → every option formatted to exactly 1 d.p.
 */
export function makeOptions(correct, misconceptions, rng, { mode = 'int', unit = '' } = {}) {
  const fmt = mode === 'dec1' ? fmt1 : fmtExact;
  const label = v => (unit ? `${fmt(v)} ${unit}` : fmt(v));
  const ok = v => Number.isFinite(v) && v > 0 && (mode !== 'int' || Number.isInteger(v));
  const seen = new Set([label(correct)]);
  const picked = [];
  const tryAdd = v => {
    if (picked.length >= 3 || !ok(v)) return;
    const key = label(v);
    if (seen.has(key)) return;
    // decimal worlds: keep non-rounding distractors at least 0.3 from the correct value
    if (mode === 'dec1' && Math.abs(v - correct) < 0.3 && !misconceptions.includes(v)) return;
    seen.add(key); picked.push(v);
  };
  misconceptions.forEach(tryAdd);
  const fillers = mode === 'dec1' ? [0.3, -0.3, 0.5, -0.5, 1, -1, 2, -2] : [1, -1, 2, -2, 5, -5, 10, -10];
  rng.shuffle(fillers).forEach(d => tryAdd(correct + d));
  const options = rng.shuffle([correct, ...picked]).map(label);
  return { options, correctAnswer: label(correct) };
}

/* ------------------------------------------------------------ validators */

/** Independent recomputation used by the stress test: returns the answer implied by visualData. */
export function answerFromVisualData(vd) {
  switch (vd.find) {
    case 'hyp': return vd.mode === 'dec1' ? root1dp(sq(vd.a) + sq(vd.b)) : Math.sqrt(sq(vd.a) + sq(vd.b));
    case 'leg': return vd.mode === 'dec1' ? root1dp(sq(vd.c) - sq(vd.b)) : Math.sqrt(sq(vd.c) - sq(vd.b));
    default: return null;
  }
}
export function validateRightTriangleData(vd) {
  if (vd.find === 'hyp') {
    if (vd.mode === 'dec1') return isClean1dp(sq(vd.a) + sq(vd.b));
    return isExactTriangle({ a: vd.a, b: vd.b, c: Math.sqrt(sq(vd.a) + sq(vd.b)) });
  }
  if (vd.find === 'leg') {
    if (!(vd.c > vd.b)) return false;                       // hypotenuse must be strictly longest
    if (vd.mode === 'dec1') return isClean1dp(sq(vd.c) - sq(vd.b));
    return isExactTriangle({ a: Math.sqrt(sq(vd.c) - sq(vd.b)), b: vd.b, c: vd.c });
  }
  return false;
}
```

**Hard rules this module enforces** (mirrors PRD §8): (1) exact triangle questions use `TRIPLES` only, scaled triples only ×0.5 / ×0.1 / ×10 in real-world items and validated in tenths; (2) decimal items come from `DECIMAL_HYP` / `DECIMAL_LEG`, answers computed from the exact squared value; (3) the hypotenuse is strictly the longest side (`validateRightTriangleData`); (4) labels, right-angle vertex and rotation are randomised (`genLabels`) so `c`/"bottom"/"slanted" never equals "hypotenuse"; (5) `makeOptions` returns four distinct displayed options; decimal options all have exactly one decimal place.

### 6.5 `data/questionBank.js`

Exports (names fixed by the reference callers): `DISTRICTS` (derived from `WORLDS` as `{ id, name, icon, boss }`), `generateQuestion(worldId, qIdxInWorld, rng)`, `generateBank(seed)`, `questionBank`, plus new `generateSession(worldIdx, count, rng)` used by `PlayPhase` (picks `count` templates for the world without repeating a `questionText`, retrying a template up to 20 times).

Schema (fixed): `{ id, districtId, category, visual, questionText, options[4], correctAnswer, explanation, hint1, hint2, visualData }`. `visualData` always carries `find`, `mode` and the raw numbers so `answerFromVisualData` can recompute the answer in tests.

Per-world templates (each ≥ 3 so 10 questions can be distinct; the **world's 10 `questionText`s must all differ**):

| World | Templates | Misconception distractors |
|---|---|---|
| 0 Square Station | `square-of` ("13² = ?"); `root-of-perfect-square`; `between-roots` ("√50 lies between…", visual `number-line`); `which-is-perfect-square` | n×2, n+1/n−1 neighbours, digit-swap of the square, n/2 (mode `mixed`) |
| 1 Hypotenuse Harbour | `name-hypotenuse` (vertices + right-angle vertex); `name-leg`; `diagram-hypotenuse` (rotated triangle, pick the side); `which-is-longest`; `when-does-it-apply` (four small triangles, one right-angled) | a side touching the right angle; the side that "looks" slanted/bottom; "it depends how it is drawn" |
| 2 Longest-Side Lane | `find-hyp-exact` — 3 phrasings: labelled triangle, "legs" words, diagram with `x` | `a+b`; `a²+b²` (no root); `|a−b|` |
| 3 Shorter-Side Street | `find-leg-exact` — labelled triangle, diagram with `x`, "hypotenuse … one leg …" words | `c−a`; `c²−a²` (no root); `c+a` |
| 4 Triple Tower | `is-triple` (one triple + three near-misses); `scaled-triple-hyp` (6, 8 → 10 using 3-4-5); `scaled-triple-leg`; `add-or-subtract` (diagram with `x` on a leg → "subtract the squares") | near-miss sets whose squares differ by 1–2 units; wrong operation |
| 5 Decimal Docks | `find-hyp-dec1` (diagram + words); `find-leg-dec1` (words/ladder); `round-the-root` ("√74 to 1 d.p.") | `a+b`; `c²` unrooted; the subtract-instead answer; the ±0.1 rounding slip |
| 6 Double-Triangle Depot | `isosceles-height` (rafter c, base 2a → height b); `rectangle-diagonal` (and its inverse: diagonal + one side → other side); `two-step-chain` (T1 → T2 from `buildChains()`, §7.3) | didn't halve the base; `c−a`; stopped after step 1; added the wrong pair |
| 7 Ladder & Ramp Yard | `ladder-height`, `ladder-foot`, `ramp-length`, `stay-wire-pole`, `roof-truss-rise` (scaled triples) | same families as worlds 2–3, in context |
| 8 Shortcut City | `tv-diagonal`; `field-shortcut-saving` (sum − diagonal); `grid-distance` (two grid points); `drone-route` (north then east → direct) | sum of legs; unrooted; difference instead of saving |
| 9 Grand Skyline Finale | One draw from each of worlds 0–8 (9 items) plus one extra from worlds 5–6; shuffled; guarantees ≥ 5 (in practice 9) source worlds | as source template |

**Visual types** (`visual` field) and their `visualData`:

| `visual` | data | notes |
|---|---|---|
| `right-triangle` | `{ find, mode, a, b, c, labels:{vertices,right,hyp,legs,rotation}, unknown:'a'|'b'|'c' }` | square marker at the right angle; unknown shown as `x` or `?` |
| `triangle-squares` | `{ a, b, tiles:boolean }` | Wonder/Story/Station A |
| `ladder`, `ramp`, `flagpole`, `roof-truss` | `{ find, mode, … lengths, unit }` | simple illustrative SVGs reusing the same arc/label helpers |
| `rectangle-diagonal`, `tv-screen`, `field-shortcut`, `grid-path` | `{ w, h, … }` | `grid-path` draws a unit grid |
| `chain-quad` | `{ ab, bc, cd, rightAtB, rightAtC, find:'AD' }` | Station C build 2 and World 6 |
| `isosceles-height` | `{ equal, base, find:'height' }` | dashed height with the half-base annotated |
| `number-line` | `{ n }` | World 0 `between-roots` |

`TriangleVisual.jsx`: pure SVG, `viewBox="0 0 360 240"` (slightly wider than the reference's 320×220 to fit labels such as `PR = x`), colours from CSS variables only, `compact` prop for Play (smaller strokes/labels), text label on every side (never colour alone), right-angle square marker, "not to scale" caption. Rotation is applied with an SVG `transform="rotate(r cx cy)"` and labels counter-rotated so text stays upright.

**Generator patterns** — two templates, ✅ *executed* in the stress prototype (these are the exact-answer and decimal templates; the remaining ~30 follow the same shape):

```js
// Prototype of 3 templates to prove the pools, options and validators hold under stress.
import { TRIPLES, DECIMAL_HYP, DECIMAL_LEG, genLabels, makeOptions, sq, fmtExact, fmt1, scaleTriple } from './pythagorasMath.js';

export function tFindHypExact(rng) {
  const [a0, b0, c] = rng.pick(TRIPLES);
  const [a, b] = rng.next() < 0.5 ? [a0, b0] : [b0, a0];
  const lab = genLabels(rng);
  const { options, correctAnswer } = makeOptions(c, [a + b, sq(a) + sq(b), Math.abs(b - a)], rng, { unit: 'cm' });
  return {
    category: 'find-hypotenuse-exact', visual: 'right-triangle',
    questionText: `In triangle ${lab.vertices.join('')}, the right angle is at ${lab.right}. ${lab.legs[0]} = ${a} cm and ${lab.legs[1]} = ${b} cm. Find ${lab.hyp}.`,
    options, correctAnswer,
    explanation: `${sq(a)} + ${sq(b)} = ${sq(c)}, so ${lab.hyp} = √${sq(c)} = ${c} cm.`,
    hint1: `${lab.hyp} is opposite the right angle, so it is the hypotenuse. Add the squares of the two legs.`,
    hint2: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${sq(a) + sq(b)}. Now take the square root.`,
    visualData: { find: 'hyp', mode: 'int', a, b, c, labels: lab },
  };
}
export function tFindLegExact(rng) {
  const [a0, b0, c] = rng.pick(TRIPLES);
  const [known, unknown] = rng.next() < 0.5 ? [a0, b0] : [b0, a0];
  const lab = genLabels(rng);
  const { options, correctAnswer } = makeOptions(unknown, [c - known, sq(unknown), c + known], rng, { unit: 'cm' });
  return {
    category: 'find-leg-exact', visual: 'right-triangle',
    questionText: `In triangle ${lab.vertices.join('')}, the right angle is at ${lab.right}. ${lab.hyp} = ${c} cm and ${lab.legs[0]} = ${known} cm. Find ${lab.legs[1]}.`,
    options, correctAnswer,
    explanation: `${sq(c)} − ${sq(known)} = ${sq(unknown)}, so ${lab.legs[1]} = √${sq(unknown)} = ${unknown} cm.`,
    hint1: `${lab.hyp} is the hypotenuse. To find a shorter side, subtract the squares.`,
    hint2: `${c}² − ${known}² = ${sq(c)} − ${sq(known)} = ${sq(c) - sq(known)}. Now take the square root.`,
    visualData: { find: 'leg', mode: 'int', b: known, c, a: unknown, labels: lab },
  };
}
export function tFindHypDecimal(rng) {
  const e = rng.pick(DECIMAL_HYP);
  const { a, b, c2, answer } = e;
  const lab = genLabels(rng);
  const { options, correctAnswer } = makeOptions(answer, [a + b, c2, Math.round(Math.sqrt(Math.abs(b * b - a * a)) * 10) / 10, Math.round((answer + 0.1) * 10) / 10], rng, { mode: 'dec1', unit: 'cm' });
  return {
    category: 'find-hypotenuse-decimal', visual: 'right-triangle',
    questionText: `The legs of a right-angled triangle are ${a} cm and ${b} cm. Find the hypotenuse, correct to 1 decimal place.`,
    options, correctAnswer,
    explanation: `${a}² + ${b}² = ${c2}, so the hypotenuse = √${c2} ≈ ${fmt1(answer)} cm (1 d.p.).`,
    hint1: 'The hypotenuse is opposite the right angle: add the squares of the legs, then take the square root.',
    hint2: `${a}² + ${b}² = ${sq(a)} + ${sq(b)} = ${c2}. Use √${c2}.`,
    visualData: { find: 'hyp', mode: 'dec1', a, b, labels: lab },
  };
}
export function tFindLegDecimal(rng) {
  const e = rng.pick(DECIMAL_LEG);
  const { c, b, d2, answer } = e;
  const { options, correctAnswer } = makeOptions(answer, [c - b, c + b, d2, Math.round(Math.sqrt(c * c + b * b) * 10) / 10], rng, { mode: 'dec1', unit: 'm' });
  return {
    category: 'find-leg-decimal', visual: 'ladder',
    questionText: `A ladder ${c} m long leans against a wall. Its foot is ${b} m from the wall. How high up the wall does it reach? Give your answer correct to 1 decimal place.`,
    options, correctAnswer,
    explanation: `${c}² − ${b}² = ${d2}, so the height = √${d2} ≈ ${fmt1(answer)} m (1 d.p.).`,
    hint1: 'The ladder is the hypotenuse. To find a shorter side, subtract the squares.',
    hint2: `${c}² − ${b}² = ${sq(c)} − ${sq(b)} = ${d2}. Use √${d2}.`,
    visualData: { find: 'leg', mode: 'dec1', c, b, labels: null },
  };
}
export function tRealWorldScaled(rng) {
  const [a0, b0, c0] = rng.pick(TRIPLES.filter(t => t[2] <= 13));
  const s = rng.pick([0.5, 0.1]);
  const [a, b, c] = scaleTriple([a0, b0, c0], s);
  const { options, correctAnswer } = makeOptions(b, [Math.round((c - a) * 10) / 10, Math.round((c + a) * 10) / 10, Math.round(b * b * 10) / 10], rng, { mode: s === 1 ? 'int' : 'dec1', unit: 'm' });
  return { category: 'real-world', visual: 'flagpole', options, correctAnswer, visualData: { find: 'leg', mode: 'dec1', c, b: a } };
}
```

---

## 7. Simulate Station Specs

### 7.0 Shared contract and kit
Each station: `<Station onComplete={fn} audioEnabled={bool} />`; self-contained state; SVG visuals using CSS variables; a `StationSuccess` panel with the button "Complete Station ✓" calling `onComplete`; every drag control paired with 44 px −/+ buttons and arrow keys (`Shift` = bigger step); pointer maths via `svg.getScreenCTM().inverse()` (as the reference does); `aria-live="polite"` region for feedback. `kit.jsx` keeps `Panel / Node / Msg / GoldBtn / GhostBtn` and replaces `AngleSlider` with `NumberSlider({ value, min, max, step, unit, onChange, label })` (controls ≥ 44 px, value text ≥ 16 px, `title`/`aria-label` generated from the unit).
`useStationNarration(stationIdx, audioEnabled)` returns `say(eventKey, text)`; stations call it on open, on each correct/incorrect step and on completion (fixes §1.2 #4). Narration strings come from `narration.js` so `generate_audio.js` pre-generates the fixed ones.

### 7.1 Station A · `SquareSecretLab` (Concept Discovery)
State: `a, b` (1–12), `stage` (`tiles` | `bender`), `poured`, `pairsSeen:Set<'a-b'>`, `sawTriple`, `sawNonTriple`, `theta` (40–140, step 5), `nonRightSeen:Set`, `lockedAt90`, `confirmed`.
Geometry (SVG units, scale `s = min(maxW/(a+b+…), …)`): right angle at `C=(x0,y0)`, `B=C+(a·s,0)`, `A=C−(0,b·s)`. Square on a side: for side `P→Q` with unit normal `n` pointing **away** from the opposite vertex, the square is `[P, Q, Q+n·L, P+n·L]`, `L=|PQ|`. Tile grids: unit lines at every `s` along both axes for the two leg squares; the hypotenuse square gets a rotated unit grid only if `intSqrt(a²+b²) !== null`, otherwise a plain tinted square with the counter `c² = N square units → c ≈ root1dp(N)`.
Stage 1 "Pour": the two leg squares' tiles animate into a tile counter `a² + b²`; `prefers-reduced-motion` → step-through buttons. Gate conditions (all must hold): `pairsSeen.size ≥ 4`, `sawTriple && sawNonTriple`.
Stage 2 "Angle Bender": fixed `a=3, b=4`; angle θ between the legs; `c² = a² + b² − 2ab·cosθ` (law of cosines, used only to draw — never shown); bars `a²+b²` vs `c²`; snap-to-90 magnet within ±2°; gate: `nonRightSeen.size ≥ 2` and `lockedAt90`.
Confirmation MCQ: "`a² + b² = c²` works only when…" → **the triangle has a right angle** / the triangle is isosceles / all sides are whole numbers / the hypotenuse is 5. Wrong → `Msg` + retry; no penalty. Success when all three gates pass.

### 7.2 Station B · `LadderLockIn` (Build-to-Target)
Round data from `TRIPLES` (rounds 1–2) and `DECIMAL_LEG` (round 3), chosen by a seeded RNG each time "New job" is pressed; round 3 is the decimal item `{ c: ladder, b: ledgeHeight }` (e.g. 10 m, 9 m → foot √19 ≈ 4.4 m).
State: `foot` (rounds 1–2 step 1; round 3 step 0.1, via `NumberSlider`), `round (0–2)`, `done[3]`. Kinematics: ladder length `L` fixed; foot `d`; top height `h = √(L² − d²)` if `d < L`, else "the ladder can't reach". SVG: wall (right), ground, ladder from `(x−d·s, ground)` to `(wall, ground − h·s)`, ledge marker at target height `H`.
Readout: `foot² + height² = ladder²` with live numbers (2 d.p. only in the readout during round 3). Ring: amber when `|h − H| ≤ 1` (round 3: `≤ 0.5`), green on success. **Check** accepts `|d − exact| ≤ 0.05` (round 3) or `d === exact` (rounds 1–2), computed in tenths. Gate: three rounds succeeded.

### 7.3 Station C · `BlueprintBuilder` (Composite)
Builds come from `stationCases.js` using seeded pools: **isosceles roof** (any `TRIPLES` entry with either leg as half-span → 34 variants) and **two-triangle chain** (`buildChains()`: hypotenuse of triangle 1 is a leg of triangle 2, triangle 2 hypotenuse ≤ 65 → 17 variants; 10 if both ≤ 41). ✅ *executed*:

```js
export function buildChains(triples = TRIPLES, limit2 = 65) {
  const T2 = buildTriples(limit2), out = [];
  for (const t1 of triples) for (const t2 of T2) {
    if (t1 === t2) continue;
    if (t2[0] === t1[2]) out.push({ t1, given2: t2[1], leg2: t2[0], ans: t2[2] });
    else if (t2[1] === t1[2]) out.push({ t1, given2: t2[0], leg2: t2[1], ans: t2[2] });
  }
  return out;
}
```
Step machine per build (`steps[]`, each `{ prompt, choices, correct }`; wrong choice → shake + hint, never a fail state):
- **Roof:** ① drop the centre post (button) → ② pick the right triangle's hypotenuse (rafter) and leg (half-span) on the diagram → ③ "subtract the squares" (vs add / subtract the sides) → ④ `NumberSlider` answer (exact).
- **Chain:** ① find the first unknown (add) → value appears on the diagram → ② pick the new leg → ③ add → ④ answer.
Progress lamps (1–4). Gate: one roof build **and** one chain build completed (so both *subtract* and *add* are used).

### 7.4 Station D · `SiteReportDetective` (Error-Detective)
✅ *executed* — `stationCases.js` `buildCase(rng, type)`; five error types; each case carries its raw numbers in `data`, and the test proves the faulty line is wrong and the fix is right independently (1 500 cases, 0 failures):

```js
// Station D case builder (data-driven). Every case carries its raw numbers in `data` so tests can recompute independently.
import { TRIPLES, DECIMAL_HYP, sq, intSqrt, root1dp, fmt1, fmtExact } from './pythagorasMath.js';

export const ERROR_TYPES = ['added-instead-of-subtracted', 'skipped-square-root', 'wrong-hypotenuse', 'squaring-slip', 'rounding-slip'];
const rootText = n2 => (intSqrt(n2) !== null ? `√${n2} = ${intSqrt(n2)}` : `√${n2} ≈ ${fmt1(root1dp(n2))}`);

export function buildCase(rng, type) {
  const [a0, b0, c] = rng.pick(TRIPLES);
  const swap = rng.next() < 0.5, a = swap ? b0 : a0, b = swap ? a0 : b0;
  let lines, faultyIdx, correct, wrong;

  if (type === 'added-instead-of-subtracted') {              // leg problem: hypotenuse c, known leg a, unknown leg b
    const bad2 = sq(c) + sq(a);
    lines = [
      `Hypotenuse = ${c} cm, known leg = ${a} cm, unknown leg = x`,
      `Rule: add the squares, x² = ${c}² + ${a}²`,
      `x² = ${sq(c)} + ${sq(a)} = ${bad2}`,
      `x ${intSqrt(bad2) !== null ? '=' : '≈'} ${intSqrt(bad2) !== null ? intSqrt(bad2) : fmt1(root1dp(bad2))} cm`];
    faultyIdx = 1;
    correct = `Rule: subtract the squares, x² = ${c}² − ${a}²`;
    wrong = [`Rule: subtract the squares, x² = ${a}² − ${c}²`, `Rule: subtract the sides, x = ${c} − ${a}`];
  } else if (type === 'skipped-square-root') {               // hypotenuse problem
    lines = [`Legs = ${a} cm and ${b} cm, hypotenuse = h`, `Rule: add the squares, h² = ${a}² + ${b}²`, `h² = ${sq(a)} + ${sq(b)} = ${sq(c)}`, `h = ${sq(c)} cm`];
    faultyIdx = 3;
    correct = `h = √${sq(c)} = ${c} cm`;
    wrong = [`h = ${sq(c)} ÷ 2 = ${fmtExact(sq(c) / 2)} cm`, `h = ${a} + ${b} = ${a + b} cm`];
  } else if (type === 'wrong-hypotenuse') {                  // hypotenuse problem; mislabels the longest GIVEN side as the hypotenuse
    const lo = Math.min(a, b), hi = Math.max(a, b), d2 = sq(hi) - sq(lo);   // hi > lo always, so d2 > 0
    lines = [`Hypotenuse = ${hi} cm (the longest side given), legs = ${lo} cm and h`, `Rule: subtract the squares, h² = ${hi}² − ${lo}²`, `h² = ${sq(hi)} − ${sq(lo)} = ${d2}`, `h ${intSqrt(d2) !== null ? '=' : '≈'} ${intSqrt(d2) !== null ? intSqrt(d2) : fmt1(root1dp(d2))} cm`];
    faultyIdx = 0;
    correct = `h is opposite the right angle, so h is the hypotenuse; legs = ${lo} cm and ${hi} cm`;
    wrong = [`Hypotenuse = ${lo} cm (the shortest side given), legs = ${hi} cm and h`, `Hypotenuse = ${lo + hi} cm (both sides together), legs = ${lo} cm and ${hi} cm`];
  } else if (type === 'squaring-slip') {                      // hypotenuse problem; a² computed as 2a
    lines = [`Legs = ${a} cm and ${b} cm, hypotenuse = h`, `Rule: add the squares, h² = ${a}² + ${b}²`, `h² = ${2 * a} + ${sq(b)} = ${2 * a + sq(b)}`, `h = √${2 * a + sq(b)}`];
    faultyIdx = 2;
    correct = `h² = ${sq(a)} + ${sq(b)} = ${sq(c)}`;
    wrong = [`h² = (${a} + ${b})² = ${sq(a + b)}`, `h² = ${sq(a)} + ${2 * b} = ${sq(a) + 2 * b}`];
  } else {                                                    // rounding-slip: decimal hypotenuse problem
    const e = rng.pick(DECIMAL_HYP), good = e.answer, slip = Math.round((good + 0.1) * 10) / 10;
    lines = [`Legs = ${e.a} cm and ${e.b} cm, hypotenuse = h`, `Rule: add the squares, h² = ${e.a}² + ${e.b}²`, `h² = ${sq(e.a)} + ${sq(e.b)} = ${e.c2}`, `h ≈ ${fmt1(slip)} cm (1 d.p.)`];
    faultyIdx = 3;
    correct = `h = √${e.c2} ≈ ${fmt1(good)} cm (1 d.p.)`;
    wrong = [`h = √${e.c2} ≈ ${fmt1(Math.round((good - 0.1) * 10) / 10)} cm (1 d.p.)`, `h = √${e.c2} ≈ ${Math.round(good)} cm (nearest whole number)`];
    return { type, lines, faultyIdx, options: rng.shuffle([correct, ...wrong]), correctFix: correct, data: { type, a: e.a, b: e.b, c2: e.c2, good, slip } };
  }
  return { type, lines, faultyIdx, options: rng.shuffle([correct, ...wrong]), correctFix: correct, data: { type, a, b, c } };
}
```
UI: four numbered lines in a "report card"; tap the first faulty line (later lines follow from the slip and are marked "follows from the slip" after the reveal); then choose one of three corrected lines. Wrong line or wrong fix → `Msg` with a hint, no penalty. Gate: 3 cases, each a **different** error type (chosen by shuffling `ERROR_TYPES` and taking 3). Narration: intro + one spoken line per correct step.

---

## 8. Audio Pipeline

### 8.1 Mechanics (reuse)
`config/audio.config.js` (voice `Xb7hH8MSUJpSbSDYk0k2`, model `eleven_multilingual_v2`, presets `celebration / encouragement / question / emphasis / thinking / statement / instruction`), `utils/audio.js` (static map → live fetch → queue with next-segment preload, `playClickSound`, `setMuted`, `stopNarration`, helpers `say/ask/cheer/emphasize/think/instruct/celebrate`), `hooks/useAudio.js`, `scripts/generate_audio.js`, `scripts/clean_audio.js`: reuse as-is. ✅ `grep -rn speechSynthesis src` → no matches in the reference; keep it that way (CI grep in §12).

### 8.2 `utils/speak.js` — spoken forms (replaces the reference's `speak()`/`numberToWords`)
✅ *executed* (13 cases: squares, roots, decimals, thousands, vertex names, units, `HDB`/`TV` left untouched). **The same function builds both the text sent to ElevenLabs and the `audioMap` key**, so spoken/on-screen parity cannot drift.

```js
// utils/speak.js — on-screen notation → spoken words. Used for BOTH narration text and the audioMap key (parity by construction).
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const UNITS = { cm: 'centimetres', m: 'metres' };
const VERTEX_TOKEN = /\b([PQRABCXYZLMNDEF]{2,3})\b/g; // only the letters used by LABEL_SETS, so "HDB"/"TV" are untouched

/** 0 … 999 999 (reference version returned raw digits from 1 000 upward). */
export function numberToWords(n) {
  const num = Math.trunc(Number(n));
  if (!Number.isFinite(num)) return String(n);
  if (num === 0) return 'zero';
  if (num < 0) return 'minus ' + numberToWords(-num);
  if (num < 20) return ONES[num];
  if (num < 100) return TENS[Math.floor(num / 10)] + (num % 10 ? '-' + ONES[num % 10] : '');
  if (num < 1000) return ONES[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 1e6) {
    const r = num % 1000;
    return numberToWords(Math.floor(num / 1000)) + ' thousand' + (r ? (r < 100 ? ' and ' : ' ') + numberToWords(r) : '');
  }
  return String(num);
}

export function speak(text) {
  let s = String(text ?? '');
  s = s.replace(/\b1 d\.p\./g, 'one decimal place').replace(/\bd\.p\./g, 'decimal places');
  s = s.replace(/(\d+)\s*°/g, (_, d) => `${numberToWords(d)} degrees`);
  s = s.replace(/\(([^()]+)\)\s*²/g, '$1, all squared');                       // (a + b)² → a + b, all squared
  s = s.replace(/\b([a-z]|\d+)\s*²/g, (_, b) => `${/\d/.test(b) ? numberToWords(b) : b} squared`);
  s = s.replace(/√\s*\(?(\d+)\)?/g, (_, d) => `the square root of ${numberToWords(d)}`);
  s = s.replace(/≈/g, ' is approximately ').replace(/≠/g, ' is not equal to ').replace(/−/g, ' minus ')
       .replace(/\+/g, ' plus ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/=/g, ' equals ');
  s = s.replace(/(\d+)\.(\d+)/g, (_, i, f) => `${numberToWords(i)} point ${[...f].map(d => DIGITS[d]).join(' ')}`);
  s = s.replace(/\b(\d{1,3}(?: \d{3})+)\b/g, m => numberToWords(m.replace(/ /g, '')));   // "10 000"
  s = s.replace(/\b(\d+)\b/g, (_, d) => numberToWords(d));
  s = s.replace(/\b(cm|m)\b/g, (_, u) => UNITS[u]);
  s = s.replace(VERTEX_TOKEN, (_, v) => [...v].join(' '));
  return s.replace(/\s+/g, ' ').trim();
}
```
`narration.js` keeps the blueprint's exported names — `wonderNarration`, `storyNarration(panel)`, `simStationIntro(stationIdx)`, `playQuestionNarration`, `playCorrectNarration`, `playWrongNarration`, `playHint1Narration`, `playHint2Narration`, `districtCompleteNarration`, `bossStartNarration`, `bossWinNarration`, `reflectNarration`, `reflectCompleteNarration`, `getAllNarration()` — plus `stationEventNarration(stationIdx, event)`. Every returned segment text passes through `speak()`.

### 8.3 Generation
Fixed text (Wonder, Story, station intros and feedback, UI lines, boss/district lines, recap questions) is pre-generated via `npm run generate-audio`, then `npm run clean-audio`. Question stems, options read-outs and explanations are procedural → live path. Pre-generate nothing for them; cache by spoken text in memory (`getAudioUrl` already caches).
**Pronunciation listen-check (manual, once):** generate and listen to clips containing "Pythagoras' theorem", "hypotenuse", "centimetres", "square root of fifty-two", "eight point six". If "Pythagoras" or "hypotenuse" is mispronounced, add a respelling in a `PRONUNCIATION` map applied inside `speak()` (on-screen text unchanged). The map ships empty by default.

### 8.4 Key handling
`VITE_ELEVENLABS_API_KEY` embeds the key in the client bundle. `.env.local.example` contains the variable name and a placeholder only. Production: implement `api/elevenlabs.js` (Vercel serverless: reads `ELEVENLABS_API_KEY` from server env, accepts `{ text, voiceId, modelId, voice_settings }` — the exact body the reference `audio.js` already posts when no client key is present — and returns `audio/mpeg`), and leave the client variable unset. **Rotate the key currently committed in the reference's `.env.local.example`.**

---

## 9. Gamification

- `utils/scoring.js`: reuse verbatim — `calcStars(correct)` → 9–10 = 3★, 7–8 = 2★, 5–6 = 1★, else 0; `calcXP({attempts, hintsUsed, streak})` = `max(2, 10 − 3·(attempts−1) − 2·hints) + (streak ≥ 3 ? min(10, 2·(streak−2)) : 0)`.
- `utils/badgeEngine.js`: `checkBadges(state)` logic **unchanged**; only the `BADGES` strings change (names and emojis per PRD §9). Trigger keys: `first_correct`, `streak_5`, `streak_10`, `sim_all`, `world_3star`, `boss_won`, `answered_20`, `journey_complete`. ✅ executed with the new strings: a scripted journey through the §4 reducer unlocks all eight.

| id | name | description |
|---|---|---|
| first_correct | First Side Solved ✅ | Answered your first side question correctly! |
| streak_5 | Square Streak 🔥 | 5 correct answers in a row! |
| streak_10 | Master Measurer Streak 🏅 | 10 correct answers in a row! |
| sim_all | Fully Rigged Crew 🧰 | Completed all 4 stations in the Site Lab! |
| world_3star | Triple-Star Site ⭐⭐⭐ | Earned 3 stars in any world! |
| boss_won | Boss Beam Broken 🏗️ | Defeated a boss in a Boss Battle! |
| answered_20 | Tireless Tape Measure 📏 | Answered 20 or more questions in Practice! |
| journey_complete | Chief Site Surveyor 🎖️ | Completed the full 5-phase Survey Crew journey! |

- Boss Battle: 5 questions, 3 lives, one per world; a win also awards the world's own reward badge (`WORLDS[i].boss.reward`) — display-only list in `BadgesModal`, not a reducer trigger.
- Reflect scorecard uses "Stars n / 30".

---

## 10. Design Tokens & Viewport

### 10.1 `styles/design-tokens.css`
Keep the reference's `:root` (cosmic background, glass tokens, phase colours, `--world-0…9`, `--header-h`, fluid `--space-*` / `--fs-*`). Replace the `--angle-*` block with:

```css
:root {
  --tri-leg-a: #38bdf8;     /* leg a, square on a */
  --tri-leg-b: #fb923c;     /* leg b, square on b */
  --tri-hyp:   #c084fc;     /* hypotenuse and its square */
  --tri-known: #facc15;     /* given lengths */
  --tri-unknown: #f43f5e;   /* x / ? */
  --tri-ok: #4ade80;
  --tri-square-a: #38bdf833; --tri-square-b: #fb923c33; --tri-square-c: #c084fc33;
}
```
Colour is never the only cue (§PRD 11.6). Add the same colours to `tailwind.config.js` only if utilities are needed.

### 10.2 Viewport rules (replace every remaining `vh`)
```css
html, body, #root { height: 100%; margin: 0; }
body, .app-container { height: 100dvh; max-height: 100dvh; overflow: hidden; }
main.app-main { padding-top: var(--header-h); padding-bottom: env(safe-area-inset-bottom); }
.card-fit { max-height: calc(100dvh - var(--header-h) - 1rem); }          /* Story, Simulate, Practice, Reflect, Wonder */
.map-fit  { max-height: calc(100dvh - var(--header-h) - 11rem); }          /* KingdomMap grid (was 62vh) */
.diagram-fit { max-height: 32dvh; }                                         /* QuestionRenderer (was 32vh) */
@media (max-height: 520px) { .diagram-fit { max-height: 28dvh; } .floating-bg-container, .mascot-bubble { display: none; } }
```
Mechanical edits: `w-screen h-screen` → `w-full h-full` (App container and celebration screen); `max-h-[94vh]`, `[92vh]`, `[90vh]` → `card-fit`; `max-h-[62vh]` → `map-fit`; `max-h-[32vh]` → `diagram-fit`. Add `viewport-fit=cover` (already in `index.html`) and use the safe-area padding above. Keep the `@media (max-height: 800px)` compact rules but raise label sizes to ≥ 14 px.

### 10.3 Responsive `TopNav` — ✅ measured
Applied to a copy of the reference and measured at 1920×1080, 1366×768, 1280×720, 1100×700, 1024×768, 820×1180, 768×1024, 844×390, 390×844 and 360×740: **everything fits, no off-screen control, header height measured by `useHeaderHeight` (71–122 px)**.

```jsx
// labels only from 1366 px; phone capsule wraps below 480 px
<header className="w-full fixed top-0 left-0 right-0 px-2 sm:px-6 py-2 sm:py-3 flex flex-col items-center z-50 pointer-events-none">
  <div className="w-full flex flex-wrap items-center justify-between pointer-events-none max-w-7xl gap-2">
    <button className="… min-w-[44px] min-h-[44px]"> <span>🏠</span> <span className="hidden min-[1366px]:inline">Home</span> </button>
    <nav className="max-[479px]:order-last max-[479px]:w-full max-[479px]:justify-center pointer-events-auto … flex items-center gap-1 sm:gap-2">
      {/* each pill: className="px-1 sm:px-3.5 min-w-[44px] min-h-[44px] justify-center … flex items-center gap-1.5"
          number circle always; icon + label: "hidden min-[1366px]:inline" */}
    </nav>
    <div className="pointer-events-auto flex items-center gap-2 shrink-0"> {/* mute (label hidden < 1366) + ✕, each ≥ 44 px */} </div>
  </div>
  {/* Story progress row unchanged */}
</header>
```
(The measured patch used 40 px pills; the spec raises them to 44 px — recheck with `scripts/viewport_matrix.mjs`.)

### 10.4 Wonder card scroll — ✅ measured
Add `overflow-y-auto card-fit` to the Wonder glass card. After the patch the "Explore" button is reachable by scroll at 390×844, 360×640 and 844×390 (it was unreachable before).

### 10.5 Size floors
Body ≥ 16 px; station/diagram labels ≥ 14 px; interactive controls ≥ 44×44 px; drag handles ≥ 56 px hit area (transparent circle around the visible handle); focus ring `outline: 3px solid var(--color-gold)`; `@media (prefers-reduced-motion: reduce)` disables confetti burst count > 0, tile-pour and card transitions.

### 10.6 Layout/viewport matrix (what each screen does)

| Screen | ≥ 1024 | 768–1023 | 480–767 | < 480 | landscape height < 520 |
|---|---|---|---|---|---|
| Nav | 1 row, labels ≥ 1366 | 1 row, numbered pills | 1 row, numbered pills | capsule on 2nd row | compact padding |
| Wonder | centred card max 672 px | same | same, card scrolls | same, card scrolls | card scrolls, visual ≤ 28 dvh |
| Story | 2 columns (image 420 px) | 2 columns | stacked, image `clamp(160px,28dvh,420px)` | stacked | stacked, image 40 % width |
| Simulate | 4/8 columns | 4/8 columns | chip strip + full-width workspace | chip strip | chip strip, workspace scrolls |
| Practice map | 5 columns | 5 columns | 5 → 2 columns (`sm:` at 640) | 2 columns | 5 columns, scroll |
| Quiz | options 2×2 | 2×2 | 2×2 | 1 column | options 2×2, diagram 28 dvh |
| Reflect | card max 896 px, scrolls | same | same | same | same |

---

## 11. Build / Deploy

`npm install && npm run build` from a clean extract; deploy to Vercel (SPA rewrite + `api/elevenlabs.js`). `index.html`: title "SideQuest · Grade 8 Maths"; description and OG text for the Skyline Survey Crew story (no AngleQuest wording); `favicon.svg` actually present. Fonts: Fredoka One, Nunito, Inter via Google Fonts (as reference). README: run/build/audio/test commands, module summary, the §PRD 13 art brief; no real keys; no mention of browser speech.

---

## 12. QA Plan

### 12.1 Bank stress test — `scripts/stress_test_bank.js` (REWRITE)
≥ 300 seeds × 100 questions (30 000). Per question: all schema keys present and non-empty; exactly 4 **distinct** options and `correctAnswer ∈ options`; no `NaN` / `undefined` anywhere; **recompute** the answer with `answerFromVisualData(visualData)` and compare to `correctAnswer` (tolerance 1e-9 for exact, equality of the 1 d.p. string for decimals); `validateRightTriangleData(visualData)` true (triples exact in tenths; decimal items clean; hypotenuse strictly longest); decimal items: every option matches `/^\d+\.\d /`; exact triangle items: every option integer-valued; orientation varies: across 300 `genLabels` draws the right angle falls on each of the three vertex positions and at least 5 of the 8 rotations appear; **each world has 10 distinct `questionText`s** (not 7); World 9 draws from ≥ 5 source worlds; per-session `generateSession` for each of the four modes yields distinct texts.
Pool-size assertions: `TRIPLES.length === 17`, `DECIMAL_HYP.length === 156`, `DECIMAL_LEG.length === 213` (guards accidental edits to the pools).

### 12.2 Unit tests (`node --test tests/`)
`pythagorasMath` (pools, scaling in tenths, `makeOptions` modes, validators); `stationD` (1 500 cases: distinct options, faulty ≠ fix, per-type arithmetic proofs); `buildChains`; `appReducer` (full journey unlocks 8 badges; no duplicates; `NEXT_STORY_PANEL` obeys the passed panel count; streak reset); `speak` (the 13 cases in §8.2 plus any new narration strings); **`stations.wiring`**: `STATIONS.map(s => s.archetype)` equals `['discovery','build-to-target','composite','error-detective']` and every `Comp` is a function.

### 12.3 Audio parity
Every string passed to a narration helper, run through `speak()`, has an exact `audioMap` entry or is on the explicit dynamic list (question stems, options, explanations); zero matches for `speechSynthesis` in `src/` and in `dist/`; stations call `useStationNarration` (lint rule or grep for `audioEnabled` usage in each station file).

### 12.4 Journey walkthrough — `scripts/e2e_journey.mjs` (playwright-core + the installed Chromium)
Wonder → Story (6 panels; nav progress "1 of 6 … 6 of 6"; last button "Enter the Site Lab") → Simulate (all four stations completable; CTA gated until 4/4) → Practice (map; all four modes reachable; **Boss Battle starts, is winnable and losable in World 0 and World 9**; badges unlock; streak independent of stars) → Reflect (recap, scorecard, reflection, confetti) → celebration. Zero `pageerror`/`console.error`. The reference fails the Boss step today (Appendix A).

### 12.5 Viewport matrix — `scripts/viewport_matrix.mjs`
For each of 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 820×1180, 768×1024, 390×844, 360×740, 844×390 and for each phase: assert (a) every header button's rect lies inside the viewport; (b) the phase's primary CTA is either in view or inside a scrollable ancestor; (c) `document.documentElement.scrollWidth <= innerWidth`; (d) no card top is above the header bottom; (e) the smallest interactive control in `main` ≥ 44 px (Tier 1 and Tier 2). Take a screenshot per viewport/phase for review. (Run with fonts available; blocked Google Fonts only change glyph metrics slightly.)

### 12.6 Other checks
Production build from a clean clone; `npm run lint` with **zero warnings**; `grep -rn "sk_" .` returns nothing; `grep -ri "angle\|amirah\|wei jie\|detective\|inspector"` over `src/ index.html README.md` returns only deliberate geometry words; accessibility spot-check (keyboard-only walk through all four stations, focus visible, `aria-label`s on SVG handles, labels on every side).

---

## 13. Delivery Checklist

- [ ] Zip excludes `node_modules/` and `dist/`.
- [ ] `public/assets/story/story_1.png … story_6.png` — real PNG placeholders, 1024×1024, ≤ 300 KB each, no `.jpg` duplicates; README art brief per panel.
- [ ] `README.md`, `index.html`, OG tags rewritten; branding grep clean.
- [ ] `.env.local.example` has a placeholder only; `.env.local` in `.gitignore`; exposed reference key rotated.
- [ ] `vercel.json`, `.oxlintrc.json`, `favicon.svg`, `api/elevenlabs.js` present.
- [ ] `audioMap.js` regenerated after content lock; `clean-audio` run; pronunciation listen-check done.
- [ ] Attach logs: `test:bank`, `test:units`, `test:e2e`, `viewport_matrix` (pass output + screenshots).

---

## 14. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Blueprint dependency versions differ from the reference's tested React 18/Vite 5 stack. | ✅ Verified on a copy: install, build and bank test pass on the blueprint versions. Plan B pins in §2. |
| R2 | Floating-point error makes a scaled "triple" or a rounded answer wrong. | Tenths arithmetic in `isExactTriangle`; answers from exact squares; independent recomputation in the stress test. |
| R3 | ElevenLabs key exposed in the client bundle; a key is already committed in the reference. | Serverless proxy, client variable unset in production, rotate the exposed key. |
| R4 | SVG drag maths breaks under flex/scale layouts, or on touch. | `getScreenCTM().inverse()`, pointer events with capture, −/+ and arrow-key fallbacks, tested in the viewport matrix. |
| R5 | Pythagoras stems contain notation (`²`, `√`, decimals, thousands) that narrates badly. | One `speak()` used for text and map key; parity check; manual pronunciation listen-check. |
| R6 | Students pattern-match to the small triple pool (17). | PRD §15 (i): raise the limit to c ≤ 65 (31 triples) if repetition is a concern; decimal pools (156 / 213) are large. |
| R7 | No in-app calculator, but Worlds 5–9 need √ of non-perfect squares. | PRD §15 (d); hints show the squared value and a bracket (`8.6² = 73.96`); optional √/x² drawer is a contained future addition. |
| R8 | Home/✕ wipes progress. | Existing confirmation modal retained. |
| R9 | World-unlock rule (≥ 1★) is inherited, not specified. | One function `isWorldUnlocked`; confirm with stakeholders. |
| R10 | Station C chain variety is limited (17). | Roof builds add 34 variants; rounds are randomised; extend the T2 limit if needed. |
| R11 | Scope interpretation (Pythagoras vs trigonometry). | PRD §15 (a). Shell, state, audio, gamification, viewport work and the stress-test harness are topic-independent; only §6–§7 would change. |

---

## Appendix A — Evidence log (what was actually run)

| What | Result |
|---|---|
| Reference copied; dependencies swapped to the blueprint ranges; `npm install`; `npm run build` | 112 packages; Vite 8.3.3 build ✓ in ≈ 1 s (49 modules) |
| `npm run test:bank` on the reference (on blueprint versions) | 300 seeds, 30 000 questions, passed (but see §1.2 #9: weak assertions) |
| `npx oxlint` on the reference | 30 unused-variable/parameter warnings (e.g. `audioEnabled` in all stations, `selectedCorrection`, `exploredMilestones`) |
| Headless Chromium on the built reference, 1440×900 | Boss mode → click World 1 → no modal, no quiz (0 / 0); Simulate list shows the Radiant Point Lab as Station D |
| Headless Chromium, nav fit (original labels) | 844×390: 2 of 5 pills off-screen; 390×844: 4 of 5 pills + mute + ✕ off-screen |
| Headless Chromium, Wonder CTA | 390×844, 360×640, 844×390: button below the fold, no scrollable ancestor |
| Patched copy (§10.3, §10.4) | Nav fits at all 10 viewports (360×740 → 1920×1080); Wonder CTA reachable by scroll at all three phone viewports |
| `pythagorasMath` prototype, 300 seeds × 40 questions + 6 000 real-world | 0 failures; pools 17 / 156 / 213 |
| Station D prototype, 300 seeds × 5 error types | 1 500 cases, 0 failures (an earlier draft failed 156 cases on a sign bug in the *mislabelled-hypotenuse* case; the test caught it and the shipped code above is the fixed version) |
| Reducer prototype, scripted journey | all 8 badges unlock; no duplicates; `bestStreak` preserved |
| `speak()` prototype | 13/13 cases match |
| Sources for scope | [learner.net — Singapore Secondary 2 Mathematics (G3)](https://learner.net/u/singapore-grade-eight-mathematics) (third-party summary; the official MOE syllabus PDF was not retrievable) |
