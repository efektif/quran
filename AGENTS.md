# Quran Repository Guidelines

## Product

Expo / React Native Quran reading app with data sync scripts (`app/`, `scripts/`).

## Stack

- TypeScript / Expo (pnpm)
- Oxc lint/format

## Verification

Run from this repository root:

- `pnpm run verify`

## Editor extensions

Workspace recommendations live in `.vscode/extensions.json`.
Opening this folder in VS Code or Cursor prompts installation.

- `expo.vscode-expo-tools` — Expo / React Native tooling

## Conventions

- This repository keeps **one** knowledge document: `AGENTS.md`. Do not add `README.md`, `docs/`, or other markdown knowledge files unless they are product artifacts already required by the project.
- Follow the Efektif root `AGENTS.md` for cross-repo boundaries. This file overrides root guidance for work inside this repository.
- Use manifests, Makefile, and package scripts as the runtime source of truth.
- Extend this file when new durable knowledge is needed.
