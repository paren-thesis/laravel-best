import { expect, test } from '@playwright/test';
import { ACCOUNTS, signInAs } from './helpers';

test.describe('Dashboard content', () => {
  test('a student sees their own team, not somebody else’s', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.student, '/team');

    // student1 is seeded as leader of Team Alpha.
    await expect(page.getByRole('heading', { name: /Team Alpha/ })).toBeVisible();
    await expect(page.getByText('Leader')).toBeVisible();

    // The submission forms must name the same team, never fall back to another.
    await expect(page.getByText(/Submitting on behalf of/).first()).toContainText('Team Alpha');
  });

  test('the proposal review queue shows submitted topics to a coordinator', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator, '/proposals');

    await expect(
      page.getByRole('heading', { name: /Department Proposal Submissions/ }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible();
  });

  test('a student sees the proposal bank without review controls', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.student, '/proposals');

    await expect(page.getByRole('heading', { name: /My Team's Proposals/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);
  });

  test('the defense form is driven by the rubric the API returns', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.supervisor, '/defense');

    await expect(page.getByRole('heading', { name: /Defense Panel Assessment/ })).toBeVisible();
    await expect(page.getByText('Final Year Defense Assessment Rubric')).toBeVisible();

    // Three seeded criteria worth 30 + 35 + 35.
    await expect(page.getByPlaceholder('Score')).toHaveCount(3);
    await expect(page.getByText('0 / 100')).toBeVisible();
  });

  test('the running total updates as an examiner scores each criterion', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.supervisor, '/defense');

    const scores = page.getByPlaceholder('Score');
    await expect(scores).toHaveCount(3);

    await scores.nth(0).fill('26');
    await scores.nth(1).fill('30');
    await scores.nth(2).fill('28');

    await expect(page.getByText('84 / 100')).toBeVisible();
  });

  test('a coordinator can read the configured rubric and its criteria', async ({ page, request }) => {
    await signInAs(page, request, ACCOUNTS.coordinator, '/rubrics');

    await expect(page.getByRole('heading', { name: 'Active Rubrics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Final Year Defense Assessment Rubric/ })).toBeVisible();
    await expect(page.getByText('100 pts')).toBeVisible();
  });
});
