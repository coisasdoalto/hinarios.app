import { create } from 'zustand';
import { MantineSize } from '@mantine/core';

interface FontSizeState {
  fontSize: MantineSize;
  setFontSize: (size: MantineSize) => void;
}



export const useFontSizeStore = create<FontSizeState>((set) => ({
  fontSize: (typeof window !== 'undefined' && localStorage.getItem('fontSize') as MantineSize) || 'md',

  setFontSize: (size) => {
    localStorage.setItem('fontSize', size);
    set({ fontSize: size });
  },
}));
