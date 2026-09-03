import React, { useState } from 'react';
import { Github } from 'lucide-react';
import api from '../api/axios';

interface DeliverablesFormProps {
  teams: any[];
  user: any;
  onRefresh: () => void;
  setMessage: (msg: string) => void;
}

export const DeliverablesForm: React.FC<DeliverablesFormProps> = ({
  teams,
  user,
  onRefresh,
  setMessage,
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [envDetails, setEnvDetails] = useState('');

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const myTeam = teams.find((t: any) => t.members?.some((m: any) => m.id === user?.id)) || teams[0];
      const teamId = myTeam?.id || 1;
      await api.post('/deliverables', {
        team_id: teamId,
        github_repository_url: githubUrl,
        google_drive_url: driveUrl,
        environment_details: envDetails,
      });
      setMessage('Deliverable links submitted successfully!');
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Github className="w-4 h-4 text-indigo-400" /> Submit GitHub & Drive Links
      </h3>
      <form onSubmit={handleDeliverableSubmit} className="space-y-3">
        <input
          type="url"
          placeholder="https://github.com/org/repo"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="url"
          placeholder="https://drive.google.com/folder-url"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <textarea
          rows={3}
          placeholder="Environment Credentials / Testing Details for Supervisor"
          value={envDetails}
          onChange={(e) => setEnvDetails(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all"
        >
          Submit Deliverable Links
        </button>
      </form>
    </section>
  );
};
