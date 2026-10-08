// utils/speak.js — on-screen notation → spoken words. Used for BOTH narration text and the audioMap key (parity by construction).

const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const UNITS = { cm: 'centimetres', m: 'metres' };
const VERTEX_TOKEN = /\b([PQRABCXYZLMNDEF]{2,3})\b/g; // only letters used by LABEL_SETS, so "HDB" and "TV" are untouched

export const PRONUNCIATION = {
  // Optional phonetic substitutions if listen-check requires them
};

/** 0 … 999 999 */
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
  s = s.replace(/\(([^()]+)\)\s*²/g, '$1, all squared');
  s = s.replace(/\b([a-z]|\d+)\s*²/g, (_, b) => `${/\d/.test(b) ? numberToWords(b) : b} squared`);
  s = s.replace(/√\s*\(?(\d+)\)?/g, (_, d) => `the square root of ${numberToWords(d)}`);
  s = s.replace(/≈/g, ' is approximately ').replace(/≠/g, ' is not equal to ').replace(/−/g, ' minus ')
       .replace(/\+/g, ' plus ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/=/g, ' equals ');
  s = s.replace(/(\d+)\.(\d+)/g, (_, i, f) => `${numberToWords(i)} point ${[...f].map(d => DIGITS[d]).join(' ')}`);
  s = s.replace(/\b(\d{1,3}(?: \d{3})+)\b/g, m => numberToWords(m.replace(/ /g, '')));
  s = s.replace(/\b(\d+)\b/g, (_, d) => numberToWords(d));
  s = s.replace(/\b(cm|m)\b/g, (_, u) => UNITS[u]);
  s = s.replace(VERTEX_TOKEN, (_, v) => [...v].join(' '));

  for (const [raw, rep] of Object.entries(PRONUNCIATION)) {
    s = s.replaceAll(raw, rep);
  }

  return s.replace(/\s+/g, ' ').trim();
}
