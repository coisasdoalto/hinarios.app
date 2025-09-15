import { GetStaticPaths, GetStaticProps } from 'next';

import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Badge,
  Button,
  Container,
  Flex,
  Group,
  Paper,
  SegmentedControl,
  Space,
  Textarea,
  Title,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { IconGripVertical } from '@tabler/icons-react';
import cx from 'clsx';
import { z } from 'zod';

import BackButton from 'components/BackButton/BackButton';
import { useHymnBooks, useHymnBooksSave } from 'context/HymnBooks';
import getHymnBooks from 'data/getHymnBooks';
import getHymnsIndex from 'data/getHymnsIndex';
import getParsedData from 'data/getParsedData';
import { Hymn, hymnSchema } from 'schemas/hymn';
import { HymnBook } from 'schemas/hymnBook';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import classes from './styles.module.css';

type PageProps = { content: Hymn; hymnBooks: HymnBook[]; hymnBook: string };

type ItemProps = {
  item: Hymn['lyrics'][number] & { id: number };
  index: number;
};

function SortableItem({ item, index }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const position = index + 1;

  return (
    <Paper
      className={cx({ [classes.itemDragging]: isDragging })}
      p="xs"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <Group noWrap>
        <Flex className={classes.dragHandle} {...listeners}>
          <IconGripVertical size={18} stroke={1.5} />
        </Flex>
        <Group w="100%">
          <Group>
            <Badge w="fit-content">{position}</Badge>
            <SegmentedControl
              defaultValue={item.type}
              data={[
                { value: 'stanza', label: 'Estrofe' },
                { value: 'chorus', label: 'Estribilho' },
                { value: 'unnumbered_stanza', label: 'Sem número' },
              ]}
            />
          </Group>
          <Textarea autosize w="100%" value={item.text} />
        </Group>
      </Group>
    </Paper>
  );
}

export default function Page(props: AppProps & PageProps) {
  const {
    content: { number, title, subtitle, lyrics },
  } = props;

  useHymnBooksSave(props.hymnBooks);

  const router = useRouter();
  const params = useParams();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === params.hymnBook)!;

  const listState = lyrics.map((lyric, index) => ({ ...lyric, id: index }));

  const [state, handlers] = useListState(listState);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = state.findIndex((i) => i.id === active.id);
    const newIndex = state.findIndex((i) => i.id === over.id);
    handlers.setState(arrayMove(state, oldIndex, newIndex));
  };

  return (
    <Container size="xs">
      <BackButton to={`${hymnBook?.slug}/${params?.slug}`} />

      <Space h="md" />

      <Flex align="flex-start" gap="sm">
        <div>
          <Title order={1} size="h2">
            {number}. {title}
          </Title>
          {subtitle && (
            <Title order={5} color="dimmed" italic>
              {subtitle}
            </Title>
          )}
        </div>
      </Flex>

      <Space h="md" />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={state.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <Flex direction="column" gap="sm">
            {state.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} />
            ))}
          </Flex>
        </SortableContext>
      </DndContext>

      <Space h="md" />

      <Group position="right">
        <Link href={`/${hymnBook?.slug}/${params?.slug}`} passHref>
          <Button color="red" variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button>Salvar</Button>
      </Group>
    </Container>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const hymnBook = z.string().parse(context.params?.hymnBook);
  const hymnNumber = String(context.params?.slug)?.split('-')[0];

  const content = await getParsedData({
    filePath: `${hymnBook}/${hymnNumber}.json`,
    schema: hymnSchema,
  });

  const hymnBooks = await getHymnBooks();

  return {
    props: { content, hymnBooks, hymnBook },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const hymnBooks = await getHymnBooks();

  const allPaths = (
    await Promise.all(
      hymnBooks.map(async (hymnBook) => {
        const hymnsIndex = await getHymnsIndex(hymnBook.slug);

        const paths = hymnsIndex.map(({ slug }) => ({
          params: { hymnBook: hymnBook.slug, slug },
        }));

        return paths;
      })
    )
  ).flat();

  return {
    paths: allPaths,
    fallback: false,
  };
};
