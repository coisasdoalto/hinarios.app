import { describe, expect, it } from '@jest/globals';
import { parseChordSheet } from './parseChordSheet';

describe('parseChordSheet', () => {
  it('parses aligned chords, sections, key and balanced repeats', () => {
    const parsedChordSheet = parseChordSheet(
      [
        'TOM %G',
        '',
        '   G       D',
        'Em espírito, em verdade,',
        '',
        '[Refrão]',
        ' C',
        '{Meu prazer é Te louvar',
        ' G',
        'Onde flui o amor.} (2x)',
      ].join('\n'),
      'ev-1'
    );

    expect(parsedChordSheet.originalKey).toBe('G');
    expect(parsedChordSheet.sections).toHaveLength(2);
    expect(parsedChordSheet.sections[0]).toMatchObject({
      type: 'unnumbered',
      lines: [
        {
          text: 'Em espírito, em verdade,',
          chords: [
            { symbol: 'G', column: 3 },
            { symbol: 'D', column: 11 },
          ],
        },
      ],
    });
    expect(parsedChordSheet.sections[1]).toMatchObject({
      type: 'chorus',
      label: 'Refrão',
      lines: [{ text: 'Meu prazer é Te louvar' }, { text: 'Onde flui o amor.' }],
      repeats: [{ times: 2 }],
    });
  });

  it('keeps empty labels and malformed repeat markers without failing', () => {
    const parsedChordSheet = parseChordSheet(
      ['TOM %G', '', '[Canon]', '', '[Todos]', '{Linha sem fechamento', 'Linha final.}'].join('\n'),
      'ev-82'
    );

    expect(parsedChordSheet.sections[0]).toMatchObject({
      label: 'Canon',
      lines: [],
    });
    expect(parsedChordSheet.sections[1]).toMatchObject({
      label: 'Todos',
      lines: [{ text: '{Linha sem fechamento' }, { text: 'Linha final.}' }],
    });
    expect(parsedChordSheet.sections[1].repeats).toBeUndefined();
  });

  it('preserves a chord-only progression as a renderable line', () => {
    const parsedChordSheet = parseChordSheet('TOM %C\n\nC  F  G', 'ev-2');

    expect(parsedChordSheet.sections[0].lines[0]).toEqual({
      id: 'ev-2/section-1/line-1',
      text: '',
      chords: [
        { symbol: 'C', column: 0 },
        { symbol: 'F', column: 3 },
        { symbol: 'G', column: 6 },
      ],
    });
  });

  it('accepts Brazilian major-seventh notation and optional chord groups', () => {
    const parsedChordSheet = parseChordSheet('F7M   G   ( C G7 )\nUma letra', 'ev-3');

    expect(parsedChordSheet.sections[0].lines[0]).toMatchObject({
      text: 'Uma letra',
      chords: [
        { symbol: 'F7M', column: 0 },
        { symbol: 'G', column: 6 },
        { symbol: 'C', column: 12 },
        { symbol: 'G7', column: 14 },
      ],
    });
  });

  it('normalizes Markdown emphasis and keeps chord columns aligned', () => {
    const parsedChordSheet = parseChordSheet('C        G\nEu **te** *adoro*', 'ev-4');

    expect(parsedChordSheet.sections[0].lines[0]).toMatchObject({
      text: 'Eu te adoro',
      chords: [
        { symbol: 'C', column: 0 },
        { symbol: 'G', column: 5 },
      ],
      segments: [
        { text: 'Eu ' },
        { text: 'te', bold: true },
        { text: ' ' },
        { text: 'adoro', italic: true },
      ],
    });
  });

  it('normalizes multiline Markdown emphasis without shifting its chords', () => {
    const parsedChordSheet = parseChordSheet(
      [' C', '*Pra Te adorar,', ' G', 'Onde flui o amor.* (2x)'].join('\n'),
      'ev-1'
    );

    expect(parsedChordSheet.sections[0].lines).toMatchObject([
      {
        text: 'Pra Te adorar,',
        chords: [{ symbol: 'C', column: 0 }],
        segments: [{ text: 'Pra Te adorar,', italic: true }],
      },
      {
        text: 'Onde flui o amor. (2x)',
        chords: [{ symbol: 'G', column: 1 }],
        segments: [{ text: 'Onde flui o amor.', italic: true }, { text: ' (2x)' }],
      },
    ]);
  });
});
