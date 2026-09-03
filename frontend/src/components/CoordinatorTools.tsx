import React, { useState } from 'react';
import { Users, FileText, Plus } from 'lucide-react';
import api from '../api/axios';

interface CoordinatorToolsProps {
  teams: any[];
  supervisors: any[];
  onRefresh: () => void;
  setMessage: (msg: string) => void;
}

export const CoordinatorTools: React.FC<CoordinatorToolsProps> = ({
  teams,
  supervisors,
  onRefresh,
  setMessage,
}) => {
  const [selectedTeamForAssign, setSelectedTeamForAssign] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  const handleAutoGroup = async () => {
    try {
      const res = await api.post('/teams/auto-group', { course_id: 1 });
      setMessage(res.data.message);
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Auto-grouping failed');
    }
  };

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/supervisions/assign', {
        team_id: selectedTeamForAssign,
        supervisor_id: selectedSupervisor,
      });
      setMessage('Supervisor allocated successfully');
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Allocation failed');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> Coordinator Management Tools
        </h3>
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8000/api/v1/exports/broadsheet/csv"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Export Broadsheet (CSV)
          </a>
          <a
            href="http://localhost:8000/api/v1/exports/broadsheet/pdf"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Export Broadsheet (PDF)
          </a>
          <button
            onClick={handleAutoGroup}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Run Auto-Grouping Tool
          </button>
        </div>
      </div>

      {/* Supervisor Allocation Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">Allocate Supervisor to Team (Capacity Enforced)</h4>
        <form onSubmit={handleAssignSupervisor} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            required
            value={selectedTeamForAssign}
            onChange={(e) => setSelectedTeamForAssign(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Team...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            required
            value={selectedSupervisor}
            onChange={(e) => setSelectedSupervisor(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Supervisor...</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.user_id || s.user?.id}>
                {s.user?.name || s.name || `Supervisor #${s.id}`} ({s.current_team_count ?? s.assigned_count ?? 0}/{s.max_team_capacity ?? s.capacity ?? 5} teams)
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all"
          >
            Assign Supervisor
          </button>
        </form>
      </div>
    </section>
  );
};
