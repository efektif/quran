import { expect, test } from "@playwright/test";

test("search overlay opens via keyboard and navigates to a match", async ({ page }) => {
  await page.goto("/");
  await page.locator("main").getByRole("link", { name: /jadwal sholat/i }).waitFor();
  const dismiss = page.getByRole("button", { name: "Tutup pengingat" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();

  // Park the pointer off the dialog: hover sets the active option, which
  // would make the Enter assertion pick whatever sits under the cursor.
  await page.mouse.move(0, 0);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pencarian ayat" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("combobox", { name: "Cari ayat" }).fill("Allah");
  const firstOption = dialog.getByRole("option").first();
  await expect(firstOption).toBeVisible();
  await expect(firstOption).toContainText("Al-Faatiha 1:1");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/surah\/1\/\?ayat=1/);
});

test("search matches Arabic queries against the normalized text", async ({ page }) => {
  await page.goto("/");
  await page.locator("main").getByRole("link", { name: /jadwal sholat/i }).waitFor();
  const dismiss = page.getByRole("button", { name: "Tutup pengingat" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();

  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pencarian ayat" });
  // Diacritics in the query must still match the stripped index.
  await dialog.getByRole("combobox", { name: "Cari ayat" }).fill("الْكَهْفِ");
  const firstOption = dialog.getByRole("option").first();
  await expect(firstOption).toBeVisible();
  await expect(firstOption).toContainText("Al-Kahf 18:");

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("search reports an empty state for unknown queries", async ({ page }) => {
  await page.goto("/");
  await page.locator("main").getByRole("link", { name: /jadwal sholat/i }).waitFor();
  const dismiss = page.getByRole("button", { name: "Tutup pengingat" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();

  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Pencarian ayat" });
  await dialog.getByRole("combobox", { name: "Cari ayat" }).fill("zzqqxxyy");
  await expect(dialog.getByText("Tidak ada hasil")).toBeVisible();
});
