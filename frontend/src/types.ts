/**
 * Shapes returned by the Laravel API. These mirror what the endpoints actually
 * send, so the compiler catches field-name mistakes before they reach the browser.
 */

export type RoleName = 'student' | 'supervisor' | 'coordinator' | 'admin' | 'panel_member';

export type TopicStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  index_number: string | null;
  staff_id: string | null;
  course_id: number | null;
  phone: string | null;
  course?: Course | null;
}

export interface SupervisorProfile {
  id: number;
  user_id: number;
  max_team_capacity: number;
  current_team_count: number;
  research_interests: string[] | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: RoleName[];
  profile?: UserProfile | null;
  supervisor_profile?: SupervisorProfile | null;
}

export interface TeamMemberPivot {
  team_id: number;
  user_id: number;
  role_in_team: 'leader' | 'member';
  joined_at: string | null;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  pivot: TeamMemberPivot;
}

export interface Topic {
  id: number;
  team_id: number;
  title: string;
  abstract: string;
  problem_statement: string | null;
  proposed_solution: string | null;
  /** JSON column: normally an array, but tolerate a raw string. */
  tech_stack: string[] | string | null;
  status: TopicStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_user_id: number | null;
  review_notes: string | null;
  team?: Team | null;
  reviewer?: Pick<AuthUser, 'id' | 'name' | 'email'> | null;
}

export interface Supervision {
  id: number;
  team_id: number;
  supervisor_id: number;
  academic_year_id: number;
  status: string;
  assigned_by_user_id: number | null;
  supervisor?: Pick<AuthUser, 'id' | 'name' | 'email'> | null;
  team?: Team | null;
}

export interface SoftwareDeliverable {
  id: number;
  team_id: number;
  github_repository_url: string | null;
  google_drive_url: string | null;
  onedrive_url: string | null;
  environment_details: string | null;
  submitted_by_user_id: number | null;
}

export interface Team {
  id: number;
  name: string;
  course_id: number;
  academic_year_id: number;
  max_members: number | null;
  created_by_user_id: number | null;
  members: TeamMember[];
  approved_topic?: Topic | null;
  supervision?: Supervision | null;
  software_deliverable?: SoftwareDeliverable | null;
}

/** Flattened shape built by SupervisionController::index, not a raw model. */
export interface Supervisor {
  id: number;
  name: string;
  email: string;
  capacity: number;
  assigned_count: number;
  research_interests: string[] | null;
}

export interface RubricCriterion {
  id: number;
  rubric_id: number;
  title: string;
  description: string | null;
  max_points: number;
  weight_percentage: number | null;
}

export interface Rubric {
  id: number;
  title: string;
  max_score: number;
  is_active: boolean;
  criteria: RubricCriterion[];
}

export interface PanelMemberPivot {
  panel_id: number;
  user_id: number;
  role: 'chair' | 'evaluator';
}

export interface PanelMember {
  id: number;
  name: string;
  email: string;
  pivot: PanelMemberPivot;
}

export interface DefensePanel {
  id: number;
  name: string;
  scheduled_at: string | null;
  location: string | null;
  academic_year_id: number;
  members: PanelMember[];
}

/** Live notification payloads broadcast over Soketi. */
export interface LiveNotification {
  message: string;
  [key: string]: unknown;
}

/* ---------- Response envelopes ---------- */

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}

export interface TopicsResponse {
  topics: Topic[];
}

export interface TeamsResponse {
  teams: Team[];
}

export interface SupervisionsResponse {
  supervisors: Supervisor[];
  supervisions: Supervision[];
}

export interface DefenseResponse {
  panels: DefensePanel[];
  rubrics: Rubric[];
}

/* ---------- Helpers ---------- */

/** tech_stack is a JSON column that has been seen as both an array and a string. */
export const parseTechStack = (value: Topic['tech_stack']): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
