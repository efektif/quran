# Quran Design System

This directory is Quran's app-owned React Native design layer. The application
does not install or load `@efektif/native` or `@efektif/tokens` at runtime.

## Provenance

- Design contract: **Efektif Design Contract 0.2.0**
- Source repository: `efektif/ui`
- Source commit: `e7363e347233eeab5c030a7fc8f0ba0c316a00d4`
- License: [MIT](./LICENSE)
- Token sources:
  - `packages/tokens/src/index.ts`
  - `packages/tokens/generated/native.json`
- Native component sources:
  - `packages/native/src/theme.ts`
  - `packages/native/src/components/pressable-surface.tsx`
  - `packages/native/src/components/button.tsx`
  - `packages/native/src/components/card.tsx`
  - `packages/native/src/components/text.tsx`
  - `packages/native/src/components/badge.tsx`
  - `packages/native/src/components/layout.tsx`

The implementation is a substantial, product-owned adaptation of those MIT
sources. `LICENSE` preserves the upstream notice.

## Local API

- Primitives: `Button`, `Card`, `Screen`, `Text`, `Badge`, `Stack`, and
  `ListItem`.
- Theme: `QuranThemeProvider`, `quranTheme`, `quranColors`, `quranTint`, and
  `useQuranTheme`.
- Internal behavior: animated press feedback remains private to the design
  system.

The local primitives preserve the upstream press, loading, disabled, selected,
accessibility-role, spacing, radius, and typography behavior used by Quran.
APIs for components that Quran does not use are intentionally not copied.

## Intentional Modes

Quran intentionally ships one static combination:

- mode: `light`
- density: `dense`
- tint: `default` (`#2563EB`)

The product already declares light UI in `app.json`, and no screen exposes a
mode, density, or tint switch. Supporting unused modes would make this snapshot
larger without changing product behavior.

`quranColors` retains the app's explicit light-surface overrides, including its
stronger `#4B4B4B` muted text, while primitives consume the contract's base
light theme through `QuranThemeProvider`.

## Verification

After changing this snapshot, run:

1. `bun install --offline`
2. `bun run lint`
3. `bun run test:unit`
4. `bun run test:integration`
5. `bunx tsc --noEmit`
6. `bun run build`

Browser end-to-end tests are a separate lane and are not part of static design
localization verification.

## Updating the Snapshot

1. Review the new upstream design contract and source diff.
2. Copy only tokens, primitives, and behavior required by Quran.
3. Update the contract version, full source commit, paths, and license if
   necessary.
4. Confirm `package.json`, `bun.lock`, and `deploy.sh` contain no sibling
   repository or file dependency.
5. Run the verification lanes above.
