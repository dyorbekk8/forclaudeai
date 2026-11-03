import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
export const Smoke = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{background: '#f4f4f2', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 300, height: 300, background: '#d62828', borderRadius: 24, transform: `scale(${s})`,
        opacity: interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};
