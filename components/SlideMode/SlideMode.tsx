import { ActionIcon, Tooltip, useMantineTheme } from '@mantine/core';
import { getHotkeyManager, useHotkey } from '@tanstack/react-hotkeys';
import { IconPresentation, IconX } from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsDesktopDevice } from '../../hooks/useIsDesktopDevice';
import { useSlidePopupPreference } from '../../hooks/useSlidePopupPreference';
import { useWindowFocus } from '../../hooks/useWindowFocus';
import { Hymn } from '../../schemas/hymn';
import { getFocusIndicatorColor, getFocusIndicatorShadow } from '../../utils/focusIndicator';
import {
  composeSlideScreens,
  getSlideLabel,
  getSlideText,
  SlideScreen,
} from './composeSlideScreens';

export const SLIDE_MODE_MIN_FONT_SIZE = 24;
export const SLIDE_MODE_MAX_FONT_SIZE = 96;
export const SLIDE_MODE_FONT_STEP = 4;
export const SLIDE_MODE_DEFAULT_FONT_SIZE = 64;
const SLIDE_MODE_EMERGENCY_MIN_FONT_SIZE = 8;
const SLIDE_MODE_HORIZONTAL_PADDING = 48;
const SLIDE_MODE_VERTICAL_PADDING = 128;
const SLIDE_MODE_PLUS_HOTKEYS = [{ key: '=', shift: true }, { key: '+' }, { key: 'Add' }] as const;

export type SlideModeProps = {
  number?: number | string;
  title: string;
  lyrics: Hymn['lyrics'];
  showNumber?: boolean;
};

type ContentDimensions = {
  width: number;
  height: number;
};

function getContentDimensions(viewport: HTMLElement): ContentDimensions {
  const viewportWidth = viewport.clientWidth || window.innerWidth;
  const viewportHeight = viewport.clientHeight || window.innerHeight;

  return {
    width: Math.max(0, viewportWidth - SLIDE_MODE_HORIZONTAL_PADDING),
    height: Math.max(0, viewportHeight - SLIDE_MODE_VERTICAL_PADDING),
  };
}

function fitsInViewport(
  textElement: HTMLElement,
  dimensions: ContentDimensions,
  fontSize: number
): boolean {
  textElement.style.fontSize = `${fontSize}px`;

  return (
    textElement.scrollWidth <= dimensions.width && textElement.scrollHeight <= dimensions.height
  );
}

function findLargestFittingSize(
  textElement: HTMLElement,
  dimensions: ContentDimensions,
  upperBound: number,
  lowerBound: number
): number {
  let low = lowerBound;
  let high = upperBound;

  while (high - low > 0.5) {
    const candidate = (low + high) / 2;

    if (fitsInViewport(textElement, dimensions, candidate)) {
      low = candidate;
    } else {
      high = candidate;
    }
  }

  return Math.floor(low);
}

function calculateFittingFontSize(
  textElement: HTMLElement,
  dimensions: ContentDimensions,
  requestedFontSize: number
): number {
  const requestedUpperBound = Math.min(requestedFontSize, SLIDE_MODE_MAX_FONT_SIZE);

  if (fitsInViewport(textElement, dimensions, requestedUpperBound)) {
    return requestedUpperBound;
  }

  if (fitsInViewport(textElement, dimensions, SLIDE_MODE_MIN_FONT_SIZE)) {
    return findLargestFittingSize(
      textElement,
      dimensions,
      requestedUpperBound,
      SLIDE_MODE_MIN_FONT_SIZE
    );
  }

  return findLargestFittingSize(
    textElement,
    dimensions,
    SLIDE_MODE_MIN_FONT_SIZE,
    SLIDE_MODE_EMERGENCY_MIN_FONT_SIZE
  );
}

function getNextIndex(currentIndex: number, direction: -1 | 1, screenCount: number): number {
  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= screenCount) return currentIndex;

  return nextIndex;
}

function requestFullscreen(element: HTMLDivElement): void {
  if (!element.requestFullscreen) return;

  try {
    void Promise.resolve(element.requestFullscreen()).catch(() => undefined);
  } catch {
    // Browsers may reject fullscreen synchronously when user activation is unavailable.
  }
}

function exitFullscreen(element: HTMLDivElement | null): void {
  const ownerDocument = element?.ownerDocument;
  if (
    !ownerDocument ||
    ownerDocument.fullscreenElement !== element ||
    !ownerDocument.exitFullscreen
  )
    return;

  try {
    void Promise.resolve(ownerDocument.exitFullscreen()).catch(() => undefined);
  } catch {
    // The overlay is already closing, even if the browser refuses the exit request.
  }
}

