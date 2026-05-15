import { useEffect, useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutModal({ isOpen, isLoading, onConfirm, onCancel }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={!isLoading ? onCancel : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(6,9,18,0.9)',
          backdropFilter: 'blur(6px)',
          transition: 'opacity 0.25s ease',
          opacity: visible ? 1 : 0,
          cursor: isLoading ? 'default' : 'pointer',
        }}
      />

      {/* Red scanlines on backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,48,48,0.018) 3px, rgba(255,48,48,0.018) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(160deg, #0f1520 0%, #0a0f1a 100%)',
          border: '1px solid rgba(255,48,48,0.35)',
          borderRadius: '2px',
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(255,48,48,0.12), 0 0 100px rgba(255,48,48,0.05), inset 0 0 40px rgba(255,48,48,0.025)',
          transition: 'all 0.32s cubic-bezier(0.34,1.4,0.64,1)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.87) translateY(-14px)',
          opacity: visible ? 1 : 0,
          filter: visible ? 'blur(0)' : 'blur(5px)',
        }}
      >
        {/* Top glow bar */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,48,48,0.8) 30%, #FF3030 50%, rgba(255,48,48,0.8) 70%, transparent 100%)',
          boxShadow: '0 0 12px rgba(255,48,48,0.9)',
        }} />

        {/* Corner brackets */}
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />

        {/* Body */}
        <div style={{ padding: '36px 36px 28px' }}>

          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: '-10px',
                borderRadius: '50%',
                background: 'rgba(255,48,48,0.08)',
                animation: 'animate-pulse-ring 2s ease-in-out infinite',
              }} />
              <div style={{
                width: '68px', height: '68px',
                borderRadius: '50%',
                background: 'rgba(255,48,48,0.07)',
                border: '1px solid rgba(255,48,48,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(255,48,48,0.18)',
              }}>
                <LogOut style={{ width: '28px', height: '28px', color: '#FF3030' }} />
              </div>
            </div>
          </div>

          {/* Glitch title */}
          <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative', height: '28px' }}>
            {/* Base layer */}
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 800, letterSpacing: '5px',
              color: '#FF3030',
              textShadow: '0 0 12px rgba(255,48,48,0.55)',
              fontFamily: 'Inter, system-ui, sans-serif',
              textTransform: 'uppercase',
              animation: 'glitch-text 5s ease-in-out infinite',
            }}>
              TERMINATE SESSION
            </span>
            {/* Cyan glitch slice */}
            <span aria-hidden style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 800, letterSpacing: '5px',
              color: '#00D4FF',
              fontFamily: 'Inter, system-ui, sans-serif',
              textTransform: 'uppercase',
              animation: 'glitch-clip-1 5s ease-in-out infinite',
              pointerEvents: 'none', userSelect: 'none',
            }}>
              TERMINATE SESSION
            </span>
            {/* Red glitch slice */}
            <span aria-hidden style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 800, letterSpacing: '5px',
              color: '#FF8080',
              fontFamily: 'Inter, system-ui, sans-serif',
              textTransform: 'uppercase',
              animation: 'glitch-clip-2 5s 0.3s ease-in-out infinite',
              pointerEvents: 'none', userSelect: 'none',
            }}>
              TERMINATE SESSION
            </span>
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: '13px',
            color: 'rgba(113,128,150,0.85)',
            lineHeight: 1.7,
            marginBottom: '28px',
          }}>
            Your secure session will be terminated.<br />
            You will need to re-authenticate to access your wallet.
          </p>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,48,48,0.2) 50%, transparent)',
            marginBottom: '24px',
          }} />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <CancelBtn onClick={onCancel} disabled={isLoading} />
            <ConfirmBtn onClick={onConfirm} disabled={isLoading} isLoading={isLoading} />
          </div>
        </div>

        {/* Status footer */}
        <div style={{
          padding: '9px 36px',
          background: 'rgba(255,48,48,0.035)',
          borderTop: '1px solid rgba(255,48,48,0.12)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: '#FF3030',
            boxShadow: '0 0 6px #FF3030',
            flexShrink: 0,
            animation: 'float 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '9px',
            letterSpacing: '3px',
            color: 'rgba(255,48,48,0.5)',
            textTransform: 'uppercase',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            SECURITY PROTOCOL ACTIVE
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '9px', letterSpacing: '2px', color: 'rgba(255,48,48,0.3)', fontFamily: 'monospace' }}>
            SYS://AUTH
          </span>
        </div>

        {/* Bottom glow line */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,48,48,0.25) 50%, transparent)',
        }} />
      </div>
    </div>
  );
}

/* ── Corner bracket decoration ── */
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const top = pos.startsWith('t');
  const left = pos.endsWith('l');
  return (
    <div style={{
      position: 'absolute',
      top: top ? 10 : undefined,
      bottom: !top ? 10 : undefined,
      left: left ? 10 : undefined,
      right: !left ? 10 : undefined,
      width: 14, height: 14,
      borderTop: top ? '1.5px solid rgba(255,48,48,0.55)' : undefined,
      borderBottom: !top ? '1.5px solid rgba(255,48,48,0.55)' : undefined,
      borderLeft: left ? '1.5px solid rgba(255,48,48,0.55)' : undefined,
      borderRight: !left ? '1.5px solid rgba(255,48,48,0.55)' : undefined,
    }} />
  );
}

/* ── Cancel button ── */
function CancelBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, padding: '11px',
        borderRadius: '2px',
        border: `1px solid ${hovered ? 'rgba(0,212,255,0.55)' : 'rgba(0,212,255,0.25)'}`,
        background: hovered ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.04)',
        color: '#00D4FF',
        fontSize: '11px', fontWeight: 700, letterSpacing: '3px',
        textTransform: 'uppercase' as const,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: hovered ? '0 0 14px rgba(0,212,255,0.15)' : 'none',
      }}
    >
      CANCEL
    </button>
  );
}

/* ── Confirm button ── */
function ConfirmBtn({ onClick, disabled, isLoading }: { onClick: () => void; disabled: boolean; isLoading: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, padding: '11px',
        borderRadius: '2px',
        border: `1px solid ${hovered ? 'rgba(255,48,48,0.75)' : 'rgba(255,48,48,0.45)'}`,
        background: hovered
          ? 'linear-gradient(135deg, rgba(255,48,48,0.28), rgba(180,20,20,0.38))'
          : 'linear-gradient(135deg, rgba(255,48,48,0.14), rgba(180,20,20,0.22))',
        color: '#FF3030',
        fontSize: '11px', fontWeight: 700, letterSpacing: '3px',
        textTransform: 'uppercase' as const,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !isLoading ? 0.4 : 1,
        transition: 'all 0.2s',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: hovered ? '0 0 20px rgba(255,48,48,0.28)' : '0 0 10px rgba(255,48,48,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}
    >
      {isLoading ? (
        <>
          <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
          LOGGING OUT
        </>
      ) : 'CONFIRM'}
    </button>
  );
}
