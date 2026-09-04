import { describe, expect, it } from '@jest/globals';

import type { IpLocation } from './locationAccess';
import { getUserAccess } from './userAccess';

const piracicabaLocation: IpLocation = {
  city: 'Piracicaba',
  region_code: 'SP',
  country_code: 'BR',
};

describe('getUserAccess', () => {
  it('grants HC access from a Piracicaba location before checking email', () => {
    expect(getUserAccess('person@example.com', piracicabaLocation)).toEqual({
      isAdmin: false,
      canAccessHc: true,
    });
  });

  it('grants HC access to an allowed email regardless of casing', () => {
    expect(getUserAccess(' IRMAOSDIADEMA@GMAIL.COM ', undefined)).toEqual({
      isAdmin: false,
      canAccessHc: true,
    });
  });

  it('grants admin access only to configured administrators', () => {
    expect(getUserAccess('raphaeldeoliveiracorrea@gmail.com', undefined)).toEqual({
      isAdmin: true,
      canAccessHc: true,
    });
  });

  it('denies access when the email is absent or not allowed', () => {
    expect(getUserAccess(undefined, undefined)).toEqual({ isAdmin: false, canAccessHc: false });
    expect(getUserAccess('person@example.com', undefined)).toEqual({
      isAdmin: false,
      canAccessHc: false,
    });
  });
});
