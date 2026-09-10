import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import type { AuthUser, Team, TeamMember } from '../types';

/**
 * A QueryClient with retries and caching off, so a failing request fails the
 * test immediately instead of being retried into a timeout.
 */
export const makeTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {},
): RenderResult & { queryClient: QueryClient } => {
  const queryClient = makeTestQueryClient();

  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

  return { ...result, queryClient };
};

/* ---------- Fixtures shaped like real API responses ---------- */

export const makeMember = (id: number, name: string, leader = false): TeamMember => ({
  id,
  name,
  email: `user${id}@htu.edu.gh`,
  pivot: {
    team_id: 1,
    user_id: id,
    role_in_team: leader ? 'leader' : 'member',
    joined_at: '2026-09-01 10:00:00',
  },
});

export const makeTeam = (id: number, name: string, members: TeamMember[]): Team => ({
  id,
  name,
  course_id: 1,
  academic_year_id: 1,
  max_members: 4,
  created_by_user_id: members[0]?.id ?? null,
  members,
});

export const makeUser = (id: number, roles: AuthUser['roles']): AuthUser => ({
  id,
  name: `User ${id}`,
  email: `user${id}@htu.edu.gh`,
  roles,
  profile: {
    id,
    user_id: id,
    index_number: '042023001',
    staff_id: null,
    course_id: 1,
    phone: null,
    course: { id: 1, code: 'HND-CS', name: 'HND Computer Science', department: 'Computer Science' },
  },
  supervisor_profile: null,
});

/** Puts a signed-in user into the auth store and clears UI state between tests. */
export const signIn = (user: AuthUser | null): void => {
  useAuthStore.setState({ user, token: user ? 'test-token' : null, isLoading: false, error: null });
  useUiStore.setState({ message: '', notifications: [] });
};
