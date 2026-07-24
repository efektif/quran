export type ChangelogRelease = {
  date: string;
  items: string[];
};

/** User-facing releases, newest first. Sourced from git history and CHANGELOG.md. */
export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    date: "2026-07-24",
    items: [
      "Pengingat Surah Al-Kahf saat dibuka Kamis malam atau Jumat, dengan tombol langsung baca surah.",
      "Halaman Changelog in-app untuk melihat pembaruan produk.",
      "Perbaikan tap daftar Surah yang tidak membuka reader.",
      "Desain native sekarang dimiliki aplikasi sehingga instalasi dan deployment tidak membutuhkan repository UI terpisah.",
    ],
  },
  {
    date: "2026-07-21",
    items: [
      "Mengadopsi System One: aksen biru primer dan palet netral yang selaras dengan suite Efektif.",
    ],
  },
  {
    date: "2026-07-18",
    items: [
      "Terjemahan Indonesia lengkap untuk 6.236 ayat dari edisi Kementerian Agama RI (QuranEnc), termasuk catatan terjemahan bila tersedia.",
      "Halaman ayat bisa digulir agar teks Arab, terjemahan, dan catatan panjang tetap terbaca.",
    ],
  },
  {
    date: "2026-07-17",
    items: [
      "Navigasi dipindah ke Expo Router dengan rute bersama untuk web, iOS, dan Android.",
      "UI list dan reader mengikuti arah visual flat, border-first ala Efektif Tools.",
      "Linting dan formatting distandarkan ke Oxlint dan Oxfmt.",
    ],
  },
  {
    date: "2026-06-12",
    items: [
      "Radius chrome mobile diselaraskan dengan token radius Efektif native.",
    ],
  },
  {
    date: "2026-06-06",
    items: [
      "Tampilan Quran diselaraskan dengan arah visual Efektif Tools.",
    ],
  },
  {
    date: "2026-05-15",
    items: [
      "Tautan About di daftar Surah yang membuka profil Moriz Kay.",
    ],
  },
  {
    date: "2026-05-14",
    items: [
      "List dan reader memakai primitif @efektif/native.",
      "Tema Quran dipusatkan lewat kontrak provider Efektif native.",
    ],
  },
  {
    date: "2026-04-18",
    items: [
      "Tombol Baca Tafseer per ayat yang membuka halaman tafseer di quran.com.",
    ],
  },
  {
    date: "2026-01-21",
    items: [
      "Lanjutkan Membaca: posisi bacaan terakhir disimpan dan bisa dilanjutkan dari daftar Surah.",
      "Penyimpanan posisi diganti ke expo-secure-store agar kompatibel dengan Expo Go.",
    ],
  },
  {
    date: "2026-01-20",
    items: [
      "Rilis awal pembaca Al-Quran dengan daftar Surah dan pembaca ayat.",
    ],
  },
];
