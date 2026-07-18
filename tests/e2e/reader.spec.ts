import { expect, test } from "@playwright/test";

test("opens a surah from the catalog", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Al-Quran", { exact: true })).toBeVisible();
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
