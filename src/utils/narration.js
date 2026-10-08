import { say, ask, cheer, emphasize, think, instruct, celebrate } from './audio.js';
import { speak } from './speak.js';

/* ------------------------------------------------------------ 01 · WONDER */
export function wonderNarration() {
  return [
    say(
      speak(
        'Priya and Hafiz arrive at their first job site with Foreman Tally. A 5 m ladder leans against an HDB wall, its foot 3 m out. The top rests on a high ledge that cannot be reached directly.'
      )
    ),
    ask(
      speak(
        'What if you could find a length you cannot measure, just from two lengths that you can?'
      )
    )
  ];
}

/* ------------------------------------------------------------- 02 · STORY */
const STORY = [
  // Panel 1: The Length You Can't Measure
  [
    say(
      speak(
        'Priya and Hafiz arrive at their first job site with Foreman Tally. A 5 m ladder leans against a building wall, its foot 3 m out. The top rests on a high ledge that is out of reach. Surveyors never climb — they calculate!'
      )
    ),
    emphasize(
      speak('Surveyors do not climb — they calculate!')
    )
  ],
  // Panel 2: Meet the Hypotenuse
  [
    instruct(
      speak(
        'The vertical wall, flat ground, and ladder form a 90° right-angled triangle. Look straight across from the 90° angle to find the hypotenuse: it is strictly the longest side. The other two sides are the legs.'
      )
    ),
    emphasize(
      speak('The hypotenuse always sits directly opposite the 90° right angle.')
    )
  ],
  // Panel 3: The Square Secret: a² + b² = c²
  [
    say(
      speak(
        'Build a square on each side of a 3-4-5 right triangle. The leg squares hold 9 and 16 unit tiles. Together, 9 + 16 = 25, which perfectly fills the square on the hypotenuse! This is Pythagoras\' theorem: a² + b² = c².'
      )
    ),
    emphasize(
      speak('a² + b² = c² — squares on the legs fill the square on the hypotenuse.')
    )
  ],
  // Panel 4: Solving the Site Mystery
  [
    celebrate(
      speak(
        'To find the hypotenuse, add the squares and take the square root. To find a leg, subtract squares! 5² − 3² = 25 − 9 = 16, so the vertical height = √16 = 4 m! Grab your hard hats — into the Site Lab!'
      )
    ),
    say(
      speak('Hard hats on — into the Site Lab!')
    )
  ]
];

export function storyNarration(panelIdx) {
  return STORY[panelIdx] || [];
}

/* ---------------------------------------------------------- 03 · SIMULATE */
const SIM_INTROS = [
  instruct(
    speak(
      'Welcome to Station A: The Square Secret Lab! Build squares on the legs and hypotenuse, pour the unit tiles, and discover how the area rule holds only when the angle is exactly 90 degrees.'
    )
  ),
  instruct(
    speak(
      'Welcome to Station B: Ladder Lock-In! Adjust the foot distance so the top of the ladder locks perfectly onto the target ledge at the required height.'
    )
  ),
  instruct(
    speak(
      'Welcome to Station C: Foreman Tally\'s Site Report! Inspect the surveyor calculations, spot the single arithmetic or algebraic slip, and pick the verified fix.'
    )
  )
];

export function simStationIntro(stationIdx) {
  const intro = SIM_INTROS[stationIdx];
  return intro ? [intro] : [];
}

export function stationEventNarration(stationIdx, event) {
  if (event === 'pour_complete') {
    return [cheer(speak('Tiles poured! The squares on the legs exactly fill the square on the hypotenuse!'))];
  }
  if (event === 'angle_locked') {
    return [cheer(speak('Angle locked at 90 degrees! Pythagoras\' theorem is verified.'))];
  }
  if (event === 'target_matched') {
    return [cheer(speak('Target reached! Ladder locked onto the ledge.'))];
  }
  if (event === 'step_correct') {
    return [cheer(speak('Step verified! Moving to the next section.'))];
  }
  if (event === 'slip_found') {
    return [cheer(speak('Slip spotted! Now select the correct replacement line.'))];
  }
  if (event === 'station_complete') {
    return [celebrate(speak('Station complete! Excellent surveying work.'))];
  }
  return [];
}

/* ---------------------------------------------------------- 04 · PRACTICE */
export function playQuestionNarration(q) {
  if (!q || !q.questionText) return [];
  return [ask(speak(q.questionText))];
}

const PRACTICE_CORRECT = [
  'Length found! Excellent geometric calculation!',
  'Measurement verified! Right on target!',
  'Outstanding surveying! That side is spot on!',
  'Splendid site work! Calculation confirmed!'
];

const PRACTICE_WRONG = [
  'Check the working! Make sure you identified the hypotenuse correctly.',
  'Careful surveyor! Remember to subtract when finding a shorter leg.',
  'Almost! Double check whether to add or subtract the squares.'
];

export function playCorrectNarration(n = 0) {
  return [cheer(speak(PRACTICE_CORRECT[n % PRACTICE_CORRECT.length]))];
}

export function playWrongNarration(n = 0) {
  return [instruct(speak(PRACTICE_WRONG[n % PRACTICE_WRONG.length]))];
}

export function playHint1Narration(text) {
  return [think(speak(text || 'Identify whether you are finding the hypotenuse or a shorter side.'))];
}

export function playHint2Narration(text) {
  return [instruct(speak(text || 'Set up the equation using Pythagoras\' theorem and calculate the square root.'))];
}

export function districtCompleteNarration(districtName) {
  return [celebrate(speak(`Site survey completed! You cleared all jobs in ${districtName}!`))];
}

export function bossStartNarration(bossName) {
  return [emphasize(speak(`A site emergency has occurred with ${bossName}! Solve 5 questions with 3 safety lives to secure the beam!`))];
}

export function bossWinNarration(bossName) {
  return [celebrate(speak(`Victory! You have secured the structure against ${bossName} and earned your reward badge!`))];
}

/* ------------------------------------------------------------ 05 · REFLECT */
export function reflectNarration() {
  return [
    think(
      speak(
        'Welcome to the Site Debrief! Complete the conceptual recap quiz and explain your geometric findings to Foreman Tally.'
      )
    )
  ];
}

export function reflectCompleteNarration() {
  return [
    celebrate(
      speak(
        'Outstanding debrief! You are now officially certified as a Chief Site Surveyor!'
      )
    )
  ];
}

/* ---------------------------------------------- everything, for the generator */
export function getAllNarration() {
  const all = [
    ...wonderNarration(),
    ...STORY.flat(),
    ...SIM_INTROS,
    ...PRACTICE_CORRECT.map(t => cheer(speak(t))),
    ...PRACTICE_WRONG.map(t => instruct(speak(t))),
    ...reflectNarration(),
    ...reflectCompleteNarration()
  ];
  const seen = new Set();
  return all.filter(seg => (seen.has(seg.text) ? false : seen.add(seg.text)));
}
