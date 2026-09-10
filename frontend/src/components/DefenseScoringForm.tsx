import React, { useEffect, useState } from 'react';
import { Award, ClipboardX } from 'lucide-react';
import { errorMessage, useDefenseConfig, useSubmitDefenseEvaluation, useTeams } from '../api/queries';
import { useUiStore } from '../store/useUiStore';
import { SectionNotice } from './SectionNotice';

interface CriterionEntry {
  score: string;
  comments: string;
}

const inputClass =
  'bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

export const DefenseScoringForm: React.FC = () => {
  const { data: teams = [] } = useTeams();
  const { data: defense, isLoading } = useDefenseConfig();
  const setMessage = useUiStore((state) => state.setMessage);
  const submitEvaluation = useSubmitDefenseEvaluation();

  const [teamId, setTeamId] = useState('');
  const [panelId, setPanelId] = useState('');
  const [rubricId, setRubricId] = useState('');
  const [entries, setEntries] = useState<Record<number, CriterionEntry>>({});

  const panels = defense?.panels ?? [];
  const rubrics = defense?.rubrics ?? [];

  // Default to whatever the API returned rather than assuming id 1 exists.
  useEffect(() => {
    if (!panelId && panels.length > 0) setPanelId(String(panels[0].id));
  }, [panels, panelId]);

  useEffect(() => {
    if (!rubricId && rubrics.length > 0) setRubricId(String(rubrics[0].id));
  }, [rubrics, rubricId]);

  const activeRubric = rubrics.find((r) => String(r.id) === rubricId) ?? rubrics[0];
  const criteria = activeRubric?.criteria ?? [];

  const updateEntry = (criterionId: number, field: keyof CriterionEntry, value: string) => {
    setEntries((prev) => {
      const current = prev[criterionId] ?? { score: '', comments: '' };
      return { ...prev, [criterionId]: { ...current, [field]: value } };
    });
  };

  const runningTotal = criteria.reduce((sum, c) => sum + (Number(entries[c.id]?.score) || 0), 0);
  const maxTotal = criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRubric) return;

    // The API takes every criterion score in one request, not one at a time.
    submitEvaluation.mutate(
      {
        team_id: Number(teamId),
        panel_id: Number(panelId),
        rubric_id: activeRubric.id,
        scores: criteria.map((c) => ({
          criteria_id: c.id,
          score: Number(entries[c.id]?.score ?? 0),
          comments: entries[c.id]?.comments || null,
        })),
      },
      {
        onSuccess: () => {
          setMessage(`Defense evaluation recorded (${runningTotal}/${maxTotal})`);
          setTeamId('');
          setEntries({});
        },
        onError: (error) => setMessage(errorMessage(error, 'Defense scoring failed')),
      },
    );
  };

  if (isLoading) {
    return (
      <SectionNotice
        title="Defense Panel Assessment & Rubric Scoring"
        titleIcon={Award}
        message="Loading panels and rubrics..."
      />
    );
  }

  if (panels.length === 0 || criteria.length === 0) {
    return (
      <SectionNotice
        title="Defense Panel Assessment & Rubric Scoring"
        titleIcon={Award}
        noticeIcon={ClipboardX}
        message="No defense panel or active rubric has been configured yet. A coordinator needs to create one before scoring can begin."
      />
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" /> Defense Panel Assessment &amp; Rubric Scoring
          </h3>
          <p className="text-xs text-slate-400 mt-1">{activeRubric.title}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Running total
          </div>
          <div className="text-lg font-bold text-indigo-400 tabular-nums">
            {runningTotal} / {maxTotal}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select required value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputClass}>
            <option value="">Select team for defense evaluation...</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select required value={panelId} onChange={(e) => setPanelId(e.target.value)} className={inputClass}>
            {panels.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {rubrics.length > 1 && (
            <select
              value={rubricId}
              onChange={(e) => {
                setRubricId(e.target.value);
                setEntries({});
              }}
              className={`${inputClass} sm:col-span-2`}
            >
              {rubrics.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-3 pt-1">
          {criteria.map((c) => (
            <div key={c.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div className="sm:col-span-5">
                <div className="text-sm font-medium text-slate-200">{c.title}</div>
                <div className="text-xs text-slate-500">Max {c.max_points} pts</div>
              </div>
              <input
                type="number"
                min="0"
                max={c.max_points}
                required
                placeholder="Score"
                value={entries[c.id]?.score ?? ''}
                onChange={(e) => updateEntry(c.id, 'score', e.target.value)}
                className={`${inputClass} sm:col-span-3 w-full tabular-nums`}
              />
              <input
                type="text"
                placeholder="Comments (optional)"
                value={entries[c.id]?.comments ?? ''}
                onChange={(e) => updateEntry(c.id, 'comments', e.target.value)}
                className={`${inputClass} sm:col-span-4 w-full`}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitEvaluation.isPending}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {submitEvaluation.isPending ? 'Recording...' : 'Record Defense Evaluation Score'}
        </button>
      </form>
    </section>
  );
};
