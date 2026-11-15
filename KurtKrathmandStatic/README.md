# Krathmand static site on Cloudflare

This is the Cloudflare implementation. The public pages are static HTML, CSS, and JavaScript. A small Worker provides the public config/inventory APIs and protected admin APIs; no Express server is needed.

The public website has no admin links or admin code. The separate admin application lives under `public/admin/`; the Worker requires a valid Cloudflare Access JWT before serving any `/admin/*` page or asset. It separately checks Access on every `/api/admin/*` request. The public endpoints `/api/config` and `/api/cars.xml` return only public site settings and vehicle inventory.

## Personal-account practice

Use your own Cloudflare account and the free `workers.dev` test URL created by the first deploy. You do not need to own a domain for this rehearsal. Do not point the customer's live domain at the test deployment.

1. Install Node.js. From the repository root, enter this project folder first:

   ```powershell
   Set-Location .\KurtKrathmandStatic
   Get-Location
   ```

   Confirm the path ends in `car-dealership-webapp\KurtKrathmandStatic`. Run all Wrangler commands from this folder; the repository root is a different static project. In Windows PowerShell, use `npx.cmd` (rather than `npx`) if script execution policy blocks `npx.ps1`. Then run `npx.cmd wrangler@latest login`. This only authorizes Wrangler; it does not create the Worker.
2. In Cloudflare, create a Workers KV namespace named `SITE_DATA`. Put its namespace ID in `wrangler.toml`.
3. Leave the `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` placeholders as they are for now. From this directory, deploy once:

   ```powershell
   npx.cmd wrangler@latest deploy --config .\wrangler.toml
   ```

   The repository root has a Wrangler config created by the mistaken deployment, so always pass `--config .\wrangler.toml` from this folder. Before confirming, check Wrangler says the Worker name is `krathmand-static` and the assets directory ends in `KurtKrathmandStatic\public`. If it says `car-dealership-webapp` or lists the repository root as the assets directory, stop. The correct deploy creates `krathmand-static` and prints its `workers.dev` test URL. Until Access is configured, the admin endpoints intentionally reject requests.

4. Configure email-code sign-in, then create the Access application. This verifies that a user can receive a code at an allowlisted email address; it does not require Google, Microsoft, or another external identity provider.

   1. In Zero Trust, go to **Integrations → Identity providers → Add new identity provider → One-time PIN**. New Zero Trust organizations may have Cloudflare login enabled by default; One-time PIN must be added explicitly.
   2. Go to **Access controls → Applications → Create new application → Self-hosted and private**. Add the test Worker hostname with paths `/admin`, `/admin/*`, and `/api/admin/*`. The form may add the leading slash automatically. The exact `/admin` path covers that URL without a trailing slash; `/admin/*` covers the admin page and its assets.
   3. In the application's login-method settings, enable **One-time PIN** as the only identity provider. Leave **Apply instant authentication** on if One-time PIN is the only provider. Leave **Authenticate with Cloudflare One Client** and independent MFA off.
   4. Add an **Allow** policy with **Include → Emails** and enter each exact email address allowed to use the panel. Do not choose **Emails ending in** for a personal email provider such as Gmail. If you have two applications for the two paths, attach the same policy to both. A rule group alone does not grant access.
   5. In **Zero Trust → Settings**, copy the team domain (for example, `your-team.cloudflareaccess.com`). In **Access controls → Applications → Edit → Additional settings**, copy **Application Audience (AUD) Tag**. Replace the placeholders in `wrangler.toml` with these values. Enter the team domain without `https://`; the Worker adds the scheme when it validates Access tokens.

5. Redeploy so the Worker receives the Access settings:

   ```powershell
   npx.cmd wrangler@latest deploy --config .\wrangler.toml
   ```

6. Add the encryption secret to the deployed Worker. In **Workers & Pages → krathmand-static → Settings → Variables and Secrets**, add `BILINFO_CREDENTIALS_ENCRYPTION_KEY`. Generate its value locally with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   Or use `npx.cmd wrangler@latest secret put BILINFO_CREDENTIALS_ENCRYPTION_KEY --config .\wrangler.toml` and enter a locally generated value at Wrangler's prompt. This is a per-Worker secret, not the account-level Secrets Store.

7. Open `/admin/` on the protected test URL. Access should prompt for sign-in before the panel loads.
8. In the panel, save the BilInfo API username/password, then select **Hent biler fra BilInfo nu** to make the first live snapshot. The supplied BilInfo demo account can be used to practice this feed refresh. Automatic updates are off by default; enable them and choose an interval in the panel if desired. Test a text/color edit and confirm it appears on the public page without another deploy.

The Worker fails closed: if Access is not configured or a request has no valid Access JWT, admin pages and APIs return 401. `wrangler dev` and the automated Worker tests can exercise the code, but an end-to-end Access sign-in test needs a hostname on which you can configure Access. The Worker test suite includes simulated signed Access tokens.

## Access and account ownership

Cloudflare Access controls who can use this admin application; it does **not** grant someone permission to manage the Cloudflare account or dashboard. For a customer deployment, the customer should own the Cloudflare account and invite your separate Cloudflare identity as an account member with only the roles needed to configure/deploy Workers, KV, domains, and Access. Configure a separate Access allow policy for the human users of the admin panel.

