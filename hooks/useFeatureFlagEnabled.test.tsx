import { describe, expect, it, jest } from '@jest/globals';
import { act, render, screen } from '@testing-library/react';

type FlagsCallback = () => void;

const handlers: FlagsCallback[] = [];
const flags: Record<string, boolean> = {};
const mockClient = {
  isFeatureEnabled: jest.fn((flag: string) => flags[flag]),
  onFeatureFlags: jest.fn((callback: FlagsCallback) => {
    // Like posthog-js when /decide was not hit: the callback is only stored,
    // not called immediately.
    handlers.push(callback);
    return () => handlers.splice(handlers.indexOf(callback), 1);
  }),
};

jest.mock('posthog-js/react', () => ({
  usePostHog: () => mockClient,
}));

const { useFeatureFlagEnabled } = jest.requireActual(
  './useFeatureFlagEnabled'
) as typeof import('./useFeatureFlagEnabled');

function FlagProbe({ flag }: { flag: string }) {
  return <span data-testid="flag">{String(useFeatureFlagEnabled(flag))}</span>;
}

describe('useFeatureFlagEnabled', () => {
  it('reads already loaded flags when mounting after they were announced', () => {
    flags['hymn-bottom-navigation'] = true;

    render(<FlagProbe flag="hymn-bottom-navigation" />);

    expect(screen.getByTestId('flag').textContent).toBe('true');
  });

  it('updates when flags are reloaded', () => {
    flags.bookmarks = false;
    render(<FlagProbe flag="bookmarks" />);
    expect(screen.getByTestId('flag').textContent).toBe('false');

    flags.bookmarks = true;
    act(() => handlers.forEach((handler) => handler()));

    expect(screen.getByTestId('flag').textContent).toBe('true');
  });
});
