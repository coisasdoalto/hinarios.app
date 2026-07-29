import { describe, expect, it, jest } from '@jest/globals';
import { NextRouter } from 'next/router';
import { HymnsIndex } from '../../schemas/hymnsIndex';
import { performNumericSearch } from './performNumericSearch';

const variantIndex: HymnsIndex = [
  { number: '72a', title: 'Maranata', slug: '72a-Maranata' },
  {
    number: '72b',
    title: 'Maranata (Versão Acampa)',
    slug: '72b-Maranata-Versao-Acampa',
  },
  { number: 73, title: 'Outro hino', slug: '73-Outro-hino' },
];

describe('performNumericSearch', () => {
  it('returns every variant that shares the searched base number', () => {
    const router = { push: jest.fn() } as unknown as NextRouter;
    const results = performNumericSearch({
      hymnBooks: [{ name: 'Em Espírito, Em Verdade', slug: 'ev', index: variantIndex }],
      queryAsNumber: 72,
      router,
    });

    expect(results?.map(({ title }) => title)).toEqual([
      '72a. Maranata',
      '72b. Maranata (Versão Acampa)',
    ]);
  });
});
