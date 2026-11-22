// The Meridian Vault — a tiny seeded random number generator.
// Every staged screenshot and every deterministic test run draws from
// mulberry32, so the same seed always deals the same room.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick a value in [min, max) from a seeded generator.
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

// Pick one element of an array from a seeded generator.
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
