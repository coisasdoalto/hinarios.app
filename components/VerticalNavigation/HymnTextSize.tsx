import { Box, SegmentedControl, Text } from '@mantine/core';
import { HymnFontSize, useFontSizeStore } from '../Store/useFontSizeStore';

export default function HymnTextSize() {
  const [fontSize, setFontSize] = useFontSizeStore();

  return (
    <Box px="md" py="xs">
      <Text size="sm">Tamanho da letra</Text>
      <SegmentedControl
        aria-label="Tamanho da letra"
        value={fontSize}
        onChange={(value: HymnFontSize) => setFontSize(value)}
        data={[
          { label: 'P', value: 'md' },
          { label: 'M', value: 'lg' },
          { label: 'G', value: 'xl' },
          { label: 'GG', value: 'xxl' },
        ]}
      />
    </Box>
  );
}
