import React, { useState } from 'react';
import { Award, UsersRound } from 'lucide-react';
import { errorMessage, useSubmitPeerEvaluation } from '../api/queries';
import { useMyTeam } from '../hooks/useMyTeam';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { SectionNotice } from './SectionNotice';

const inputClass =
  'bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

export const PeerEvaluationForm: React.FC = () => {
  const { team, isLoading } = useMyTeam();
  const user = useAuthStore((state) => state.user);
  const setMessage = useUiStore((state) => state.setMessage);
  const submitEvaluation = useSubmitPeerEvaluation();

  const [evaluateeId, setEvaluateeId] = useState('');
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');

  // The API rejects self-evaluation, so keep the evaluator out of the list.
  const teammates = (team?.members ?? []).filter((m) => m.id !== user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    submitEvaluation.mutate(
      {
        team_id: team.id,
        evaluatee_id: Number(evaluateeId),
        score: Number(score),
        comments,
      },
      {
        onSuccess: () => {
          setMessage('Peer evaluation submitted successfully!');
          setEvaluateeId('');
          setScore('');
          setComments('');
        },
        onError: (error) => setMessage(errorMessage(error, 'Peer evaluation submission failed')),
      },
    );
  };

  if (isLoading) {
    return (
      <SectionNotice
        title="Teammate Peer Evaluation"
        titleIcon={Award}
        message="Loading your team..."
      />
    );
  }

  if (!team || teammates.length === 0) {
    return (
      <SectionNotice
        title="Teammate Peer Evaluation"
        titleIcon={Award}
        noticeIcon={UsersRound}
        message={
          !team
            ? 'You are not a member of any project team yet. Peer evaluations open once you join a team.'
            : 'You are currently the only member of this team, so there is nobody to evaluate.'
        }
      />
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" /> Teammate Peer Evaluation
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Rating teammates in <span className="text-indigo-400 font-medium">{team.name}</span>.
          Submitting again for the same teammate updates your previous rating.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <select
          required
          value={evaluateeId}
          onChange={(e) => setEvaluateeId(e.target.value)}
          className={inputClass}
        >
          <option value="">Select teammate...</option>
          {teammates.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          max="10"
          required
          placeholder="Score (1 - 10)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          required
          placeholder="Constructive feedback comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={submitEvaluation.isPending}
          className="sm:col-span-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {submitEvaluation.isPending ? 'Submitting...' : 'Submit Peer Evaluation Rating'}
        </button>
      </form>
    </section>
  );
};
