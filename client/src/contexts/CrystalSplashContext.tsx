import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { CrystalSplash } from '../components/effects/CrystalSplash';

interface SplashContextValue {
  triggerSplash: (onComplete: () => void) => void;
}

const SplashContext = createContext<SplashContextValue>({ triggerSplash: (cb) => cb() });

export function CrystalSplashProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const callbackRef = useRef<() => void>(() => {});

  const triggerSplash = useCallback((onComplete: () => void) => {
    callbackRef.current = onComplete;
    setVisible(true);
  }, []);

  const handleComplete = useCallback(() => {
    setVisible(false);
    callbackRef.current();
  }, []);

  return (
    <SplashContext.Provider value={{ triggerSplash }}>
      {children}
      <CrystalSplash isVisible={visible} onComplete={handleComplete} />
    </SplashContext.Provider>
  );
}

export const useCrystalSplash = () => useContext(SplashContext);
