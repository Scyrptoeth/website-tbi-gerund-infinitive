import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

test("dashboard exposes the Persiapantubel gerund infinitive shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "TBI - Gerund & Infinitive" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
  await expect(page.getByText("Verb Bank", { exact: true })).toBeVisible();
  await expect(page.getByText("Visual progress belajar")).toBeVisible();
  await expect(page.getByText("TBI LEARNING COCKPIT", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navigasi utama" }).getByText("SuperAdmin"),
  ).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("search finds verb patterns and Indonesian meaning", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Pencarian/i }).click();

  await expect(page.getByText("300 hasil ditemukan.")).toBeVisible();
  await expect(page.locator(".content-stack > .verb-row")).toHaveCount(300);
  await expect(page.getByText("Pencarian global")).toHaveCount(0);
  await expect(page.getByText("Cari verb atau pattern")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Pencarian" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Pencarian" }).fill("stop");

  await expect(page.getByText("stop - stopped - stopped")).toBeVisible();
  await expect(
    page.getByText(/"stop" termasuk dual-pattern dengan kemungkinan perubahan makna/i),
  ).toBeVisible();
  await expect(page.getByText("Tier", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("materi and flipcard share package rail behavior", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { exact: true, name: "Materi" }).click();

  await expect(page.getByRole("heading", { name: "Materi gerund dan infinitive" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Pattern Practice 01/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { exact: true, name: "Flipcard" }).click();
  await expect(page.getByRole("heading", { name: "Flipcard active recall" })).toHaveCount(0);
  await page.getByRole("button", { name: /Ketuk untuk lihat pola/i }).first().click();

  await expect(page.getByText("admit + Verb-ing")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("test package saves answers and locks after final submit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Tes$/i }).click();

  await expect(page.getByRole("heading", { name: "Tes pattern A-D" })).toHaveCount(0);
  await page.getByRole("button", { name: /They admit reviewing the answer sheet/i }).click();
  await page.getByRole("button", { name: /Submit final/i }).click();

  await expect(page.getByText("Skor: 1/10")).toBeVisible();
  await expect(page.locator("#q-gerund-admit").getByText(/Jawaban benar A/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("developer route exposes the operational summary outside the main tabs", async ({
  page,
}) => {
  await page.goto("/developer");

  await expect(
    page.getByRole("heading", { name: "Content control room" }),
  ).toBeVisible();
  await expect(page.getByText("Developer CMS")).toBeVisible();
  await expect(page.getByText("Konfigurasi belum lengkap")).toBeVisible();
  await expect(page.getByText("Operational summary")).toHaveCount(0);
});
