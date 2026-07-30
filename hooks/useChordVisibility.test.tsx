import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { useChordVisibility } from './useChordVisibility';

function ChordVisibilityHarness() {
  const [showChords, setShowChords] = useChordVisibility();

  return (
    <button type="button" onClick={() => setShowChords((visible) => !visible)}>
      {showChords ? 'Cifras visíveis' : 'Cifras ocultas'}
    </button>
  );
}

describe('useChordVisibility', () => {
  beforeEach(() => localStorage.clear());

  it('persists visibility changes in local storage', () => {
    const firstRender = render(<ChordVisibilityHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Cifras ocultas' }));
    firstRender.unmount();

    render(<ChordVisibilityHarness />);

    expect(screen.getByRole('button', { name: 'Cifras visíveis' })).toBeTruthy();
  });
});
