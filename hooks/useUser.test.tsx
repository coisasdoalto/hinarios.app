import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render } from '@testing-library/react';

type AuthCallback = (user: unknown) => void;

const mockAuthCallbacks: AuthCallback[] = [];
const mockPosthog = {
  get_property: jest.fn<unknown, [string]>(),
  reset: jest.fn(),
  identify: jest.fn(),
};

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: AuthCallback) => {
    mockAuthCallbacks.push(callback);
    return () => undefined;
  },
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock('posthog-js/react', () => ({ usePostHog: () => mockPosthog }));
jest.mock('../firebase/web', () => ({ auth: {} }));

const { useUser } = jest.requireActual('./useUser') as typeof import('./useUser');

function UserProbe() {
  useUser();
  return null;
}

describe('useUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthCallbacks.length = 0;
  });

  it('does not reset PostHog for anonymous visitors', () => {
    mockPosthog.get_property.mockReturnValue('anonymous');
    render(<UserProbe />);

    mockAuthCallbacks.forEach((callback) => callback(null));

    expect(mockPosthog.reset).not.toHaveBeenCalled();
  });

  it('resets PostHog when an identified user logs out', () => {
    mockPosthog.get_property.mockReturnValue('identified');
    render(<UserProbe />);

    mockAuthCallbacks.forEach((callback) => callback(null));

    expect(mockPosthog.reset).toHaveBeenCalledTimes(1);
  });
});
