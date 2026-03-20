import { test, expect, Page } from '@playwright/test';

const EMAIL = 'minthwinkhant93@gmail.com';
const PASSWORD = 'minthwinkhant93@';

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Unsaved Changes Confirmation Modal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('1. modal appears when navigating away with unsaved changes', async ({ page }) => {
    await page.goto('/build');
    await page.waitForSelector('input[placeholder*="Full Name"], input[name="fullName"], input[id="fullName"]', { timeout: 10000 }).catch(() => {
      // fallback: wait for any text input on the page
    });

    // Type in the first text input (Full Name field)
    const firstInput = page.locator('input[type="text"]').first();
    await firstInput.click();
    await firstInput.fill('Test Name');

    // Click the logo link
    await page.click('a:has-text("ProResumeAI")');

    // Modal should appear
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#confirm-leave-title')).toHaveText('Leave page?');
  });

  test('2. clicking "Leave anyway" navigates away', async ({ page }) => {
    await page.goto('/build');

    const firstInput = page.locator('input[type="text"]').first();
    await firstInput.click();
    await firstInput.fill('Test Name');

    await page.click('a:has-text("ProResumeAI")');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await page.click('button:has-text("Leave anyway")');
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('3. clicking "Keep editing" closes modal and stays on /build', async ({ page }) => {
    await page.goto('/build');

    const firstInput = page.locator('input[type="text"]').first();
    await firstInput.click();
    await firstInput.fill('Test Name');

    await page.click('a:has-text("ProResumeAI")');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await page.click('button:has-text("Keep editing")');
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    await expect(page).toHaveURL(/\/build/, { timeout: 3000 });
  });

  test('4. modal card has dark background in dark mode', async ({ page }) => {
    await page.goto('/build');

    const firstInput = page.locator('input[type="text"]').first();
    await firstInput.click();
    await firstInput.fill('Test Name');

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await page.click('a:has-text("ProResumeAI")');

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    const card = modal.locator('div').first();
    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    // In dark mode, card background should not be white
    expect(bg).not.toBe('rgb(255, 255, 255)');
  });

  test('5. no modal when navigating away from fresh /build with no changes', async ({ page }) => {
    await page.goto('/build');

    // Do not type anything — click logo immediately
    await page.click('a:has-text("ProResumeAI")');

    // Modal should NOT appear; page should navigate directly
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible({ timeout: 2000 });
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
