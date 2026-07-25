import { useCallback, useRef, useState, useMemo, useEffect, type ReactNode } from "react";
import {
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { quranData } from "../data/quran";
import {
  Button,
  Card,
  quranColors,
  quranTheme,
  quranTint,
  Screen,
  Text,
} from "../design-system";
import type { Ayah, Surah } from "../types/quran";
import { useLastViewedAyat } from "../hooks/useLastViewedAyat";

interface VerseItem {
  ayah: Ayah;
  surah: Surah;
}

function getPageHeight(windowHeight: number) {
  const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
  const navbarHeight = Platform.OS === "ios" ? 34 : 0;
  return windowHeight - statusBarHeight - navbarHeight;
}

function AyahBody({ ayah, surah }: { ayah: Ayah; surah: Surah }) {
  return (
    <Card style={styles.ayahContent}>
      <Card style={styles.surahBadge}>
        <Text variant="subtitle" style={styles.surahBadgeText}>
          {surah.englishName}
        </Text>
      </Card>

      <View style={styles.arabicContainer}>
        <Text style={styles.arabicText}>{ayah.text}</Text>
      </View>

      <View style={styles.translationContainer}>
        <Text style={styles.translationLabel}>Terjemahan Kemenag RI</Text>
        <Text style={styles.translationText}>{ayah.translation}</Text>
        {ayah.translationFootnotes ? (
          <Text style={styles.translationFootnotes}>{ayah.translationFootnotes}</Text>
        ) : null}
      </View>

      <View style={styles.verseIndicator}>
        <View style={styles.verseNumberBadge}>
          <Text style={styles.verseNumberText}>{ayah.numberInSurah}</Text>
        </View>
        <Text style={styles.verseMeta}>
          Ayat {ayah.numberInSurah} dari {surah.numberOfAyahs}
        </Text>
      </View>

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>Juz {ayah.juz}</Text>
        <Text style={styles.metaDivider}>/</Text>
        <Text style={styles.metaText}>Halaman {ayah.page}</Text>
      </View>

      <Button
        variant="outline"
        size="sm"
        style={styles.tafseerButton}
        textStyle={styles.tafseerButtonText}
        onPress={() => Linking.openURL(`https://quran.com/${surah.number}/${ayah.numberInSurah}`)}
      >
        Baca Tafseer
      </Button>
    </Card>
  );
}

type AyahPageProps = {
  item: VerseItem;
  pageHeight: number;
  pageWidth: number;
};

function AyahPage({ item, pageHeight, pageWidth }: AyahPageProps) {
  const { ayah, surah } = item;
  const [contentHeight, setContentHeight] = useState(0);
  // Prefer a plain View when the ayah fits. A disabled ScrollView on web sets
  // touch-action:none and still steals mobile swipes from the outer pager.
  const needsScroll = contentHeight > pageHeight + 1;

  const handleMeasure = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  }, []);

  let pageContent: ReactNode;
  if (needsScroll) {
    pageContent = (
      <ScrollView
        style={styles.ayahScroll}
        contentContainerStyle={styles.ayahScrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <AyahBody ayah={ayah} surah={surah} />
      </ScrollView>
    );
  } else {
    pageContent = (
      <View style={[styles.ayahScroll, styles.ayahScrollContent]}>
        <AyahBody ayah={ayah} surah={surah} />
      </View>
    );
  }

  return (
    <View style={[styles.ayahContainer, { height: pageHeight, width: pageWidth }]}>
      <View
        pointerEvents="none"
        style={styles.measureLayer}
        onLayout={handleMeasure}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <AyahBody ayah={ayah} surah={surah} />
      </View>
      {pageContent}
    </View>
  );
}

