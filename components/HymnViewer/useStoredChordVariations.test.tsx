import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { CHORD_VARIATIONS_STORAGE_KEY, useStoredChordVariations } from './useStoredChordVariations';

function StoredVariationHarness(): ReactElement {
  const [variations, setVariations] = useStoredChordVariations();

  return (
    <button type="button" onClick={() => setVariations({ ...variations, G: 2 })}>
      {variations.G ?? 0}
    </button>
  );
}

describe('useStoredChordVariations', () => {
  beforeEach(() => localStorage.clear());

  it('persists selected variations in shared local storage', () => {
    render(<StoredVariationHarness />);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button').textContent).toBe('2');
    expect(JSON.parse(localStorage.getItem(CHORD_VARIATIONS_STORAGE_KEY) ?? '{}')).toEqual({
      G: 2,
    });
  });
});
