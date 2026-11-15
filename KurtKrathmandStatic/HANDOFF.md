# Krathmand Static project handoff

Last updated: 2026-11-15

Use this document to resume work on the Cloudflare Static dealership site. Read it before changing files, then update it when a major feature or deployment milestone changes.

## Project goal and scope

The active target is `KurtKrathmandStatic/`: a static HTML/CSS/JavaScript dealership website with a small Cloudflare Worker for public content/inventory APIs and protected admin APIs. The owner should be able to edit site content and manage BilInfo inventory from the protected panel without maintaining an Express backend.

Do not treat the repository-root project, the older `KurtKrathmand` project, or the saved prototype as the current implementation target unless the user asks to synchronize them. The original Cloudflare Static prototype is documented in `../backup/KurtKrathmandStatic-pre-cloudflare`.

## Current state

- The deployed public inventory endpoint returned HTTP 200 with `X-Inventory-Source: kv` and 47 vehicles on 2026-11-15.
- `public/bilinfo-offline.xml` now contains that verified 47-vehicle XML snapshot. It is well-formed and the declared and actual vehicle counts match.
- The previous six-vehicle fixture is preserved outside the public asset directory at `backup/bilinfo-offline-6-cars-deprecated-2026-11-15.xml`.
- The Worker and public site use persistent KV inventory snapshots. Visitor requests do not call BilInfo. Manual admin refresh is available; scheduled refresh is opt-in and checked hourly by Cron.
- The local car-detail page, card links, image carousel, and enlarged image viewer are being added in this work. Do not consider them deployed until tested and deployed.
- There are many existing modified/untracked files in the worktree. Preserve them; do not reset, clean, or revert unrelated work.

## BilInfo data coverage in the current snapshot

There are 47 vehicles. Each has a make, model, year, mileage, price, fuel type, and body type. Variant is present for 43; gearbox is present for 46; door count is present for 42. There are no `Description` or `Equipment` elements, so do not invent those details.

Images are not limited to one per vehicle. The XML uses a `Pictures` collection with multiple `Url` elements:

- 4 vehicles have 10 URLs each.
- 1 vehicle has 12 URLs.
- 1 vehicle has 5 URLs.
- The other 41 vehicles have an empty `Pictures` collection.

That is 57 image URLs in the current demo snapshot. This is a measurement of this snapshot, not a guarantee about future BilInfo feeds. Cars without image URLs should display an explicit no-photos message on the detail page rather than imply a stock photo is of that actual vehicle.

## Site structure

- `public/index.html` — homepage and featured inventory cards.
- `public/biler.html` — searchable/filterable full inventory.
- `public/bil-detalje.html` — intended vehicle detail route; receives a normalized vehicle ID as `?id=...`.
- `public/app.js` — shared header/footer and config loading, XML-to-vehicle normalization, filtering, card rendering, and vehicle detail/gallery behavior.
- `public/styles.css` — shared site styling and responsive layouts.
- `public/partials/header.html`, `public/partials/footer.html` — shared navigation and footer.
- `public/config.js` — public defaults only; never put API credentials or encryption secrets here.
- `public/bilinfo-offline.xml` — bundled offline inventory fallback, now the 47-car snapshot.
- `public/admin/` — Cloudflare Access-protected owner panel.
- `worker/index.mjs` — Worker routes, Access validation, KV content/inventory, encrypted credentials, refresh scheduling.
- `worker/index.test.mjs` — focused Worker tests.
- `wrangler.toml` — Worker name/configuration, KV binding, Access values, and hourly Cron.
- `backup/` — non-public Static-project backups, including the deprecated six-car XML fixture.
- `README.md` — setup, deployment, data handling, and current feature notes.

The public front end requests `/api/cars.xml`, parses `<Vehicle>` elements, and falls back to `./bilinfo-offline.xml` if the Worker request fails. It has a six-car in-code starter fallback only if both XML sources fail.

## Cloudflare and credential handling

- Deploy from this directory, not from repository root:

  ```powershell
  Set-Location .\KurtKrathmandStatic
  npx.cmd wrangler@latest deploy --config .\wrangler.toml
  ```

- The Worker is `krathmand-static`; `SITE_DATA` is the KV binding.
- Cloudflare Access is configured for the admin paths, using One-time PIN and the owner's allowlisted email. The Worker also validates the Access JWT for admin routes.
- BilInfo credentials are entered through the protected admin panel and encrypted with AES-GCM before being stored in KV. The key is the Worker secret `BILINFO_CREDENTIALS_ENCRYPTION_KEY`.
- Never put BilInfo credentials, the encryption-key value, Access tokens, or account secrets in source files, this handoff, chat, or commits.
- KV persists across deploys. The user chose not to fetch BilInfo on every deployment. Deploying does not refresh inventory.
- The user has previously saved the encryption key securely outside the project. Do not ask them to paste it into chat or source.
- Do not enable Worker-wide protection: it would block public site routes as well. Keep Access scoped to admin paths.

## Verification commands

From `KurtKrathmandStatic`:

```powershell
node --check public\app.js
node --test worker\index.test.mjs
npx.cmd wrangler@latest deploy --dry-run --config .\wrangler.toml
```

The last recorded Worker test run passed all 5 tests. The Wrangler dry run succeeded and found 20 public assets before adding the detail page.

## Work to finish / next steps

1. Finish browser validation of `bil-detalje.html`: click a card, confirm the matching vehicle appears, exercise thumbnails and previous/next, open/close the full-size image viewer, and verify keyboard arrows/Escape and a no-images vehicle.
2. Verify actual `Pictures/Url` entries are normalized and deduplicated; the current code should expose all image URLs instead of only the first one.
3. Check responsive layout, link/focus accessibility, and missing/unknown vehicle IDs.
4. Add focused front-end regression tests if an appropriate existing test setup becomes available; currently only Worker tests exist.
5. Update README/handoff with the results, then ask before deploying the new detail page. The current Worker/KV snapshot is already live; local page changes are not.
6. If the owner needs additional vehicle copy or equipment details, first confirm those fields are actually available in a newer feed. The current snapshot has no description/equipment data.
7. Later, the non-Static version may support owner-defined categories, aliases, and rules. That is a separate future scope; the current Static site intentionally uses preset filters.

## Important workflow guidance

Make small, scoped edits in `KurtKrathmandStatic/`. Inspect the current worktree before editing and preserve existing modifications. Avoid copying secrets or snapshots into the repository beyond the public fixture already requested. After completing or deploying a feature, update this file so another assistant can reliably resume.
