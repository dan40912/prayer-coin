# Data Model and Auth

This file explains the main database models and access rules at a practical level.

The source of truth is:

```text
prisma/schema.prisma
```

## Main Models

### `User`

Represents a member account.

Stores profile fields, public profile settings, account state, and relations to prayer cards and responses.

### `HomePrayerCard`

The main content model for the prayer wall.

Important fields:

```text
title
description
image
tags
meta
detailsHref
voiceHref
locationCity
locationCountry
locationLat
locationLng
isPrivate
isBlocked
ownerId
categoryId
```

Private cards should not expose title, description, image, owner data, or detail links in public contexts.

### `HomePrayerCategory`

Category records shown on the home page, prayer wall, and create form.

### `PrayerResponse`

Text or voice response connected to a prayer card.

### Report Models

The report models store moderation signals:

```text
HomePrayerCardReport
PrayerResponseReport
OvercomerUserReport
```

### Admin Models

```text
AdminAccount
AdminLog
SiteSetting
SiteBanner
```

These support admin access, audit history, maintenance mode, and homepage content settings.

## Auth Overview

Start Pray has two main access areas:

- member area
- admin area

They use separate helpers and should stay separate.

Member-related files:

```text
src/lib/server-session.js
src/lib/customer-session.js
src/lib/customer-access.js
```

Admin-related files:

```text
src/lib/admin-session.js
src/lib/admin-route-auth.js
```

## Access Rules

General rules:

- Public routes should only return public, unblocked prayer cards.
- Member routes should only return records owned by the current member.
- Admin routes should require admin access.
- Blocked accounts should not be allowed to create or modify content.
- Private prayer cards should still count for anonymous map lights, but should not expose personal content.

## Session Flow

At a high level:

1. A user signs in.
2. The server sets the member session.
3. API routes read the session.
4. `ensureActiveCustomer` checks that the account is usable.
5. Route handlers continue only after ownership or permission checks pass.

Admin flow is similar, but uses admin-specific helpers and admin account records.

## Migration Notes

Use Prisma migrations for schema changes.

Common commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
```

For production, prefer reviewed migration files and deployment runbooks over ad hoc database edits.
