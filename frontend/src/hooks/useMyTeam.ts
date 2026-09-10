import { useTeams } from '../api/queries';
import { useAuthStore } from '../store/useAuthStore';
import type { Team } from '../types';

/**
 * Resolves the signed-in student's own team.
 *
 * /teams returns every team in the department, so this must match on membership
 * and return null when there is no match. Falling back to the first team in the
 * list would silently submit work onto another team's record.
 */
export const useMyTeam = (): { team: Team | null; isLoading: boolean } => {
  const user = useAuthStore((state) => state.user);
  const { data: teams = [], isLoading } = useTeams();

  const team = user
    ? teams.find((t) => t.members?.some((m) => m.id === user.id)) ?? null
    : null;

  return { team, isLoading };
};
