import { Modal, Pressable, StyleSheet } from "react-native";
import { Button, Stack, Text } from "@efektif/native";

import { quranColors, quranNativeTheme, quranTint } from "../theme/efektifNative";

type AlKahfReminderModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onRead: () => void;
};

export function AlKahfReminderModal({
  visible,
  onDismiss,
  onRead,
}: AlKahfReminderModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Tutup pengingat Al-Kahf"
      >
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
          accessibilityRole="none"
        >
          <Stack gap={12}>
            <Text style={styles.eyebrow}>Malam Jumat / Jumat</Text>
            <Text style={styles.title}>Baca Surah Al-Kahf</Text>
            <Text style={styles.body}>
              Ada riwayat bahwa siapa yang membaca Surah Al-Kahf pada hari Jumat
              akan diberi cahaya di antara dua Jumat. Banyak yang memulainya
              sejak malam Jumat (Kamis malam).
            </Text>
            <Stack gap={8} style={styles.actions}>
              <Button onPress={onRead} accessibilityLabel="Buka Surah Al-Kahf">
                Baca Al-Kahf
              </Button>
              <Button
                variant="outline"
                onPress={onDismiss}
                accessibilityLabel="Tutup pengingat"
              >
                Nanti saja
              </Button>
            </Stack>
          </Stack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: quranColors.background,
    borderRadius: quranNativeTheme.radii.lg,
    borderWidth: 1,
    borderColor: quranColors.border,
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: quranTint,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: quranColors.foreground,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: quranColors.mutedForeground,
  },
  actions: {
    marginTop: 4,
  },
});
