import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, Card, Screen, Text } from '@efektif/native';
import { nativeTokens } from '@efektif/tokens';

import { quranData } from '../data/quran';
import type { Ayah, Surah } from '../types/quran';
import type { RootStackParamList } from '../types/navigation';
import { useLastViewedAyat } from '../hooks/useLastViewedAyat';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const CONTENT_HEIGHT = SCREEN_HEIGHT - STATUSBAR_HEIGHT - NAVBAR_HEIGHT;
const colors = nativeTokens.darkColors;
const tint = nativeTokens.tints.teal;

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerseReader'>;
  route: RouteProp<RootStackParamList, 'VerseReader'>;
}

interface VerseItem {
  ayah: Ayah;
  surah: Surah;
}

export default function VerseReaderScreen({ navigation, route }: Props) {
  const { surahNumber, startAyah = 1 } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { saveLastViewed } = useLastViewedAyat();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAyahRef = useRef({ surahNumber, ayahNumber: startAyah });

  const surah = useMemo(() => 
    quranData.surahs.find(s => s.number === surahNumber),
    [surahNumber]
  );

  const verses: VerseItem[] = useMemo(() => {
    if (!surah) return [];
    return surah.ayahs.map(ayah => ({ ayah, surah }));
  }, [surah]);

  const initialScrollIndex = useMemo(() => {
    return Math.max(0, startAyah - 1);
  }, [startAyah]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // Save current position when leaving
      saveLastViewed(currentAyahRef.current.surahNumber, currentAyahRef.current.ayahNumber);
    };
  }, [saveLastViewed]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);

      // Track current ayah for unmount save
      const ayahNumber = newIndex + 1;
      currentAyahRef.current = { surahNumber, ayahNumber };

      // Debounced save to storage
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        saveLastViewed(surahNumber, ayahNumber);
      }, 500);
    }
  }, [surahNumber, saveLastViewed]);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
  }), []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderAyahItem = useCallback(({ item }: { item: VerseItem }) => {
    const { ayah, surah: currentSurah } = item;
    
    return (
      <View style={styles.ayahContainer}>
        <Card style={styles.ayahContent}>
          {/* Surah info at top */}
          <Card style={styles.surahBadge}>
            <Text variant="subtitle" style={styles.surahBadgeText}>
              {currentSurah.englishName}
            </Text>
          </Card>

          {/* Arabic verse - centered */}
          <View style={styles.arabicContainer}>
            <Text style={styles.arabicText}>
              {ayah.text}
            </Text>
          </View>

          {/* Verse number indicator */}
          <View style={styles.verseIndicator}>
            <View style={styles.verseNumberBadge}>
              <Text style={styles.verseNumberText}>
                {ayah.numberInSurah}
              </Text>
            </View>
            <Text style={styles.verseMeta}>
              Ayat {ayah.numberInSurah} dari {currentSurah.numberOfAyahs}
            </Text>
          </View>

          {/* Juz and Page info */}
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>Juz {ayah.juz}</Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>Halaman {ayah.page}</Text>
          </View>

          {/* Tafseer link */}
          <Button
            variant="outline"
            size="sm"
            style={styles.tafseerButton}
            textStyle={styles.tafseerButtonText}
            onPress={() => Linking.openURL(`https://quran.com/${currentSurah.number}/${ayah.numberInSurah}`)}
          >
            Baca Tafseer →
          </Button>
        </Card>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: VerseItem) => 
    `${item.surah.number}-${item.ayah.numberInSurah}`,
    []
  );

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: CONTENT_HEIGHT,
    offset: CONTENT_HEIGHT * index,
    index,
  }), []);

  if (!surah) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.errorText}>Surah tidak ditemukan</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Back button overlay */}
      <View style={styles.headerOverlay}>
        <Button
          variant="secondary"
          size="sm"
          style={styles.backButton} 
          textStyle={styles.backButtonText}
          onPress={handleBack}
          accessibilityLabel="Kembali ke daftar surah"
        >
          ←
        </Button>
        <Card style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {verses.length}
          </Text>
        </Card>
      </View>

      {/* TikTok-style vertical scroll */}
      <FlatList
        ref={flatListRef}
        data={verses}
        renderItem={renderAyahItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={CONTENT_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
      />

      {/* Swipe hint */}
      <View style={styles.swipeHint} pointerEvents="none">
        <Text style={styles.swipeHintText}>↑ Swipe untuk ayat selanjutnya</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.foreground,
  },
  progressContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: tint,
    fontWeight: '600',
  },
  ayahContainer: {
    height: CONTENT_HEIGHT,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ayahContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.card,
    borderColor: colors.border,
    paddingVertical: 80,
  },
  surahBadge: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  surahBadgeText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
  arabicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  arabicText: {
    fontSize: 36,
    lineHeight: 72,
    color: colors.foreground,
    textAlign: 'center',
    fontWeight: '400',
    writingDirection: 'rtl',
  },
  verseIndicator: {
    alignItems: 'center',
    marginTop: 40,
  },
  verseNumberBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseNumberText: {
    fontSize: 18,
    color: tint,
    fontWeight: 'bold',
  },
  verseMeta: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  metaText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  metaDivider: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginHorizontal: 8,
  },
  tafseerButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tint,
  },
  tafseerButtonText: {
    fontSize: 13,
    color: tint,
    fontWeight: '600',
  },
  swipeHint: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  errorText: {
    fontSize: 18,
    color: colors.foreground,
    textAlign: 'center',
    marginTop: 100,
  },
});
