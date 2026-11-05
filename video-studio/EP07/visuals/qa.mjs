// usage: node qa.mjs out_prefix t1 t2 t3 ...   (times in seconds) -> PNGs + grid
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const [, , prefix, ...times] = process.argv;
const browserExecutable = fs.readFileSync('.browser', 'utf8').trim();
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: 'Main', inputProps: {}, browserExecutable });
const outs = [];
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * 30));
  const output = `../08_qa/stills/${prefix}_${String(frame).padStart(5, '0')}.png`;
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, inputProps: {}, imageFormat: 'png' });
  outs.push([output, t]);
}
fs.writeFileSync('/tmp/claude-0/qa_list.json', JSON.stringify(outs));
execSync(`python3 qa_grid.py ../08_qa/stills/${prefix}_grid.jpg`, { stdio: 'inherit' });
