import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const views = ["Dashboard", "Pencarian", "Materi", "Flipcard", "Tes", "SuperAdmin"];

for (const view of views) {
  test(`${view} view has no serious accessibility violations`, async ({ page }) => {
    await page.goto("/");

    if (view !== "Dashboard") {
      await page.getByRole("button", { name: new RegExp(`^${view}$`, "i") }).click();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    );

    expect(seriousViolations).toEqual([]);
  });
}
