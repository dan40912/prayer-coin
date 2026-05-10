# Architecture

Start Pray is a Next.js app that keeps the public site, member portal, admin screens, and API routes in one codebase.

The current structure is intentionally straightforward. It is easier for a small project to maintain one app well than to split too early.

## High-level Shape

```text
Browser
  -> Next.js App Router pages
  -> Next.js API routes
  -> Prisma
  -> MySQL
```

Public pages, member pages, and admin pages all live under `src/app`.

Shared UI components live under `src/components`. Domain helpers and server utilities live under `src/lib`.

## Main Areas

### Public Site

The public experience includes:

- home page
- prayer wall
- prayer detail pages
- global prayer room
- overcomer pages
- about, how-to, and policy pages

Important files:

```text
src/app/page.js
src/app/prayfor/page.js
src/app/prayfor/[id]/page.js
src/app/global-prayer-room/page.js
src/components/HomePrayerExplorer.js
src/components/GlobalPrayerRoom.js
```

### Member Portal

Members can create, edit, and manage their own prayer cards.

Important files:

```text
src/app/customer-portal/page.js
src/app/customer-portal/create/page.js
src/app/customer-portal/edit/[id]/page.js
src/app/api/customer/*
```

### Admin Area

The admin area is used for content review, user management, categories, settings, and operational maintenance.

Important files:

```text
src/app/admin/*
src/app/api/admin/*
src/lib/admin-session.js
src/lib/admin-route-auth.js
```

## Styling

The project uses plain CSS rather than a large UI framework.

Main style files:

```text
src/app/globals.css
src/styles/theme-modern.css
src/styles/theme-customer.css
src/styles/prayer-detail.css
```

Some pages also use local `style jsx` when the styles are tightly coupled to one screen.

## Runtime Notes

- Next.js App Router is used for routing and server rendering.
- API routes are used for form submissions, account operations, upload handling, and admin actions.
- Prisma handles database access.
- MySQL is the main database.
- Uploaded images are normalized through the media storage helpers.
- The global prayer room uses location fields from prayer cards and renders them on an interactive map experience.

## Project Layout

```text
src/
  app/            Pages, layouts, and API routes
  components/     Shared React components
  context/        Client-side providers
  hooks/          Reusable hooks
  lib/            Domain helpers and server utilities
  styles/         Global and themed CSS
  data/           Static fallback data

prisma/
  schema.prisma
  migrations/

public/
  img/
  legacy/

scripts/
  seed, QA, deploy, and maintenance scripts
```
