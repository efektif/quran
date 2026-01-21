import { useCallback, useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { quranData } from '../data/quran';
import type { Surah } from '../types/quran';
import type { RootStackParamList } from '../types/navigation';
import { useLastViewedAyat, type LastViewedAyat } from '../hooks/useLastViewedAyat';

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
    <TouchableOpacity
      style={styles.surahItem}
      onPress={() => handleSurahPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.surahNumber}>
        <Text style={styles.surahNumberText}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.surahEnglishName}>{item.englishName}</Text>
        <Text style={styles.surahTranslation}>{item.englishNameTranslation}</Text>
        <Text style={styles.surahMeta}>
          {item.numberOfAyahs} Ayat • {item.revelationType}
        </Text>
      </View>
      <Text style={styles.surahArabicName}>{item.name}</Text>
    </TouchableOpacity>
  ), [handleSurahPress]);

  const keyExtractor = useCallback((item: Surah) => item.number.toString(), []);

  const renderHeader = useCallback(() => {
    if (!lastViewed || !lastViewedSurah) return null;

    return (
      <TouchableOpacity
        style={styles.resumeCard}
        onPress={handleResumePress}
        activeOpacity={0.7}
      >
        <View style={styles.resumeIcon}>
          <Text style={styles.resumeIconText}>▶</Text>
        </View>
        <View style={styles.resumeInfo}>
          <Text style={styles.resumeTitle}>Lanjutkan Membaca</Text>
          <Text style={styles.resumeSubtitle}>
            {lastViewedSurah.englishName} • Ayat {lastViewed.ayahNumber}
          </Text>
        </View>
        <Text style={styles.resumeArabic}>{lastViewedSurah.name}</Text>
      </TouchableOpacity>
    );
  }, [lastViewed, lastViewedSurah, handleResumePress]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Al-Quran</Text>
        <Text style={styles.headerSubtitle}>Pilih Surah untuk dibaca</Text>
      </View>
      <FlatList
        data={quranData.surahs}
        renderItem={renderSurahItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a5f',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d4af37',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8ca3c4',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132743',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  surahNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
  },
  surahInfo: {
    flex: 1,
  },
  surahEnglishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  surahTranslation: {
    fontSize: 12,
    color: '#8ca3c4',
    marginBottom: 4,
  },
  surahMeta: {
    fontSize: 11,
    color: '#5a7a9a',
  },
  surahArabicName: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: '500',
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  resumeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resumeIconText: {
    fontSize: 16,
    color: '#0a1628',
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 2,
  },
  resumeSubtitle: {
    fontSize: 13,
    color: '#8ca3c4',
  },
  resumeArabic: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
});
