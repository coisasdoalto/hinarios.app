/** Elements where a key press belongs to the element, not to page shortcuts */
const INTERACTIVE_TARGETS =
  "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='menu'], [role='listbox'], [role='dialog'], [role='slider'], [role='radiogroup'], [role='tablist']";

export function isEditableElement(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false;

  return element.isContentEditable || Boolean(element.closest(INTERACTIVE_TARGETS));
}

/** True when a plain key press (no modifiers) may trigger a page shortcut */
export function isPageShortcut(event: KeyboardEvent, key: string): boolean {
  return (
    event.key === key &&
    !event.defaultPrevented &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey &&
    !isEditableElement(event.target)
  );
}
