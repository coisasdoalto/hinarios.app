import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

const mockUseFeatureFlagEnabled = jest.fn();

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
});
