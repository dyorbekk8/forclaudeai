import React from 'react';
import { staticFile, continueRender, delayRender } from 'remotion';

const faces: [string, number, string][] = [
  ['Fredoka', 500, 'fonts/fredoka-latin-500-normal.woff2'],
  ['Fredoka', 600, 'fonts/fredoka-latin-600-normal.woff2'],
  ['Fredoka', 700, 'fonts/fredoka-latin-700-normal.woff2'],
  ['Nunito', 800, 'fonts/nunito-latin-800-normal.woff2'],
  ['Nunito', 900, 'fonts/nunito-latin-900-normal.woff2'],
];
let loaded = false;
export const useFonts = () => {
  const [handle] = React.useState(() => (loaded ? null : delayRender('fonts')));
  React.useEffect(() => {
    if (loaded || handle === null) return;
    Promise.all(
      faces.map(([fam, w, f]) => {
        const ff = new FontFace(fam, `url(${staticFile(f)}) format('woff2')`, { weight: String(w) });
        return ff.load().then((x) => (document.fonts as any).add(x));
      }),
    ).then(() => { loaded = true; continueRender(handle); });
  }, [handle]);
};
