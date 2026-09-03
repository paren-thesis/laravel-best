import React from 'react';
import { Award } from 'lucide-react';
import api from '../api/axios';

interface DefenseScoringFormProps {
  teams: any[];
  setMessage: (msg: string) => void;
}

export const DefenseScoringForm: React.FC<DefenseScoringFormProps> = ({
  teams,
  setMessage,
}) => {
  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Award className="w-4 h-4 text-indigo-400" /> Defense Panel Assessment & Rubric Scoring
      </h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const form = e.currentTarget;
            const targetTeam = (form.elements.namedItem('team_id') as HTMLSelectElement).value;
            const criteriaId = (form.elements.namedItem('rubric_criteria_id') as HTMLSelectElement).value;
            const scoreVal = (form.elements.namedItem('score') as HTMLInputElement).value;
            const commentsVal = (form.elements.namedItem('comments') as HTMLInputElement).value;

            await api.post(`/defense/evaluations`, {
              team_id: targetTeam,
              panel_id: 1,
              rubric_id: 1,
              rubric_criteria_id: criteriaId,
              score: scoreVal,
              comments: commentsVal,
            });
            setMessage('Defense score recorded successfully!');
            form.reset();
          } catch (err: any) {
            setMessage(err.response?.data?.message || 'Defense scoring failed');
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <select
          name="team_id"
          required
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Select Team for Defense Evaluation...</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          name="rubric_criteria_id"
          required
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Select Rubric Criteria...</option>
          <option value="1">Technical Architecture & Code Quality (30 pts)</option>
          <option value="2">System Demonstration & Functionality (35 pts)</option>
          <option value="3">Presentation & Technical Q&A Defense (35 pts)</option>
        </select>

        <input
          name="score"
          type="number"
          min="0"
          max="35"
          required
          placeholder="Score (Pts)"
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />

        <input
          name="comments"
          type="text"
          placeholder="Evaluator feedback comments..."
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          className="sm:col-span-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all"
        >
          Record Defense Evaluation Score
        </button>
      </form>
    </section>
  );
};
