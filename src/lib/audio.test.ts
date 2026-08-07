import { describe, expect, it } from "vitest";

import { buildAyahAudioUrl } from "./audio";

describe("buildAyahAudioUrl", () => {
  it("zero-pads surah and ayah to three digits", () => {
    expect(buildAyahAudioUrl(1, 1)).toBe("https://everyayah.com/data/Alafasy_128kbps/001001.mp3");
    expect(buildAyahAudioUrl(2, 255)).toBe("https://everyayah.com/data/Alafasy_128kbps/002255.mp3");
    expect(buildAyahAudioUrl(114, 6)).toBe("https://everyayah.com/data/Alafasy_128kbps/114006.mp3");
  });

  it("keeps three-digit ayah numbers intact", () => {
    expect(buildAyahAudioUrl(2, 286)).toBe("https://everyayah.com/data/Alafasy_128kbps/002286.mp3");
    expect(buildAyahAudioUrl(110, 3)).toBe("https://everyayah.com/data/Alafasy_128kbps/110003.mp3");
  });
});
