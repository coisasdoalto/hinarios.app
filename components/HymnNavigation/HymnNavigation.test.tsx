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

const { HymnNavigation } = jest.requireActual('./index') as typeof import('./index');

describe('HymnNavigation', () => {
  it('renders compact previous and next links inline', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true);

    render(
      <HymnNavigation
        hymnBookSlug="hinos"
        previousHymn={{ number: 1, title: 'Primeiro', slug: '1-primeiro' }}
        nextHymn={{ number: 3, title: 'Terceiro', slug: '3-terceiro' }}
      />
    );

    expect(screen.getByRole('navigation', { name: 'Navegação entre hinos' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Anterior: 1. Primeiro' }).getAttribute('href')).toBe(
      '/hinos/1-primeiro'
    );
    expect(screen.getByRole('link', { name: 'Próximo: 3. Terceiro' }).getAttribute('href')).toBe(
      '/hinos/3-terceiro'
    );
  });

  it('disables the direction without a hymn', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true);

    render(
      <HymnNavigation
        hymnBookSlug="hinos"
        previousHymn={null}
        nextHymn={{ number: 2, title: 'Segundo', slug: '2-segundo' }}
      />
    );

    expect(screen.getByRole('button', { name: 'Anterior' })).toHaveProperty('disabled', true);
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

    it('shows the arrow key hint and shortcut on desktop', () => {
      renderNavigation();

      const next = screen.getByRole('link', { name: 'Próximo: 3. Terceiro' });
      expect(next.getAttribute('aria-keyshortcuts')).toBe('ArrowRight');
      expect(next.getAttribute('title')).toBe('3. Terceiro (→)');
      expect(next.textContent).toContain('→');
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
