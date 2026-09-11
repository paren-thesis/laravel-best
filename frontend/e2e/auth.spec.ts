import { expect, test } from '@playwright/test';
import { ACCOUNTS, AUTH_TOKEN_KEY, signInAs } from './helpers';

test.describe('Authentication', () => {
  test('an anonymous visitor is sent to the login screen', async ({ page }) => {
    await page.goto('/proposals');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'HTU FYP Portal' })).toBeVisible();
  });

  test('signing in through the form reaches the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('name@htu.edu.gh').fill(ACCOUNTS.coordinator);
    await page.getByPlaceholder('••••••••').fill('password');
    await page.getByRole('button', { name: /Sign In to Portal/ }).click();

    // Login is the slowest call in the app: bcrypt at cost 12 on Docker Desktop
    // for Windows regularly takes longer than the default expect timeout.
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible({
      timeout: 90_000,
    });
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('bad credentials are rejected without leaving the login screen', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('name@htu.edu.gh').fill(ACCOUNTS.coordinator);
    await page.getByPlaceholder('••••••••').fill('definitely-not-the-password');
    await page.getByRole('button', { name: /Sign In to Portal/ }).click();

    // Rejecting a password costs the same bcrypt work as accepting one, so this
    // is as slow as a successful sign-in and needs the same allowance.
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({
      timeout: 90_000,
    });
    await expect(page).toHaveURL(/\/login$/);
  });

  // A token restored from storage must not bounce the user out while the
  // profile request is still in flight.
  test('a deep link survives a cold page load', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator, '/reports');

    await expect(page.getByRole('heading', { name: /Department Broadsheet Exports/ })).toBeVisible();
    await expect(page).toHaveURL(/\/reports$/);
  });

  test('signing out clears the session and returns to the login screen', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator);
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

    await page.getByTitle('Sign Out').click();

    await expect(page).toHaveURL(/\/login$/);
    const token = await page.evaluate((key) => window.localStorage.getItem(key), AUTH_TOKEN_KEY);
    expect(token).toBeNull();
  });
});
