import '@testing-library/jest-dom/extend-expect';

class FakeResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

global.ResizeObserver = FakeResizeObserver;
