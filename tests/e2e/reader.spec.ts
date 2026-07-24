import { expect, test } from "@playwright/test";

async function dismissAlKahfReminder(page: import("@playwright/test").Page) {
  const dismiss = page.getByLabel("Tutup pengingat Al-Kahf", { exact: true });
  await dismiss.waitFor({ state: "visible", timeout: 3_000 }).catch(() => {});
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
}

test("opens a surah from the catalog", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Al-Quran", { exact: true })).toBeVisible();
  await dismissAlKahfReminder(page);
  await page.getByLabel("Buka surah Al-Faatiha").click();

  await expect(page).toHaveURL(/\/reader/);
  await expect(page.getByRole("button", { name: "Kembali ke daftar surah" })).toBeVisible();
  await expect(page.getByText(/بِسْمِ/).first()).toBeVisible();
  await expect(page.getByText("Terjemahan Kemenag RI", { exact: true }).first()).toBeVisible();
  await expect(
    page
      .getByText("Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.", {
        exact: true,
      })
      .first(),
  ).toBeVisible();
});

test("opens the changelog page", async ({ page }) => {
  await page.goto("/");

  await dismissAlKahfReminder(page);
  await page.getByLabel("Buka Changelog").click();

  await expect(page).toHaveURL(/\/changelog/);
  await expect(page.getByText("Changelog", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("2026-07-24", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kembali ke daftar surah" })).toBeVisible();
});
