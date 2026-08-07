import type { Metadata } from "next";

import { SholatClient } from "../../src/components/SholatClient";

export const metadata: Metadata = {
  title: "Jadwal Sholat",
  description:
    "Jadwal sholat akurat dengan metode Kemenag RI — dihitung langsung di perangkat, bekerja offline untuk lokasi mana pun.",
};

export default function SholatPage() {
  return <SholatClient />;
}
