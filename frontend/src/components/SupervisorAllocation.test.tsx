import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  API_URL: 'http://test/api/v1',
  AUTH_TOKEN_KEY: 'htu_auth_token',
}));

import api from '../api/axios';
import { SupervisorAllocation } from './SupervisorAllocation';
import { makeMember, makeTeam, makeUser, renderWithProviders, signIn } from '../test/utils';
import { useUiStore } from '../store/useUiStore';

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

// Exactly the shape SupervisionController::index builds: a flattened object
// whose identifier is `id`, with no `user_id` and no nested `user`.
const supervisors = [
  { id: 5, name: 'Prof. Eric Mensah', email: 's1@htu.edu.gh', capacity: 5, assigned_count: 2, research_interests: ['IoT'] },
  { id: 6, name: 'Dr. Patricia Addo', email: 's2@htu.edu.gh', capacity: 5, assigned_count: 5, research_interests: [] },
];

const teams = [makeTeam(1, 'Team Alpha', [makeMember(11, 'Colton', true)])];

const routeGet = (url: string) => {
  if (url === '/teams') return Promise.resolve({ data: { teams } });
  if (url === '/supervisions') return Promise.resolve({ data: { supervisors, supervisions: [] } });
  return Promise.reject(new Error(`unexpected GET ${url}`));
};

describe('SupervisorAllocation', () => {
  beforeEach(() => {
    mockedGet.mockImplementation(routeGet as never);
    mockedPost.mockResolvedValue({ data: { message: 'Team assigned' } } as never);
    signIn(makeUser(2, ['coordinator']));
  });

  afterEach(() => signIn(null));

  // Regression: the select read `s.user_id || s.user?.id`, which are both
  // undefined on this payload. React then falls back to the option's text, so
  // the form posted a label like "Prof. Eric Mensah (2/5 teams)" as the id.
  it('uses the numeric supervisor id as the option value, not the label', async () => {
    renderWithProviders(<SupervisorAllocation />);

    const [, supervisorSelect] = await screen.findAllByRole('combobox');

    await waitFor(() =>
      expect(within(supervisorSelect).getByRole('option', { name: /Eric Mensah/ })).toBeInTheDocument(),
    );

    const option = within(supervisorSelect).getByRole('option', {
      name: /Eric Mensah/,
    }) as HTMLOptionElement;

    expect(option.value).toBe('5');
    expect(Number.isNaN(Number(option.value))).toBe(false);
  });

  it('shows each supervisor’s current load against their capacity', async () => {
    renderWithProviders(<SupervisorAllocation />);
    expect(await screen.findByRole('option', { name: /Eric Mensah \(2\/5 teams\)/ })).toBeInTheDocument();
  });

  it('disables a supervisor who is already at capacity', async () => {
    renderWithProviders(<SupervisorAllocation />);
    const full = (await screen.findByRole('option', { name: /Patricia Addo/ })) as HTMLOptionElement;
    expect(full.disabled).toBe(true);
    expect(full.text).toMatch(/full/);
  });

  it('posts numeric ids to /supervisions/assign', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SupervisorAllocation />);

    // Both selects render before their queries resolve, so wait for real options.
    await screen.findByRole('option', { name: 'Team Alpha' });
    await screen.findByRole('option', { name: /Eric Mensah/ });

    const [teamSelect, supervisorSelect] = screen.getAllByRole('combobox');
    await user.selectOptions(teamSelect, '1');
    await user.selectOptions(supervisorSelect, '5');
    await user.click(screen.getByRole('button', { name: /Assign Supervisor/ }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));
    expect(mockedPost).toHaveBeenCalledWith('/supervisions/assign', {
      team_id: 1,
      supervisor_id: 5,
    });
  });

  it('surfaces the API message when allocation is rejected', async () => {
    mockedPost.mockRejectedValue({
      response: { data: { message: 'Supervisor has reached maximum capacity of 5 teams.' } },
    });

    const user = userEvent.setup();
    renderWithProviders(<SupervisorAllocation />);

    // Both selects render before their queries resolve, so wait for real options.
    await screen.findByRole('option', { name: 'Team Alpha' });
    await screen.findByRole('option', { name: /Eric Mensah/ });

    const [teamSelect, supervisorSelect] = screen.getAllByRole('combobox');
    await user.selectOptions(teamSelect, '1');
    await user.selectOptions(supervisorSelect, '5');
    await user.click(screen.getByRole('button', { name: /Assign Supervisor/ }));

    await waitFor(() =>
      expect(useUiStore.getState().message).toBe('Supervisor has reached maximum capacity of 5 teams.'),
    );
  });
});
