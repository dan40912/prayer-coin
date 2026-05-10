# Media Pipeline

Start Pray supports uploaded images, generated thumbnails, and voice-related URLs.

The goal is simple: keep media safe enough, predictable, and easy to render across the site.

## Image Uploads

Route:

```text
POST /api/upload-image
```

Main file:

```text
src/app/api/upload-image/route.js
```

Upload behavior:

- requires a signed-in member
- accepts image files only
- rejects files above the configured size limit
- decodes the image with `sharp`
- rotates based on metadata
- resizes large images
- outputs WebP
- stores the file through the media storage helper
- returns a site-local URL

## Media Storage Helper

Main file:

```text
src/lib/server-media-storage.js
```

This helper centralizes where files are written and how public URLs are built.

Keeping this logic in one place makes it easier to change storage later.

## Default Card Thumbnails

If a user creates a prayer card without uploading an image, the app can use a generated SVG thumbnail.

Route:

```text
GET /api/card-thumbnail?title=...
```

Main files:

```text
src/app/api/card-thumbnail/route.js
src/lib/default-thumbnail.js
```

The generated image is intentionally simple: dark background, white title text, and automatic line wrapping.

This keeps card creation lightweight while still giving every card a usable visual preview.

## Gallery Metadata

Prayer card gallery images are stored in the card `meta` array using a prefix:

```text
gallery::/uploads/example.webp
```

Helpers:

```text
src/lib/card-meta.js
```

The helper parses normal info lines and gallery image references into separate lists.

## Voice

Voice fields are currently stored as URLs on prayer cards or responses.

Important fields:

```text
HomePrayerCard.voiceHref
PrayerResponse.voiceUrl
```

The UI reads these values and builds playable queues for the global player and prayer detail views.
