# API Admin Authentication

This module provides admin authentication middleware for the Hinários API endpoints.

## Overview

The admin authentication system ensures that only authorized administrators can modify hymn data through the API. It uses Firebase Authentication with ID tokens to verify user identity and checks against a predefined list of admin email addresses.

## Components

### Admin Auth Middleware (`adminAuth.ts`)

A Hono middleware that:

1. Extracts the Bearer token from the Authorization header
2. Verifies the Firebase ID token using Firebase Admin SDK
3. Checks if the user's email is in the admin list
4. Adds the decoded user information to the context for use in handlers

### Authenticated Fetch Utility (`utils/authenticatedFetch.ts`)

A client-side utility that:

1. Gets the current user's ID token from Firebase Auth
2. Adds the token to the Authorization header
3. Makes authenticated requests to protected endpoints

## Usage

### Server-side (API Handler)

```typescript
import { adminAuthMiddleware } from './middleware/adminAuth';

hymnsApp.patch(
  '/:hymnBook/:hymnNumber/',
  adminAuthMiddleware, // Add this middleware before validators
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

## Admin Users

Admin access is granted to the following email addresses:

- `pablo.dinella@gmail.com`
- `raphaeldeoliveiracorrea@gmail.com`

To add new admins, update the `ADMINS` array in both:

- `api/middleware/adminAuth.ts` (server-side)
- `hooks/useAdmin.ts` (client-side)

## Error Responses

- `401 Unauthorized`: Missing, invalid, or malformed Authorization header
- `401 Unauthorized`: Invalid or expired Firebase ID token
- `403 Forbidden`: Valid user but not in admin list

## Security Notes

- ID tokens are verified using Firebase Admin SDK for maximum security
- Tokens are short-lived and automatically refreshed by Firebase
- Admin list is hardcoded to prevent unauthorized access
- All admin actions are authenticated on both client and server sides
