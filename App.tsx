import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import SurahListScreen from './src/screens/SurahListScreen';
import VerseReaderScreen from './src/screens/VerseReaderScreen';
import { QuranThemeProvider, quranColors } from './src/theme/efektifNative';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QuranThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: quranColors.background },
            }}
          >
            <Stack.Screen 
              name="SurahList" 
              component={SurahListScreen}
            />
            <Stack.Screen 
              name="VerseReader" 
              component={VerseReaderScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </QuranThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
