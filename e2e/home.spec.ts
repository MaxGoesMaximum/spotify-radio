import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the landing page", async ({ page }) => {
    await page.goto("/");

    // Check hero title is visible
    await expect(page.locator("h1")).toContainText("Spotify");
    await expect(page.locator("h1")).toContainText("Radio");
  });

  test("should show Spotify login button", async ({ page }) => {
    await page.goto("/");

    const loginButton = page.getByRole("button", { name: /Verbind met Spotify/i });
    await expect(loginButton).toBeVisible();
  });

  test("should display feature cards", async ({ page }) => {
    await page.goto("/");

    // Check features section exists
    await expect(page.getByText("Alles wat je nodig hebt")).toBeVisible();
    await expect(page.getByText("10 FM Zenders")).toBeVisible();
    await expect(page.getByText("AI DJ Presentator")).toBeVisible();
  });

  test("should show skip-to-content link on tab", async ({ page }) => {
    await page.goto("/");

    // Tab to reveal skip link
    await page.keyboard.press("Tab");
    const skipLink = page.getByText("Skip to content");
    await expect(skipLink).toBeFocused();
  });

  test("should navigate to privacy page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/.*privacy/);
  });

  test("should redirect protected routes to home", async ({ page }) => {
    await page.goto("/radio");

    // Should redirect to home since not authenticated
    await expect(page).toHaveURL(/\//);
  });
});
