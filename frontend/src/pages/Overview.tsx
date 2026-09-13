import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, UserCheck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { useSupervisors, useTeams, useTopics } from '../api/queries';
import { useMyTeam } from '../hooks/useMyTeam';
import { useAuthStore } from '../store/useAuthStore';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: LucideIcon;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon: Icon }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <Icon className="w-4 h-4 text-indigo-400" />
    </div>
    <div className="text-2xl font-bold text-slate-100 tabular-nums">{value}</div>
    {hint && <div className="text-xs text-slate-400">{hint}</div>}
  </div>
);

export const Overview: React.FC = () => {
  const hasRole = useAuthStore((state) => state.hasRole);
  const { data: topics = [] } = useTopics();
  const { data: teams = [] } = useTeams();
  const { data: supervisionData } = useSupervisors();
  const { team: myTeam } = useMyTeam();

  const isStudent = hasRole('student');
  const isStaff = hasRole('coordinator', 'admin', 'supervisor');

  const approved = topics.filter((t) => t.status === 'approved').length;
  const awaitingReview = topics.filter((t) => t.status === 'submitted').length;
  const supervisors = supervisionData?.supervisors ?? [];
  const totalCapacity = supervisors.reduce((sum, s) => sum + s.capacity, 0);
  const totalAssigned = supervisors.reduce((sum, s) => sum + s.assigned_count, 0);

  return (
    <div className="space-y-8">
      <HeroBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Proposals" value={topics.length} hint="Visible to you" icon={FileText} />
        <StatCard label="Approved" value={approved} hint="Topics cleared to proceed" icon={CheckCircle2} />
        <StatCard
          label="Awaiting review"
          value={awaitingReview}
          hint={awaitingReview > 0 ? 'Needs a decision' : 'Nothing pending'}
          icon={Clock}
        />
        {isStaff ? (
          <StatCard
            label="Supervisor load"
            value={`${totalAssigned}/${totalCapacity}`}
            hint={`${supervisors.length} supervisors`}
            icon={UserCheck}
          />
        ) : (
          <StatCard
            label="My team"
            value={myTeam ? myTeam.members.length : '—'}
            hint={myTeam ? myTeam.name : 'Not in a team yet'}
            icon={Users}
          />
        )}
      </div>

      {isStudent && !myTeam && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-sm text-amber-300/90">
          You are not a member of any project team yet. Proposal, deliverable and peer-evaluation
          forms stay locked until you join one.
        </div>
      )}

      {isStaff && awaitingReview > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-300">
            {awaitingReview} proposal{awaitingReview === 1 ? '' : 's'} waiting on a review decision.
          </span>
          <Link
            to="/proposals"
            className="px-4 py-2 min-h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all"
          >
            Go to review queue
          </Link>
        </div>
      )}

      <div className="text-xs text-slate-500">
        {teams.length} team{teams.length === 1 ? '' : 's'} registered this academic year.
      </div>
    </div>
  );
};
