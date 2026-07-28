const THURSDAY = 4;
const FRIDAY = 5;
/** Approximate Maghrib / start of Islamic night when Maghrib times are unavailable. */
export const AL_KAHF_NIGHT_START_HOUR = 18;
export const AL_KAHF_SURAH_NUMBER = 18;

// Use local calendar fields, not toISOString(): a UTC date could dismiss the
// reminder for the wrong day near midnight in the reader's timezone.
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Thursday from night-start hour through all of Friday.
 *
 * Islamic days begin at sunset. Until prayer times are available, 18:00 is an
 * explicit approximation rather than pretending the device knows local Maghrib.
 */
export function isAlKahfReminderWindow(now: Date = new Date()): boolean {
  const day = now.getDay();
  if (day === FRIDAY) return true;
  if (day === THURSDAY && now.getHours() >= AL_KAHF_NIGHT_START_HOUR) return true;
  return false;
}

/** Calendar day key — dismiss once and the modal stays closed for the rest of that day. */
export function getAlKahfDayKey(now: Date = new Date()): string {
  return formatLocalDate(now);
}

// Window eligibility and dismissal are separate rules: entering Friday must not
// reopen a reminder already dismissed on that same local calendar day.
export function shouldShowAlKahfReminder(
  dismissedDayKey: string | null,
  now: Date = new Date(),
): boolean {
  if (!isAlKahfReminderWindow(now)) return false;
  return dismissedDayKey !== getAlKahfDayKey(now);
}
