jest.mock('./useUser', () => ({
  useUser: () => ({
    isLoading: false,
    user: null,
  }),
}));

const { ADMINS } = require('./useAdmin');

describe('ADMINS', () => {
  test('contains the expected admin emails', () => {
    expect(ADMINS).toEqual([
      'pablo.dinella@gmail.com',
      'raphaeldeoliveiracorrea@gmail.com',
      'irmaosdiadema@gmail.com',
    ]);
  });
});
