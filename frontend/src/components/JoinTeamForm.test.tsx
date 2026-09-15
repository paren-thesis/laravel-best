import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  API_URL: 'http://test/api/v1',
  AUTH_TOKEN_KEY: 'htu_auth_token',
}));

import api from '../api/axios';
import { JoinTeamForm } from './JoinTeamForm';
import { makeUser, renderWithProviders, signIn } from '../test/utils';
import { useUiStore } from '../store/useUiStore';

const mockedPost = vi.mocked(api.post);

describe('JoinTeamForm', () => {
  beforeEach(() => {
    mockedPost.mockResolvedValue({ data: { message: 'Successfully joined the project team.' } } as never);
    signIn(makeUser(99, ['student']));
  });

  afterEach(() => signIn(null));

  it('posts the code to the join route', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    await user.type(screen.getByLabelText('Invite code'), 'UWFVCW');
    await user.click(screen.getByRole('button', { name: /Join Team/ }));

    await waitFor(() => expect(mockedPost).toHaveBeenCalledTimes(1));
    expect(mockedPost).toHaveBeenCalledWith('/teams/join', { invite_code: 'UWFVCW' });
  });

  // Codes are stored uppercase and the API uppercases on the way in, so the
  // field should not let a lowercase-looking value be submitted.
  it('normalises a lowercase code to uppercase', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    const field = screen.getByLabelText('Invite code') as HTMLInputElement;
    await user.type(field, 'uwfvcw');

    expect(field.value).toBe('UWFVCW');
  });

  it('strips characters that cannot appear in a code', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    const field = screen.getByLabelText('Invite code') as HTMLInputElement;
    await user.type(field, 'ab-12 cd');

    expect(field.value).toBe('AB12CD');
  });

  it('stops at six characters, the generated length', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    const field = screen.getByLabelText('Invite code') as HTMLInputElement;
    await user.type(field, 'ABCDEFGHIJ');

    expect(field.value).toBe('ABCDEF');
  });

  it('keeps the button disabled until something is typed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    const button = screen.getByRole('button', { name: /Join Team/ });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Invite code'), 'A');
    expect(button).toBeEnabled();
  });

  it('surfaces the API message when the code is wrong', async () => {
    mockedPost.mockRejectedValue({ response: { data: { message: 'Invalid team invite code.' } } });

    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    await user.type(screen.getByLabelText('Invite code'), 'NOPE12');
    await user.click(screen.getByRole('button', { name: /Join Team/ }));

    await waitFor(() =>
      expect(useUiStore.getState().message).toBe('Invalid team invite code.'),
    );
  });

  it('surfaces the API message when the team is already full', async () => {
    mockedPost.mockRejectedValue({
      response: { data: { message: 'This team has reached its maximum member capacity.' } },
    });

    const user = userEvent.setup();
    renderWithProviders(<JoinTeamForm />);

    await user.type(screen.getByLabelText('Invite code'), 'FULL12');
    await user.click(screen.getByRole('button', { name: /Join Team/ }));

    await waitFor(() =>
      expect(useUiStore.getState().message).toBe(
        'This team has reached its maximum member capacity.',
      ),
    );
  });
});
