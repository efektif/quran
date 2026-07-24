# Changelog

All notable changes to Efektif Quran will be documented in this file.

This project follows Semantic Versioning for app-level releases.

## [Unreleased]

### Added

- In-app Changelog page linked from the Surah list header.
- Kamis malam / Jumat Al-Kahf reminder modal with a direct open action.

## [1.1.0] - 2026-07-21

### Added

- Release policy for Bun-only package management, SemVer, and changelog entries.
- Added published `@efektif/native` and `@efektif/tokens` packages for the shared Efektif native design contract.
- Added an About link on the Surah list that opens Moriz Kay at `https://x.com/morizkay`.
- Added all 6,236 Indonesian ayah translations and available notes from the Kementerian Agama Republik Indonesia edition published through QuranEnc.
- Added scrollable verse pages so long Arabic text, translations, and translation notes remain readable.
- Added per-ayah Baca Tafseer links to quran.com.
- Added reading position tracking with a Lanjutkan Membaca card on the Surah list.

### Changed

- Updated the Quran list and reader surfaces to follow the neutral, flat, border-first Efektif Tools visual direction.
- Moved Quran list and reader surfaces onto Efektif native primitives while preserving React Navigation behavior.
- Centralized Quran theme setup through the Efektif native provider contract, with a compatibility fallback for the published native package.
- Tightened the mobile chrome to use Efektif native radius tokens on cards, badges, and actions.
- Migrated navigation to Expo Router with shared web, iOS, and Android routes for the Surah list and reader.
- Standardized repository linting and formatting on Oxlint and Oxfmt.
- Adopted System One blue-primary accents aligned with the shared Efektif suite palette.

### Fixed

- Replaced react-native-mmkv with expo-secure-store for Expo Go compatibility.

## [1.0.0] - 2026-05-03

### Added

- Initial Quran app version baseline.
