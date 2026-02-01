# efektif-quran

Quran reader app built with Expo (SDK 54) and React Native.

## Commands

```bash
bun install          # Install dependencies
bun start            # Start Expo dev server
bun run ios          # Run on iOS simulator
bun run android      # Run on Android emulator
bun run web          # Run in browser
```

## Architecture

```
src/
├── screens/         # SurahListScreen, VerseReaderScreen
├── hooks/           # useLastViewedAyat (reading position)
├── utils/           # storage (platform-aware SecureStore/localStorage)
├── types/           # TypeScript types (quran.ts, navigation.ts)
└── data/            # Static quran data
```

## Key Patterns

- **Storage**: `src/utils/storage.ts` wraps SecureStore (native) and localStorage (web) with sync-like API via caching
- **Navigation**: Uses typed `RootStackParamList` - always include in navigation props
- **Verse Reader**: TikTok-style paging with `snapToInterval={CONTENT_HEIGHT}`

## Gotchas

- Storage reads are async on native but hook returns `isLoaded` to indicate ready state
- `startAyah` is 1-based (matches `numberInSurah`)
- Quran data is bundled statically, not fetched
