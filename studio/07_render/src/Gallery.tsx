import {AbsoluteFill} from 'remotion';
import {Sprinkler} from './components/Sprinkler';
import {C, fonts} from './theme';

const bulbs = [
  ['ORANGE', '#F07A1A'],
  ['RED', '#D9262B'],
  ['YELLOW', '#F2C61F'],
  ['GREEN', '#2E9E4F'],
  ['BLUE', '#2F6FD6'],
  ['PURPLE', '#7A3FB8'],
  ['BLACK', '#1B1B1F'],
] as const;

export const Gallery = () => (
  <AbsoluteFill style={{background: C.paper, flexDirection: 'row', flexWrap: 'wrap', padding: 60, gap: 24}}>
    {bulbs.map(([n, c]) => (
      <div key={n} style={{width: 230, height: 440, background: C.tile, border: `2px solid ${C.tileBorder}`, borderRadius: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Sprinkler bulb={{liquid: c}} size={170} />
        <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 34, color: C.ink, marginTop: 6}}>{n}</div>
      </div>
    ))}
    <div style={{width: 230, height: 440, background: C.tile, border: `2px solid ${C.tileBorder}`, borderRadius: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Sprinkler bulb={{liquid: '#D9262B', response: 'quick'}} size={170} expansion={0.6} glow={0.8} />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 34, color: C.ink}}>QUICK</div>
    </div>
    <div style={{width: 230, height: 440, background: C.tile, border: `2px solid ${C.tileBorder}`, borderRadius: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Sprinkler fusible bulb={null} size={170} />
      <div style={{fontFamily: fonts.label, fontWeight: 800, fontSize: 34, color: C.ink}}>FUSIBLE</div>
    </div>
  </AbsoluteFill>
);
