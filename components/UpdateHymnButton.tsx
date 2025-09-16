import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPencil } from '@tabler/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function UpdateHymnButton() {
  const router = useRouter();

  const pathWithoutSlash = router.asPath.replace(/\/$/, '');

  return (
    <Link href={`${pathWithoutSlash}/editar`}>
      <Tooltip label="Editar hino">
        <ActionIcon variant="subtle" size="lg">
          <IconPencil stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </Link>
  );
}
