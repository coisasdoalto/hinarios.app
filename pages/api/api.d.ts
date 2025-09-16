import { NextApiRequest, NextApiResponse } from 'next';

declare module 'hono' {
  interface Env {
    Bindings: {
      incoming: NextApiRequest;
      outgoing: NextApiResponse;
    };
  }
}
