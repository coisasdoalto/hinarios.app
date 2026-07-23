export const CONTACT_EMAIL = 'pablo.dinella@gmail.com';

// HC remains in the downloaded data while publication is paused for rights clearance.
export const HIDDEN_HYMN_BOOK_SLUGS = ['hinos-e-canticos'];

/**
 * Determines whether a hymn book can be exposed by app routes and navigation.
 * @example isHymnBookVisible('hinos-e-canticos'); // false
 */
export function isHymnBookVisible(slug: string): boolean {
  const isHidden = HIDDEN_HYMN_BOOK_SLUGS.includes(slug);

  return !isHidden;
}

// Ordem de exibição dos hinários na Home (por slug)
// Para alterar a ordem, ajuste o array abaixo.
// Slugs disponíveis (padrão atual):
// - hinos-e-canticos (HC)
// - hinos-espirituais (HE)
// - corinhos-e-canticos-de-salvacao (CCS)
// - hinario-alvorada (HA)
// - musicas-avulsas (MA)
export const HYMN_BOOKS_ORDER: string[] = [
  'hinos-e-canticos',
  'hinos-espirituais',
  'corinhos-e-canticos-de-salvacao',
  'hinario-alvorada',
  'musicas-avulsas',
];
