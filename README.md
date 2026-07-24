# Efektif Quran

Efektif Quran is a standalone Expo Router application for web, iOS, and
Android. Product screens, bundled Quran data, local persistence, and the React
Native design layer are owned by this repository.

## Project Boundaries

- Routes live in [`app/`](./app) and product code lives in [`src/`](./src).
- The static, app-owned design system lives in
  [`src/design-system/`](./src/design-system/README.md). The app has no runtime
  or deployment dependency on a sibling Efektif UI repository.
- Reading position and the Al-Kahf reminder dismissal are private local state:
  web uses `localStorage`, while native platforms use Expo SecureStore. See
  [`src/utils/storage.ts`](./src/utils/storage.ts).
- Quran text is bundled in [`src/data/quran.ts`](./src/data/quran.ts). Its
  Arabic source is the `quran-uthmani` edition from
  [Al Quran Cloud](https://api.alquran.cloud), and the Indonesian Kementerian
  Agama translation is provided through
  [QuranEnc](https://quranenc.com) (`indonesian_affairs` v1.0.1). The provenance
  and regeneration command are recorded at the top of the generated file.

The app has no account system or remote application database. Opening a
per-ayah tafseer is an explicit external link to
[quran.com](https://quran.com).

## Development

```sh
bun install --offline
bun run start
```

Use `bun run web`, `bun run ios`, or `bun run android` for a specific platform.
Translation regeneration (`bun run data:sync:translations`) is a networked,
data-changing maintenance task and is not part of installation or builds.

## Verification

Run the standalone non-browser gates:

```sh
bun install --offline
bun run lint
bun run test:unit
bun run test:integration
bunx tsc --noEmit
bun run build
```

`bun run test:e2e` is the separate Playwright browser lane. It requires a
supported browser environment and is not run as part of design-system
localization verification.

## Deployment

`./deploy.sh` installs this repository from its frozen lockfile, runs the
quality gates, builds the static Expo export, and atomically deploys it to the
configured Caddy web root. It does not check out, build, or copy files from a
sibling repository.
