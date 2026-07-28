export type PositionedChord = {
  symbol: string;
  column: number;
};

export type RepeatGroup = {
  id: string;
  times: number;
  lineIds: string[];
};

export type RenderableLine = {
  id: string;
  text: string;
  chords?: PositionedChord[];
};

export type RenderableSection = {
  id: string;
  type: 'stanza' | 'chorus' | 'bridge' | 'unnumbered';
  number?: number;
  label?: string;
  lines: RenderableLine[];
  repeats?: RepeatGroup[];
};

export type RenderableHymn = {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  editable: boolean;
  sections: RenderableSection[];
  musical?: {
    originalKey?: string;
    transposable: boolean;
  };
};
