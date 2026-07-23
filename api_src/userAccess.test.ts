import { describe, expect, it } from '@jest/globals';

import { getUserAccess } from './userAccess';

describe('getUserAccess', () => {
  it('grants HC access to an allowed email regardless of casing', () => {
    expect(getUserAccess(' IRMAOSDIADEMA@GMAIL.COM ')).toEqual({
      isAdmin: false,
      canAccessHc: true,
    });
  });

  it('grants admin access only to configured administrators', () => {
    expect(getUserAccess('raphaeldeoliveiracorrea@gmail.com')).toEqual({
      isAdmin: true,
      canAccessHc: true,
    });
  });

  it('denies access when the email is absent or not allowed', () => {
    expect(getUserAccess()).toEqual({ isAdmin: false, canAccessHc: false });
    expect(getUserAccess('person@example.com')).toEqual({
      isAdmin: false,
      canAccessHc: false,
    });
  });
});
