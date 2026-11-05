import { useIsomorphicEffect } from '@mantine/hooks';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';

/**
 * Returns whether a PostHog feature flag is enabled.
 *
 * posthog-js/react's hook only learns the flag value from the "flags loaded"
 * callback, which is not replayed for components that mount later (e.g. after
 * a client-side navigation) unless the /decide request succeeded. This hook
 * also reads the current value (including bootstrapped flags) on mount.
 * @example const isEnabled = useFeatureFlagEnabled('bookmarks');
 */
export function useFeatureFlagEnabled(flag: string): boolean | undefined {
  const client = usePostHog();
  const [isEnabled, setIsEnabled] = useState<boolean | undefined>(undefined);

  useIsomorphicEffect(() => {
    setIsEnabled(client.isFeatureEnabled(flag, { send_event: false }));

    return client.onFeatureFlags(() => setIsEnabled(client.isFeatureEnabled(flag)));
  }, [client, flag]);

  return isEnabled;
}
