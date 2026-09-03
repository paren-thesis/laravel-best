import React from 'react';
import { Award } from 'lucide-react';
import api from '../api/axios';

interface PeerEvaluationFormProps {
  teams: any[];
  user: any;
  setMessage: (msg: string) => void;
}

export const PeerEvaluationForm: React.FC<PeerEvaluationFormProps> = ({
  teams,
  user,
  setMessage,
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Award className="w-4 h-4 text-indigo-400" /> Teammate Peer Evaluation
      </h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const form = e.currentTarget;
            const targetEvaluatee = (form.elements.namedItem('evaluatee_id') as HTMLInputElement).value;
            const scoreVal = (form.elements.namedItem('score') as HTMLInputElement).value;
            const commentsVal = (form.elements.namedItem('comments') as HTMLInputElement).value;

            const myTeam = teams.find((t: any) => t.members?.some((m: any) => m.id === user?.id)) || teams[0];
            await api.post(`/teams/${myTeam?.id || 1}/peer-evaluations`, {
              evaluatee_id: targetEvaluatee,
              score: scoreVal,
              comments: commentsVal,
            });
            setMessage('Peer evaluation submitted successfully!');
            form.reset();
          } catch (err: any) {
            setMessage(err.response?.data?.message || 'Peer evaluation submission failed');
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <input
          name="evaluatee_id"
          type="number"
          required
          placeholder="Teammate User ID"
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <input
          name="score"
          type="number"
          min="1"
          max="10"
          required
          placeholder="Score (1 - 10)"
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <input
          name="comments"
          type="text"
          required
          placeholder="Constructive feedback comments"
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="sm:col-span-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all"
        >
          Submit Peer Evaluation Rating
        </button>
      </form>
    </section>
  );
};
