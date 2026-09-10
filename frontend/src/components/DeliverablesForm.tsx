import React, { useState } from 'react';
import { Github, UsersRound } from 'lucide-react';
import api from '../api/axios';

interface DeliverablesFormProps {
  team: any | null;
  onRefresh: () => void;
  setMessage: (msg: string) => void;
}

export const DeliverablesForm: React.FC<DeliverablesFormProps> = ({
  team,
  onRefresh,
  setMessage,
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [envDetails, setEnvDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    if (!githubUrl.trim() && !driveUrl.trim()) {
      setMessage('Provide at least a repository URL or a Drive URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/deliverables', {
        team_id: team.id,
        github_repository_url: githubUrl.trim() || null,
        google_drive_url: driveUrl.trim() || null,
        environment_details: envDetails,
      });
      setMessage('Deliverable links submitted successfully!');
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

  if (!team) {
    return (
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Github className="w-4 h-4 text-indigo-400" /> Submit GitHub &amp; Drive Links
        </h3>
        <div className="flex items-start gap-3 text-sm text-slate-400">
          <UsersRound className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
          <p>You are not a member of any project team yet. Deliverables are submitted per team.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Github className="w-4 h-4 text-indigo-400" /> Submit GitHub &amp; Drive Links
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Submitting on behalf of <span className="text-indigo-400 font-medium">{team.name}</span>
        </p>
      </div>
      <form onSubmit={handleDeliverableSubmit} className="space-y-3">
        <input
          type="url"
          placeholder="https://github.com/org/repo"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className={inputClass}
        />
        <input
          type="url"
          placeholder="https://drive.google.com/folder-url"
          value={driveUrl}
          onChange={(e) => setDriveUrl(e.target.value)}
          className={inputClass}
        />
        <textarea
          rows={3}
          placeholder="Environment Credentials / Testing Details for Supervisor"
          value={envDetails}
          onChange={(e) => setEnvDetails(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Deliverable Links'}
        </button>
      </form>
    </section>
  );
};
