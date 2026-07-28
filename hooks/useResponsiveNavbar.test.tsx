import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { useResponsiveNavbar } from './useResponsiveNavbar';

function ResponsiveNavbarHarness({ isWideScreen }: { isWideScreen: boolean }): ReactElement {
  const navbar = useResponsiveNavbar(isWideScreen);

  return (
    <>
      <span>{navbar.isNavbarOpen ? 'Menu aberto' : 'Menu fechado'}</span>
      <button type="button" onClick={navbar.toggleNavbar}>
        Alternar
      </button>
      <button type="button" onClick={navbar.closeAfterNavigation}>
        Navegar
      </button>
    </>
  );
}

describe('useResponsiveNavbar', () => {
  it('starts closed and closes after navigation on mobile', () => {
    render(<ResponsiveNavbarHarness isWideScreen={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Alternar' }));
    expect(screen.getByText('Menu aberto')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Navegar' }));
    expect(screen.getByText('Menu fechado')).toBeTruthy();
  });

  it('starts open and stays open after navigation on wide screens', () => {
    render(<ResponsiveNavbarHarness isWideScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Navegar' }));
    expect(screen.getByText('Menu aberto')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Alternar' }));
    expect(screen.getByText('Menu fechado')).toBeTruthy();
  });

  it('keeps independent states when the viewport changes', () => {
    const harness = render(<ResponsiveNavbarHarness isWideScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Alternar' }));

    harness.rerender(<ResponsiveNavbarHarness isWideScreen={false} />);
    expect(screen.getByText('Menu fechado')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Alternar' }));

    harness.rerender(<ResponsiveNavbarHarness isWideScreen />);
    expect(screen.getByText('Menu fechado')).toBeTruthy();
  });
});
