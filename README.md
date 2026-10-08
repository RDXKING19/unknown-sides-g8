# SideQuest 📐🏗️
**Singapore MOE Grade 8 / Secondary 2 Mathematics Module**  
*Finding Unknown Sides in Right-Angled Triangles using Pythagoras' Theorem*

---

## 🏗️ Project Overview

**SideQuest** is a production-grade, interactive educational math module designed according to Singapore MOE Grade 8 syllabus standards. Students join the **Skyline Survey Crew**—working alongside **Priya** (apprentice engineer), **Hafiz** (cadet surveyor), and **Foreman Tally** (veteran site supervisor)—to calculate structural heights, spans, and distances across Skyline City without needing to climb inaccessible scaffolding.

### Pedagogical Journey (5 Phases)

1. **Wonder Phase (The Inaccessible Ledge)**:
   - Sets the scene on a high-density HDB block construction site.
   - Poses the central dilemma: A $5\text{ m}$ ladder leans against a wall with its foot $3\text{ m}$ out. How high does it reach when the ledge cannot be reached directly?
   - Connects concrete intuition to the need for geometric deduction.

2. **Story Phase (Job Panels 1–6)**:
   - **Panel 1**: *The Length You Can't Measure* — Surveyors do not climb; they calculate!
   - **Panel 2**: *Meet the Right-Angled Triangle* — Hypotenuse vs. legs, right angle identification in triangle $PQR$.
   - **Panel 3**: *The Square Secret* — $3\text{--}4\text{--}5$ square tiles proving $a^2 + b^2 = c^2$.
   - **Panel 4**: *Finding the Longest Side* — Add the squares, take the square root (exact $5\text{--}12\text{--}13$ and decimal $4\text{--}6\text{--}\sqrt{52} \approx 7.2$).
   - **Panel 5**: *Finding a Shorter Side* — Subtract squares ($c^2 - a^2 = b^2$), solving the opening ladder puzzle ($25 - 9 = 16 \implies 4\text{ m}$).
   - **Panel 6**: *Job Done... For Now* — Reflection on when Pythagoras applies and invitation to the Site Lab.

3. **Simulate Phase (4 Site Stations)**:
   - **Station A: Square Secret Lab** (*Discovery*) — Adjustable angle slider ($60^\circ$ to $120^\circ$) with fluid tile pouring demonstration showing $a^2 + b^2 = c^2$ holds strictly at $90^\circ$.
   - **Station B: Ladder Lock-In** (*Build-to-Target*) — Interactive slider placing ladder foot distance to reach designated target ledges ($12\text{ m}$, $15\text{ m}$, $8\text{ m}$, $24\text{ m}$).
   - **Station C: Blueprint Builder** (*Composite*) — Multi-step decomposition of symmetric roof trusses and two-triangle quadrilaterals with intermediate diagonals.
   - **Station D: Foreman Tally's Site Report** (*Error-Detective*) — Diagnose and fix real survey errors across 5 misconception categories (added instead of subtracted, skipped square root, misidentified hypotenuse, squaring slips, rounding slips).

4. **Practice Phase (Skyline City Practice)**:
   - 10 unlockable districts across Skyline City:
     0. *Square Station* (Squares and square roots)
     1. *Hypotenuse Harbour* (Identifying hypotenuse)
     2. *Longest-Side Lane* (Hypotenuse exact)
     3. *Shorter-Side Street* (Leg exact)
     4. *Triple Tower* (Pythagorean triples & method choice)
     5. *Decimal Docks* (1 decimal place rounding)
     6. *Double-Triangle Depot* (Composite figures)
     7. *Ladder & Ramp Yard* (Real-world structures)
     8. *Shortcut City* (Real-world 2D distance)
     9. *Grand Skyline Finale* (Mixed cumulative review)
   - 4 Practice Modes: *Quick Drill (5Q)*, *Standard Run (8Q)*, *Challenge (12Q)*, and *Boss Battle* (5 questions, 3 lives to secure the beam against site hazards).

5. **Reflect Phase (Site Debrief & Certification)**:
   - 3-question conceptual recap quiz with instant pedagogical feedback.
   - Performance scorecard (total stars, accuracy percentage, longest streak, XP).
   - Free-form reflection input box explaining findings to Foreman Tally.
   - Confetti celebration granting the **Chief Site Surveyor** credential.

---

## 🧮 Mathematical Engine (`src/utils/pythagorasMath.js`)

- **Curated Pools**:
  - `TRIPLES`: 17 primitive and scaled integer triples with $c \le 41$ (e.g. $3\text{-}4\text{-}5$, $5\text{-}12\text{-}13$, $8\text{-}15\text{-}17$, $7\text{-}24\text{-}25$, $20\text{-}21\text{-}29$, $9\text{-}40\text{-}41$).
  - `DECIMAL_HYP`: 156 pairs ($a, b \in [2, 20]$) verified with clean 1 decimal place rounding (`isClean1dp`).
  - `DECIMAL_LEG`: 213 pairs ($c \le 25$) verified with clean 1 decimal place rounding.
