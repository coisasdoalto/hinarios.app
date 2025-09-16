import { GetServerSideProps } from 'next';

import { AppProps } from 'next/app';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
  Tooltip,
} from '@mantine/core';
import { useForm, UseFormReturnType, zodResolver } from '@mantine/form';
import { useListState, useMediaQuery } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconGripVertical } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { omitBy } from 'lodash-es';
import { z } from 'zod';

import BackButton from 'components/BackButton/BackButton';
import { useHymnBooks, useHymnBooksSave } from 'context/HymnBooks';
import getHymnBooks from 'data/getHymnBooks';
import getParsedData from 'data/getParsedData';
import { Hymn, hymnSchema } from 'schemas/hymn';
import { HymnBook } from 'schemas/hymnBook';

type PageProps = { content: Hymn; hymnBooks: HymnBook[]; hymnBook: string };

type Lyric = Hymn['lyrics'][number];
type LyricFormItem = { id: number } & Lyric;

type FormValues = { lyrics: LyricFormItem[] };

type LyricSortableItemProps = {
  index: number;
  item: LyricFormItem;
  form: UseFormReturnType<FormValues>;
};

function LyricSortableItem({ item, index, form }: LyricSortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const isMobile = useMediaQuery('(max-width: 48em)');

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const position = index + 1;

  function handleTypeChange(value: string) {
    form.getInputProps(`lyrics.${index}.type`).onChange(value);

    if (value === 'stanza') {
      form.setFieldValue(`lyrics.${index}.number`, position);
      return;
    }

    form.setFieldValue(`lyrics.${index}.number`, undefined);
  }

  return (
    <Paper
      withBorder
      p="xs"
      ref={setNodeRef}
      style={style}
      sx={(theme) => ({
        boxShadow: isDragging ? theme.shadows.sm : 'none',
        zIndex: isDragging ? 1 : 'unset',
        borderColor: isDragging ? theme.colors.blue[6] : undefined,
      })}
      {...attributes}
    >
      <Group noWrap spacing="xs">
        <Flex
          data-dragging={isDragging}
          sx={{
            cursor: 'grab',
            "&[data-dragging='true']": {
              cursor: 'grabbing',
            },
            touchAction: 'none',
          }}
          {...listeners}
        >
          <IconGripVertical size={24} stroke={1.5} />
        </Flex>
        <Group w="100%">
          <Group spacing="xs">
            <Badge
              w="fit-content"
              sx={{
                userSelect: 'none',
              }}
              size="lg"
            >
              {position}
            </Badge>
            <SegmentedControl
              data={[
                { value: 'stanza', label: 'Estrofe' },
                { value: 'chorus', label: 'Estribilho' },
                { value: 'unnumbered_stanza', label: 'Sem número' },
              ]}
              {...form.getInputProps(`lyrics.${index}.type`)}
              onChange={handleTypeChange}
              size={isMobile ? 'xs' : 'sm'}
            />
          </Group>
          <Textarea autosize w="100%" {...form.getInputProps(`lyrics.${index}.text`)} />
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

  const initialListState = lyrics.map((lyric, index) => ({ ...lyric, id: index }));

  const form = useForm<FormValues>({
    initialValues: { lyrics: initialListState },
    validateInputOnChange: true,
    validate: zodResolver(
      z.object({
        lyrics: z.array(
          z.object({
            type: z.enum(['stanza', 'chorus', 'unnumbered_stanza']),
            text: z.string().min(1, 'O texto é obrigatório'),
            number: z.number().optional(),
          })
        ),
      })
    ),
  });

  const { mutateAsync: updateHymnMutation, isPending } = useMutation({
    mutationFn: async (lyrics: Lyric[]) => {
      return await axios.patch(`/api/hymns/${hymnBook?.slug}/${number}`, { lyrics });
    },
    onSuccess: (data) => {
      showNotification({
        title: 'Hino atualizado',
        message: 'O hino foi atualizado com sucesso.',
        color: 'green',
      });

      router.push(`/${hymnBook?.slug}/${params?.slug}`);
    },
    onError: () => {
      showNotification({
        title: 'Erro ao atualizar',
        message: 'Ocorreu um erro ao atualizar o hino. Tente novamente.',
        color: 'red',
      });
    },
    throwOnError: false,
  });

  const params = useParams();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === params.hymnBook)!;

  const [listState, listStateHandlers] = useListState(initialListState);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 0 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = listState.findIndex((i) => i.id === active.id);
    const newIndex = listState.findIndex((i) => i.id === over.id);
    form.reorderListItem('lyrics', {
      from: oldIndex,
      to: newIndex,
    });
    listStateHandlers.setState(arrayMove(listState, oldIndex, newIndex));

    const formItem = form.values.lyrics[newIndex];

    if (formItem.type === 'stanza') {
      const position = newIndex + 1;
      form.setFieldValue(`lyrics.${newIndex}.number`, position);
    }
  };

  async function handleSubmit(values: FormValues) {
    const newLyrics = values.lyrics.map(({ id, ...lyric }) =>
      omitBy<Lyric>(lyric, (v) => v === undefined)
    ) as Lyric[];

    const res = await updateHymnMutation(newLyrics);

    console.log(res.data);
  }

  function handleReset() {
    form.setValues({ lyrics: initialListState });
    listStateHandlers.setState(initialListState);
  }

  const isDirty = form.isDirty();
  const isValid = form.isValid();

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

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={listState.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <Flex direction="column" gap="sm">
              {listState.map((item, index) => (
                <LyricSortableItem key={item.id} item={item} index={index} form={form} />
              ))}
            </Flex>
          </SortableContext>
        </DndContext>

        <Space h="md" />

        <Group position="right">
          <Link href={`/${hymnBook?.slug}/${params?.slug}`}>
            <Button color="red" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Tooltip label="Reverter para a última versão salva">
            <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
              Reverter
            </Button>
          </Tooltip>
          <Button type="submit" disabled={!isDirty || !isValid || isPending} loading={isPending}>
            Salvar
          </Button>
        </Group>
      </form>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
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
