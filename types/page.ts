import { NextPage } from 'next';
import { ReactNode } from 'react';

/**
 * A page that can place its own content in the app top bar. The content is
 * derived from the page props so it is rendered on the server as well.
 */
export type PageWithHeaderContent<P = any> = NextPage<P> & {
  renderHeaderContent?: (props: P) => ReactNode;
};
