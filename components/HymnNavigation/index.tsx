import { Box, Button, ButtonProps, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useFeatureFlagEnabled } from '../../hooks/useFeatureFlagEnabled';

export type HymnNavigationItem = {
  number?: number | string;
  title: string;
  subtitle?: string;
  slug: string;
};

type NavigationButtonProps = {
  align: 'left' | 'right';
  directionLabel: string;
  href?: string;
  hymn?: HymnNavigationItem | null;
  showNumbers: boolean;
};

function NavigationButton({
  align,
  directionLabel,
  href,
  hymn,
  showNumbers,
}: NavigationButtonProps) {
  const hymnLabel = hymn ? `${showNumbers ? `${hymn.number}. ` : ''}${hymn.title}` : undefined;
  const label = (
    <Text
      component="span"
      sx={(theme) => ({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        [theme.fn.smallerThan('sm')]: { display: 'none' },
      })}
    >
      {hymnLabel ?? directionLabel}
    </Text>
  );

  const buttonProps: ButtonProps = {
    variant: 'subtle',
    color: 'gray',
    size: 'xs',
    sx: (theme) => ({
      minWidth: 0,
      maxWidth: '100%',
      paddingInline: 8,
      '&[data-disabled]': { backgroundColor: 'transparent' },
      [theme.fn.smallerThan('sm')]: { paddingInline: 6 },
    }),
    styles: { label: { minWidth: 0 } },
    leftIcon: align === 'left' ? <IconChevronLeft size="1rem" /> : undefined,
    rightIcon: align === 'right' ? <IconChevronRight size="1rem" /> : undefined,
  };

  if (!hymn || !href) {
    return (
      <Button {...buttonProps} title={hymnLabel} disabled aria-label={directionLabel}>
        {label}
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      title={hymnLabel}
      component={Link}
      href={href}
      aria-label={`${directionLabel}: ${hymnLabel}`}
    >
      {label}
    </Button>
  );
}

type HymnNavigationProps = {
  hymnBookSlug: string;
  previousHymn?: HymnNavigationItem | null;
  nextHymn?: HymnNavigationItem | null;
  showNumbers?: boolean;
};

export function HymnNavigation({
  hymnBookSlug,
  previousHymn,
  nextHymn,
  showNumbers = true,
}: HymnNavigationProps) {
  const isHymnNavigationEnabled = useFeatureFlagEnabled('hymn-bottom-navigation');

  if (!isHymnNavigationEnabled) {
    return null;
  }

  return (
    <Box
      component="nav"
      aria-label="Navegação entre hinos"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, max-content))',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
      }}
    >
      <NavigationButton
        align="left"
        directionLabel="Anterior"
        hymn={previousHymn}
        showNumbers={showNumbers}
        href={previousHymn ? `/${hymnBookSlug}/${previousHymn.slug}` : undefined}
      />
      <NavigationButton
        align="right"
        directionLabel="Próximo"
        hymn={nextHymn}
        showNumbers={showNumbers}
        href={nextHymn ? `/${hymnBookSlug}/${nextHymn.slug}` : undefined}
      />
    </Box>
  );
}
