import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type Params = Record<string, unknown> | undefined;

const mockedGet = jest.fn<Promise<unknown>, [string, { params?: Params }?]>();

jest.mock('axios', () => ({ __esModule: true, default: { get: mockedGet } }));
jest.mock('../firebase/web', () => ({ auth: { currentUser: null } }));
jest.mock('./useUser', () => ({ useUser: () => ({ isLoading: false, user: null }) }));

// Required after the mocks: this jest transform doesn't hoist them above imports.
const { getRememberedCoordinates, hcGet, rememberHcAccessParams } = jest.requireActual(
  '../utils/hcRequest'
) as typeof import('../utils/hcRequest');
const { requestUserAccess } = jest.requireActual('./useAccess') as typeof import('./useAccess');
const PIRACICABA = { latitude: -22.7253, longitude: -47.6492 };

/** Grants access only when the request carries the given parameter. */
function grantWhen(predicate: (params: Params) => boolean) {
  mockedGet.mockImplementation(async (_url, config) => ({
    data: { isAdmin: false, canAccessHc: predicate(config?.params) },
  }));
}

function mockGeolocation(coordinates?: typeof PIRACICABA) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (success: PositionCallback, error: PositionErrorCallback) =>
        coordinates
          ? success({ coords: coordinates } as GeolocationPosition)
          : error({} as GeolocationPositionError),
    },
  });
}

describe('requestUserAccess', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    rememberHcAccessParams(undefined);
  });

  it('keeps HC when a later location read fails', async () => {
    grantWhen((params) => params?.latitude === PIRACICABA.latitude);

    mockGeolocation(PIRACICABA);
    expect((await requestUserAccess()).canAccessHc).toBe(true);

    mockGeolocation(undefined);
    expect((await requestUserAccess()).canAccessHc).toBe(true);
    expect(getRememberedCoordinates()).toEqual(PIRACICABA);
  });

  it('sends the expanded-radius fallback with HC requests when that granted access', async () => {
    grantWhen((params) => params?.locationFallback === 'expanded');
    mockGeolocation(undefined);

    expect((await requestUserAccess()).canAccessHc).toBe(true);

    await hcGet('/api/hc/search');
    expect(mockedGet).toHaveBeenLastCalledWith(
      '/api/hc/search',
      expect.objectContaining({ params: { locationFallback: 'expanded' } })
    );
  });

  it('sends no location with HC requests when the connection alone granted access', async () => {
    rememberHcAccessParams({ latitude: 0, longitude: 0 });
    grantWhen(() => true);

    expect((await requestUserAccess()).canAccessHc).toBe(true);

    await hcGet('/api/hc/search');
    expect(mockedGet).toHaveBeenLastCalledWith(
      '/api/hc/search',
      expect.objectContaining({ params: {} })
    );
  });
});
