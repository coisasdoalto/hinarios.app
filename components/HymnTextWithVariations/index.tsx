import { Button, Group, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHandClick } from '@tabler/icons';
import { AddBreakLine } from '../AddBreakLine';
import { useState } from 'react';

function splitTextParts(text: string) {
  /**
   * Example {variation1|variation2}
   *          ^-------Match-------^
   */
  const regex = /\{([^}]+)\}/g;

  return text.split(regex).reduce((parts, part, index) => {
    /**
     * Matches always come in even indices
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#splitting_with_a_regexp_to_include_parts_of_the_separator_in_the_result
     */
    if (index % 2 === 0) {
      parts.push(<AddBreakLine key={index}>{part}</AddBreakLine>);

      return parts;
    }
    const options = part.split('|');
    parts.push(<Variation key={index} options={options} />);

    return parts;
  }, [] as JSX.Element[]);
}

function Variation({ options }: { options: string[] }) {
  // TODO: Save preferences

  const [selection, setSelection] = useState(options[0]);
  const [opened, { close, toggle }] = useDisclosure(false);

  function handleSelect(option: string) {
    setSelection(option);
    close();
  }

  return (
    <Popover position="bottom" withArrow shadow="md" opened={opened} onChange={close}>
      <Popover.Target>
        <span>
          <Text
            role="button"
            display="inline"
            onClick={toggle}
            sx={{
              fontStyle: 'italic',
              cursor: 'pointer',
              borderBottom: '1px dotted',
            }}
            title="Ver variações"
          >
            {selection}
          </Text>
          <IconHandClick
            style={{
              verticalAlign: 'middle',
              marginLeft: 4,
            }}
            size={19}
          />
        </span>
      </Popover.Target>
      <Popover.Dropdown>
        <Group position="center">
          {options.map((option, index) => (
            <Button key={index} onClick={() => handleSelect(option)} variant="subtle" compact>
              {option}
            </Button>
          ))}
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

export function HymnTextWithVariations({ children: text }: { children: string }) {
  return <>{splitTextParts(text)}</>;
}