The customer can remove your email from the Access policy and remove your Cloudflare account membership independently. There is no hidden/backdoor account. Never ask the customer for their Cloudflare password or API token.

## Data and credential handling

- Website text, image URLs, and theme colors are stored in KV and returned by the public config API.
- BilInfo credentials are entered or replaced in the protected panel. The Worker encrypts them with AES-GCM before storing them in KV, never returns them to the panel, and decrypts them only to call BilInfo.
- The encryption key is a Worker secret installed once by the deployer. It is not the BilInfo password and is not editable/readable in the admin panel.
- The latest vehicle XML snapshot is stored persistently in KV. Public inventory requests read KV (or the bundled offline XML before the first successful refresh); they never call BilInfo. Only a manual admin refresh or an enabled scheduled refresh calls BilInfo. A failed refresh keeps serving the previous snapshot.
- KV data survives Worker code deployments. Deploying does not trigger a BilInfo request; after initial setup, use the saved snapshot and the configured schedule, or refresh manually.
- `wrangler.toml` runs a lightweight scheduled check once per hour (UTC). The admin panel can turn BilInfo updates off or choose an interval; the scheduled handler calls BilInfo only when updates are enabled and due.
- Routine text, color, credential, and inventory changes do not rebuild or redeploy the site.
- The custom domain is configured in Cloudflare DNS/Workers, not as a content field in the panel.

The dashboard/CLI is only needed for platform setup and future deployments/API maintenance. The owner uses the panel for routine changes.

## Deploy and Access setup

From this directory, create the KV namespace if you have not already created it in the dashboard, update `wrangler.toml` with its ID, then deploy. The first deploy creates the Worker; do not wait for a Worker to appear in the dashboard before running it:

```powershell
npx.cmd wrangler@latest kv namespace create SITE_DATA
# Put the returned namespace ID in wrangler.toml.
npx.cmd wrangler@latest deploy --config .\wrangler.toml
```

After the first deploy, configure Access for the printed `workers.dev` URL, put the Access team domain and audience into `wrangler.toml`, and deploy again with `--config .\wrangler.toml`. Then set the credential-encryption secret either in the Worker's **Settings → Variables and Secrets** page or with Wrangler:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
npx.cmd wrangler@latest secret put BILINFO_CREDENTIALS_ENCRYPTION_KEY --config .\wrangler.toml
```

In the Cloudflare dashboard:

1. Attach the test or customer hostname to the Worker. Keep the existing public website DNS unchanged until the replacement has been tested and approved.
2. Create an Access self-hosted application for the admin hostname or the `/admin/*` and `/api/admin/*` paths.
3. Add an **Allow** policy directly to that application. Under **Include**, select **Emails** and list the exact owner and temporary maintainer email addresses. Avoid **Emails ending in** for consumer email domains and avoid broad rules such as **Everyone**. A reusable rule group is only useful if you need to reuse or combine criteria; it must still be referenced by an application policy to grant access.
4. Set the Worker `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` values to match the Access application.
5. Verify an allowed user can load `/admin/`, and an unauthenticated request to `/admin/` or `/api/admin/*` is rejected.

For the first rehearsal, the admin app is an isolated `/admin/` path in the same Worker/static deployment, with no public navigation to or from it. The Worker authenticates every request to that path. If the final deployment uses a dedicated admin hostname, attach that hostname to the same Worker and configure Access for the entire admin hostname; the public site's code and stored data do not need to change.

## API

- `GET /api/config` — public website content, never secret values
- `GET /api/cars.xml` — persistent KV inventory snapshot, or the bundled offline XML before the first successful refresh
- `POST /api/admin/config` — Access-protected content and color updates
- `GET|POST /api/admin/credentials` — Access-protected status/update; stored credentials are never returned
- `GET|POST /api/admin/inventory/settings` — Access-protected automatic-update schedule and status
- `POST /api/admin/inventory/refresh` — Access-protected BilInfo refresh

The Worker requests BilInfo's `GET https://gw.bilinfo.net/listingapi/api/export` endpoint with an XML `Accept` header. The public-page parser prefers documented `VehicleId` and `Price` fields, handles `GearType` codes `A` and `M`, and reads each image URL from the BilInfo `Pictures` collection; legacy fixture fields remain fallbacks.

The original static prototype is preserved in `../backup/KurtKrathmandStatic-pre-cloudflare`.

## Vehicle details and photos

Vehicle cards link to `public/bil-detalje.html` with the BilInfo vehicle ID in the query string. The detail page reloads the same public inventory, displays available technical fields, and offers an image carousel plus a larger image viewer.

The current 47-vehicle offline XML snapshot was fetched from the live KV endpoint. All 47 records contain make, model, year, mileage, price, fuel, and body type. Six records have photo URLs in `Pictures/Url` (four with 10 photos, one with 12, and one with 5); the other 41 have no photo URLs in this snapshot. Description and equipment fields are not present, so the detail page does not invent them. Future feed snapshots may have different coverage.

The prior six-car fallback is preserved outside the public asset directory at `backup/bilinfo-offline-6-cars-deprecated-2026-11-15.xml`.
