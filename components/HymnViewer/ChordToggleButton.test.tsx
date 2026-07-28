import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChordToggleButton } from './ChordToggleButton';

describe('ChordToggleButton', () => {
  it('announces the active state and requests the inverse state', () => {
    const onChange = jest.fn();
    render(<ChordToggleButton checked onChange={onChange} />);

    const button = screen.getByRole('button', { name: 'Ocultar cifras' });
    expect(button.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
