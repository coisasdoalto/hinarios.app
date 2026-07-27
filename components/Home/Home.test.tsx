import { render, screen } from '@testing-library/react';
import { describe, expect, it, jest } from '@jest/globals';

import { HC_UNAVAILABLE_MESSAGE } from '../../contants';

const mockUseAccess = jest.fn();

jest.mock('../../context/HymnBooks', () => ({
  useHymnBooks: () => [[]],
  useHymnBooksSave: jest.fn(),
}));

jest.mock('../../hooks/useAccess', () => ({
  useAccess: mockUseAccess,
}));

const Home = jest.requireActual<typeof import('../../pages')>('../../pages').default;

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
});
