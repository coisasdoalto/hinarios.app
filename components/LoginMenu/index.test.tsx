import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';

const mockUseUser = jest.fn<{ user: unknown; isLoading: boolean }, []>();

jest.mock('../../hooks/useUser', () => ({ useUser: () => mockUseUser() }));
jest.mock('../../firebase/web/auth', () => ({
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
}));

const { default: LoginMenu } = jest.requireActual('./index') as typeof import('./index');

function renderMenu() {
  return render(
    <MantineProvider>
      <LoginMenu />
    </MantineProvider>
  );
}

describe('LoginMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the login button to visitors without depending on feature flags', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: false });
    renderMenu();

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
  });

  it('renders nothing while the auth state is loading', () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true });
    const { container } = renderMenu();

    expect(container.textContent).toBe('');
  });
});
