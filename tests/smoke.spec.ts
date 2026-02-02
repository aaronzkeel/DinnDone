import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/DinnDone/i);
});

test("can navigate to Plan page", async ({ page }) => {
  await page.goto("/");
  await page.click('a[href="/weekly-planning"]');
  await expect(page).toHaveURL(/weekly-planning/);
});
