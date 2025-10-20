import { GetServerSideProps } from 'next';
import { useEffect } from 'react';

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
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm, UseFormReturnType, zodResolver } from '@mantine/form';
import { useListState, useMediaQuery } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { omitBy } from 'lodash-es';
import { z } from 'zod';

import BackButton from 'components/BackButton/BackButton';
import { useHymnBooks, useHymnBooksSave } from 'context/HymnBooks';
import getHymnBooks from 'data/getHymnBooks';
import getParsedData from 'data/getParsedData';
import { useAdmin } from 'hooks/useAdmin';
import { Hymn, hymnSchema } from 'schemas/hymn';
import { HymnBook } from 'schemas/hymnBook';
import { authenticatedAxios } from 'utils/authenticatedFetch';

type PageProps = { content: Hymn; hymnBooks: HymnBook[]; hymnBook: string };

type Lyric = Hymn['lyrics'][number];
type LyricFormItem = { id: number } & Lyric;

type FormValues = {
  title: string;
  subtitle?: string;
  lyrics: LyricFormItem[];
};

type LyricSortableItemProps = {
  index: number;
  item: LyricFormItem;
  form: UseFormReturnType<FormValues>;
  onDelete: (index: number) => void;
};

function LyricSortableItem({ item, index, form, onDelete }: LyricSortableItemProps) {
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
          <Flex w="100%" gap="xs" align="flex-start">
            <Textarea
              autosize
              style={{ flex: 1 }}
              {...form.getInputProps(`lyrics.${index}.text`)}
            />
            <Tooltip label="Excluir estrofe">
              <Button
                variant="subtle"
                color="red"
                size="sm"
                p="xs"
                onClick={() => onDelete(index)}
                style={{ minWidth: 'auto' }}
              >
                <IconTrash size={16} />
              </Button>
            </Tooltip>
          </Flex>
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
    initialValues: {
      title,
      subtitle,
      lyrics: initialListState,
    },
    validateInputOnChange: true,
    validate: zodResolver(
      z.object({
        title: z.string().min(1, 'O título é obrigatório'),
        subtitle: z.string().optional(),
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
    mutationFn: async (data: { title: string; subtitle?: string; lyrics: Lyric[] }) => {
      return await authenticatedAxios(`/api/hymns/${hymnBook?.slug}/${number}`, {
        method: 'PATCH',
        data,
      });
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

  const { isAdmin, isLoading: isLoadingUser } = useAdmin();

  useEffect(() => {
    if (isLoadingUser || isAdmin) return;

    router.replace(`/${params.hymnBook}/${params.slug}`);
  }, [isAdmin, isLoadingUser]);

  if (isLoadingUser) {
    return null;
  }

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

    await updateHymnMutation({
      title: values.title,
      subtitle: values.subtitle,
      lyrics: newLyrics,
    });
  }

  function handleReset() {
    form.setValues({
      title,
      subtitle,
      lyrics: initialListState,
    });
    listStateHandlers.setState(initialListState);
  }

  function handleInsertLyric() {
    const newId = Math.max(...listState.map((item) => item.id), 0) + 1;
    const newLyric: LyricFormItem = {
      id: newId,
      type: 'stanza',
      text: '',
      number: listState.length + 1,
    };

    form.insertListItem('lyrics', newLyric);
    listStateHandlers.append(newLyric);
  }

  function handleDeleteLyric(index: number) {
    form.removeListItem('lyrics', index);
    const newListState = [...listState];
    newListState.splice(index, 1);
    listStateHandlers.setState(newListState);
  }

  const isDirty = form.isDirty();
  const isValid = form.isValid();

  const submitButtonTooltipLabel = (() => {
    if (form.values.lyrics.length === 0) {
      return 'Adicione pelo menos uma estrofe';
    }

    if (!isValid) {
      return 'Corrija os erros no formulário';
    }
    return '';
  })();

  return (
    <Container size="xs">
      <BackButton to={`${hymnBook?.slug}/${params?.slug}`} />

      <Space h="md" />

      <Flex align="flex-start" gap="sm">
        <div style={{ width: '100%' }}>
          <Group align="center" spacing="xs">
            <Title order={1} size="h2" style={{ minWidth: 'fit-content' }}>
              {number}.
            </Title>
            <TextInput
              placeholder="Título do hino"
              variant="unstyled"
              w="100%"
              sx={(theme) => ({
                flex: 1,
                input: {
                  padding: 0,
                  fontSize: `calc(${theme.fontSizes.lg}px * 1.5)`,
                  fontWeight: 'bold',
                  color: 'var(--mantine-color-dimmed)',
                },
              })}
              {...form.getInputProps('title')}
            />
          </Group>
          <TextInput
            placeholder="Subtítulo (opcional)"
            size="md"
            variant="unstyled"
            sx={(theme) => ({
              input: {
                padding: 0,
                fontSize: theme.fontSizes.md,
                fontStyle: 'italic',
                color: 'var(--mantine-color-dimmed)',
              },
            })}
            {...form.getInputProps('subtitle')}
          />
        </div>
      </Flex>

      <Space h="md" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group position="apart" mb="sm">
          <Button
            leftIcon={<IconPlus size={16} />}
            variant="light"
            size="sm"
            onClick={handleInsertLyric}
          >
            Adicionar estrofe
          </Button>
        </Group>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={listState.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <Flex direction="column" gap="sm">
              {listState.map((item, index) => (
                <LyricSortableItem
                  key={item.id}
                  item={item}
                  index={index}
                  form={form}
                  onDelete={handleDeleteLyric}
                />
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
          <Tooltip label={submitButtonTooltipLabel}>
            <Button
              type="submit"
              disabled={!isDirty || !isValid || isPending || form.values.lyrics.length === 0}
              loading={isPending}
            >
              Salvar
            </Button>
          </Tooltip>
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
