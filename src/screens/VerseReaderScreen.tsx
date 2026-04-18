import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { quranData } from '../data/quran';
import type { Ayah, Surah } from '../types/quran';
import type { RootStackParamList } from '../types/navigation';
import { useLastViewedAyat } from '../hooks/useLastViewedAyat';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const NAVBAR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const CONTENT_HEIGHT = SCREEN_HEIGHT - STATUSBAR_HEIGHT - NAVBAR_HEIGHT;

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
        <View style={styles.ayahContent}>
          {/* Surah info at top */}
          <View style={styles.surahBadge}>
            <Text style={styles.surahBadgeText}>
              {currentSurah.englishName}
            </Text>
          </View>

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
          <TouchableOpacity
            style={styles.tafseerButton}
            onPress={() => Linking.openURL(`https://quran.com/${currentSurah.number}/${ayah.numberInSurah}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.tafseerButtonText}>Baca Tafseer →</Text>
          </TouchableOpacity>
        </View>
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Surah tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      
      {/* Back button overlay */}
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {verses.length}
          </Text>
        </View>
      </SafeAreaView>

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
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>↑ Swipe untuk ayat selanjutnya</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
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
    backgroundColor: 'rgba(19, 39, 67, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  progressContainer: {
    backgroundColor: 'rgba(19, 39, 67, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#d4af37',
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
    paddingVertical: 80,
  },
  surahBadge: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  surahBadgeText: {
    fontSize: 14,
    color: '#8ca3c4',
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
    color: '#ffffff',
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
    borderColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseNumberText: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: 'bold',
  },
  verseMeta: {
    fontSize: 14,
    color: '#5a7a9a',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  metaText: {
    fontSize: 12,
    color: '#5a7a9a',
  },
  metaDivider: {
    fontSize: 12,
    color: '#5a7a9a',
    marginHorizontal: 8,
  },
  tafseerButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  tafseerButtonText: {
    fontSize: 13,
    color: '#d4af37',
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
    color: '#5a7a9a',
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
  },
});
