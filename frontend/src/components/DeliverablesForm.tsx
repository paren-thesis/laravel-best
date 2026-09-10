import React, { useState } from 'react';
import { Github, UsersRound } from 'lucide-react';
import { errorMessage, useSubmitDeliverable } from '../api/queries';
import { useMyTeam } from '../hooks/useMyTeam';
import { useUiStore } from '../store/useUiStore';
import { SectionNotice } from './SectionNotice';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

export const DeliverablesForm: React.FC = () => {
  const { team, isLoading } = useMyTeam();
  const setMessage = useUiStore((state) => state.setMessage);
  const submitDeliverable = useSubmitDeliverable();

  const [githubUrl, setGithubUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [envDetails, setEnvDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    if (!githubUrl.trim() && !driveUrl.trim()) {
      setMessage('Provide at least a repository URL or a Drive URL.');
      return;
    }

    submitDeliverable.mutate(
      {
        team_id: team.id,
        github_repository_url: githubUrl.trim() || null,
        google_drive_url: driveUrl.trim() || null,
        environment_details: envDetails,
      },
      {
        onSuccess: () => setMessage('Deliverable links submitted successfully!'),
        onError: (error) => setMessage(errorMessage(error, 'Submission failed')),
      },
    );
  };

  if (isLoading) {
    return (
      <SectionNotice
        title="Submit GitHub & Drive Links"
        titleIcon={Github}
        message="Loading your team..."
      />
    );
  }

  if (!team) {
    return (
      <SectionNotice
        title="Submit GitHub & Drive Links"
        titleIcon={Github}
        noticeIcon={UsersRound}
        message="You are not a member of any project team yet. Deliverables are submitted per team."
      />
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
      <form onSubmit={handleSubmit} className="space-y-3">
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
          disabled={submitDeliverable.isPending}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {submitDeliverable.isPending ? 'Submitting...' : 'Submit Deliverable Links'}
        </button>
      </form>
    </section>
  );
};
