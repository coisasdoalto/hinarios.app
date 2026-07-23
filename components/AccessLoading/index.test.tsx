import { render, screen } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import { AccessLoading } from './index';

describe('AccessLoading', () => {
  it('shows an accessible loading indicator', () => {
    render(<AccessLoading />);

    expect(screen.getByLabelText('Carregando permissões')).toBeTruthy();
  });
});
