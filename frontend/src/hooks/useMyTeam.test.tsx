import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
  API_URL: 'http://test/api/v1',
  AUTH_TOKEN_KEY: 'htu_auth_token',
}));

import api from '../api/axios';
import { useMyTeam } from './useMyTeam';
import { makeMember, makeTeam, makeTestQueryClient, makeUser, signIn } from '../test/utils';

const mockedGet = vi.mocked(api.get);

/** Two teams, neither containing user 99. */
const teamsPayload = [
  makeTeam(1, 'Team Alpha', [makeMember(11, 'Colton', true), makeMember(12, 'Jacynthe')]),
  makeTeam(2, 'Team Vision', [makeMember(21, 'Ellis', true)]),
];

const wrapper = () => {
  const client = makeTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useMyTeam', () => {
  beforeEach(() => {
    mockedGet.mockResolvedValue({ data: { teams: teamsPayload } } as never);
  });

  afterEach(() => {
    signIn(null);
  });

  it('finds the team the signed-in student actually belongs to', async () => {
    signIn(makeUser(12, ['student']));
    const { result } = renderHook(() => useMyTeam(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.team?.id).toBe(1);
    expect(result.current.team?.name).toBe('Team Alpha');
  });

  it('matches on membership, not on position in the list', async () => {
    signIn(makeUser(21, ['student']));
    const { result } = renderHook(() => useMyTeam(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.team?.id).toBe(2);
  });

  // Regression: the original code did `teams.find(...) || teams[0]`, so a student
  // in no team silently submitted work onto whichever team came back first.
  it('returns null for a student who belongs to no team, never the first team', async () => {
    signIn(makeUser(99, ['student']));
    const { result } = renderHook(() => useMyTeam(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.team).toBeNull();
  });

  it('returns null when nobody is signed in', async () => {
    signIn(null);
    const { result } = renderHook(() => useMyTeam(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.team).toBeNull();
  });

  it('returns null rather than guessing when the teams request fails', async () => {
    mockedGet.mockRejectedValue(new Error('network down'));
    signIn(makeUser(12, ['student']));
    const { result } = renderHook(() => useMyTeam(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.team).toBeNull();
  });

  it('tolerates a team arriving without a members array', async () => {
    mockedGet.mockResolvedValue({
      data: { teams: [{ ...makeTeam(3, 'Broken', []), members: undefined }] },
    } as never);
    signIn(makeUser(12, ['student']));
    const { result } = renderHook(() => useMyTeam(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.team).toBeNull();
  });
});
