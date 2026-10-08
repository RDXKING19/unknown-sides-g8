// Seeded PRNG using Mulberry32
export function createRNG(seed = Date.now()) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  
  function next() {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min, max) {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[int(0, arr.length - 1)];
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  return { next, int, pick, shuffle };
}
