import { useEffect, useState } from 'react';

type Phase = 'idle' | 'enter' | 'hold' | 'exit';

interface Props {
  isVisible: boolean;
  onComplete: () => void;
}

const LETTERS = 'CRYSTAL'.split('');

const PARTICLES = [
  { r: 82,  speed: '2.6s', color: '#00D4FF', size: 5, ccw: false, delay: '0s' },
  { r: 82,  speed: '2.6s', color: '#00D4FF', size: 3, ccw: false, delay: '-1.3s' },
  { r: 108, speed: '3.8s', color: '#7B2FFF', size: 4, ccw: true,  delay: '0s' },
  { r: 108, speed: '3.8s', color: '#7B2FFF', size: 3, ccw: true,  delay: '-1.9s' },
  { r: 66,  speed: '1.8s', color: '#F0B90B', size: 3, ccw: false, delay: '-0.4s' },
  { r: 66,  speed: '1.8s', color: '#F0B90B', size: 2, ccw: false, delay: '-1.3s' },
  { r: 128, speed: '5.5s', color: '#ffffff', size: 2, ccw: true,  delay: '0s' },
  { r: 128, speed: '5.5s', color: '#ffffff', size: 2, ccw: true,  delay: '-2.75s' },
];

export function CrystalSplash({ isVisible, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (!isVisible) { setPhase('idle'); return; }
    setPhase('enter');
    const t1 = setTimeout(() => setPhase('hold'), 650);
    const t2 = setTimeout(() => setPhase('exit'), 2000);
    const t3 = setTimeout(() => { setPhase('idle'); onComplete(); }, 2650);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isVisible, onComplete]);

  if (phase === 'idle') return null;

  const exiting = phase === 'exit';
  const holding = phase === 'hold';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        background: 'rgba(6,9,18,0.98)',
        animation: exiting
          ? 'splash-bg-out 0.65s ease-in 0.15s both'
          : 'splash-bg-in 0.25s ease-out both',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(0,212,255,0.08) 0%, rgba(123,47,255,0.06) 35%, transparent 65%)',
          animation: holding ? 'splash-glow-pulse 2.2s ease-in-out infinite' : undefined,
          pointerEvents: 'none',
        }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Rings + Particles + Gem ── */}
      <div style={{ position: 'relative', width: '300px', height: '300px', perspective: '700px' }}>

        {/* Ring 1 — outer gold, slow CW */}
        <Ring
          size={300} r={142} color="#F0B90B" strokeWidth={1.5}
          dashArray="85 810" duration="7s" direction="cw"
          enterDelay="0.28s" exiting={exiting} glowBlur={3}
        />

        {/* Ring 2 — middle purple, medium CCW */}
        <Ring
          size={300} r={110} color="#7B2FFF" strokeWidth={2}
          dashArray="125 570" duration="4s" direction="ccw"
          enterDelay="0.14s" exiting={exiting} glowBlur={3}
        />

        {/* Ring 3 — inner cyan, fast CW */}
        <Ring
          size={300} r={80} color="#00D4FF" strokeWidth={2.5}
          dashArray="100 400" duration="2.4s" direction="cw"
          enterDelay="0s" exiting={exiting} glowBlur={4}
        />

        {/* Orbiting particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transformOrigin: '0 0',
              animation: `${p.ccw ? 'ring-ccw' : 'ring-cw'} ${p.speed} linear ${p.delay} infinite`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${-p.size / 2}px`,
                left: `${p.r}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.size * 1.5}px ${p.color}55`,
              }}
            />
          </div>
        ))}

        {/* Gem centering wrapper — isolates translate from animation */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              animation: exiting
                ? 'gem-out 0.55s cubic-bezier(0.55,0,1,0.45) forwards'
                : phase === 'enter'
                ? 'gem-in 0.58s cubic-bezier(0.34,1.56,0.64,1) forwards'
                : 'crystal-rot 6s ease-in-out infinite, gem-pulse 2.5s ease-in-out infinite',
            }}
          >
            <CrystalGem />
          </div>
        </div>

        {/* Radial flash on exit */}
        {exiting && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '2px',
              height: '2px',
              marginLeft: '-1px',
              marginTop: '-1px',
              borderRadius: '50%',
              animation: 'radial-flash 0.6s ease-out forwards',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* ── CRYSTAL letters ── */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              fontSize: '32px',
              fontWeight: 900,
              fontFamily: 'Inter, system-ui, sans-serif',
              background: 'linear-gradient(135deg, #00D4FF 0%, #7B2FFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.65))',
              opacity: 0,
              animation: exiting
                ? `letter-out 0.3s ease-in ${i * 22}ms both`
                : `letter-drop 0.52s cubic-bezier(0.34,1.56,0.64,1) ${200 + i * 55}ms both`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p
        style={{
          margin: '-28px 0 0',
          fontSize: '10px',
          letterSpacing: '5px',
          color: 'rgba(74,85,104,0.85)',
          textTransform: 'uppercase',
          opacity: 0,
          animation: exiting
            ? 'letter-out 0.25s ease-in both'
            : `letter-drop 0.45s ease ${610}ms both`,
        }}
      >
        Crypto Wallet
      </p>
    </div>
  );
}

/* ── Ring sub-component ── */
interface RingProps {
  size: number; r: number; color: string; strokeWidth: number;
  dashArray: string; duration: string; direction: 'cw' | 'ccw';
  enterDelay: string; exiting: boolean; glowBlur: number;
}

