Status: DONE
Verify: FULL

2026-09-26: the user's new production domain is `*.asanrezerve.ir`. Confirmed mapping (user decision):
`back.nahalkmi.ir` → `api.asanrezerve.ir` (API + same-origin Vue web app), `provider.nahalkmi.ir` →
`provider.asanrezerve.ir`, `customer.nahalkmi.ir` → `customer.asanrezerve.ir`, `admin.nahalkmi.ir` →
`admin.asanrezerve.ir`, and the bare `nahalkmi.ir` used as the admin-login email domain →
`asanrezerve.ir`.

## Scope and a hard limit

`nahalkmi.ir` appears 151 times across 46 files (full inventory from an Explore pass, kept below).
This retargets every repo-tracked file that is source of truth for a deployment (CORS lists, nginx
vhosts, CI workflow, `docker-compose.prod.yml`, the admin `.env.production`, the geocoding
User-Agent, tests that pin the exact origin) plus the docs that describe *current* production.

**What this task cannot do, because it needs the live server or a domain registrar, neither
reachable from here:** point DNS at `194.1.155.230` for the four new subdomains, or run `certbot`
to issue their TLS certs. Production keeps serving `*.nahalkmi.ir` under the *old* nginx/CORS
config until a human does that on the box and redeploys. `docs/DEPLOYMENT_RUNBOOK.md` gets a new
"Domain cutover" note (mirroring the existing Booksy→AsanRezerve pending-migration footnote in
`FOLLOW-UPS.md` #58) spelling out that sequence, so nothing here is silently assumed done.

**One deliberately flagged, not silently fixed, risk:** `asan-rezerve-admin/src/utils/login-identifier.ts`'s
`ADMIN_EMAIL_DOMAIN` turns the admin's typed username into `<user>@nahalkmi.ir` — the account's
*actual* email in the production database. Changing the constant to `asanrezerve.ir` without also
updating that DB row breaks the username-shorthand login the day this ships. Task 4 changes the
code (matching the user's stated new domain) and adds this exact warning to the runbook; the DB
update itself is a production data change outside this repo and is called out, not performed.

## Full inventory (46 files, by category)

- **Backend runtime config**: `src/Host/AsanRezerve.Host/appsettings.json` (`Cors:AllowedOrigins`,
  4 entries), `docker-compose.prod.yml` (`PUBLIC_BASE_URL` default),
  `.../ServiceCatalog.Infrastructure/Services/Geocoding/NominatimGeocodingProvider.cs` (Nominatim
  usage-policy User-Agent).
- **Backend tests pinning the exact origin/domain**:
  `tests/AsanRezerve.Host.IntegrationTests/Composition/CorsOriginsCompositionTests.cs`,
  `tests/AsanRezerve.ServiceCatalog.Api.UnitTests/Services/UrlServiceTests.cs`,
  `tests/AsanRezerve.Host.IntegrationTests/ServiceCatalog/GalleryManagementTests.cs`,
  `tests/AsanRezerve.Host.IntegrationTests/ServiceCatalog/API/Customers/ProviderPhotosReachCustomersTests.cs`,
  `ReviewTestBase.cs`, `ProviderRatingBackfillTests.cs`, `AdminRoleNameTests.cs` (fixture emails).
- **Deployment**: `deployment/nginx/{asan-rezerve,asan-rezerve-admin,asan-rezerve-customer,asan-rezerve-provider}.conf`
  (`server_name` + cert paths), `.github/workflows/deploy.yml` (8+ hardcoded URLs: dart-defines,
  build-output greps, health checks, e2e `BASE=`/`ORIGIN=`), `tools/observability-mcp/{server.mjs,
  client.mjs, README.md, mcp.example.json}` (example values).
- **Admin app**: `asan-rezerve-admin/.env.production` (`VITE_API_BASE_URL`),
  `src/utils/login-identifier.ts` + its spec (see risk above).
- **Frontend test fixture**: `asan-rezerve-frontend/src/modules/provider/views/invitation/__tests__/AcceptInvitationView.spec.ts`.
- **Flutter apps** (comments + one real assertion): both apps' `lib/core/api/config/api_constants.dart`
  doc-comment, `provider_image.dart` / `gallery_page.dart` shared-cache comments,
  `analysis_options.yaml` comment, `test/config/web_shell_test.dart` group name,
  `test/core/widgets/widgets_test.dart` (comment + one fixture URL), `test/features/home/more_test.dart`
  comment, `test/core/api_base_url_test.dart` (the "not a prod URL" guard — retarget to the new domain).
- **Docs**: `CLAUDE.md`, `docs/DEPLOYMENT_RUNBOOK.md` (extensive — add the cutover note near the top
  rather than pretending the switch already happened on the box), `openspec/changes/FOLLOW-UPS.md`
  #58 (add a footnote in the existing pending-migration style; do not rewrite the historical entry).
- **Left alone deliberately**: `openspec/changes/**/tasks.md` (historical work logs — a record of
  what was true when written, per repo convention already applied to this same inventory by the
  Explore pass); the `asanrezerve.com` / `app.asanrezerve.com` CORS entries already sitting in
  `ServiceCatalog.Api` and `UserManagement.API`'s own (separately-hosted, currently-unused)
  `appsettings.json` — pre-existing and unrelated to `.ir`, out of scope here.

## Tasks

- [x] 1 Backend: retarget `appsettings.json` CORS, `docker-compose.prod.yml`, `NominatimGeocodingProvider`;
  update the seven backend test files above to the new origins/emails. `scripts/verify.sh fast`.
- [x] 2 Deployment: retarget the four nginx vhosts, `deploy.yml`, and the observability-mcp examples.
- [x] 3 Frontend test fixture (`AcceptInvitationView.spec.ts`) and Flutter apps (comments, test group
  name/fixture, `api_base_url_test.dart` guard). `npx vitest` / `flutter analyze && flutter test` in
  each touched app.
- [x] 4 Admin app: `.env.production`, `ADMIN_EMAIL_DOMAIN` + its spec — with the DB-email risk written
  into the runbook (not silently assumed). Also caught two files the inventory missed:
  `Login.vue`'s comment and both `tests/e2e/*-smoke.sh` usage lines.
- [x] 5 Docs: `CLAUDE.md`, a new "⚠️ Pending: domain cutover to asanrezerve.ir" section in
  `docs/DEPLOYMENT_RUNBOOK.md` (mirroring the doc's own existing Booksy-rename section, right before
  "Current production state" — DNS, certbot-before-nginx-swap, DB-email order, keep old certs for a
  grace period), a footnote on `FOLLOW-UPS.md` #58. Grep confirms no remaining `nahalkmi` outside
  `openspec/changes/**/tasks.md`.
- [x] 6 FULL verify.

## Log

- 2026-09-26 The PR for the previous change (branding logos, #36) had already merged, so this
  branch was restarted from `origin/master` per the repo's own convention, rather than stacked.
  Grep swept 46 files across categories; the Explore pass's inventory missed two
  (`asan-rezerve-admin/src/views/Login.vue`'s comment, both `tests/e2e/*-smoke.sh` usage lines),
  caught and fixed while doing the sweep. `scripts/verify.sh full --all` (reusing this session's
  already-installed `dotnet-sdk-10.0` + `DOTNET_ROLL_FORWARD=Major` + the manually started
  `asanrezerve-test-postgres` container from the previous change): **PASS, 21/21 steps** — build,
  all ten unit/architecture projects, all 901 integration tests, both Vue apps' type-check/lint/unit,
  both Flutter apps' analyze/test. Re-ran once more after this file's own final edits so the
  recorded tree matches; nothing touched after that second run.
