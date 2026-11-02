import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, Audio, staticFile } from 'remotion';
import { FPS, TOTAL_SECONDS, tw, ease } from './lib/anim';
import { Grain, Vignette, Flash } from './lib/ui';
import { AgeHUD } from './lib/HUD';
import { POPS } from './lib/ledger';
import { useFonts } from './lib/Fonts';
import { SHOTS, Tr } from './shots/list';

const TrWrap: React.FC<{ tr: Tr; children: React.ReactNode }> = ({ tr, children }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let style: React.CSSProperties = {};
  if (tr === 'whip') {
    const k = tw(t, 0, 0.22, 1, 0, ease.out);
    style = { transform: `translateX(${k * 420}px)`, filter: k > 0.02 ? `blur(${k * 26}px)` : undefined };
  } else if (tr === 'whipL') {
    const k = tw(t, 0, 0.22, 1, 0, ease.out);
    style = { transform: `translateX(${-k * 420}px)`, filter: k > 0.02 ? `blur(${k * 26}px)` : undefined };
  } else if (tr === 'zoom') {
    const k = tw(t, 0, 0.3, 1, 0, ease.out);
    style = { transform: `scale(${1 + k * 0.35})`, filter: k > 0.02 ? `blur(${k * 14}px)` : undefined, opacity: 1 - k * 0.3 };
  } else if (tr === 'fade') {
    style = { opacity: tw(t, 0, 0.45, 0, 1, ease.soft) };
  } else if (tr === 'slowfade') {
    style = { opacity: tw(t, 0, 1.1, 0, 1, ease.soft) };
  }
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const Main: React.FC<{ from?: number; withAudio?: boolean }> = ({ withAudio = false }) => {
  useFonts();
  const f = useCurrentFrame();
  const gt = f / FPS;
  // pop shake + flash (Eli's lies)
  let shake = 0, flash = 0;
  for (const p of POPS) {
    const dt = gt - p.t;
    if (dt >= 0 && dt < 0.5) {
      shake = Math.max(shake, (p.soft ? 0.5 : 1) * Math.exp(-dt * 9));
      flash = Math.max(flash, (p.soft ? 0.25 : 0.55) * Math.exp(-dt * 16));
    }
  }
  const sx = shake * 16 * Math.sin(gt * 95), sy = shake * 12 * Math.cos(gt * 77);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + shake * 0.02})` }}>
        {SHOTS.map((sh, i) => {
          const start = Math.round(sh.at * FPS);
          const end = i < SHOTS.length - 1 ? Math.round(SHOTS[i + 1].at * FPS) : Math.round(TOTAL_SECONDS * FPS);
          const C = sh.C;
          return (
            <Sequence key={i} from={start} durationInFrames={Math.max(1, end - start)} name={sh.name}>
              <TrWrap tr={sh.tr ?? 'cut'}>
                <C o={sh.at} d={(end - start) / FPS} />
              </TrWrap>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AgeHUD gt={gt} />
      <Flash k={flash} />
      <Vignette />
      <Grain opacity={0.055} />
      {withAudio && <Audio src={staticFile('audio/mix.wav')} />}
    </AbsoluteFill>
  );
};
