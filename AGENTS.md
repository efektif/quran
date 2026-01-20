# AGENTS.md - AI Coding Agent Guidelines

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Type** | React Native mobile app (Expo SDK 54) |
| **Language** | TypeScript (strict mode) |
| **React/RN** | 19.1.0 / 0.81.5 |
| **Package Manager** | Bun |
| **Platforms** | iOS, Android, Web |

---

## Build/Lint/Test Commands

```bash
# Development
bun start                    # Start Expo dev server
bun run ios                  # iOS simulator
bun run android              # Android emulator
bun run web                  # Web browser

# Package Management (prefer bun expo over bun add)
bun expo add <package>       # Add package
bun expo remove <package>    # Remove package

# Type Checking
bunx tsc --noEmit            # Type check
bunx tsc --noEmit --watch    # Watch mode

# Testing (when configured)
bun test                     # Run all tests
bun test <path>              # Run specific test file
bun test -- --testNamePattern="<pattern>"  # Run matching tests

# Building
bunx expo prebuild           # Generate native projects
```

---

## Project Structure

```
efektif-quran/
├── App.tsx              # Root component
├── index.ts             # Entry point
├── app.json             # Expo config
├── assets/              # Static assets
└── src/                 # Source code (future)
    ├── components/      # Reusable UI
    ├── screens/         # Screen components
    ├── hooks/           # Custom hooks
    ├── services/        # API services
    └── types/           # TypeScript types
```

---

## Code Style

### Formatting
- **Indentation:** 2 spaces
- **Quotes:** Single (JS/TS), Double (JSX attributes)
- **Semicolons:** Required
- **Trailing commas:** Yes

### Import Order (separated by blank lines)
```typescript
// 1. React/React Native
import { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Expo packages
import { StatusBar } from 'expo-status-bar';

// 3. Third-party
import axios from 'axios';

// 4. Local imports
import { Button } from '@/components/Button';

// 5. Types
import type { User } from '@/types';
```

### Naming Conventions
| Entity | Convention | Example |
|--------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | `use` prefix | `useAuth.ts` |
| Types/Interfaces | PascalCase | `interface User {}` |
| Constants | SCREAMING_SNAKE | `API_BASE_URL` |
| Functions/Variables | camelCase | `calculateTotal` |
| Booleans | `is/has/should` | `isLoading` |

### Component Pattern
```typescript
import { StyleSheet, View, Text } from 'react-native';

interface Props {
  title: string;
  onPress?: () => void;
}

export default function ComponentName({ title, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

### TypeScript
- Strict mode enabled - avoid `any`
- Prefer `interface` for objects, `type` for unions
- Use explicit return types for complex functions

### Error Handling
```typescript
try {
  const data = await fetchData();
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed:', error.message);
  }
  throw error;
}
```

### Styles
- Use `StyleSheet.create()` at file bottom
- Define outside component for performance

---

## Agent Instructions

### Tooling
- Use `bunx` instead of `npx`
- Use `bun expo add/remove` for Expo packages
- Use `ast-grep` instead of `grep` for code search

### Git Commits
- Concise messages, no signatures or Co-Authored-By
- Format: `type: description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### Testing (Jest + React Native Testing Library)
```typescript
import { render, screen } from '@testing-library/react-native';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button title="Click" />);
    expect(screen.getByText('Click')).toBeTruthy();
  });
});
```

Test files: `*.test.ts(x)` in `__tests__/` or colocated with source.
