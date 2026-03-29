# PROD DB Migration Runbook

This project uses Prisma migrations under `prisma/migrations`.

## Files prepared for cloud deployment
- `scripts/db/prod-migrate.sh` (Linux)
- `scripts/db/prod-migrate.ps1` (Windows / PowerShell)
- `scripts/db/export-migration-bundle.cjs` (builds a single SQL bundle)
- `prisma/migrations/PROD_MIGRATION_BUNDLE.sql` (generated SQL bundle)

## Recommended production flow
1. Set `DATABASE_URL` on the server.
2. Install dependencies (`npm ci`).
3. Run migration deploy:
   - Linux: `bash scripts/db/prod-migrate.sh`
   - PowerShell: `./scripts/db/prod-migrate.ps1`
4. Restart application process.

## Manual DBA flow (if direct SQL is required)
1. Review `prisma/migrations/PROD_MIGRATION_BUNDLE.sql`.
2. Execute it in order on production DB.
3. Run `npx prisma migrate status` in app environment to verify.

## Safety checks before running in PROD
- Backup database first.
- Confirm DB user has ALTER/CREATE privileges.
- Ensure app version and migration bundle are from the same commit.