import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';
import { HymnBookUnavailable } from './index';

describe('HymnBookUnavailable', () => {
  it('shows the unavailable message and a home link', () => {
    render(<HymnBookUnavailable />);

    expect(screen.getByText(/Estamos trabalhando junto aos detentores/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar para a home' }).getAttribute('href')).toBe('/');
  });
});
