# Krathmand car dealership website

The Cloudflare implementation is in `KurtKrathmandStatic`. The root-level pages are the visual/content reference. `KurtKrathmand` is the older Express prototype; its server-side routes/admin remain separate and are not required for the Cloudflare deployment.

## Project structure

- `KurtKrathmandStatic/` — Cloudflare static frontend and Worker API; see its [README](./KurtKrathmandStatic/README.md) for setup.
- `KurtKrathmand/` — separate Express-based website and backend.
- `backup/KurtKrathmandStatic-pre-cloudflare/` — snapshot of the earlier static demo, before replacing its browser-only admin and demo inventory.
- `backup-root-pre-jjbiler/` — older root-site archive, kept for reference.
- Root-level HTML, CSS, JS, partials, and BilInfo XML — original prototype/reference site.

## Security and persistence

The Cloudflare project keeps the public site runtime separate from its `/admin/` application, with no public navigation between them. Cloudflare Access protects every admin page, asset, and write API, and the Worker independently validates Access JWTs. BilInfo credentials are entered through the protected admin panel and encrypted by the Worker before KV storage. A separate Worker encryption key is provisioned once during deployment. Public site settings and cached inventory use the `SITE_DATA` KV namespace rather than browser localStorage.

The Worker serves the bundled BilInfo XML until the owner configures API access in the protected panel. Cloudflare Access app membership is separate from Cloudflare account/dashboard roles; use named account members for platform maintenance and allow policies for admin-panel access.
