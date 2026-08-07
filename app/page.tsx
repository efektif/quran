import { AlKahfReminder } from "../src/components/AlKahfReminder";
import { HomeClient } from "../src/components/HomeClient";
import { PrayerWidget } from "../src/components/PrayerWidget";
import { SURAH_INDEX } from "../src/data/surah-index";
import { getJuzMap } from "../src/lib/quran";

export default async function HomePage() {
  const juzMap = await getJuzMap();

  return (
    <>
      <div className="border-b-[3px] border-double border-gold/60 pt-6 pb-4 text-center">
        <h1 className="font-display text-3xl font-bold text-text">Al-Quran</h1>
        <p className="mt-1 text-sm text-muted italic">
          Terjemahan Kemenag RI &amp; Saheeh International
        </p>
      </div>
      <div className="mt-4">
        <PrayerWidget />
      </div>
      <HomeClient surahs={SURAH_INDEX} juzMap={juzMap} />
      <AlKahfReminder />
    </>
  );
}
