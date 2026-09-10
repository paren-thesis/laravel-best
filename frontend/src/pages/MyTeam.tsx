import React from 'react';
import { Crown, UsersRound } from 'lucide-react';
import { CreateTeamForm } from '../components/CreateTeamForm';
import { DeliverablesForm } from '../components/DeliverablesForm';
import { PeerEvaluationForm } from '../components/PeerEvaluationForm';
import { SectionNotice } from '../components/SectionNotice';
import { useMyTeam } from '../hooks/useMyTeam';

export const MyTeam: React.FC = () => {
  const { team, isLoading } = useMyTeam();

  return (
    <div className="space-y-8">
      {isLoading && (
        <SectionNotice title="My Project Team" titleIcon={UsersRound} message="Loading your team..." />
      )}

      {!isLoading && !team && <CreateTeamForm />}

      {team && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-indigo-400" /> {team.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {team.members.length} member{team.members.length === 1 ? '' : 's'}
                {team.max_members ? ` of a maximum ${team.max_members}` : ''}
              </p>
            </div>
            {team.supervision?.supervisor && (
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Supervisor
                </div>
                <div className="text-sm text-slate-200">{team.supervision.supervisor.name}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm text-slate-200 truncate">{m.name}</div>
                  <div className="text-xs text-slate-500 truncate">{m.email}</div>
                </div>
                {m.pivot?.role_in_team === 'leader' && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400 shrink-0">
                    <Crown className="w-3.5 h-3.5" /> Leader
                  </span>
                )}
              </div>
            ))}
          </div>

          {team.approved_topic && (
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                Approved topic
              </div>
              <div className="text-sm text-slate-200">{team.approved_topic.title}</div>
            </div>
          )}
        </section>
      )}

      <DeliverablesForm />
      <PeerEvaluationForm />
    </div>
  );
};
