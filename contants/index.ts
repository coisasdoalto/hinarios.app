export const CONTACT_EMAIL = 'pablo.dinella@gmail.com';

export const HC_HYMN_BOOK_SLUG = 'hinos-e-canticos';
export const HC_UNAVAILABLE_ALERT_TITLE = 'Hinos e Cânticos temporariamente indisponível';
export const HC_UNAVAILABLE_MESSAGE =
  'Estamos trabalhando junto aos detentores dos direitos da editora para viabilizar a publicação do HC no app. Agradecemos a compreensão.';
export const HC_UNAVAILABLE_FAVORITE_MESSAGE = 'Hinos e Cânticos temporariamente indisponíveis';

// HC remains in the downloaded data while publication is paused for rights clearance.
export const HIDDEN_HYMN_BOOK_SLUGS = [HC_HYMN_BOOK_SLUG];

/**
 * Determines whether a hymn book can be exposed with the granted HC permission.
 * @example isHymnBookVisible('hinos-e-canticos', true); // true
 */
export function isHymnBookVisible(slug: string, canAccessHc = false): boolean {
  if (slug === HC_HYMN_BOOK_SLUG) return canAccessHc;

  return !HIDDEN_HYMN_BOOK_SLUGS.includes(slug);
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
