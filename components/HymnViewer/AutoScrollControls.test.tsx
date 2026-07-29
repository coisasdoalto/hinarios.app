import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { AutoScrollControls } from './AutoScrollControls';

describe('AutoScrollControls', () => {
  it('changes enabled state and speed', () => {
    const onEnabledChange = jest.fn();
    const onSpeedChange = jest.fn();
    render(
      <AutoScrollControls
        enabled={false}
        onEnabledChange={onEnabledChange}
        onPausedChange={() => undefined}
        onSpeedChange={onSpeedChange}
        paused={false}
        speed={5}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Rolagem automática' }));
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Velocidade da rolagem automática' }), {
      key: 'ArrowRight',
    });

    expect(onEnabledChange).toHaveBeenCalledWith(true);
    expect(onSpeedChange).toHaveBeenCalledWith(6);
  });

  it('offers pause and resume while enabled', () => {
    const onPausedChange = jest.fn();
    const controls = render(
      <AutoScrollControls
        enabled
        onEnabledChange={() => undefined}
        onPausedChange={onPausedChange}
        onSpeedChange={() => undefined}
        paused={false}
        speed={5}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(onPausedChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Pausar rolagem automática' })).toBeTruthy();

    controls.rerender(
      <AutoScrollControls
        enabled
        onEnabledChange={() => undefined}
        onPausedChange={onPausedChange}
        onSpeedChange={() => undefined}
        paused
        speed={5}
      />
    );
    expect(screen.getByRole('button', { name: 'Retomar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retomar rolagem automática' })).toBeTruthy();
  });
});
