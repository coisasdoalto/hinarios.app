import { describe, expect, it } from '@jest/globals';

import { getRequestIp, IpLocationResolver, isPiracicabaLocation } from './locationAccess';
import type { IpLocationFetcher, IpLocationResponse } from './locationAccess';

class FakeIpLocationFetcher {
  requestedUrls: string[] = [];

  constructor(private readonly response: IpLocationResponse) {}

  fetch(url: string): Promise<IpLocationResponse> {
    this.requestedUrls.push(url);
    return Promise.resolve(this.response);
  }
}

class FakeIpLocationResponse implements IpLocationResponse {
  constructor(private readonly body: unknown, public readonly ok: boolean) {}

  async json(): Promise<unknown> {
    return this.body;
  }
}

describe('isPiracicabaLocation', () => {
  it('accepts the target city with accents and different casing', () => {
    expect(
      isPiracicabaLocation({ city: 'PIRACICABA', region_code: 'sp', country_code: 'br' })
    ).toBe(true);
  });

  it('rejects locations outside the target city, state, or country', () => {
    expect(isPiracicabaLocation({ city: 'Campinas', region_code: 'SP', country_code: 'BR' })).toBe(
      false
    );
    expect(
      isPiracicabaLocation({ city: 'Piracicaba', region_code: 'PR', country_code: 'BR' })
    ).toBe(false);
    expect(
      isPiracicabaLocation({ city: 'Piracicaba', region_code: 'SP', country_code: 'AR' })
    ).toBe(false);
  });
});

describe('getRequestIp', () => {
  it('prefers the hosting proxy client IP headers', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.10',
      'x-forwarded-for': '203.0.113.20, 203.0.113.30',
    });

    expect(getRequestIp(headers)).toBe('203.0.113.10');
  });

  it('takes the first address from forwarded-for', () => {
    expect(getRequestIp(new Headers({ 'x-forwarded-for': '203.0.113.20, 203.0.113.30' }))).toBe(
      '203.0.113.20'
    );
  });
});

describe('IpLocationResolver', () => {
  it('resolves the client IP through the geolocation provider', async () => {
    const fetcher = new FakeIpLocationFetcher(
      new FakeIpLocationResponse(
        {
          city: 'Piracicaba',
          region_code: 'SP',
          country_code: 'BR',
          latitude: -22.7253,
          longitude: -47.6492,
        },
        true
      )
    );
    const resolver = new IpLocationResolver(fetcher.fetch.bind(fetcher) as IpLocationFetcher);

    await expect(resolver.resolve('203.0.113.10')).resolves.toEqual({
      city: 'Piracicaba',
      region_code: 'SP',
      country_code: 'BR',
      latitude: -22.7253,
      longitude: -47.6492,
    });
    expect(fetcher.requestedUrls).toEqual(['https://ipapi.co/203.0.113.10/json/']);
  });

  it('fails closed when the provider is unavailable or returns invalid data', async () => {
    const unavailableFetcher = new FakeIpLocationFetcher(new FakeIpLocationResponse({}, false));
    const invalidFetcher = new FakeIpLocationFetcher(
      new FakeIpLocationResponse({ error: true }, true)
    );

    await expect(
      new IpLocationResolver(unavailableFetcher.fetch.bind(unavailableFetcher)).resolve(
        '203.0.113.10'
      )
    ).resolves.toBeUndefined();
    await expect(
      new IpLocationResolver(invalidFetcher.fetch.bind(invalidFetcher)).resolve('203.0.113.10')
    ).resolves.toBeUndefined();
  });
});