function copyPopupStyles(popupDocument: Document): void {
  document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((style) => {
    popupDocument.head.appendChild(style.cloneNode(true));
  });
}

function openSlidePopup(): Window | null {
  const popup = window.open('', 'hinarios-slide-mode', 'popup=yes,width=1280,height=720');
  if (!popup) return null;

  popup.document.title = 'Modo Slide';
  popup.document.body.innerHTML = '';
  popup.document.body.style.margin = '0';
  copyPopupStyles(popup.document);
  popup.focus();

  return popup;
}

type PopupKeyHandlers = {
  close: () => void;
  decreaseFontSize: () => void;
  increaseFontSize: () => void;
  move: (direction: -1 | 1) => void;
};

function handlePopupKeyDown(event: KeyboardEvent, handlers: PopupKeyHandlers): void {
  if (event.key === 'Escape') handlers.close();
  if (event.key === 'ArrowLeft') handlers.move(-1);
  if (event.key === 'ArrowRight') handlers.move(1);
  if (event.key === '-') handlers.decreaseFontSize();
  if (event.key === '+' || (event.key === '=' && event.shiftKey)) handlers.increaseFontSize();
}

function usePlusShortcut(enabled: boolean, callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const manager = getHotkeyManager();
    const registrations = SLIDE_MODE_PLUS_HOTKEYS.map((hotkey) =>
      manager.register(hotkey, () => callbackRef.current(), { ignoreInputs: false })
    );

    return () => registrations.forEach((registration) => registration.unregister());
  }, [enabled]);
}

function SlideText({
  screen,
  fontSize,
  textRef,
}: {
  screen: SlideScreen;
  fontSize: number;
  textRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={textRef}
      data-testid="slide-mode-text"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        overflowWrap: 'anywhere',
        textAlign: 'center',
        whiteSpace: 'pre-line',
        fontSize: `${fontSize}px`,
        fontStyle: screen.type === 'chorus' ? 'italic' : 'normal',
        lineHeight: 1.2,
      }}
    >
      {getSlideText(screen.text)}
    </div>
  );
}

/**
 * Provides a fullscreen-friendly lyric presentation with keyboard navigation.
 *
 * @example <SlideMode number={1} title="Hino" lyrics={lyrics} />
 */
