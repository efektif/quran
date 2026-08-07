import { expect, test } from "@playwright/test";

test("bookmark flow: save from reader, list grouped by surah, remove", async ({ page }) => {
  await page.goto("/bookmarks/");
  await expect(page.getByText("Belum ada bookmark")).toBeVisible();

  await page.goto("/surah/1/");
  await page.getByRole("button", { name: "Bookmark ayat ini" }).first().click();

  await page.goto("/bookmarks/");
  await expect(page.getByRole("heading", { name: "1. Al-Faatiha" })).toBeVisible();

  const entry = page.getByRole("link", { name: "Buka Al-Faatiha ayat 1" });
  await expect(entry).toBeVisible();
  await entry.click();
  await expect(page).toHaveURL(/\/surah\/1\/\?ayat=1/);

  await page.goto("/bookmarks/");
  await page.getByRole("button", { name: "Hapus bookmark Al-Faatiha ayat 1" }).click();
  await expect(page.getByText("Belum ada bookmark")).toBeVisible();
});

test("bookmarked surah shows an indicator in the home list", async ({ page }) => {
  await page.goto("/surah/18/");
  await page.getByRole("button", { name: "Bookmark ayat ini" }).first().click();

  await page.goto("/");
  await page.locator("main").getByRole("link", { name: /jadwal sholat/i }).waitFor();
  const dismiss = page.getByRole("button", { name: "Tutup pengingat" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();

  const row = page.getByRole("link", { name: "Buka surah Al-Kahf" });
  await expect(row.getByLabel("Ada ayat tersimpan")).toBeVisible();
});
