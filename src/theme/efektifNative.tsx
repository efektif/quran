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

export const quranColors = quranNativeTheme.colors;
export const quranTint = quranNativeTheme.colors.tint;

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
