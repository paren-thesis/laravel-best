import React, { useState } from 'react';
import { Users, FileText, Plus, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { downloadFile, readApiError } from '../api/download';

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
  const [isAssigning, setIsAssigning] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const handleAutoGroup = async () => {
    try {
      const res = await api.post('/teams/auto-group', { course_id: 1 });
      setMessage(res.data.message);
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Auto-grouping failed');
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format);
    try {
      await downloadFile(`/exports/broadsheet/${format}`, `htu_fyp_broadsheet.${format}`);
      setMessage(`Broadsheet downloaded as ${format.toUpperCase()}`);
    } catch (err: any) {
      setMessage(await readApiError(err, `${format.toUpperCase()} export failed`));
    } finally {
      setExporting(null);
    }
  };

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      const res = await api.post('/supervisions/assign', {
        team_id: selectedTeamForAssign,
        supervisor_id: selectedSupervisor,
      });
      setMessage(res.data.message || 'Supervisor allocated successfully');
      setSelectedTeamForAssign('');
      setSelectedSupervisor('');
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Allocation failed');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" /> Coordinator Management Tools
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-50 text-emerald-300 border border-emerald-500/30 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            {exporting === 'csv'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileText className="w-4 h-4" />}
            Export Broadsheet (CSV)
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-300 border border-rose-500/30 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            {exporting === 'pdf'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FileText className="w-4 h-4" />}
            Export Broadsheet (PDF)
          </button>
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
              <option key={s.id} value={s.id} disabled={s.assigned_count >= s.capacity}>
                {s.name} ({s.assigned_count}/{s.capacity} teams)
                {s.assigned_count >= s.capacity ? ' — full' : ''}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isAssigning}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
          >
            {isAssigning ? 'Assigning...' : 'Assign Supervisor'}
          </button>
        </form>
      </div>
    </section>
  );
};
