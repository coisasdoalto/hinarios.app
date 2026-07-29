import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { RenderableSection } from '../../domain/hymn/renderableHymn.types';
import { HymnSection } from './HymnSection';

const formattedSection: RenderableSection = {
  id: 'ev-1/section-1',
  type: 'unnumbered',
  lines: [
    {
      id: 'ev-1/section-1/line-1',
      text: 'Cantamos para sempre',
      segments: [
        { text: 'Cantamos ' },
        { text: 'para', italic: true },
        { text: ' ' },
        { text: 'sempre', bold: true, italic: true },
      ],
    },
  ],
};

describe('HymnSection', () => {
  it('renders normalized Markdown emphasis without showing its markers', () => {
    render(
      <HymnSection fontSize="md" isMusical section={formattedSection} showChords transpose={0} />
    );

    expect(screen.getByText('para').tagName).toBe('EM');
    expect(screen.getByText('sempre').tagName).toBe('EM');
    expect(screen.getByText('sempre').parentElement?.tagName).toBe('STRONG');
    expect(screen.queryByText(/[*_]/u)).toBeNull();
  });
});
