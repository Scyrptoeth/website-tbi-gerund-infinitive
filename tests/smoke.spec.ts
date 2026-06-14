import { expect, test } from "@playwright/test";

test("dashboard exposes the Persiapantubel gerund infinitive shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "TBI - Gerund & Infinitive" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
  await expect(page.getByText("Verb Bank", { exact: true })).toBeVisible();
  await expect(page.getByText("Visual progress belajar")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama" }).getByText("SuperAdmin"),
  ).toHaveCount(0);
});

test("search finds verb patterns and Indonesian meaning", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Pencarian/i }).click();

  await expect(page.getByText("300 hasil ditemukan.")).toBeVisible();
  await expect(page.locator(".content-stack > .verb-row")).toHaveCount(300);

  await page.getByRole("searchbox", { name: "Cari verb atau pattern" }).fill("stop");

  await expect(page.getByText("stop - stopped - stopped")).toBeVisible();
  await expect(
    page.getByText(/"stop" termasuk dual-pattern dengan kemungkinan perubahan makna/i),
  ).toBeVisible();
  await expect(page.getByText("Tier", { exact: true })).toHaveCount(0);
});

test("materi and flipcard share package rail behavior", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { exact: true, name: "Materi" }).click();

  await expect(page.getByRole("heading", { name: "Materi gerund dan infinitive" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Pattern Practice 01/i })).toBeVisible();

  await page.getByRole("button", { exact: true, name: "Flipcard" }).click();
  await expect(page.getByRole("heading", { name: "Flipcard active recall" })).toBeVisible();
  await page.getByRole("button", { name: /Ketuk untuk lihat pola/i }).first().click();

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

test("developer route exposes the operational summary outside the main tabs", async ({
  page,
}) => {
  await page.goto("/developer");

  await expect(
    page.getByRole("heading", { name: "Operational summary" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama" }).getByText("SuperAdmin"),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reset progress lokal" })).toBeVisible();
});
