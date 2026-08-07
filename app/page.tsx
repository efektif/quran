import { AlKahfReminder } from "../src/components/AlKahfReminder";
import { HomeClient } from "../src/components/HomeClient";
import { SURAH_INDEX } from "../src/data/surah-index";
import { getJuzMap } from "../src/lib/quran";

export default async function HomePage() {
  const juzMap = await getJuzMap();

  return (
    <>
      <div className="pt-6">
        <h1 className="text-2xl font-bold text-text">Al-Quran</h1>
        <p className="mt-1 text-sm text-muted">Pilih surah atau juz untuk dibaca</p>
      </div>
      <HomeClient surahs={SURAH_INDEX} juzMap={juzMap} />
      <AlKahfReminder />
    </>
  );
}
