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
  background: '#f6f7f9',
  foreground: '#121418',
  card: '#ffffff',
  cardForeground: '#121418',
  surface: '#f0f2f5',
  surfaceMuted: '#e3e7ec',
  mutedForeground: '#68717d',
  border: 'rgba(18, 20, 24, 0.14)',
  primary: '#f6821f',
  primaryForeground: '#241204',
  accent: '#fff0df',
  accentForeground: '#9a4100',
  ring: '#0c6bdb',
} as const;
export const quranTint = '#f6821f';

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
