export type HymnNumberIdentity = {
  number: string | number;
  variant?: string;
};

/**
 * Resolves the catalog number shown in lists, routes and hymn headings.
 *
 * @example resolveHymnDisplayNumber({ number: 72, variant: 'a' })
 */
export function resolveHymnDisplayNumber(identity: HymnNumberIdentity): string | number {
  if (!identity.variant) return identity.number;
  return `${identity.number}${identity.variant}`;
}

/**
 * Orders hymn identities by their numeric base and then by optional variant.
 *
 * @example compareHymnNumbers({ number: 72, variant: 'a' }, { number: 72, variant: 'b' })
 */
export function compareHymnNumbers(current: HymnNumberIdentity, next: HymnNumberIdentity): number {
  const baseDifference = parseInt(String(current.number), 10) - parseInt(String(next.number), 10);
  if (baseDifference !== 0) return baseDifference;

  const currentDisplayNumber = String(resolveHymnDisplayNumber(current));
  const nextDisplayNumber = String(resolveHymnDisplayNumber(next));
  return currentDisplayNumber.localeCompare(nextDisplayNumber, 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
}
