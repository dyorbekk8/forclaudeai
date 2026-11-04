// node stills.mjs <comp> <outdir> <frame,frame,...>  — one bundle, many stills
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import path from 'path';
const [comp, out, frames] = process.argv.slice(2);
const B = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable: B});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser});
for (const f of frames.split(',').map(Number)) {
  await renderStill({serveUrl, composition, frame: f, output: path.join(out, `f${String(f).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 80, puppeteerInstance: browser, scale: 0.5});
}
await browser.close({silent: true});
console.log('done');
