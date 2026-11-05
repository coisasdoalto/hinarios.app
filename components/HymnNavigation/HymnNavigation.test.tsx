import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

const mockUseFeatureFlagEnabled = jest.fn();
const mockPush = jest.fn();

const mockRouteHandlers: Record<string, Array<() => void>> = {};
const mockRouter = {
  push: (href: string) => {
    mockPush(href);
    (mockRouteHandlers.routeChangeComplete ?? []).forEach((handler) => handler());
  },
  events: {
    on: (event: string, handler: () => void) => {
      mockRouteHandlers[event] = [...(mockRouteHandlers[event] ?? []), handler];
    },
    off: (event: string, handler: () => void) => {
      mockRouteHandlers[event] = (mockRouteHandlers[event] ?? []).filter(
        (item) => item !== handler
      );
    },
  },
};

jest.mock('next/router', () => ({ useRouter: () => mockRouter }));

jest.mock('../../hooks/useFeatureFlagEnabled', () => ({
  useFeatureFlagEnabled: mockUseFeatureFlagEnabled,
}));

const mockUseSideArrowLayout = jest.fn<unknown, []>(() => null);

jest.mock('./sideArrowLayout', () => ({
  ...(jest.requireActual('./sideArrowLayout') as object),
  useSideArrowLayout: () => mockUseSideArrowLayout(),
}));

const { HymnNavigation } = jest.requireActual('./index') as typeof import('./index');

describe('HymnNavigation', () => {
  const renderBetweenHymns = () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true);

    return render(
      <HymnNavigation
        hymnBookSlug="hinos"
        currentNumber={2}
        previousHymn={{ number: 1, title: 'Primeiro', slug: '1-primeiro' }}
        nextHymn={{ number: 3, title: 'Terceiro', slug: '3-terceiro' }}
      />
    );
  };

  it('uses the original bottom bar when the side arrows do not fit', () => {
    mockUseSideArrowLayout.mockReturnValue({ arrows: null, areaLeft: 0 });
    renderBetweenHymns();

    expect(screen.queryByRole('link', { name: 'Anterior: 1. Primeiro' })).toBeNull();
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/hinos/1-primeiro', '/hinos/3-terceiro']);
    expect(screen.getByText('Anterior')).toBeTruthy();
    expect(screen.getByText('Próximo')).toBeTruthy();
  });

  it('shows arrows on the sides of the content when they fit', () => {
    mockUseSideArrowLayout.mockReturnValue({ arrows: { previous: 180, next: 1220 }, areaLeft: 0 });
    renderBetweenHymns();

    const previous = screen.getByRole('link', { name: 'Anterior: 1. Primeiro' });
    const next = screen.getByRole('link', { name: 'Próximo: 3. Terceiro' });
    expect(previous.getAttribute('href')).toBe('/hinos/1-primeiro');
    expect(previous.getAttribute('aria-keyshortcuts')).toBe('ArrowLeft');
    expect(next.getAttribute('href')).toBe('/hinos/3-terceiro');
    expect(next.getAttribute('aria-keyshortcuts')).toBe('ArrowRight');
  });

  it('has no side arrow past the first hymn', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true);
    mockUseSideArrowLayout.mockReturnValue({ arrows: { previous: 180, next: 1220 }, areaLeft: 0 });

    render(
      <HymnNavigation
        hymnBookSlug="hinos"
        previousHymn={null}
        nextHymn={{ number: 2, title: 'Segundo', slug: '2-segundo' }}
      />
    );

    expect(screen.queryByRole('link', { name: /Anterior/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Próximo: 2. Segundo' })).toBeTruthy();
  });

  it('renders nothing when the feature flag is disabled', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(false);

    const { container } = render(<HymnNavigation hymnBookSlug="hinos" />);

    expect(container.innerHTML).toBe('');
  });

  describe('shortcuts', () => {
    const renderNavigation = () => {
      mockUseFeatureFlagEnabled.mockReturnValue(true);
      mockPush.mockClear();

      return render(
        <HymnNavigation
          hymnBookSlug="hinos"
          previousHymn={{ number: 1, title: 'Primeiro', slug: '1-primeiro' }}
          nextHymn={{ number: 3, title: 'Terceiro', slug: '3-terceiro' }}
        />
      );
    };

    const touch = (type: 'touchStart' | 'touchEnd', x: number, y = 300) => {
      const point = { clientX: x, clientY: y };
      fireEvent[type](document.body, {
        touches: type === 'touchStart' ? [point] : [],
        changedTouches: [point],
      });
    };

    it('goes to the previous/next hymn with the arrow keys', () => {
      renderNavigation();

      fireEvent.keyDown(document.body, { key: 'ArrowRight' });
      fireEvent.keyDown(document.body, { key: 'ArrowLeft' });

      expect(mockPush.mock.calls).toEqual([['/hinos/3-terceiro'], ['/hinos/1-primeiro']]);
    });

    it('ignores arrow keys typed in inputs', () => {
      renderNavigation();
      const input = document.createElement('input');
      document.body.append(input);

      fireEvent.keyDown(input, { key: 'ArrowRight' });

      expect(mockPush).not.toHaveBeenCalled();
      input.remove();
    });

    it('goes to the next hymn on swipe left and previous on swipe right', () => {
      renderNavigation();

      touch('touchStart', 300);
      touch('touchEnd', 120);
      touch('touchStart', 100);
      touch('touchEnd', 280);

      expect(mockPush.mock.calls).toEqual([['/hinos/3-terceiro'], ['/hinos/1-primeiro']]);
    });

    it('does not navigate on vertical scrolls', () => {
      renderNavigation();

      touch('touchStart', 300, 600);
      touch('touchEnd', 200, 200);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
