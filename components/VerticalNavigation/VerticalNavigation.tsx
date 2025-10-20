import { Box, Divider, NavLink } from '@mantine/core';
import { IconBookmarks, IconBooks, IconChecklist, IconHome, IconInfoSquare } from '@tabler/icons';
import Link from 'next/link';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { useHymnBooks } from '../../context/HymnBooks';
import { useUser } from '../../hooks/useUser';
import { DarkModeToggle } from './DarkModeToggle';

function VerticalNavigation({ onNavigation }: { onNavigation: () => void }) {
  const [hymnBooks] = useHymnBooks();

  const {user} = useUser();
  const isBookmarksEnabled = useFeatureFlagEnabled('bookmarks');

  const shouldShowBookmarksLink = user && isBookmarksEnabled;

  return (
    <Box>
      <NavLink
        label="Início"
        icon={<IconHome size={16} stroke={1.5} />}
        component={Link}
        href="/"
        onClick={onNavigation}
      />

      {shouldShowBookmarksLink && (
        <NavLink
          label="Favoritos"
          icon={<IconBookmarks size={16} stroke={1.5} />}
          component={Link}
          href="/favoritos"
          onClick={onNavigation}
        />
      )}

      <NavLink
        label="Hinários"
        icon={<IconBooks size={16} stroke={1.5} />}
        childrenOffset={28}
        defaultOpened
      >
        {hymnBooks?.map((hymnBook) => (
          <NavLink
            key={hymnBook.slug}
            label={hymnBook.name}
            component={Link}
            href={`/${hymnBook.slug}`}
            onClick={onNavigation}
          />
        ))}
      </NavLink>

      <NavLink
        label="Sobre"
        icon={<IconInfoSquare size={16} stroke={1.5} />}
        component={Link}
        href="/sobre"
        onClick={onNavigation}
      />

      <NavLink
        label="Política de privacidade"
        icon={<IconChecklist size={16} stroke={1.5} />}
        component={Link}
        href="/politica-de-privacidade"
        onClick={onNavigation}
      />

      <Divider my="md" label="Configurações" labelPosition="center" />

      <DarkModeToggle />
    </Box>
  );
}

export default VerticalNavigation;