function Ring({ size, r, color, strokeWidth, dashArray, duration, direction, enterDelay, exiting, glowBlur }: RingProps) {
  const cx = size / 2;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0,
        animation: exiting
          ? 'ring-out 0.45s ease-in forwards'
          : `ring-in 0.38s cubic-bezier(0.34,1.56,0.64,1) ${enterDelay} both`,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ animation: `ring-${direction} ${duration} linear infinite`, filter: `drop-shadow(0 0 ${glowBlur}px ${color})` }}
      >
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ── Crystal gem SVG ── */
function CrystalGem() {
  return (
    <svg width="110" height="144" viewBox="-55 -72 110 144" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cg-tr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="cg-tl" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7B2FFF" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="cg-tc" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="cg-mr" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7B2FFF" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="cg-ml" x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#7B2FFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="cg-br" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#7B2FFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#060912" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cg-bl" x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#7B2FFF" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#060912" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cg-bc" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#3030a0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#060912" stopOpacity="0.95" />
        </linearGradient>
        <filter id="f-sparkle">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="f-outer-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow */}
      <polygon
        points="0,-62 42,-20 42,20 0,62 -42,20 -42,-20"
        fill="rgba(0,212,255,0.04)"
        stroke="#00D4FF"
        strokeWidth="0.8"
        opacity="0.18"
        filter="url(#f-outer-glow)"
        transform="scale(1.3)"
      />

      {/* ── Crown ── */}
      <polygon points="0,-62 42,-20 0,-16"  fill="url(#cg-tr)" />
      <polygon points="0,-62 -42,-20 0,-16" fill="url(#cg-tl)" />
      <polygon points="0,-62 12,-18 -12,-18" fill="url(#cg-tc)" />
      <polygon points="42,-20 12,-18 0,-16"  fill="url(#cg-tr)" opacity="0.55" />
      <polygon points="-42,-20 -12,-18 0,-16" fill="url(#cg-tl)" opacity="0.55" />

      {/* ── Girdle ── */}
      <polygon points="42,-20 42,20 12,18 12,-18"   fill="url(#cg-mr)" />
      <polygon points="-42,-20 -42,20 -12,18 -12,-18" fill="url(#cg-ml)" />
      <polygon points="12,-18 -12,-18 -12,18 12,18"  fill="rgba(0,212,255,0.08)" />

      {/* ── Pavilion ── */}
      <polygon points="42,20 0,62 12,18"   fill="url(#cg-br)" />
      <polygon points="-42,20 0,62 -12,18" fill="url(#cg-bl)" />
      <polygon points="12,18 -12,18 0,62"  fill="url(#cg-bc)" />

      {/* ── Outline ── */}
      <polygon
        points="0,-62 42,-20 42,20 0,62 -42,20 -42,-20"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.7"
      />

      {/* ── Inner facet lines ── */}
      <line x1="0" y1="-62"  x2="12" y2="-18"  stroke="rgba(255,255,255,0.48)" strokeWidth="0.6" />
      <line x1="0" y1="-62"  x2="-12" y2="-18" stroke="rgba(255,255,255,0.48)" strokeWidth="0.6" />
      <line x1="12" y1="-18" x2="-12" y2="-18" stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" />
      <line x1="12" y1="18"  x2="-12" y2="18"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      <line x1="12" y1="-18" x2="12" y2="18"   stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      <line x1="-12" y1="-18" x2="-12" y2="18" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      <line x1="42" y1="-20"  x2="12" y2="-18"  stroke="rgba(255,255,255,0.3)"  strokeWidth="0.6" />
      <line x1="42" y1="20"   x2="12" y2="18"   stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <line x1="-42" y1="-20" x2="-12" y2="-18" stroke="rgba(255,255,255,0.3)"  strokeWidth="0.6" />
      <line x1="-42" y1="20"  x2="-12" y2="18"  stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <line x1="0" y1="62"  x2="12" y2="18"  stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />
      <line x1="0" y1="62"  x2="-12" y2="18" stroke="rgba(255,255,255,0.22)" strokeWidth="0.6" />

      {/* ── Top sparkle ── */}
      <g filter="url(#f-sparkle)">
        <circle cx="0" cy="-60" r="2.8" fill="white" opacity="0.95" />
        <line x1="0" y1="-70" x2="0" y2="-50"   stroke="white" strokeWidth="1.2" opacity="0.85" />
        <line x1="-10" y1="-60" x2="10" y2="-60" stroke="white" strokeWidth="1.2" opacity="0.85" />
        <line x1="-6" y1="-66" x2="6" y2="-54"  stroke="white" strokeWidth="0.7" opacity="0.45" />
        <line x1="6" y1="-66"  x2="-6" y2="-54" stroke="white" strokeWidth="0.7" opacity="0.45" />
      </g>

      {/* ── Small inner sparkle dots ── */}
      <circle cx="20" cy="-30" r="1.2" fill="white" opacity="0.5" />
      <circle cx="-18" cy="-28" r="0.9" fill="#00D4FF" opacity="0.6" />
      <circle cx="15" cy="5"   r="1"   fill="#7B2FFF" opacity="0.5" />
      <circle cx="-12" cy="8" r="0.8" fill="white" opacity="0.35" />
    </svg>
  );
}
