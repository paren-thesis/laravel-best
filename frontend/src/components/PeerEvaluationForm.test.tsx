import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  API_URL: 'http://test/api/v1',
  AUTH_TOKEN_KEY: 'htu_auth_token',
}));

import api from '../api/axios';
import { PeerEvaluationForm } from './PeerEvaluationForm';
import { makeMember, makeTeam, makeUser, renderWithProviders, signIn } from '../test/utils';

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

const teams = [
  makeTeam(7, 'Team Alpha', [
    makeMember(11, 'Colton Shields', true),
    makeMember(12, 'Jacynthe Ullrich'),
    makeMember(13, 'Ellis Botsford'),
  ]),
];

describe('PeerEvaluationForm', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue({ data: { teams } } as never);
    mockedPost.mockResolvedValue({ data: { message: 'ok' } } as never);
    signIn(makeUser(11, ['student']));
  });

  afterEach(() => signIn(null));

  it('lists teammates by name and leaves out the evaluator', async () => {
    renderWithProviders(<PeerEvaluationForm />);

    expect(await screen.findByRole('option', { name: 'Jacynthe Ullrich' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ellis Botsford' })).toBeInTheDocument();
    // The API rejects self-evaluation, so the evaluator must not be offered.
    expect(screen.queryByRole('option', { name: 'Colton Shields' })).not.toBeInTheDocument();
  });

  // Regression: the form used to POST /teams/{id}/peer-evaluations, which is not
  // a registered route and returned 404 on every submission.
  it('posts to the collection route with the team in the body', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PeerEvaluationForm />);

    await screen.findByRole('option', { name: 'Jacynthe Ullrich' });
    await user.selectOptions(screen.getByRole('combobox'), '12');
    await user.type(screen.getByPlaceholderText(/Score/), '8');
    await user.type(screen.getByPlaceholderText(/feedback/i), 'Strong backend work');
    await user.click(screen.getByRole('button', { name: /Submit Peer Evaluation/ }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));

    const [url, body] = mockedPost.mock.calls[0];
    expect(url).toBe('/teams/peer-evaluations');
    expect(url).not.toMatch(/\/teams\/\d+\//);
    expect(body).toEqual({
      team_id: 7,
      evaluatee_id: 12,
      score: 8,
      comments: 'Strong backend work',
    });
  });

  it('sends the score and evaluatee as numbers, which the API validation requires', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PeerEvaluationForm />);

    await screen.findByRole('option', { name: 'Ellis Botsford' });
    await user.selectOptions(screen.getByRole('combobox'), '13');
    await user.type(screen.getByPlaceholderText(/Score/), '9');
    await user.type(screen.getByPlaceholderText(/feedback/i), 'Reliable');
    await user.click(screen.getByRole('button', { name: /Submit Peer Evaluation/ }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));

    const body = mockedPost.mock.calls[0][1] as Record<string, unknown>;
    expect(typeof body.evaluatee_id).toBe('number');
    expect(typeof body.score).toBe('number');
    expect(typeof body.team_id).toBe('number');
  });

  it('explains itself instead of rendering a form when the student has no team', async () => {
    mockedGet.mockResolvedValue({ data: { teams: [] } } as never);
    renderWithProviders(<PeerEvaluationForm />);

    expect(await screen.findByText(/not a member of any project team/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit Peer Evaluation/ })).not.toBeInTheDocument();
  });

  it('explains itself when the student is the only member of their team', async () => {
    mockedGet.mockResolvedValue({
      data: { teams: [makeTeam(7, 'Solo', [makeMember(11, 'Colton Shields', true)])] },
    } as never);
    renderWithProviders(<PeerEvaluationForm />);

    expect(await screen.findByText(/only member of this team/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit Peer Evaluation/ })).not.toBeInTheDocument();
  });
});
