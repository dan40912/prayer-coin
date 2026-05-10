# Admin and Moderation

The admin area exists because a prayer platform needs care, not just publishing.

People may share sensitive things. Reports, moderation, and account controls help keep the space usable.

## Admin Screens

Admin pages live under:

```text
src/app/admin
```

Current areas include:

- dashboard
- prayer card management
- response management
- user management
- category management
- moderation
- site settings
- admin accounts
- logs

## Admin API Routes

Admin API routes live under:

```text
src/app/api/admin
```

They should always use admin access checks before reading or changing data.

Important helpers:

```text
src/lib/admin-session.js
src/lib/admin-route-auth.js
```

## Moderation Objects

Reports are stored separately for different target types:

```text
HomePrayerCardReport
PrayerResponseReport
OvercomerUserReport
```

This keeps moderation history explicit and easier to inspect.

## Blocking Behavior

Several public queries filter blocked content.

For prayer cards, public listings should generally require:

```text
isBlocked = false
isPrivate = false
```

Private cards are handled separately for anonymous map display.

## Operation Logs

Admin actions can be recorded through `AdminLog`.

This is useful when multiple people help manage the site, because moderation decisions should not become invisible.

## Maintenance Mode

`SiteSetting` stores site-level operational flags.

The current system includes a maintenance mode field that can be used to protect the site during upgrades or incidents.
