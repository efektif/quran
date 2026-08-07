import { expect, test, type Page } from "@playwright/test";

async function dismissAlKahfIfShown(page: Page) {
  // The reminder only renders after store hydration; wait for the
  // hydration-gated prayer widget so the check below cannot race it.
  await page.locator("main").getByRole("link", { name: /jadwal sholat/i }).waitFor();
  const dismiss = page.getByRole("button", { name: "Tutup pengingat" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
}

test("home lists all 114 surahs and links into the reader", async ({ page }) => {
  await page.goto("/");
  await dismissAlKahfIfShown(page);

  await expect(page.getByRole("heading", { name: "Al-Quran", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Buka surah/ })).toHaveCount(114);

  await page.getByRole("link", { name: "Buka surah Al-Faatiha" }).click();
  await expect(page).toHaveURL(/\/surah\/1\//);
  await expect(page.getByRole("heading", { name: /1\. Al-Faatiha/ })).toBeVisible();
});

test("juz tab lists 30 juz and opens a juz page", async ({ page }) => {
  await page.goto("/");
  await dismissAlKahfIfShown(page);

  await page.getByRole("tab", { name: "Juz" }).click();
  await expect(page.getByRole("link", { name: /Buka juz/ })).toHaveCount(30);

  await page.getByRole("link", { name: /Buka juz 30/ }).click();
  await expect(page).toHaveURL(/\/juz\/30\//);
  await expect(page.getByRole("heading", { name: "Juz 30" })).toBeVisible();
  await expect(page.getByRole("region", { name: "An-Naas" })).toBeVisible();
});

test("surah 18 reader shows bismillah and the first ayah of Al-Kahf", async ({ page }) => {
  await page.goto("/surah/18/");

  await expect(page.getByRole("heading", { name: /18\. Al-Kahf/ })).toBeVisible();
  await expect(page.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")).toBeVisible();
  await expect(page.locator("article").first()).toContainText("ٱلْحَمْدُ");
});

test("reading a surah offers a resume card on the home page", async ({ page }) => {
  await page.goto("/surah/2/");
  await page.goto("/");
  await dismissAlKahfIfShown(page);

  const resume = page.getByRole("link", { name: /Lanjutkan membaca Al-Baqara/ });
  await expect(resume).toBeVisible();
  await resume.click();
  await expect(page).toHaveURL(/\/surah\/2\/\?ayat=\d+/);
});

test("changelog page lists the release history", async ({ page }) => {
  await page.goto("/changelog/");
  await expect(page.getByRole("heading", { name: "Changelog" })).toBeVisible();
  await expect(page.getByText("2026-07-24")).toBeVisible();
});