export function SlideMode({
  number,
  title,
  lyrics,
  showNumber = true,
}: SlideModeProps): JSX.Element {
  const screens = composeSlideScreens(lyrics);
  const isDesktopDevice = useIsDesktopDevice();
  const [isPopupEnabled] = useSlidePopupPreference();
  const [isOpen, setIsOpen] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [requestedFontSize, setRequestedFontSize] = useState(SLIDE_MODE_DEFAULT_FONT_SIZE);
  const [fittingFontSize, setFittingFontSize] = useState(SLIDE_MODE_DEFAULT_FONT_SIZE);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const popupWindowRef = useRef<Window | null>(null);
  const theme = useMantineTheme();
  const isWindowFocused = useWindowFocus();
  const [isPopupFocused, setIsPopupFocused] = useState(false);
  const focusColor = getFocusIndicatorColor(theme.colorScheme);

  const closePopup = useCallback(() => {
    const popup = popupWindowRef.current;
    popupWindowRef.current = null;
    setPopupWindow(null);
    if (popup && !popup.closed) popup.close();
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
    exitFullscreen(overlayRef.current);
    closePopup();
  }, [closePopup]);

  const move = useCallback(
    (direction: -1 | 1) => {
      setCurrentIndex((index) => getNextIndex(index, direction, screens.length));
    },
    [screens.length]
  );

  const increaseFontSize = useCallback(() => {
    setRequestedFontSize((size) => Math.min(SLIDE_MODE_MAX_FONT_SIZE, size + SLIDE_MODE_FONT_STEP));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setRequestedFontSize((size) => Math.max(SLIDE_MODE_MIN_FONT_SIZE, size - SLIDE_MODE_FONT_STEP));
  }, []);

  useHotkey('Escape', close, { enabled: isOpen });
  useHotkey('ArrowLeft', () => move(-1), { enabled: isOpen });
  useHotkey('ArrowRight', () => move(1), { enabled: isOpen });
  useHotkey({ key: '-' }, decreaseFontSize, { enabled: isOpen });
  usePlusShortcut(isOpen, increaseFontSize);

  useEffect(() => {
    if (!isOpen || !popupWindow) return;

    const handleKeyDown = (event: KeyboardEvent) =>
      handlePopupKeyDown(event, { close, decreaseFontSize, increaseFontSize, move });
    popupWindow.document.addEventListener('keydown', handleKeyDown);

    return () => popupWindow.document.removeEventListener('keydown', handleKeyDown);
  }, [close, decreaseFontSize, increaseFontSize, isOpen, move, popupWindow]);

  useEffect(() => {
    if (!popupWindow) return;

    const handleFocus = () => setIsPopupFocused(true);
    const handleBlur = () => setIsPopupFocused(false);

    popupWindow.addEventListener('focus', handleFocus);
    popupWindow.addEventListener('blur', handleBlur);

    const handleBeforeUnload = () => {
      popupWindowRef.current = null;
      setPopupWindow(null);
      setIsPopupFocused(false);
      setIsOpen(false);
    };
    popupWindow.addEventListener('beforeunload', handleBeforeUnload);

    handleFocus();

    return () => {
      popupWindow.removeEventListener('focus', handleFocus);
      popupWindow.removeEventListener('blur', handleBlur);
      popupWindow.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [popupWindow]);

  useEffect(
    () => () => {
      const popup = popupWindowRef.current;
      if (popup && !popup.closed) popup.close();
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const ownerDocument = overlay.ownerDocument;
    const handleFullscreenChange = () => {
      if (ownerDocument.fullscreenElement !== overlay) close();
    };

    ownerDocument.addEventListener('fullscreenchange', handleFullscreenChange);
    overlay.focus();
    requestFullscreen(overlay);

    return () => ownerDocument.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [close, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const viewport = viewportRef.current;
    const textElement = textRef.current;
    if (!viewport || !textElement) return;

    const recalculateFontSize = () => {
      const dimensions = getContentDimensions(viewport);
      const nextFontSize = calculateFittingFontSize(textElement, dimensions, requestedFontSize);

      setFittingFontSize(nextFontSize);
    };

    recalculateFontSize();

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(recalculateFontSize);
    observer?.observe(viewport);
    window.addEventListener('resize', recalculateFontSize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', recalculateFontSize);
    };
  }, [currentIndex, isOpen, requestedFontSize]);

  const screen = screens[currentIndex];
  const backgroundColor = theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white;
  const foregroundColor = theme.colorScheme === 'dark' ? theme.white : theme.black;

  function openCurrentSlide(): void {
    setCurrentIndex(0);
    const popup = isDesktopDevice && isPopupEnabled ? openSlidePopup() : null;
    popupWindowRef.current = popup;
    setPopupWindow(popup);
    setIsOpen(true);
  }

  const slideContent = isOpen && screen && (
    <div
      ref={overlayRef}
      aria-label="Modo Slide"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor,
        color: foregroundColor,
        outline: 'none',
        boxShadow: popupWindow
          ? getFocusIndicatorShadow(isPopupFocused, focusColor)
          : getFocusIndicatorShadow(isWindowFocused, focusColor),
      }}
    >
      <div
        style={{
          position: 'relative',
          flex: '0 0 auto',
          padding: '16px 64px 8px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
          {showNumber ? `${number}. ${title}` : title}
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
            fontSize: '0.9rem',
          }}
        >
          {getSlideLabel(screen)}
        </p>
        <ActionIcon
          aria-label="Fechar Modo Slide"
          onClick={close}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
          }}
          sx={(buttonTheme) => {
            const buttonColor =
              buttonTheme.colorScheme === 'dark' ? buttonTheme.white : buttonTheme.colors.blue[9];

            return {
              color: buttonColor,
              border: `1px solid ${buttonTheme.fn.rgba(buttonColor, 0.35)}`,
              backgroundColor: buttonTheme.fn.rgba(buttonColor, 0.06),
              '&:hover': {
                backgroundColor: buttonTheme.fn.rgba(buttonColor, 0.14),
              },
            };
          }}
          variant="subtle"
        >
          <IconX stroke={1.5} />
        </ActionIcon>
      </div>

      <div
        ref={viewportRef}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '24px',
        }}
      >
        <SlideText screen={screen} fontSize={fittingFontSize} textRef={textRef} />
      </div>
    </div>
  );

  return (
    <>
      <Tooltip label="Modo Slide">
        <ActionIcon
          ref={triggerRef}
          aria-label="Abrir Modo Slide"
          onClick={openCurrentSlide}
          disabled={screens.length === 0}
          size="lg"
          variant="subtle"
        >
          <IconPresentation stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      {popupWindow?.document.body && slideContent
        ? createPortal(slideContent, popupWindow.document.body)
        : slideContent}
    </>
  );
}
