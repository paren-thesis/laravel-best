import type { APIRequestContext, Page } from '@playwright/test';

export const API_URL = 'http://localhost:8000/api/v1';
export const AUTH_TOKEN_KEY = 'htu_auth_token';

export const DEMO_PASSWORD = 'password';

export const ACCOUNTS = {
  coordinator: 'coordinator@htu.edu.gh',
  admin: 'admin@htu.edu.gh',
  supervisor: 'supervisor1@htu.edu.gh',
  /** Seeded into Team Alpha, unlike the bare `student@` account. */
  student: 'student1@htu.edu.gh',
} as const;

/**
 * Signs in through the API and seeds the token before the page loads.
 *
 * The UI login flow is covered by its own spec. Everywhere else, going through
 * the form would add ten seconds per test for no extra coverage.
 */
export const signInAs = async (
  page: Page,
  request: APIRequestContext,
  email: string,
  path = '/',
): Promise<void> => {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email, password: DEMO_PASSWORD },
    headers: { Accept: 'application/json' },
  });

  if (!response.ok()) {
    throw new Error(
      `Could not sign in as ${email} (HTTP ${response.status()}). ` +
        'Is the stack up and the database seeded? `docker exec fyp_app php artisan db:seed`',
    );
  }

  const { access_token: token } = (await response.json()) as { access_token: string };

  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [AUTH_TOKEN_KEY, token] as const,
  );

  await page.goto(path);
};

/** The hrefs of the nav links visible to the signed-in role. */
export const navHrefs = (page: Page) =>
  page.locator('header nav a').evaluateAll((links) =>
    links.map((a) => a.getAttribute('href')),
  );
