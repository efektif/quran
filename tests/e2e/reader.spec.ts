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

test("pages to the next ayah on a mobile viewport", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/reader?surahNumber=1&startAyah=1");

  await expect(page.getByText("1 / 7", { exact: true })).toBeVisible();
  await expect(
    page
      .getByText("Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.", {
        exact: true,
      })
      .first(),
  ).toBeVisible();

  const list = page.getByTestId("verse-list");
  await expect(list).toBeVisible();
  const box = await list.boundingBox();
  expect(box).toBeTruthy();

  const startX = box!.x + box!.width / 2;
  const startY = box!.y + box!.height * 0.8;
  const endY = box!.y + box!.height * 0.2;

  // Real touch swipe via CDP — mouse wheel would not catch the mobile regression.
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y: startY }],
  });
  for (let step = 1; step <= 8; step += 1) {
    const y = startY + ((endY - startY) * step) / 8;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX, y }],
    });
  }
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });

  await expect(page.getByText("2 / 7", { exact: true })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/الْحَمْدُ/).first()).toBeVisible();
});test("opens the changelog page", async ({ page }) => {
  await page.goto("/");

  await dismissAlKahfReminder(page);
  await page.getByLabel("Buka Changelog").click();

  await expect(page).toHaveURL(/\/changelog/);
  await expect(page.getByText("Changelog", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("2026-07-24", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Kembali ke daftar surah" })).toBeVisible();
});