export default function VerseReaderScreen() {
  const router = useRouter();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const pageHeight = getPageHeight(windowHeight);
  const params = useLocalSearchParams<{
    surahNumber?: string | string[];
    startAyah?: string | string[];
  }>();
  const surahValue = Array.isArray(params.surahNumber) ? params.surahNumber[0] : params.surahNumber;
  const startAyahValue = Array.isArray(params.startAyah) ? params.startAyah[0] : params.startAyah;
  const surahNumber = Number(surahValue);
  const parsedStartAyah = Number(startAyahValue ?? 1);
  const startAyah = Number.isInteger(parsedStartAyah) && parsedStartAyah > 0 ? parsedStartAyah : 1;
  const flatListRef = useRef<FlatList<VerseItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { saveLastViewed } = useLastViewedAyat();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAyahRef = useRef({ surahNumber, ayahNumber: startAyah });

  const surah = useMemo(
    () => quranData.surahs.find((s) => s.number === surahNumber),
    [surahNumber],
  );

  const verses: VerseItem[] = useMemo(() => {
    if (!surah) return [];
    return surah.ayahs.map((ayah) => ({ ayah, surah }));
  }, [surah]);

  const initialScrollIndex = useMemo(() => {
    return Math.max(0, startAyah - 1);
  }, [startAyah]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      saveLastViewed(currentAyahRef.current.surahNumber, currentAyahRef.current.ayahNumber);
    };
  }, [saveLastViewed]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        setCurrentIndex(newIndex);

        const ayahNumber = newIndex + 1;
        currentAyahRef.current = { surahNumber, ayahNumber };

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          saveLastViewed(surahNumber, ayahNumber);
        }, 500);
      }
    },
    [surahNumber, saveLastViewed],
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    [],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderAyahItem = useCallback(
    ({ item }: { item: VerseItem }) => (
      <AyahPage item={item} pageHeight={pageHeight} pageWidth={windowWidth} />
    ),
    [pageHeight, windowWidth],
  );

  const keyExtractor = useCallback(
    (item: VerseItem) => `${item.surah.number}-${item.ayah.numberInSurah}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<VerseItem> | null | undefined, index: number) => ({
      length: pageHeight,
      offset: pageHeight * index,
      index,
    }),
    [pageHeight],
  );

  if (!surah) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.errorText}>Surah tidak ditemukan</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={quranColors.background} />

      <View style={styles.headerOverlay}>
        <Button
          variant="secondary"
          size="sm"
          style={styles.backButton}
          textStyle={styles.backButtonText}
          onPress={handleBack}
          accessibilityLabel="Kembali ke daftar surah"
        >
          Back
        </Button>
        <Card style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {verses.length}
          </Text>
        </Card>
      </View>

      <FlatList
        ref={flatListRef}
        testID="verse-list"
        data={verses}
        renderItem={renderAyahItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={pageHeight}
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

      <View style={styles.swipeHint} pointerEvents="none">
        <Text style={styles.swipeHintText}>Swipe untuk ayat selanjutnya</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: quranColors.background,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  backButton: {
    minWidth: 72,
    height: 44,
    borderRadius: quranTheme.radii.md,
    backgroundColor: quranColors.surface,
    borderColor: quranColors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  backButtonText: {
    fontSize: 13,
    color: quranColors.foreground,
    fontWeight: "700",
  },
  progressContainer: {
    backgroundColor: quranColors.surface,
    borderColor: quranColors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: quranTheme.radii.md,
  },
  progressText: {
    fontSize: 14,
    color: quranTint,
    fontWeight: "700",
  },
  ayahContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  measureLayer: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    opacity: 0,
  },
  ayahScroll: {
    flex: 1,
    width: "100%",
  },
  ayahScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  ayahContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: quranColors.card,
    borderColor: quranColors.border,
    borderRadius: quranTheme.radii.md,
    paddingHorizontal: 24,
    paddingVertical: 76,
  },
  surahBadge: {
    backgroundColor: quranColors.surface,
    borderColor: quranColors.border,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: quranTheme.radii.md,
    marginBottom: 32,
  },
  surahBadgeText: {
    fontSize: 14,
    color: quranColors.mutedForeground,
    fontWeight: "700",
  },
  arabicContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  arabicText: {
    fontSize: 36,
    lineHeight: 72,
    color: quranColors.foreground,
    textAlign: "center",
    fontWeight: "400",
    writingDirection: "rtl",
  },
  translationContainer: {
    width: "100%",
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: quranColors.border,
  },
  translationLabel: {
    marginBottom: 10,
    color: quranTint,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  translationText: {
    color: quranColors.foreground,
    fontSize: 18,
    lineHeight: 30,
  },
  translationFootnotes: {
    marginTop: 16,
    color: quranColors.mutedForeground,
    fontSize: 13,
    lineHeight: 21,
  },
  verseIndicator: {
    alignItems: "center",
    marginTop: 32,
  },
  verseNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: quranTheme.radii.md,
    backgroundColor: quranTint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  verseNumberText: {
    fontSize: 16,
    color: quranColors.background,
    fontWeight: "bold",
  },
  verseMeta: {
    fontSize: 14,
    color: quranColors.mutedForeground,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  metaText: {
    fontSize: 12,
    color: quranColors.mutedForeground,
  },
  metaDivider: {
    fontSize: 12,
    color: quranColors.mutedForeground,
    marginHorizontal: 8,
  },
  tafseerButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: quranTheme.radii.md,
    borderWidth: 1,
    borderColor: quranColors.border,
  },
  tafseerButtonText: {
    fontSize: 13,
    color: quranColors.foreground,
    fontWeight: "700",
  },
  swipeHint: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  swipeHintText: {
    fontSize: 12,
    color: quranColors.mutedForeground,
  },
  errorText: {
    fontSize: 18,
    color: quranColors.foreground,
    textAlign: "center",
    marginTop: 100,
  },
});
