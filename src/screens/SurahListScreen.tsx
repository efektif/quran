import { useCallback, useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, ListItem, Screen, Stack, Text } from '@efektif/native';

import { quranData } from '../data/quran';
import type { Surah } from '../types/quran';
import type { RootStackParamList } from '../types/navigation';
import { useLastViewedAyat, type LastViewedAyat } from '../hooks/useLastViewedAyat';
import { quranColors, quranTint } from '../theme/efektifNative';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SurahList'>;
}

export default function SurahListScreen({ navigation }: Props) {
  const { getLastViewed, isLoaded } = useLastViewedAyat();
  const [lastViewed, setLastViewed] = useState<LastViewedAyat | null>(null);

  // Refresh last viewed position when screen gains focus or storage loads
  useEffect(() => {
    if (!isLoaded) return;

    const unsubscribe = navigation.addListener('focus', () => {
      setLastViewed(getLastViewed());
    });
    // Also load on initial mount
    setLastViewed(getLastViewed());
    return unsubscribe;
  }, [navigation, getLastViewed, isLoaded]);

  const lastViewedSurah = useMemo(() => {
    if (!lastViewed) return null;
    return quranData.surahs.find(s => s.number === lastViewed.surahNumber);
  }, [lastViewed]);

  const handleSurahPress = useCallback((surah: Surah) => {
    navigation.navigate('VerseReader', {
      surahNumber: surah.number,
      startAyah: 1,
    });
  }, [navigation]);

  const handleResumePress = useCallback(() => {
    if (lastViewed) {
      navigation.navigate('VerseReader', {
        surahNumber: lastViewed.surahNumber,
        startAyah: lastViewed.ayahNumber,
      });
    }
  }, [navigation, lastViewed]);

  const renderSurahItem = useCallback(({ item }: { item: Surah }) => (
    <Pressable
      onPress={() => handleSurahPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`Buka surah ${item.englishName}`}
    >
      <ListItem style={styles.surahItem}>
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>{item.number}</Text>
        </View>
        <Stack gap={2} style={styles.surahInfo}>
          <Text style={styles.surahEnglishName}>{item.englishName}</Text>
          <Text style={styles.surahTranslation}>{item.englishNameTranslation}</Text>
          <Text style={styles.surahMeta}>
            {item.numberOfAyahs} Ayat • {item.revelationType}
          </Text>
        </Stack>
        <Text style={styles.surahArabicName}>{item.name}</Text>
      </ListItem>
    </Pressable>
  ), [handleSurahPress]);

  const keyExtractor = useCallback((item: Surah) => item.number.toString(), []);

  const renderHeader = useCallback(() => {
    if (!lastViewed || !lastViewedSurah) return null;

    return (
      <Pressable
        onPress={handleResumePress}
        accessibilityRole="button"
        accessibilityLabel={`Lanjutkan membaca ${lastViewedSurah.englishName} ayat ${lastViewed.ayahNumber}`}
      >
        <Card style={styles.resumeCard}>
          <View style={styles.resumeIcon}>
            <Text style={styles.resumeIconText}>▶</Text>
          </View>
          <Stack gap={2} style={styles.resumeInfo}>
            <Text style={styles.resumeTitle}>Lanjutkan Membaca</Text>
            <Text style={styles.resumeSubtitle}>
              {lastViewedSurah.englishName} • Ayat {lastViewed.ayahNumber}
            </Text>
          </Stack>
          <Text style={styles.resumeArabic}>{lastViewedSurah.name}</Text>
        </Card>
      </Pressable>
    );
  }, [lastViewed, lastViewedSurah, handleResumePress]);

  return (
    <Screen style={styles.container}>
      <Stack gap={4} style={styles.header}>
        <Text variant="title" style={styles.headerTitle}>Al-Quran</Text>
        <Text variant="subtitle" style={styles.headerSubtitle}>Pilih Surah untuk dibaca</Text>
      </Stack>
      <FlatList
        data={quranData.surahs}
        renderItem={renderSurahItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: quranColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: quranColors.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: quranTint,
  },
  headerSubtitle: {
    fontSize: 14,
    color: quranColors.mutedForeground,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: quranColors.card,
    borderColor: quranColors.border,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: quranColors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  surahNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: quranTint,
  },
  surahInfo: {
    flex: 1,
  },
  surahEnglishName: {
    fontSize: 16,
    fontWeight: '600',
    color: quranColors.foreground,
  },
  surahTranslation: {
    fontSize: 12,
    color: quranColors.mutedForeground,
  },
  surahMeta: {
    fontSize: 11,
    color: quranColors.mutedForeground,
  },
  surahArabicName: {
    fontSize: 18,
    color: quranTint,
    fontWeight: '500',
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: quranColors.surface,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: quranTint,
  },
  resumeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: quranTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resumeIconText: {
    fontSize: 16,
    color: quranColors.background,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: quranTint,
  },
  resumeSubtitle: {
    fontSize: 13,
    color: quranColors.mutedForeground,
  },
  resumeArabic: {
    fontSize: 18,
    color: quranColors.foreground,
    fontWeight: '500',
  },
});
