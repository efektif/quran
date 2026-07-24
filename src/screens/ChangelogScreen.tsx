import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Stack, Text } from "@efektif/native";

import { CHANGELOG_RELEASES } from "../data/changelog";
import { quranColors, quranNativeTheme, quranTint } from "../theme/efektifNative";

export default function ChangelogScreen() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }, [router]);

  return (
    <Screen style={styles.container}>
      <Stack gap={4} style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke daftar surah"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
          </Pressable>
        </View>
        <Text style={styles.eyebrow}>Pembaruan</Text>
        <Text variant="title" style={styles.title}>
          Changelog
        </Text>
        <Text style={styles.lead}>
          Perubahan terbaru yang sudah masuk ke Efektif Quran.
        </Text>
      </Stack>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          {CHANGELOG_RELEASES.map((release, index) => (
            <View
              key={release.date}
              style={[
                styles.release,
                index === CHANGELOG_RELEASES.length - 1 ? styles.releaseLast : null,
              ]}
            >
              <Text style={styles.releaseDate}>{release.date}</Text>
              <Stack gap={8}>
                {release.items.map((item) => (
                  <View key={item} style={styles.itemRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </Stack>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: quranColors.border,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    borderWidth: 1,
    borderColor: quranColors.border,
    borderRadius: quranNativeTheme.radii.md,
    backgroundColor: quranColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  backButtonText: {
    color: quranTint,
    fontSize: 12,
    fontWeight: "700",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: quranTint,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: quranTint,
  },
  lead: {
    fontSize: 14,
    lineHeight: 21,
    color: quranColors.mutedForeground,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  panel: {
    borderWidth: 1,
    borderColor: quranColors.border,
    borderRadius: quranNativeTheme.radii.lg,
    backgroundColor: quranColors.surface,
    overflow: "hidden",
  },
  release: {
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: quranColors.border,
  },
  releaseLast: {
    borderBottomWidth: 0,
  },
  releaseDate: {
    fontSize: 13,
    fontWeight: "700",
    color: quranColors.foreground,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    color: quranColors.mutedForeground,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: quranColors.mutedForeground,
  },
});
