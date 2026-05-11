import { expect, test } from "@playwright/test";

test("dashboard exposes the Persiapantubel gerund infinitive shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "TBI - Gerund & Infinitive" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
  await expect(page.getByText("Verb Bank", { exact: true })).toBeVisible();
  await expect(page.getByText("curated MVP verb bank")).toBeVisible();
});

test("search finds verb patterns and Indonesian meaning", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Pencarian/i }).click();
  await page.getByRole("searchbox", { name: "Cari verb atau pattern" }).fill("stop");

  await expect(page.getByText("stop - stopped - stopped")).toBeVisible();
  await expect(page.getByText(/Stop doing means end the activity/i)).toBeVisible();
});

test("materi and flipcard share package rail behavior", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { exact: true, name: "Materi" }).click();

  await expect(page.getByRole("heading", { name: "Materi gerund dan infinitive" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Pattern Practice 01/i })).toBeVisible();

  await page.getByRole("button", { exact: true, name: "Flipcard" }).click();
  await expect(page.getByRole("heading", { name: "Flipcard active recall" })).toBeVisible();
  await page.getByRole("button", { name: /Tap untuk lihat pattern/i }).first().click();

  await expect(page.getByText("admit + Verb-ing")).toBeVisible();
});

test("test package saves answers and locks after final submit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Tes$/i }).click();

  await expect(page.getByRole("heading", { name: "Tes pattern A-D" })).toBeVisible();
  await page.getByRole("button", { name: /They admit reviewing the answer sheet/i }).click();
  await page.getByRole("button", { name: /Submit final/i }).click();

  await expect(page.getByText("Skor: 1/10")).toBeVisible();
  await expect(page.locator("#q-gerund-admit").getByText(/Jawaban benar: A/i)).toBeVisible();
});
