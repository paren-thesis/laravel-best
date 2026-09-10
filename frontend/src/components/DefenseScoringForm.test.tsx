import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  API_URL: 'http://test/api/v1',
  AUTH_TOKEN_KEY: 'htu_auth_token',
}));

import api from '../api/axios';
import { DefenseScoringForm } from './DefenseScoringForm';
import { makeMember, makeTeam, makeUser, renderWithProviders, signIn } from '../test/utils';

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

const teams = [makeTeam(3, 'Team Cyber', [makeMember(31, 'Ama', true)])];

// Deliberately not id 1: the form used to hardcode panel_id and rubric_id to 1,
// which would not survive a reseed.
const defensePayload = {
  panels: [{ id: 42, name: 'Panel B', scheduled_at: null, location: 'Lab 2', academic_year_id: 1, members: [] }],
  rubrics: [
    {
      id: 77,
      title: 'Defense Rubric',
      max_score: 100,
      is_active: true,
      criteria: [
        { id: 101, rubric_id: 77, title: 'Architecture', description: null, max_points: 30, weight_percentage: 100 },
        { id: 102, rubric_id: 77, title: 'Demonstration', description: null, max_points: 35, weight_percentage: 100 },
        { id: 103, rubric_id: 77, title: 'Q&A', description: null, max_points: 35, weight_percentage: 100 },
      ],
    },
  ],
};

const routeGet = (url: string) => {
  if (url === '/teams') return Promise.resolve({ data: { teams } });
  if (url === '/defense/panels') return Promise.resolve({ data: defensePayload });
  return Promise.reject(new Error(`unexpected GET ${url}`));
};

const fillAllScores = async (user: ReturnType<typeof userEvent.setup>, values: string[]) => {
  const inputs = screen.getAllByPlaceholderText('Score');
  for (let i = 0; i < inputs.length; i += 1) {
    await user.type(inputs[i], values[i]);
  }
};

describe('DefenseScoringForm', () => {
  beforeEach(() => {
    mockedGet.mockImplementation(routeGet as never);
    mockedPost.mockResolvedValue({ data: { message: 'ok' } } as never);
    signIn(makeUser(5, ['supervisor']));
  });

  afterEach(() => signIn(null));

  it('renders one scored row per rubric criterion, capped at its maximum', async () => {
    renderWithProviders(<DefenseScoringForm />);

    await screen.findByText('Architecture');
    const inputs = screen.getAllByPlaceholderText('Score') as HTMLInputElement[];

    expect(inputs).toHaveLength(3);
    expect(inputs.map((i) => i.max)).toEqual(['30', '35', '35']);
  });

  it('totals the rubric maximum from the criteria rather than assuming 100', async () => {
    renderWithProviders(<DefenseScoringForm />);
    expect(await screen.findByText('0 / 100')).toBeInTheDocument();
  });

  it('updates the running total as scores are entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DefenseScoringForm />);

    await screen.findByText('Architecture');
    await fillAllScores(user, ['26', '30', '28']);

    expect(await screen.findByText('84 / 100')).toBeInTheDocument();
  });

  // Regression: the form used to send a single flat { rubric_criteria_id, score },
  // but the controller validates `scores` as a required array, so every
  // submission failed with 422.
  it('submits every criterion in one request as a scores array', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DefenseScoringForm />);

    await screen.findByRole('option', { name: 'Team Cyber' });
    await user.selectOptions(screen.getAllByRole('combobox')[0], '3');
    await fillAllScores(user, ['26', '30', '28']);
    await user.click(screen.getByRole('button', { name: /Record Defense Evaluation/ }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));

    const [url, body] = mockedPost.mock.calls[0];
    expect(url).toBe('/defense/evaluations');
    expect(body).toEqual({
      team_id: 3,
      panel_id: 42,
      rubric_id: 77,
      scores: [
        { criteria_id: 101, score: 26, comments: null },
        { criteria_id: 102, score: 30, comments: null },
        { criteria_id: 103, score: 28, comments: null },
      ],
    });
  });

  it('uses the panel and rubric ids the API returned, not hardcoded ones', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DefenseScoringForm />);

    await screen.findByRole('option', { name: 'Team Cyber' });
    await user.selectOptions(screen.getAllByRole('combobox')[0], '3');
    await fillAllScores(user, ['10', '10', '10']);
    await user.click(screen.getByRole('button', { name: /Record Defense Evaluation/ }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));

    const body = mockedPost.mock.calls[0][1] as { panel_id: number; rubric_id: number };
    expect(body.panel_id).toBe(42);
    expect(body.rubric_id).toBe(77);
  });

  it('explains itself instead of rendering a form when no rubric is configured', async () => {
    mockedGet.mockImplementation(((url: string) => {
      if (url === '/teams') return Promise.resolve({ data: { teams } });
      return Promise.resolve({ data: { panels: [], rubrics: [] } });
    }) as never);

    renderWithProviders(<DefenseScoringForm />);

    expect(await screen.findByText(/No defense panel or active rubric/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Record Defense Evaluation/ })).not.toBeInTheDocument();
  });
});
