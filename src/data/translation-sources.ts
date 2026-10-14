export interface TranslationSource {
  identifier: string;
  label: string;
  language: "id" | "en";
}

export const TRANSLATION_SOURCES: TranslationSource[] = [
  { identifier: "id.indonesian", label: "Kemenag RI", language: "id" },
  { identifier: "id.muntakhab", label: "Al Muntakhab", language: "id" },
  { identifier: "id.jalalayn", label: "Tafsir Jalalain", language: "id" },
  { identifier: "en.sahih", label: "Saheeh International", language: "en" },
  { identifier: "en.asad", label: "Muhammad Asad", language: "en" },
  { identifier: "en.yusufali", label: "Yusuf Ali", language: "en" },
  { identifier: "en.pickthall", label: "Pickthall", language: "en" },
];

export const ID_TRANSLATIONS = TRANSLATION_SOURCES.filter((t) => t.language === "id");
export const EN_TRANSLATIONS = TRANSLATION_SOURCES.filter((t) => t.language === "en");
