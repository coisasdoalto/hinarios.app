import { describe, expect, it } from '@jest/globals';

import { isPageShortcut } from './keyboardShortcuts';

const keyDown = (target: EventTarget, init: KeyboardEventInit) => {
  let result = false;
  const listener = (event: Event) => {
    result = isPageShortcut(event as KeyboardEvent, 'ArrowRight');
  };
  window.addEventListener('keydown', listener);
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
  window.removeEventListener('keydown', listener);
  return result;
};

describe('isPageShortcut', () => {
  it('accepts a plain key press on the page', () => {
    expect(keyDown(document.body, { key: 'ArrowRight' })).toBe(true);
  });

  it('ignores other keys and modifiers', () => {
    expect(keyDown(document.body, { key: 'ArrowLeft' })).toBe(false);
    expect(keyDown(document.body, { key: 'ArrowRight', altKey: true })).toBe(false);
    expect(keyDown(document.body, { key: 'ArrowRight', shiftKey: true })).toBe(false);
    expect(keyDown(document.body, { key: 'ArrowRight', metaKey: true })).toBe(false);
  });

  it('ignores key presses in inputs and dialogs', () => {
    const input = document.createElement('input');
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    const insideDialog = document.createElement('button');
    dialog.append(insideDialog);
    document.body.append(input, dialog);

    expect(keyDown(input, { key: 'ArrowRight' })).toBe(false);
    expect(keyDown(insideDialog, { key: 'ArrowRight' })).toBe(false);

    input.remove();
    dialog.remove();
  });
});
