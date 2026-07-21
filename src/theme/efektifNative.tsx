import { Fragment, type ComponentType, type ReactNode } from 'react';
import * as EfektifNative from '@efektif/native';

type QuranNativeThemeOptions = {
  density?: 'comfortable' | 'dense';
  mode?: 'light' | 'dark';
  tint?: 'default' | 'indigo' | 'teal' | 'amber' | 'rose' | 'green' | 'violet';
};

type QuranNativeTheme = typeof EfektifNative.darkTheme & {
  colors: typeof EfektifNative.darkTheme.colors & {
    tint?: string;
  };
};

type QuranNativeProviderProps = QuranNativeThemeOptions & {
  children: ReactNode;
  theme?: QuranNativeTheme;
};

type EfektifNativeCompatApi = typeof EfektifNative & {
  EfektifNativeProvider?: ComponentType<QuranNativeProviderProps>;
  createNativeTheme?: (options: QuranNativeThemeOptions) => QuranNativeTheme;
};

const nativeApi = EfektifNative as EfektifNativeCompatApi;

export const quranNativeTheme =
  nativeApi.createNativeTheme?.({
    density: 'dense',
    mode: 'light',
    tint: 'default',
  }) ?? (EfektifNative.darkTheme as QuranNativeTheme);

export const quranColors = {
  ...quranNativeTheme.colors,
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#f7f7f7',
  cardForeground: '#0a0a0a',
  surface: '#fafafa',
  surfaceMuted: '#f0f0f0',
  mutedForeground: '#4b4b4b',
  border: '#e5e5e5',
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  accent: '#eff6ff',
  accentForeground: '#1e40af',
  ring: '#2563eb',
} as const;
export const quranTint = '#2563eb';

export function QuranThemeProvider({ children }: { children: ReactNode }) {
  const Provider = nativeApi.EfektifNativeProvider;

  if (!Provider) {
    return <Fragment>{children}</Fragment>;
  }

  return (
    <Provider density="dense" mode="light" tint="default">
      {children}
    </Provider>
  );
}
