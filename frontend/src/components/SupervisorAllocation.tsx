import React, { useState } from 'react';
import { Plus, UserCheck, Users } from 'lucide-react';
import {
  errorMessage,
  useAssignSupervisor,
  useAutoGroup,
  useSupervisors,
  useTeams,
} from '../api/queries';
import { useUiStore } from '../store/useUiStore';

const controlClass =
  'bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

export const SupervisorAllocation: React.FC = () => {
  const { data: teams = [] } = useTeams();
  const { data: supervisionData } = useSupervisors();
  const setMessage = useUiStore((state) => state.setMessage);
  const assignSupervisor = useAssignSupervisor();
  const autoGroup = useAutoGroup();

  const [teamId, setTeamId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');

  const supervisors = supervisionData?.supervisors ?? [];

  const handleAutoGroup = () => {
    autoGroup.mutate(
      { course_id: 1 },
      {
        onSuccess: (data) => setMessage(data.message ?? 'Auto-grouping completed'),
        onError: (error) => setMessage(errorMessage(error, 'Auto-grouping failed')),
      },
    );
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    assignSupervisor.mutate(
      { team_id: Number(teamId), supervisor_id: Number(supervisorId) },
      {
        onSuccess: (data) => {
          setMessage(data.message ?? 'Supervisor allocated successfully');
          setTeamId('');
          setSupervisorId('');
        },
        onError: (error) => setMessage(errorMessage(error, 'Allocation failed')),
      },
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> Supervisor Allocation &amp; Grouping
        </h3>
        <button
          onClick={handleAutoGroup}
          disabled={autoGroup.isPending}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {autoGroup.isPending ? 'Grouping...' : 'Run Auto-Grouping Tool'}
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">
          Allocate Supervisor to Team (Capacity Enforced)
        </h4>
        <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select required value={teamId} onChange={(e) => setTeamId(e.target.value)} className={controlClass}>
            <option value="">Select Team...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            required
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            className={controlClass}
          >
            <option value="">Select Supervisor...</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id} disabled={s.assigned_count >= s.capacity}>
                {s.name} ({s.assigned_count}/{s.capacity} teams)
                {s.assigned_count >= s.capacity ? ' — full' : ''}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={assignSupervisor.isPending}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            {assignSupervisor.isPending ? 'Assigning...' : 'Assign Supervisor'}
          </button>
        </form>
      </div>
    </section>
  );
};
