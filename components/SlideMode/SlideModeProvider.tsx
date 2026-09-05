import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { SlideMode, SlideModeProps } from './SlideMode';

type Presentation = {
  hymn: SlideModeProps;
  triggerContainer: HTMLElement;
};

const SlideModeContext = createContext<((presentation: Presentation) => void) | null>(null);

export function SlideModeProvider({ children }: PropsWithChildren) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);

  return (
    <SlideModeContext.Provider value={setPresentation}>
      {children}
      {presentation && (
        <SlideMode {...presentation.hymn} triggerContainer={presentation.triggerContainer} />
      )}
    </SlideModeContext.Provider>
  );
}

// The page supplies the hymn and a place for the button. The presentation stays
// mounted in the app while lists, search results, and other pages are visited.
export function HymnSlideMode({ hymnId, number, title, lyrics, showNumber }: SlideModeProps) {
  const setPresentation = useContext(SlideModeContext);
  const [triggerContainer, setTriggerContainer] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!triggerContainer || !setPresentation) return;

    setPresentation({
      hymn: { hymnId, number, title, lyrics, showNumber },
      triggerContainer,
    });
  }, [hymnId, number, title, lyrics, showNumber, triggerContainer, setPresentation]);

  return <span ref={setTriggerContainer} />;
}
