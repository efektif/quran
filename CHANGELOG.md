# Changelog

All notable changes to Efektif Quran will be documented in this file.

This project follows Semantic Versioning for app-level releases.

## [Unreleased]

### Added

- Release policy for Bun-only package management, SemVer, and changelog entries.
- Added published `@efektif/native` and `@efektif/tokens` packages for the shared Efektif native design contract.
- Added an About link on the Surah list that opens Moriz Kay at `https://x.com/morizkay`.

### Changed

- Updated the Quran list and reader surfaces to follow the neutral, flat, border-first Efektif Tools visual direction.
- Moved Quran list and reader surfaces onto Efektif native primitives while preserving React Navigation behavior.
- Centralized Quran theme setup through the Efektif native provider contract, with a compatibility fallback for the published native package.
- Tightened the mobile chrome to use Efektif native radius tokens on cards, badges, and actions.
- Migrated navigation to Expo Router with shared web, iOS, and Android routes for the Surah list and reader.
- Standardized repository linting and formatting on Oxlint and Oxfmt.

## [1.0.0] - 2026-05-03

### Added

- Initial Quran app version baseline.
