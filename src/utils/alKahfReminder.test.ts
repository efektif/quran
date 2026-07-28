import { describe, expect, test } from "vitest";

import {
  AL_KAHF_NIGHT_START_HOUR,
  getAlKahfDayKey,
  isAlKahfReminderWindow,
  shouldShowAlKahfReminder,
} from "./alKahfReminder";

function at(isoLocal: string): Date {
  const [datePart, timePart] = isoLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

describe("Al-Kahf reminder window", () => {
  test("is active all Friday", () => {
    expect(isAlKahfReminderWindow(at("2026-07-24T00:00"))).toBe(true);
    expect(isAlKahfReminderWindow(at("2026-07-24T12:30"))).toBe(true);
    expect(isAlKahfReminderWindow(at("2026-07-24T23:59"))).toBe(true);
  });

  test("is active Thursday from night-start hour", () => {
    expect(
      isAlKahfReminderWindow(
        at(`2026-07-23T${String(AL_KAHF_NIGHT_START_HOUR).padStart(2, "0")}:00`),
      ),
    ).toBe(true);
    expect(isAlKahfReminderWindow(at("2026-07-23T21:15"))).toBe(true);
  });

  test("is inactive before Thursday night and after Friday", () => {
    expect(isAlKahfReminderWindow(at("2026-07-23T17:59"))).toBe(false);
    expect(isAlKahfReminderWindow(at("2026-07-22T20:00"))).toBe(false);
    expect(isAlKahfReminderWindow(at("2026-07-25T00:00"))).toBe(false);
  });

  test("day key is the local calendar date", () => {
    expect(getAlKahfDayKey(at("2026-07-23T19:00"))).toBe("2026-07-23");
    expect(getAlKahfDayKey(at("2026-07-24T10:00"))).toBe("2026-07-24");
  });

  test("closed for that day does not show again the same day", () => {
    const fridayMorning = at("2026-07-24T09:00");
    const fridayEvening = at("2026-07-24T21:00");
    const thursdayNight = at("2026-07-23T19:00");

    expect(shouldShowAlKahfReminder(null, fridayMorning)).toBe(true);
    expect(shouldShowAlKahfReminder("2026-07-24", fridayMorning)).toBe(false);
    expect(shouldShowAlKahfReminder("2026-07-24", fridayEvening)).toBe(false);
    expect(shouldShowAlKahfReminder("2026-07-23", thursdayNight)).toBe(false);
    expect(shouldShowAlKahfReminder("2026-07-23", fridayMorning)).toBe(true);
    expect(shouldShowAlKahfReminder("2026-07-17", fridayMorning)).toBe(true);
    expect(shouldShowAlKahfReminder(null, at("2026-07-22T12:00"))).toBe(false);
  });
});
