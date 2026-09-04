# API Admin Authentication

This module provides admin authentication middleware for the Hinários API endpoints.

## Overview

The admin authentication system ensures that only authorized administrators can modify hymn data through the API. It uses Firebase Authentication with ID tokens to verify user identity and checks against a predefined list of admin email addresses.

## Components

### Authentication Middlewares

The Hono authentication middlewares:

1. Extracts the Bearer token from the Authorization header
2. Verifies the Firebase ID token using Firebase Admin SDK
3. Adds the decoded user information to the context for use in handlers
4. Checks server-side permissions when administrator access is required

### Authenticated Fetch Utility (`utils/authenticatedFetch.ts`)

A client-side utility that:

1. Gets the current user's ID token from Firebase Auth
2. Adds the token to the Authorization header
3. Makes authenticated requests to protected endpoints

## Usage

### Server-side (API Handler)

```typescript
import { adminAuthMiddleware } from './middleware/adminAuth';
import { authenticatedUserMiddleware } from './middleware/userAuth';

hymnsApp.patch(
  '/:hymnBook/:hymnNumber/',
  authenticatedUserMiddleware,
  adminAuthMiddleware,
  zValidator(/* ... */),
  async (c) => {
    // Access user info via c.get('user') if needed
    const user = c.get('user');
    // Handler logic...
  }
);
```

### Client-side (React Component)

```typescript
import { authenticatedFetch } from 'utils/authenticatedFetch';

const updateHymn = async (lyrics: Lyric[]) => {
  return await authenticatedFetch(`/api/hymns/${hymnBook}/${number}`, {
    method: 'PATCH',
    body: JSON.stringify({ lyrics }),
  });
};
```

## User Permissions

Admin and restricted hymn-book permissions are defined only in
`api_src/userAccess.ts`. The `/api/hymns/access/` endpoint checks the requesting
location first, then a valid Firebase email, and exposes only boolean
permissions without sending the configured lists to the browser. When the IP
location is inconclusive, the browser may provide precise coordinates after the
user grants permission; if permission is unavailable, the server applies the
expanded IP fallback radius.

## Error Responses

- `401 Unauthorized`: Missing, invalid, or malformed Authorization header on a protected endpoint
- `401 Unauthorized`: Invalid or expired Firebase ID token on a protected endpoint
- `/api/hymns/access/` treats missing or invalid optional authentication as an unavailable email fallback
- `403 Forbidden`: Valid user but not in admin list

## Security Notes

- ID tokens are verified using Firebase Admin SDK for maximum security
- Tokens are short-lived and automatically refreshed by Firebase
- Permission lists are kept in server-only API modules
- All protected actions are authenticated and authorized on the server
