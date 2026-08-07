import { expect, test } from "@playwright/test";

test("sholat page computes a schedule after picking a city", async ({ page }) => {
  await page.goto("/sholat/");
  await expect(page.getByRole("heading", { name: "Jadwal Sholat" })).toBeVisible();

  await page.getByLabel("Cari kota").fill("Jakarta");
  await page.getByRole("button", { name: /^Jakarta DKI/ }).click();

  await expect(page.getByRole("region", { name: "Waktu sholat berikutnya" })).toBeVisible();
  const daily = page.getByRole("region", { name: "Jadwal harian" });
  await expect(daily.getByText("Subuh", { exact: true })).toBeVisible();
  await expect(daily.getByText("Maghrib", { exact: true })).toBeVisible();
  await expect(daily.getByText(/\d{2}\.\d{2}/).first()).toBeVisible();

  await page.getByRole("tab", { name: "Bulanan" }).click();
  await expect(page.getByRole("region", { name: "Jadwal bulanan" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Isya" })).toBeVisible();
});

test("picked location powers the home prayer widget", async ({ page }) => {
  await page.goto("/sholat/");
  await page.getByLabel("Cari kota").fill("Makassar");
  await page.getByRole("button", { name: /^Makassar/ }).click();

  await page.goto("/");
  await page.locator("main").getByRole("link", { name: /jadwal sholat/i }).waitFor();
  const dismiss = page.getByRole("button", { name: "Tutup pengingat" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();

  const widget = page.getByRole("link", { name: /Buka jadwal sholat/ });
  await expect(widget).toBeVisible();
  await expect(widget).toContainText("Menuju");
  await expect(widget).toContainText("Makassar");
});
