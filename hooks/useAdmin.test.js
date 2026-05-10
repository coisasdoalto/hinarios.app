jest.mock('./useUser', () => ({
  useUser: () => ({
    isLoading: false,
    user: null,
  }),
}));

const { ADMINS } = require('./useAdmin');

describe('ADMINS', () => {
  test('includes irmaosdiadema@gmail.com', () => {
    expect(ADMINS).toContain('irmaosdiadema@gmail.com');
  });
});
