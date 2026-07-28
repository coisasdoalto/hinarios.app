import { describe, expect, it } from '@jest/globals';
import { createHymnsIndex } from './createHymnsIndex';

describe('createHymnsIndex', () => {
  it('creates route metadata without changing display values', () => {
    expect(
      createHymnsIndex([
        {
          number: 1,
          title: 'Em Espírito, Em Verdade',
          subtitle: 'Piracicaba',
        },
      ])
    ).toEqual([
      {
        number: 1,
        title: 'Em Espírito, Em Verdade',
        subtitle: 'Piracicaba',
        slug: '1-Em-Espirito-Em-Verdade',
      },
    ]);
  });
});
