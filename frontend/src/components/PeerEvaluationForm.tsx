import React, { useState } from 'react';
import { Award, UsersRound } from 'lucide-react';
import api from '../api/axios';

interface PeerEvaluationFormProps {
  team: any | null;
  user: any;
  setMessage: (msg: string) => void;
}

export const PeerEvaluationForm: React.FC<PeerEvaluationFormProps> = ({
  team,
  user,
  setMessage,
}) => {
  const [evaluateeId, setEvaluateeId] = useState('');
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A student cannot evaluate themselves; the API rejects it, so keep it out of the list.
  const teammates = (team?.members ?? []).filter((m: any) => m.id !== user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setIsSubmitting(true);
    try {
      await api.post('/teams/peer-evaluations', {
        team_id: team.id,
        evaluatee_id: Number(evaluateeId),
        score: Number(score),
        comments,
      });
      setMessage('Peer evaluation submitted successfully!');
      setEvaluateeId('');
      setScore('');
      setComments('');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Peer evaluation submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

  if (!team || teammates.length === 0) {
    return (
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" /> Teammate Peer Evaluation
        </h3>
        <div className="flex items-start gap-3 text-sm text-slate-400">
          <UsersRound className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
          <p>
            {!team
              ? 'You are not a member of any project team yet. Peer evaluations open once you join a team.'
              : 'You are currently the only member of this team, so there is nobody to evaluate.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" /> Teammate Peer Evaluation
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Rating teammates in <span className="text-indigo-400 font-medium">{team.name}</span>. Submitting again for the
          same teammate updates your previous rating.
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
          {teammates.map((m: any) => (
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
          disabled={isSubmitting}
          className="sm:col-span-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Peer Evaluation Rating'}
        </button>
      </form>
    </section>
  );
};
