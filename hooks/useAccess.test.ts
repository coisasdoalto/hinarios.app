import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type RequestConfig = { headers?: Record<string, string>; params?: unknown };

const mockedGet = jest.fn<Promise<unknown>, [string, RequestConfig?]>();
const mockAuth: { currentUser: { getIdToken: () => Promise<string> } | null } = {
  currentUser: null,
};

jest.mock('axios', () => ({ __esModule: true, default: { get: mockedGet } }));
jest.mock('../firebase/web', () => ({ auth: mockAuth }));
jest.mock('./useUser', () => ({ useUser: () => ({ isLoading: false, user: null }) }));

// Required after the mocks: this jest transform doesn't hoist them above imports.
const { requestUserAccess } = jest.requireActual('./useAccess') as typeof import('./useAccess');

describe('requestUserAccess', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue({ data: { isAdmin: false, canAccessHc: true } });
    mockAuth.currentUser = null;
  });

  it("checks access with the signed-in user's token and no location", async () => {
    mockAuth.currentUser = { getIdToken: async () => 'id-token' };

    expect((await requestUserAccess()).canAccessHc).toBe(true);
    expect(mockedGet).toHaveBeenCalledTimes(1);

    const [url, config] = mockedGet.mock.calls[0];
    expect(url).toBe('/api/hc/access');
    expect(config?.headers).toEqual({ Authorization: 'Bearer id-token' });
    expect(config?.params).toBeUndefined();
  });

  it('never asks the browser for its location', async () => {
    const getCurrentPosition = jest.fn();
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });

    await requestUserAccess();

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
});
