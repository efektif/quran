import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QuranThemeProvider, quranColors } from '../src/theme/efektifNative';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QuranThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: quranColors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="reader" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </QuranThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