- **Tenths Exactness**: Scaled real-world numbers ($0.1$, $0.5$) checked in integer tenths to avoid floating-point drift.
- **Procedural Generator**: Deterministic PRNG with parameterized templates producing unique question stems, strictly distinct options, and geometric validity assertions across $\ge 300$ random seeds.

---

## 🎙️ Audio & Voice Pipeline (`src/utils/speak.js`, `src/utils/audio.js`)

- **Voice Talent**: ElevenLabs **Alice** (`Xb7hH8MSUJpSbSDYk0k2`), model `eleven_multilingual_v2`.
- **Speech Settings**: Dynamic emotional presets for `statement`, `question`, `encouragement`, `emphasis`, `thinking`, `celebration`, and `instruction`.
- **Natural Math Pronunciation (`speak.js`)**:
  - $c^2 \to$ *"c squared"*, $5^2 \to$ *"five squared"*, $(a + b)^2 \to$ *"a plus b, all squared"*
  - $\sqrt{169} \to$ *"the square root of one hundred and sixty-nine"*
  - $12.5\text{ m} \to$ *"twelve point five metres"*
  - Vertex labels: $PR \to$ *"P R"*, $ABC \to$ *"A B C"*
  - Acronyms preserved: *"HDB"*, *"TV"*
- **Zero Browser Speech Fallback**: If an audio file is missing and no API key is provided, audio skips silently without disturbing the user with robotic browser synthesizers.

---

## 🎨 Visual Design & Responsive Layout

- **Typography**: `Fredoka One` for playful headings, `Nunito` for clean body text, `Inter` for technical formulas.
- **Color Palette**: Dark indigo/slate site aesthetic (`#07021a`, `#0f0728`) accented with Gold (`#facc15`), Cyber Cyan (`#38bdf8`), and Emerald (`#10b981`).
- **Touch-Friendly Controls**: Minimum $44\text{ px}$ touch targets, minimum $14\text{ px}$ labels.
- **Viewport Resilience**: Dynamic viewport height (`100dvh`), responsive bottom padding (`env(safe-area-inset-bottom)`), responsive horizontal chip strip for simulations on mobile screens ($< 768\text{ px}$).

---

## 🧪 Verification & Test Suites

```bash
# 1. Run the 300-seed question bank stress test (30,000 questions checked)
npm run test:bank

# 2. Run the Node.js native unit test suite (18 unit tests across math, state, voice, wiring)
npm run test:units

# 3. Run the Oxlint linter
npm run lint

# 4. Compile the Vite production build
npm run build
```

---

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Pre-generating Audio (Optional)

Create a `.env.local` file with your ElevenLabs key:
```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Then run:
```bash
npm run generate-audio
npm run clean-audio
```

---

## 📦 Directory Structure

```text
├── api/
│   └── elevenlabs.js                # Serverless TTS proxy
├── public/
│   ├── assets/
│   │   ├── audio/                   # Static .mp3 pre-generated files
│   │   └── story/                   # Story panel PNG illustrations (story_1.png .. story_6.png)
│   └── favicon.svg
├── scripts/
│   ├── clean_audio.js               # Prune orphaned audio files
│   ├── create_png_placeholders.mjs  # Canvas illustration generator
│   ├── generate_audio.js            # ElevenLabs batch audio pre-generator
│   └── stress_test_bank.js          # 300-seed question bank stress test
├── src/
│   ├── components/
│   │   ├── gamification/            # KingdomMap, StarRating, BadgesModal
│   │   ├── phases/                  # WonderPhase, StoryPhase, SimulatePhase, PlayPhase, ReflectPhase
│   │   ├── quiz/                    # QuestionRenderer, BossBattleModal
│   │   ├── shared/                  # TriangleVisual, FloatingSymbols, Mascot, FeedbackOverlay
│   │   ├── simulations/             # SquareSecretLab, LadderLockIn, BlueprintBuilder, SiteReportDetective
│   │   ├── IntroScreen.jsx
│   │   └── TopNav.jsx
│   ├── config/                      # worlds, characters, audio configs
│   ├── data/                        # questionBank.js, storyContent.js
│   ├── hooks/                       # useAudio, useHeaderHeight, useViewport, useStationNarration
│   ├── state/                       # appReducer.js
│   ├── styles/                      # design-tokens.css, globals.css
│   └── utils/                       # pythagorasMath, speak, audio, narration, stationCases, badgeEngine, rng
└── tests/
    ├── appReducer.test.js           # 8-badge journey, panel navigation, streak tests
    ├── pythagorasMath.test.js       # Pool sizes, exactness, rounding tests
    ├── speak.test.js                # Pronunciation transformations test
    ├── stationD.test.js             # 1,500 error detective cases test
    └── stations.wiring.test.js      # SimulatePhase STATIONS wiring assertions
```
