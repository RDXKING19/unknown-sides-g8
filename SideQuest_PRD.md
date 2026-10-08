# SideQuest — Grade 8 · Finding Unknown Sides (Pythagoras' Theorem) (PRD)

**Grade:** 8 (Singapore Sec 2) &nbsp;|&nbsp; **Topic:** Finding Unknown Sides of Right-Angled Triangles (Pythagoras' Theorem) &nbsp;|&nbsp; **Module name:** SideQuest
**Clone source for this build:** `angle-on-line-g7-main` (the shipped AngleQuest build, user-supplied) — used as the reference for UI/UX, layouts, viewports and architecture. Where that build contradicts the Intellia blueprints or fails a check (§2.2), the blueprint or the fix wins and the defect is not cloned.
**Special instructions given:** none — all blueprint defaults apply.
**Scope interpretation (please confirm — §15 a):** "Finding unknown sides" at Grade 8 is read as **Pythagoras' theorem** (finding the hypotenuse or a shorter side of a right-angled triangle). Trigonometric ratios and similar triangles are also "find the unknown side" topics, but they are deliberately scoped out and listed as next-module candidates (§3.2).

---

## 1. Overview

SideQuest is a Grade 8 module teaching students to find an unknown side of a right-angled triangle with Pythagoras' theorem — add the squares to find the hypotenuse, subtract the squares to find a shorter side, take the square root, and round sensibly — and then to spot and use right-angled triangles hidden inside real structures and composite figures. Two junior surveyors, **Priya** and **Hafiz**, join **Foreman Tally** (Tally the Owl in a hard hat) on the **Skyline Survey Crew**. Every "job" is a length that cannot be measured directly: a ladder against an HDB wall, a wheelchair ramp, a stay-wire on a flagpole, a drone route across a field.

The five-phase **Wonder → Story → Simulate → Practice → Reflect** journey, XP / Stars / Streak / Badge gamification, the 100-question procedurally generated bank across 10 worlds, and ElevenLabs-only narration are inherited unchanged from the Intellia product architecture (PRD blueprint §A).

## 2. Background

### 2.1 Why this topic suits the Simulate archetypes
Pythagoras' theorem is a relationship between areas that students usually meet as a formula to memorise. That makes it a strong fit for the four Simulate archetypes: *watch the squares prove the rule* (Discovery), *place a ladder so it reaches a ledge* (Build-to-Target), *split a roof truss into two right triangles* (Composite), and *find the faulty line in a worked solution* (Error-Detective). The commonest real errors (adding when you should subtract, forgetting the square root, treating a leg as the hypotenuse) are exactly what the Error-Detective and the Reflect recap target.

### 2.2 Lessons from the reference (AngleQuest) build — carried forward as requirements
The reference was read in full, built, bank-tested and exercised in a headless browser. It is a strong visual and structural base, but it differs from its own PRD/TRD in ways that matter to product behaviour. SideQuest must not inherit these:

| # | Finding in the shipped reference | Product requirement for SideQuest |
|---|---|---|
| 1 | **Boss Battle cannot start.** Selecting a world in Boss mode opens nothing (verified in-browser: no modal, no quiz). | Boss Battle must be fully playable: intro modal → 5 questions → 3 lives → win/lose result → reward badge. |
| 2 | **Station D (Error-Detective) is built but not wired in.** The Simulate list shows a fourth "360° Radiant Point Lab" instead; `CaseFileDetective.jsx` is orphaned. | All four stations are the four blueprint archetypes (§7.3). The Error-Detective is wired in and covered by an automated check. |
| 3 | **Most badges can never unlock.** The badge check is called from Practice with a partial state, so "all stations complete", "3 stars" and "boss won" never fire. | All 8 badges must be reachable and are verified end-to-end (§14). |
| 4 | **Stations never speak.** `audioEnabled` is accepted by all four stations and ignored. | Each station narrates its intro and its feedback lines (§10). |
| 5 | **The top nav overflows on anything narrower than a wide laptop, and phones are unusable.** The nav shows full labels from 640 px up, so at 1280 px and below the right-hand controls spill off-screen (measured: mute/close and 2–4 phase pills unreachable at 844×390 and 390×844); on phones the Wonder phase's main button sits below the fold with no way to scroll to it. | A defined viewport support matrix with no unreachable controls (§11.4). |
| 6 | **Touch targets and type are below accessibility floors in the lab.** The shared slider's −/+ buttons are 32 px and some labels are 11 px. | Floors in §12: 44 px targets, 14 px minimum label text. |
| 7 | **Number narration breaks above 999 and for decimals.** `numberToWords` returns raw digits for ≥ 1000; `speak()` handles only integer degrees and `x =`. Pythagoras questions routinely contain 1 521, 2 500, `8.6`, `√`, `²`. | Spoken forms for squares, roots, decimals and thousands (§10). |
| 8 | **The stress test only requires ≥ 7 distinct question texts per world** (the TRD says 10) and checks no independent recomputation of answers. | Stricter bank QA (§14). |
| 9 | **A real-looking ElevenLabs API key is committed in `.env.local.example`.** | No real key in any shipped file; the existing key should be treated as exposed and rotated (§15 h). |
| 10 | **Story images are JPEG data in files named `.png`, duplicated as `.jpg`.** | Real PNG placeholders (or correctly named JPEGs), one set only (§13). |

The technical detail behind each item is in the paired TRD (§1).

## 3. Standards Alignment

Singapore MOE Secondary Mathematics, Geometry and Measurement strand, **Secondary 2: Pythagoras' theorem** — pupils use Pythagoras' theorem to determine an unknown side of a right-angled triangle, in routine and real-world settings.

> **Verification note.** The official MOE syllabus document could not be retrieved in this session. The scope below follows third-party Secondary 2 syllabus summaries (e.g. [learner.net Secondary 2 syllabus](https://learner.net/u/singapore-grade-eight-mathematics), which lists "Pythagoras' Theorem and Trigonometry" as a Sec 2 strand and describes "use of Pythagoras' theorem" and "identifying right-angled triangles") and standard Sec 2 textbook practice. It should be confirmed against the current MOE syllabus (§15 a, b).

### 3.1 Precise skills in scope
- Identify the right angle, the hypotenuse (the side opposite the right angle) and the two legs of a right-angled triangle in any orientation and with any vertex labelling.
- Square whole numbers to 20² (and recognise larger squares used in the triple pool) and find square roots of perfect squares; locate √ of a non-perfect square between two consecutive whole numbers.
- State Pythagoras' theorem for a right-angled triangle: the square on the hypotenuse equals the sum of the squares on the other two sides (`a² + b² = c²`, with `c` the hypotenuse).
- Find the hypotenuse given the two legs.
- Find a shorter side given the hypotenuse and the other leg.
- Choose correctly between adding and subtracting the squares by identifying which side is the hypotenuse.
- Recognise common Pythagorean triples and their multiples (3-4-5, 5-12-13, 8-15-17, 7-24-25, 20-21-29, …) as a shortcut and as a check.
- Give non-exact answers correct to 1 decimal place, computed from the exact squared value.
- Solve multi-step problems that contain two right-angled triangles (isosceles-triangle height, rectangle diagonal, a chain of two triangles).
- Apply the theorem to real-world situations (ladders, ramps, wires, diagonals, grid distances, shortcuts), including drawing or identifying the right-angled triangle first.

### 3.2 Adjacent skills scoped out (bridge only, never tested)
- **Converse of Pythagoras' theorem** ("is this triangle right-angled?") — appears only as a one-line teaser in Story panel 6.
- **Trigonometric ratios** (sine, cosine, tangent) for finding a side from an angle — teaser in Story panel 6. Natural next module (working name **TrigQuest**).
- **Similar triangles** and 3-D Pythagoras problems; **surd form** answers (e.g. `5√2`) — not assessed; every non-exact answer is a decimal to 1 d.p.

### 3.3 Domain conventions students are expected to know
- Lengths carry units (cm or m) and all sides in one question share a unit; no unit conversion is tested.
- Squares are written `a²` on screen but **spoken** "a squared"; roots are written `√` but **spoken** "square root of" (§10).
- Non-exact answers are always requested "correct to 1 decimal place" and computed from the exact squared value, never from a rounded intermediate.
- Diagrams are "not drawn to scale" in the textbook convention; SideQuest diagrams are approximately proportional but carry a small "not to scale" note.
- Students use their own calculator for non-perfect-square roots in Worlds 5–9 (Sec 2 standard); no in-app calculator is provided (§15 d).

## 4. Learning Objectives

By the end of this module, a student should be able to:
1. Identify the right angle, hypotenuse and legs of a right-angled triangle, whatever its orientation or labelling.
2. Recall squares up to 20² and perfect-square roots, and estimate a square root between two whole numbers.
3. State Pythagoras' theorem and say when it applies (right-angled triangles only).
4. Find the hypotenuse given the two legs.
5. Find a shorter side given the hypotenuse and one leg.
6. Decide whether to add or subtract the squares, and use Pythagorean triples as a shortcut and a check.
7. Give non-exact answers correct to 1 decimal place.
8. Solve composite problems that combine two right-angled triangles.
9. Apply Pythagoras' theorem to real-world problems (ladders, ramps, diagonals, shortcuts) by first finding the right-angled triangle.

The ordering (recall → single-step → comparison/method choice → composite → real-world) drives the Story sequence (§7.2) and the world sequence (§8).

## 5. Inherited Standards (copied from PRD blueprint §A — not re-derived)

- **Five-phase architecture:** Wonder → Story → Simulate → Play ("Practice" in-UI) → Reflect.
- **Gamification:** XP per question (attempts, hints and streak weighted); Stars 0–3 per world (9–10 correct = 3★, 7–8 = 2★, 5–6 = 1★, below = 0★); continuous streak tracking; 8 fixed badge triggers (relabelled, §9); Boss Battles (5 questions, 3 lives, one per world, 10 total).
- **Practice modes:**

| Mode | Questions | Hints | Timed | Lives |
|---|---|---|---|---|
| Guided Practice | 5 | Yes | No | No |
| Independent Practice | 10 | No | No | No |
| Timed Challenge | 8 | No | Yes (60 s) | No |
| Boss Battle | 5 | No | No | Yes (3) |

- **Audio:** ElevenLabs "Alice" (`Xb7hH8MSUJpSbSDYk0k2`), `eleven_multilingual_v2`, six style presets; pre-generated static `.mp3`s through `generate_audio.js` → `audioMap.js`; dynamic ElevenLabs generation only for procedurally varying text; **no browser Web Speech API fallback**; 1:1 spoken/on-screen parity; all symbols and notation spoken as full natural language (§10).
- **Question bank:** 10 worlds × 10 questions = 100, procedurally generated, ≥ 300-run stress test, fixed schema (`id, districtId, category, visual, questionText, options[4], correctAnswer, explanation, hint1, hint2, visualData`), World 9 always the mixed-review grand finale.
- **Product standards:** React / Vite / Tailwind / Framer Motion; the established dark glass-morphism design system (`design-tokens.css`, Fredoka One / Nunito); enlarged fonts and touch targets in Simulate and Practice calibrated to the age group; surgical reuse of every non-topic file; zip delivery excluding `node_modules`/`dist`, with placeholder story art and an art-brief README.

## 6. Module Identity

- **Name:** SideQuest (follows the `{Topic}Quest` convention; "side" = the unknown side). Alternative if preferred: PythagoQuest.
- **Story theme:** *The Skyline Survey Crew* — a project-based, city-building setting suited to 13–14-year-olds. Each world is a "job site" in a Singapore-flavoured city (HDB blocks, void decks, a bridge, a drone field).
- **Characters:** **Priya** and **Hafiz**, two junior surveyors (Singaporean-multicultural naming, first names only, per blueprint default; no override requested). Distinct from the G7 pair (Amirah, Wei Jie).
- **Mascot:** **Tally the Owl** 🦉 retained, reskinned as **Foreman Tally** — hard hat and a retractable measuring tape. A reskin rather than a swap, as with Inspector Tally in AngleQuest.

## 7. Five-Phase Journey Detail

### 7.1 Wonder
One hook screen, "**The Ladder That Won't Tell**": Priya and Hafiz stand at the foot of an HDB wall with a 5 m ladder whose foot is 3 m from the wall. The top rests on a ledge they cannot reach to measure. Diagram shows `ladder = 5 m`, `foot = 3 m`, `height = ?`. Tally poses the driving question: *"What if you could find a length you can't measure — just from two you can?"* Primary button: "Open the Job File →".

### 7.2 Story — 6 panels
Pythagoras' theorem needs staged build-up (vocabulary → the rule → two directions of use → sanity checks), so this module uses **6 panels**, matching the AngleQuest precedent. *(Build note: the app must read the count from `STORY_PANELS.length`; the reference already does in `StoryPhase.jsx` and in the reducer. The TRD adds a test so a hard-coded count cannot creep back in.)*

| # | Title | Concept delivered | Narrative beat |
|---|---|---|---|
| 1 | "The Length You Can't Measure" | Concrete hook | The crew's first job: the 5 m ladder, 3 m from the wall. "Surveyors don't climb — they calculate." |
| 2 | "Meet the Right-Angled Triangle" | Vocabulary: right angle, **hypotenuse** (opposite the right angle, always the longest side), **legs**; vertex labelling (e.g. triangle PQR with the right angle at Q); the hypotenuse is *not* always the slanted or bottom side | Ladder + wall + ground form a right-angled triangle; Tally shows the same triangle rotated three ways. |
| 3 | "The Square Secret" | The rule: squares built on the sides of a 3-4-5 triangle give 9 + 16 = 25; `a² + b² = c²`; true **only** when there is a right angle | Priya tiles the squares; Hafiz notices the two small squares exactly fill the big one. |
| 4 | "Finding the Longest Side" | Add the squares, then take the square root: legs 5 and 12 → 25 + 144 = 169 → √169 = 13. A second example with a non-perfect square: legs 4 and 6 → 52 → √52 ≈ 7.2 (1 d.p.) | The wire from the flagpole top: solving the 13 m wire, then a "not so neat" 7.2 m one. |
| 5 | "Finding a Shorter Side" | Subtract the squares: hypotenuse 13, leg 5 → 169 − 25 = 144 → 12. Sanity check: the hypotenuse is always the longest side; if a "shorter side" comes out longer than it, something went wrong | The ladder from Wonder resolved: 25 − 9 = 16, √16 = 4 m. |
| 6 | "Job Done… For Now" | Recap of the three moves (name the hypotenuse → add or subtract the squares → square root); one-line teasers for the scoped-out topics (§3.2): "How can you tell a triangle is right-angled in the first place? What if you only know one side and an angle?" | Foreman Tally hands over hard hats and sends the crew to the Site Lab. |

The Wonder ladder (3, 4, 5) is resolved in panel 5, giving the module a closed loop.

### 7.3 Simulate — 4 stations (archetype heuristic)
The reference's 2-column shell (station tabs left, workspace right, gated "Go to Practice" button) is kept. The four stations follow the **documented standard**, not the reference's station set (§2.2 #2). All four are live SVG, keyboard-operable, and narrate (§10).

**A · Concept Discovery Lab — "The Square Secret Lab"**
- *Premise:* build squares on the three sides of a right-angled triangle and watch the areas.
- *Stage 1, Tile Pour.* The student sets the two legs (1–12 units, − / + and slider). Each side carries a square. A "Pour" action moves the unit tiles from the two small squares into the big one. For whole-number hypotenuses (e.g. 3-4-5) the tilted big square carries a unit grid and fills exactly; otherwise it is a plain tinted square with the counter reading `c² = 52 square units → c ≈ 7.2`.
- *Stage 2, Angle Bender.* The right angle is released: an angle slider (40°–140°, 5° steps, snaps to 90°) deforms the triangle and shows two bars, `a² + b²` and `c²`. They match only at exactly 90°.
- *Live feedback:* running readout `a² + b² = c²` with the numbers substituted; area bars; a green lock icon at 90°.
- *Completion gate:* ≥ 4 distinct leg pairs explored in Stage 1 (at least one whole-number triple and one non-triple), ≥ 2 non-90° angles visited and the 90° position locked in Stage 2, then one confirmation question: "Pythagoras' theorem `a² + b² = c²` works only when…" → "the triangle has a right angle" (wrong answers give a hint and a retry, no penalty).

**B · Build-to-Target Challenge — "Ladder Lock-In"**
- *Premise:* the ladder length is fixed; place its foot so the top touches a ledge at a target height.
- *What the student manipulates:* the foot distance (− / + buttons and slider; step 1 m in rounds 1–2, 0.1 m in round 3).
- *Live feedback:* the ladder moves; the readout shows `foot² + height² = ladder²` with live numbers; the ring turns amber within ±1 (round 3: ±0.5) and green on a match. A top that cannot reach shows "ladder too short here".
- *Completion gate:* three successful rounds — two whole-number (e.g. ladder 13 m, ledge 12 m → foot 5 m; ladder 10 m, ledge 8 m → foot 6 m) and one decimal (e.g. ladder 10 m, ledge 9 m → foot 4.4 m). "Check" accepts a value within ±0.05 of the true answer, so tolerance is visual guidance only. Each round starts after pressing "New job".

**C · Multi-Step / Composite Construction Challenge — "Blueprint Builder"** (targets LO 8)
- *Premise:* the figure contains two right-angled triangles; build the solution step by step.
- *Build 1 — roof truss (isosceles):* rafters 13 m, span 10 m, find the height. Steps: ① "Drop the centre post" (creates the dashed height and the 5 m half-span) → ② tap the hypotenuse and the known leg of the right triangle that appears → ③ choose *subtract the squares* → ④ set the answer with the stepper (12 m).
- *Build 2 — chain of two triangles:* in quadrilateral ABCD, AB = 8 m, BC = 6 m (right angle at B) and CD = 24 m (right angle at C); find AD. Steps: find AC (add → 10 m; the value appears on the diagram) → then use AC as a leg in the second triangle (add → 26 m).
- *Live feedback:* each correct step lights a progress lamp and annotates the diagram; a wrong choice shakes and shows a hint.
- *Completion gate:* both builds finished. The two builds are chosen so a student must use both **adding** and **subtracting** the squares.

**D · Error-Detective — "Foreman Tally's Site Report"**
- *Premise:* a four-line worked solution (label the sides / state the rule / substitute and calculate / answer with units) contains exactly one realistic slip.
- *What the student does:* tap the faulty line, then choose the corrected line from three options.
- *Seeded error types:* `added-instead-of-subtracted` (finding a leg), `skipped-square-root` (leaves 169 cm as the hypotenuse), `wrong-hypotenuse` (a leg treated as the hypotenuse), `squaring-slip` (e.g. 12² = 24 or (a + b)²), `rounding-or-units-slip` (√74 given as 8.7; unit forgotten).
- *Completion gate:* three cases, each a different error type. The "wrong" line must be provably wrong and the correction provably right (checked in tests).
- *Why:* it targets the misconception behind most lost marks: not identifying the hypotenuse, hence adding when you should subtract (and vice versa).

### 7.4 Play / Practice
Unchanged mechanics (§5): world map of 10 worlds, four selectable modes, a Boss Battle per world. World *n* unlocks when World *n − 1* has ≥ 1★ (inherited behaviour; §15 f).

### 7.5 Reflect
(1) A 3-question conceptual recap quiz on the module's core misconception — identifying the hypotenuse and choosing add vs subtract. (2) Scorecard (XP / Stars out of 30 / best streak / badges). (3) Open reflection to Tally (minimum 10 characters, inherited): "Dear Foreman Tally, the hypotenuse is always… because…". (4) Confetti celebration screen.

Recap questions:
1. *"In a right-angled triangle, which side is the hypotenuse?"* → **The side opposite the right angle** / The side at the bottom / The shortest side / Any slanted side.
2. *"A right-angled triangle has hypotenuse 10 cm and one leg 6 cm. Which working finds the other leg?"* → **√(10² − 6²)** / √(10² + 6²) / 10 − 6 / 10² − 6².
3. *"Hafiz finds the hypotenuse of a triangle with legs 8 cm and 15 cm and writes 8² + 15² = 289 cm. What did he forget?"* → **To take the square root of 289** / To subtract instead of add / To square the 15 / Nothing — 289 cm is correct.

## 8. World & Question Bank Table

10 worlds, foundational → applied; **World 9 is the mixed-review grand finale** with the hardest boss. Accent colours reuse the product's 10-colour world palette unchanged.

| id | Name | Emoji | Accent | conceptFocus | Description | Boss (name · emoji · reward badge) |
|---|---|---|---|---|---|---|
| 0 | Square Station | 🟦 | `#f472b6` | `squares-and-roots` | Squares to 20², square roots of perfect squares, √ estimated between whole numbers. | Rootless Rex 🦖 · "Root Ranger" |
| 1 | Hypotenuse Harbour | ⚓ | `#fb923c` | `identify-hypotenuse` | Name the right angle, hypotenuse and legs in any orientation and labelling. | The Mix-Up Mimic 🎭 · "Hypotenuse Hunter" |
| 2 | Longest-Side Lane | 📏 | `#fbbf24` | `find-hypotenuse-exact` | Add the squares, then square root — whole-number answers. | Long-Shot Larry 🏹 · "Add-and-Root Ace" |
| 3 | Shorter-Side Street | 🧱 | `#4ade80` | `find-leg-exact` | Subtract the squares, then square root — whole-number answers. | The Shortchanger 🪙 · "Leg-Length Legend" |
| 4 | Triple Tower | 🗼 | `#38bdf8` | `triples-and-method` | Pythagorean triples and their multiples; choosing add vs subtract. | Triple Trouble Trio 🎲 · "Triple Tracker" |
| 5 | Decimal Docks | 🚢 | `#818cf8` | `decimal-answers` | Non-perfect-square answers, correct to 1 decimal place. | The Decimal Dodger 🎯 · "Precision Pilot" |
| 6 | Double-Triangle Depot | 🔺 | `#c084fc` | `composite-two-triangles` | Two right triangles in one figure: isosceles height, rectangle diagonals, two-step chains. | The Double Decker 🚌 · "Two-Triangle Tamer" |
| 7 | Ladder & Ramp Yard | 🪜 | `#22d3ee` | `real-world-structures` | Ladders, ramps, stay-wires, flagpoles, roof trusses. | The Ramp Raider 🚧 · "Site Safety Star" |
| 8 | Shortcut City | 🌆 | `#facc15` | `real-world-distance` | Diagonals, TV screens, grid distances, shortcut-versus-detour, drone routes. | Shortcut Shifty 🧭 · "Shortcut Specialist" |
| 9 | Grand Skyline Finale | 🏙️ | `#f43f5e` | `mixed-review` | Hardest boss; mixes every question type from worlds 0–8. | The Skyline Saboteur 🦹 · "Master Surveyor" |

**Sample questions** (illustrative, not the full 100; every answer below was checked by calculation):

- **World 0:** "What is the value of √169?" → **13** / 14 / 12 / 84.5. *13 × 13 = 169.* · "√50 lies between which two whole numbers?" → **7 and 8** / 6 and 7 / 24 and 26 / 25 and 26. *49 < 50 < 64.*
- **World 1:** "In triangle PQR the right angle is at Q. Which side is the hypotenuse?" → **PR** / PQ / QR / It depends on how the triangle is drawn. *The hypotenuse is opposite the right angle.*
- **World 2:** "The legs of a right-angled triangle are 9 cm and 12 cm. Find the hypotenuse." → **15 cm** / 21 cm / 225 cm / 3 cm. *81 + 144 = 225, √225 = 15.*
- **World 3:** "A 17 m ladder leans on a wall with its foot 8 m from the wall. How high does it reach?" → **15 m** / 9 m / 25 m / 225 m. *289 − 64 = 225, √225 = 15.*
- **World 4:** "Which set of lengths is a Pythagorean triple?" → **8, 15, 17** / 6, 7, 9 / 5, 10, 13 / 9, 12, 16. · "A right-angled triangle has hypotenuse 26 cm and one leg 10 cm. Use a triple to find the other leg." → **24 cm** / 16 cm / 36 cm / 576 cm. *(5-12-13 doubled.)*
- **World 5:** "The legs are 5 cm and 7 cm. Find the hypotenuse, correct to 1 decimal place." → **8.6 cm** / 12.0 cm / 74.0 cm / 4.9 cm. *25 + 49 = 74, √74 ≈ 8.6.*
- **World 6:** "An isosceles triangle has equal sides 13 cm and base 10 cm. Find its height." → **12 cm** / 144 cm / 8 cm / 18 cm. *Half the base is 5; 169 − 25 = 144.*
- **World 7:** "A 6.5 m wire runs from the top of a flagpole to a peg 2.5 m from its base. How tall is the pole?" → **6 m** / 4 m / 9 m / 36 m. *(5-12-13 halved.)*
- **World 8:** "A TV screen is 80 cm wide and 60 cm high. Find its diagonal." → **100 cm** / 140 cm / 20 cm / 10 000 cm. · "A field is 40 m by 30 m. How much shorter is the diagonal than walking the two edges?" → **20 m** / 10 m / 50 m / 70 m.
- **World 9:** one item from each of Worlds 0–8 plus one extra composite item.

**Clean-number and geometric-validity constraints** (hard rules, carried into the TRD generator as dedicated helpers — not inline checks):

1. **Exact-answer worlds (2, 3, 4, parts of 6–9) draw sides only from the curated triple pool:** all 17 integer triples with hypotenuse ≤ 41 (3-4-5, 5-12-13, 6-8-10, 7-24-25, 8-15-17, 9-12-15, 9-40-41, 10-24-26, 12-16-20, 12-35-37, 15-20-25, 15-36-39, 16-30-34, 18-24-30, 20-21-29, 21-28-35, 24-32-40). Real-world contexts may scale a triple by ×0.5 or ×0.1 (e.g. 2.5 / 6 / 6.5) and must be validated in tenths so floating-point error cannot make a "triple" false.
2. **Decimal-answer worlds (5, parts of 9) draw from verified pools:** 156 hypotenuse pairs (legs 2–20) and 213 leg pairs (hypotenuse ≤ 25). A pair is admitted only if (a) the squared value is not a perfect square, (b) rounding to 1 d.p. is unambiguous (the unrounded value is not within 0.005 of an `xx.x5` boundary), and (c) the 1 d.p. answer does not end in `.0` (so no "7.0" that looks like an exact answer). Answers are always computed from the exact squared value.
3. **Orientation and labelling vary.** The right angle sits at a random vertex, the vertex-letter set varies (PQR, ABC, XYZ, LMN, DEF), and diagrams are rotated through eight rotations. The hypotenuse is never fixed as `c`, the bottom side or the slanted side, so students learn "opposite the right angle".
4. **Finding a leg:** the hypotenuse must be strictly the longest side (`c > b`), and the unknown leg is never degenerate.
5. **Options:** exactly 4, all distinct as displayed. Exact-answer triangle questions use integer-valued options only (World 0 number-fluency items may include a halved-value distractor such as 84.5); decimal questions format *every* option to exactly 1 d.p. Distractors encode real misconceptions: added the legs; subtracted when they should add (or added when they should subtract); forgot the square root; used the difference of the sides; rounded the wrong way; (non-isosceles) forgot to halve the base.
6. **Real-world and composite items** must pass an independent recomputation from their `visualData` in the stress test (§14).

## 9. Gamification Naming (8 fixed triggers, relabelled)

| Trigger (fixed) | Badge name |
|---|---|
| First correct answer | First Side Solved ✅ |
| 5-answer streak | Square Streak 🔥 |
| 10-answer streak | Master Measurer Streak 🏅 |
| All 4 Simulate stations complete | Fully Rigged Crew 🧰 |
| Any world scores 3 stars | Triple-Star Site ⭐⭐⭐ |
| Any Boss Battle won | Boss Beam Broken 🏗️ |
| 20+ questions answered in Practice | Tireless Tape Measure 📏 |
| Full 5-phase journey complete | Chief Site Surveyor 🎖️ |

Each world's boss also awards its own reward badge (§8) on a win, in addition to the "Boss Beam Broken" trigger.

## 10. Audio & Narration Content Rules

Spoken in full — never as symbols, abbreviations or digits-only (per the universal rule in §5):
- `a²` → "a squared"; `10² − 6²` → "ten squared minus six squared"; `a² + b² = c²` → "a squared plus b squared equals c squared".
- `√169` → "the square root of one hundred and sixty-nine"; `√52 ≈ 7.2` → "the square root of fifty-two is approximately seven point two".
- Decimals → "eight point six" (digit by digit after the point; "eight point six zero" is never used because answers have exactly 1 d.p.). "correct to 1 decimal place" → "correct to one decimal place".
- Numbers of 1 000 or more → "one thousand five hundred and twenty-one" (never digit strings).
- `cm`, `m` → "centimetres", "metres"; the `²` after a unit never appears (no area units are tested).
- "hypotenuse", "Pythagoras' theorem", "right-angled triangle", "right angle" — always full words. Pronunciation of "Pythagoras" and "hypotenuse" is listen-checked after generation (TRD §12).
- Vertex and side names are spoken letter by letter: "triangle P Q R", "side P R"; "the right angle is at Q".
- `x = 12` → "x equals twelve"; `−` → "minus"; `+` → "plus"; `=` → "equals"; `≈` → "is approximately".
- The right angle `90°` → "ninety degrees".

Dynamic text (generated question stems and explanations) goes through the live ElevenLabs path; everything fixed is pre-generated. Stations narrate their intro and feedback lines (§2.2 #4).

## 11. UI / UX, Layout and Viewport Requirements

Derived from the reference build (screens inspected in-browser at 1366×768, 844×390 and 390×844).

### 11.1 Visual language (inherited)
Dark cosmic-purple gradient background; glass cards (`--glass-bg`, blur 22 px, 1 px translucent border); gold primary button (`btn-gold`), ghost secondary (`btn-secondary`); phase bands in the five phase colours (Wonder `#c084fc`, Story `#fb923c`, Simulate `#38bdf8`, Play `#4ade80`, Reflect `#818cf8`); Fredoka One for headings and numbers, Nunito for body; fluid `clamp()` type and spacing tokens; faint floating background symbols (re-skinned: `√`, `a²`, `3-4-5`, `△`, `⊾`). No creative re-theme of layout.

### 11.2 Global shell
Fixed top bar: **Home** pill (left), five numbered phase pills in a capsule (centre), **Sound** pill and **✕** (right). During Story, a second row shows the panel progress bar ("Job Panel 3 of 6"). Home / ✕ ask for confirmation when any progress exists. The header height is measured at runtime and content is padded by it (TRD §10), so nothing hides under the bar.

### 11.3 Screens
- **Intro:** centred hero card; module name, characters, "Start the Job".
- **Wonder:** one centred glass card (max ≈ 672 px): title, ladder diagram, key numbers, Tally speech bubble, primary button.
- **Story:** two columns on ≥ 768 px (illustration left, text right: case-file label, title, body, highlighted quote pill, character speech bubble); stacked on narrow screens; Back / progress dots / Next row below the card.
- **Simulate:** 12-column shell on ≥ 768 px (station list 4 cols, workspace 8 cols, gated "Go to Practice" button under the list); on narrow screens the station list collapses to a horizontal chip strip above the workspace.
- **Practice:** header with badge button and Stars `n / 30`, mode tabs (four), world map (2 columns on phones, 5 on ≥ 640 px), quiz view with question text, diagram panel, 2 × 2 options (1 column on phones), hint button in Guided mode, feedback overlay with explanation and "Next".
- **Reflect:** card with the three-question recap, then scorecard and reflection, then celebration.

### 11.4 Viewport support matrix

| Tier | Viewports (W×H) | Requirement |
|---|---|---|
| 1 — pixel-correct | 1920×1080, 1440×900, 1366×768 (school laptop), 1280×720, 1024×768 (tablet landscape), 820×1180 and 768×1024 (tablet portrait) | Everything visible and reachable with no page scroll; inner panels scroll only when content genuinely overflows; no content under the header. |
| 2 — fully usable | 390×844 and 360×740 (phone portrait), 844×390 (phone landscape) | Every control reachable (phase navigation, mute, close, primary buttons), no horizontal page scroll; lab and quiz diagrams may reduce in size but keep text labels. The reference fails this tier (§2.2 #5). |

Behaviour rules: use dynamic viewport height (`dvh`) so mobile browser chrome cannot clip content; honour `env(safe-area-inset-*)`; below 1366 px the nav shows numbered pills without text labels, and below 480 px the pill capsule wraps onto its own row so Home, mute and close always stay on screen (this pattern was tested on a copy of the reference at ten viewports from 360×740 to 1920×1080); below 520 px height the diagram panel is capped at 28 dvh and decorative elements (floating symbols, mascot bubble) are hidden; both orientations supported.

### 11.5 Motion and feedback
Framer Motion for card/phase transitions and station feedback; click sound on interactive elements (inherited); confetti on Reflect; correct = green glow, wrong = shake. A `prefers-reduced-motion` setting replaces the Station A tile-pour animation with a step-through (no information is lost).

### 11.6 Diagram standards
Every side carries a text label with its length or `x`/`?`; the right angle is marked with the standard square; the hypotenuse is also labelled "hypotenuse" in learning contexts (Stations, Hint panels) — colour is never the only cue. Diagrams carry a small "not to scale" note. All colours come from CSS variables (TRD §10).

## 12. Accessibility

- Age calibration (13–14 years): moderate enlargement — body ≥ 16 px, station and diagram labels ≥ 14 px (the reference uses 11 px in places), **touch targets ≥ 44 × 44 px** (drag handles have a 56 px hit area; the reference's 32 px station buttons are enlarged).
- Every slider or drag interaction has explicit − / + buttons and arrow-key support (`Shift` = larger step); nothing is drag-only.
- Visible focus rings; `aria-label`s on SVG handles; feedback is announced through an `aria-live` region.
- Text contrast meets WCAG AA on the dark glass surfaces; colour is never the sole carrier of meaning.
- Respects `prefers-reduced-motion`.
- Audio is optional; narration text is always on screen (1:1 parity).

## 13. Assets Required

6 story images (one per Story panel) at **1024×1024**, delivered as **real PNG placeholders** (the reference ships JPEG data in `.png` files and a duplicate `.jpg` set — one correctly typed set only), plus a favicon. The README carries the art brief:

| Panel | File | Scene | Characters and mood |
|---|---|---|---|
| 1 | `story_1.png` | HDB block wall at golden hour; a 5 m ladder resting on a ledge out of reach, foot marked 3 m from the wall; measuring tape on the ground. | Priya and Hafiz looking up, Tally on the ladder rung with a hard hat; curious. |
| 2 | `story_2.png` | The same scene as a clean blueprint: ladder, wall and ground outlined as a triangle with the right-angle square, rotated copies beside it. | Tally pointing at the hypotenuse with a laser pointer; instructional. |
| 3 | `story_3.png` | A drafting table: a 3-4-5 triangle with squares of tiles built on each side; small squares nested into the large one. | Priya sliding tiles, Hafiz amazed; "aha" mood. |
| 4 | `story_4.png` | A flagpole on a field with a taut stay-wire pegged to the ground; chalk calculation 25 + 144 = 169 on the pavement. | Hafiz measuring, Priya writing; confident, bright daylight. |
| 5 | `story_5.png` | A ladder leaning on the wall with the answer 4 m glowing at the ledge; a subtraction chalked beside it. | Priya and Hafiz high-fiving; Tally with a thumbs-up wing; triumphant. |
| 6 | `story_6.png` | Survey Crew site hut at dusk, hard hats on pegs, a city skyline behind, a door marked "Site Lab". | Tally handing out hard hats; celebratory send-off. |

## 14. Success Metrics / Acceptance Criteria

Fixed criteria (every module): bank stress test, audio parity, clean production build, full user-journey walkthrough with zero console/page errors. In addition:

- **Bank correctness, not just schema:** ≥ 300 seeds × 100 questions (30 000); every `visualData` recomputes to the stated answer; every triple is exact in tenths; every decimal item satisfies the §8 rules; ≥ 10 distinct question texts in each world; World 9 draws from ≥ 5 different source worlds; no duplicate options.
- **All four stations are the four archetypes, wired and completable,** and the Simulate list is asserted to be exactly [Discovery, Build-to-Target, Composite, Error-Detective] by an automated test.
- **Boss Battle is playable end-to-end** in all 10 worlds (win and lose paths).
- **All 8 badges unlock** in a scripted walkthrough, and the badge count shown in the UI matches the engine.
- **Reflect recap** targets the hypotenuse / add-vs-subtract misconception (§7.5).
- **Viewport matrix passes** (§11.4): scripted checks at all Tier 1 and Tier 2 viewports find no control outside the viewport, no content under the header and no horizontal scroll.
- **Accessibility floors** (§12) verified at lab and quiz screens.
- **No real API key** in any shipped file.

## 15. Assumptions & Open Questions

(a) **Scope interpretation — please confirm.** "Finding unknown sides" at Grade 8 was taken to mean Pythagoras' theorem. If you meant trigonometric ratios (finding a side from an angle) or similar triangles, the world list, stations and bank change materially; the shell, gamification, audio and viewport work carry over unchanged.
(b) **Syllabus verification.** The MOE syllabus document was not retrievable here; scope follows third-party Sec 2 summaries. Please confirm against the current MOE syllabus, especially whether the converse of Pythagoras' theorem should be assessed in this module.
(c) **Rounding convention.** Non-exact answers are "correct to 1 decimal place" so that MCQ options are unambiguous. The MOE default for unspecified accuracy is 3 significant figures; confirm whether any items should use it.
(d) **Calculator.** Students use their own calculator for non-perfect-square roots (Worlds 5–9); no in-app calculator is included. Confirm, or ask for a simple built-in √ / x² drawer.
(e) **Names and mascot.** Priya, Hafiz and "Foreman Tally" are proposed defaults, not stakeholder-approved. Module name SideQuest vs PythagoQuest is open.
(f) **World unlock rule** (≥ 1★ on the previous world) is inherited from the reference, not specified by the blueprint; confirm.
(g) **Scoped-out skills** (converse of Pythagoras' theorem, trigonometry, similar triangles, surds) are strong candidates for follow-on modules (working name for the next: TrigQuest).
(h) **Security note.** The reference's `.env.local.example` contains what appears to be a real ElevenLabs key. It should be treated as exposed and rotated; SideQuest ships a placeholder only, and production audio should go through a serverless proxy that holds the key.
(i) **Granularity of numbers.** Exact worlds use the 17-triple pool, which gives ~34 ordered variants × label/orientation combinations per template. If stakeholders want less repetition across sessions, raise the hypotenuse limit from 41 (31 triples to 65) at the cost of heavier arithmetic.
