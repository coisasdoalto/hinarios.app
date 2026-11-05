import { highlightMatches } from './highlightMatches';

const body = `1. Castelo forte é nosso Deus, espada e bom escudo;
com seu poder defende os seus em todo transe agudo.

2. A nossa força nada faz, estamos, sim, perdidos;
mas nosso Deus socorro traz e somos protegidos.`;

describe('highlightMatches', () => {
  it('highlights a single word', () => {
    expect(highlightMatches('Deus é amor, castelo de paz', 'castelo')).toBe(
      '…@@@castelo@@@ de paz'
    );
  });

  it('returns null when nothing matches', () => {
    expect(highlightMatches(body, 'chuva')).toBeNull();
    expect(highlightMatches(body, '')).toBeNull();
  });

  it('highlights a long phrase as a whole, starting the snippet near it', () => {
    expect(highlightMatches(body, 'a nossa força nada faz estamos sim perdidos')).toBe(
      '…@@@A nossa força nada faz, estamos, sim, perdidos@@@; mas nosso Deus socorro traz e somos protegidos.'
    );
  });

  it('does not highlight short words inside other words', () => {
    const result = highlightMatches(body, 'com seu poder defende os seus em todo transe');

    expect(result).toBe(
      '…@@@com seu poder defende os seus em todo transe@@@ agudo. 2. A nossa força nada faz, estamos, sim, perdidos; mas nosso Deus socorro traz e somos protegidos.'
    );
  });

  it('ignores accents and case', () => {
    expect(highlightMatches(body, 'FORCA nada')).toBe(
      '…@@@força nada@@@ faz, estamos, sim, perdidos; mas nosso Deus socorro traz e somos protegidos.'
    );
  });

  it('matches word prefixes (partially typed words)', () => {
    expect(highlightMatches(body, 'socorro tr')).toBe('…@@@socorro traz@@@ e somos protegidos.');
  });

  it('prefers the longest phrase match over earlier single words', () => {
    expect(highlightMatches(body, 'mas nosso Deus')).toBe(
      '…@@@mas nosso Deus@@@ socorro traz e somos protegidos.'
    );
  });

  it('also highlights other occurrences of meaningful terms after the best match', () => {
    expect(highlightMatches('Deus é amor e nosso Deus é bom', 'deus')).toBe(
      '@@@Deus@@@ é amor e nosso @@@Deus@@@ é bom'
    );
  });

  it('only adds the ellipsis when there is text before the match', () => {
    expect(highlightMatches('Castelo forte é nosso Deus', 'castelo forte')).toBe(
      '@@@Castelo forte@@@ é nosso Deus'
    );
  });

  it('does not match a lone short word', () => {
    expect(highlightMatches('Castelo forte', 'a')).toBeNull();
  });
});
