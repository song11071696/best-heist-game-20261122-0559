// The Meridian Vault — entry program (make.fun program/v1).
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from the
// kit's vendor/makefun-game.ts. Pure byte copies, so two runs write the
// same bytes. Node 22, no dependencies.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO = resolve(join(fileURLToPath(import.meta.url), '..'));
const OUT = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

mkdirSync(OUT, { recursive: true });

cpSync(join(REPO, 'game'), join(OUT, 'game'), { recursive: true });
cpSync(join(REPO, 'screenshots'), join(OUT, 'screenshots'), { recursive: true });

writeFileSync(
  join(OUT, 'dossier.json'),
  buildDossier(OUT, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`wrote ${OUT}/game, ${OUT}/screenshots and ${OUT}/dossier.json`);
