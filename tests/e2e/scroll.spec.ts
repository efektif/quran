import { expect, test } from "@playwright/test";

test("scroll mode shows one ayah per screen with an action rail", async ({ page }) => {
  await page.goto("/surah/1/");
  await expect(page.getByRole("heading", { name: /1\. Al-Faatiha/ })).toBeVisible();

  await page.getByRole("button", { name: "Scroll" }).click();

  const list = page.getByTestId("verse-list");
  // 7 ayat + the end-of-surah nav page.
  await expect(list.locator("section")).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Putar audio ayat 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bookmark ayat ini" }).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Baca tafsir Al-Faatiha ayat 1/ }),
  ).toBeVisible();
  await expect(page.getByText("1 / 7", { exact: true })).toBeVisible();
});

test("scrolling the feed advances the progress counter", async ({ page }) => {
  await page.goto("/surah/1/");
  await expect(page.getByRole("heading", { name: /1\. Al-Faatiha/ })).toBeVisible();
  await page.getByRole("button", { name: "Scroll" }).click();

  const list = page.getByTestId("verse-list");
  await list.evaluate((el) => {
    el.scrollTop = el.clientHeight;
  });

  await expect(page.getByText("2 / 7", { exact: true })).toBeVisible();
});
