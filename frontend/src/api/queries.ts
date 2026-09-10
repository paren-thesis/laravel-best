import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './axios';
import type {
  DefenseResponse,
  SupervisionsResponse,
  TeamsResponse,
  TopicsResponse,
} from '../types';

export const queryKeys = {
  topics: ['topics'] as const,
  teams: ['teams'] as const,
  supervisions: ['supervisions'] as const,
  defense: ['defense'] as const,
};

/* ---------- Queries ---------- */

export const useTopics = () =>
  useQuery({
    queryKey: queryKeys.topics,
    queryFn: async () => (await api.get<TopicsResponse>('/topics')).data.topics ?? [],
  });

export const useTeams = () =>
  useQuery({
    queryKey: queryKeys.teams,
    queryFn: async () => (await api.get<TeamsResponse>('/teams')).data.teams ?? [],
  });

export const useSupervisors = () =>
  useQuery({
    queryKey: queryKeys.supervisions,
    queryFn: async () => (await api.get<SupervisionsResponse>('/supervisions')).data,
  });

export const useDefenseConfig = () =>
  useQuery({
    queryKey: queryKeys.defense,
    queryFn: async () => (await api.get<DefenseResponse>('/defense/panels')).data,
  });

/* ---------- Mutations ---------- */

interface CreateTopicInput {
  team_id: number;
  title: string;
  abstract: string;
  problem_statement: string;
  proposed_solution: string;
  tech_stack: string[];
}

export const useCreateTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTopicInput) => (await api.post('/topics', input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.topics }),
  });
};

export const useReviewTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { topicId: number; status: 'approved' | 'rejected' }) =>
      (await api.patch(`/topics/${input.topicId}/review`, { status: input.status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.topics }),
  });
};

export const useAutoGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { course_id: number }) =>
      (await api.post('/teams/auto-group', input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.teams });
      qc.invalidateQueries({ queryKey: queryKeys.supervisions });
    },
  });
};

export const useAssignSupervisor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { team_id: number; supervisor_id: number }) =>
      (await api.post('/supervisions/assign', input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.supervisions });
      qc.invalidateQueries({ queryKey: queryKeys.teams });
    },
  });
};

interface DeliverableInput {
  team_id: number;
  github_repository_url: string | null;
  google_drive_url: string | null;
  environment_details: string;
}

export const useSubmitDeliverable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DeliverableInput) => (await api.post('/deliverables', input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams }),
  });
};

interface PeerEvaluationInput {
  team_id: number;
  evaluatee_id: number;
  score: number;
  comments: string;
}

export const useSubmitPeerEvaluation = () =>
  useMutation({
    mutationFn: async (input: PeerEvaluationInput) =>
      (await api.post('/teams/peer-evaluations', input)).data,
  });

interface DefenseEvaluationInput {
  team_id: number;
  panel_id: number;
  rubric_id: number;
  scores: Array<{ criteria_id: number; score: number; comments: string | null }>;
}

export const useSubmitDefenseEvaluation = () =>
  useMutation({
    mutationFn: async (input: DefenseEvaluationInput) =>
      (await api.post('/defense/evaluations', input)).data,
  });

/** Pulls the human-readable message out of an axios error. */
export const errorMessage = (error: unknown, fallback: string): string =>
  (error as any)?.response?.data?.message ?? fallback;
