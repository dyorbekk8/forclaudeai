import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, string][] = [
  ['Barlow Condensed', '600', 'BarlowCondensed-600.woff2'],
  ['Barlow Condensed', '700', 'BarlowCondensed-700.woff2'],
  ['Barlow Condensed', '800', 'BarlowCondensed-800.woff2'],
  ['Inter', '400 700', 'Inter-400.woff2'],
  ['Caveat', '600 700', 'Caveat-700.woff2'],
  ['JetBrains Mono', '500 700', 'JetBrainsMono-700.woff2'],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading local fonts');
  Promise.all(
    faces.map(([family, weight, file]) => {
      const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
      document.fonts.add(f);
      return f.load();
    }),
  ).then(() => continueRender(handle));
}

export const fonts = {
  label: 'Barlow Condensed',
  body: 'Inter',
  hand: 'Caveat',
  mono: 'JetBrains Mono',
};

export const C = {
  paper: '#F6F5F1',
  tile: '#FFFFFF',
  tileBorder: '#DEDCD6',
  ink: '#16161A',
  inkSoft: '#5B5B63',
  inkFaint: '#9A9AA2',
  red: '#D7262E',
  redDark: '#A3161D',
  water: '#4FA3E0',
  heat: '#FF7A1A',
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;
