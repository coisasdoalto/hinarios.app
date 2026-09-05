import { render, screen } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';

import { HC_UNAVAILABLE_MESSAGE } from '../../contants';

const mockUseAccess = jest.fn();
const mockUseFeatureFlagEnabled = jest.fn();

jest.mock('../../context/HymnBooks', () => ({
  useHymnBooks: () => [[]],
  useHymnBooksSave: jest.fn(),
}));

jest.mock('../../hooks/useAccess', () => ({
  useAccess: mockUseAccess,
}));

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: mockUseFeatureFlagEnabled,
}));

const Home = (jest.requireActual('../../pages') as typeof import('../../pages')).default;

describe('Home access loading', () => {
  it('shows loading without flashing the unavailable notice', () => {
    mockUseAccess.mockReturnValue({
      canAccessHc: false,
      isAdmin: false,
      isLoading: true,
    });

    render(<Home hymnBooks={[]} />);

    expect(screen.getByLabelText('Carregando permissões')).toBeTruthy();
    expect(screen.queryByText(HC_UNAVAILABLE_MESSAGE)).toBeNull();
  });

  it('links to standalone songs as a separate area', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(true);
    mockUseAccess.mockReturnValue({
      canAccessHc: false,
      isAdmin: false,
      isLoading: false,
    });

    render(<Home hymnBooks={[]} />);

    expect(screen.getByRole('link', { name: /Outras músicas/i }).getAttribute('href')).toBe(
      '/outras-musicas'
    );
  });

  it('hides standalone songs when its feature flag is disabled', () => {
    mockUseFeatureFlagEnabled.mockReturnValue(false);
    mockUseAccess.mockReturnValue({
      canAccessHc: false,
      isAdmin: false,
      isLoading: false,
    });

    render(<Home hymnBooks={[]} />);

    expect(screen.queryByRole('link', { name: /Outras músicas/i })).toBeNull();
  });
});
