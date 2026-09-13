import { expect, test } from '@playwright/test';
import { ACCOUNTS, navHrefs, signInAs } from './helpers';

test.describe('Role-based access', () => {
  test('a coordinator sees the staff pages and not the student team page', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator);
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

    const hrefs = await navHrefs(page);
    expect(hrefs).toEqual(
      expect.arrayContaining(['/', '/proposals', '/supervision', '/rubrics', '/reports']),
    );
    expect(hrefs).not.toContain('/team');
  });

  test('a student sees their team page and no staff pages', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.student);
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

    const hrefs = await navHrefs(page);
    expect(hrefs).toEqual(['/', '/proposals', '/team']);
  });

  // The guard has to hold on the URL, not just hide the link.
  test('a coordinator typing the student route is redirected away', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator, '/team');

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  });

  test('a student typing a coordinator route is redirected away', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.student, '/supervision');

    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('a supervisor reaches defense scoring but not supervisor allocation', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.supervisor, '/defense');
    await expect(page.getByRole('heading', { name: /Defense Panel Assessment/ })).toBeVisible();

    await page.goto('/supervision');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('an unknown path renders the not-found page', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator, '/no-such-page');

    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});
