// node tools/stills.mjs [ids,comma] [fractions,comma] -> out/stills/<id>_<pct>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const B = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const PREFIX = process.env.PREFIX ?? 'beat-';
const edl = JSON.parse(fs.readFileSync(process.env.EDL ?? 'src/edl.json', 'utf8'));
const ids = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : edl.beats.map((b) => b.id);
const fr = (process.argv[3] ?? '0.6').split(',').map(Number);
fs.mkdirSync('out/stills', {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of ids) {
  const comp = await selectComposition({serveUrl, id: `${PREFIX}${id}`, browserExecutable: B});
  for (const p of fr) {
    const frame = Math.min(comp.durationInFrames - 1, Math.round(comp.durationInFrames * p));
    await renderStill({serveUrl, composition: comp, frame, output: `out/stills/${id}_${Math.round(p * 100)}.png`, browserExecutable: B, scale: 0.5});
  }
  process.stdout.write(id + ' ');
}
console.log('done');
