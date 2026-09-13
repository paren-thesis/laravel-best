import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { errorMessage, useCreateRubric, useDefenseConfig } from '../api/queries';
import { useUiStore } from '../store/useUiStore';

interface CriterionDraft {
  title: string;
  maxPoints: string;
}

const inputClass =
  'bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 min-h-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500';

const emptyCriterion = (): CriterionDraft => ({ title: '', maxPoints: '' });

export const RubricManager: React.FC = () => {
  const { data: defense, isLoading, isError } = useDefenseConfig();
  const setMessage = useUiStore((state) => state.setMessage);
  const createRubric = useCreateRubric();

  const [title, setTitle] = useState('');
  const [drafts, setDrafts] = useState<CriterionDraft[]>([emptyCriterion(), emptyCriterion()]);

  const rubrics = defense?.rubrics ?? [];

  const updateDraft = (index: number, field: keyof CriterionDraft, value: string) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const addCriterion = () => setDrafts((prev) => [...prev, emptyCriterion()]);

  const removeCriterion = (index: number) =>
    setDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const draftTotal = drafts.reduce((sum, d) => sum + (Number(d.maxPoints) || 0), 0);
  const isValid =
    title.trim().length > 0 &&
    drafts.every((d) => d.title.trim().length > 0 && Number(d.maxPoints) > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    createRubric.mutate(
      {
        title: title.trim(),
        criteria: drafts.map((d) => ({
          title: d.title.trim(),
          max_points: Number(d.maxPoints),
        })),
      },
      {
        onSuccess: () => {
          setMessage(`Rubric created with ${drafts.length} criteria totalling ${draftTotal} points`);
          setTitle('');
          setDrafts([emptyCriterion(), emptyCriterion()]);
        },
        onError: (error) => setMessage(errorMessage(error, 'Could not create the rubric')),
      },
    );
  };

  return (
    <div className="space-y-8">
      {/* ---------- Existing rubrics ---------- */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" /> Active Rubrics
        </h3>

        {isLoading && (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            Loading rubrics...
          </div>
        )}

        {isError && (
          <div className="p-8 text-center bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
            Could not load rubrics. Check that the API is running.
          </div>
        )}

        {!isLoading && !isError && rubrics.length === 0 && (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No active rubric yet. Create one below — defense scoring cannot begin without it.
          </div>
        )}

        {rubrics.map((rubric) => {
          const total = rubric.criteria.reduce((sum, c) => sum + (Number(c.max_points) || 0), 0);

          return (
            <div key={rubric.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-100 text-base">{rubric.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {rubric.criteria.length} criteri{rubric.criteria.length === 1 ? 'on' : 'a'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {rubric.is_active && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total</div>
                    <div className="text-lg font-bold text-indigo-400 tabular-nums">{total} pts</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-2 font-semibold">Criterion</th>
                      <th className="pb-2 font-semibold text-right w-28">Max points</th>
                      <th className="pb-2 font-semibold text-right w-24">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubric.criteria.map((c) => (
                      <tr key={c.id} className="border-t border-slate-800/80">
                        <td className="py-2.5 pr-4 text-slate-200">
                          {c.title}
                          {c.description && (
                            <div className="text-xs text-slate-500 mt-0.5">{c.description}</div>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-slate-300 tabular-nums">{c.max_points}</td>
                        <td className="py-2.5 text-right text-slate-400 tabular-nums">
                          {total > 0 ? `${Math.round((c.max_points / total) * 100)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------- Create ---------- */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" /> Create a New Rubric
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Each criterion contributes its maximum points to the total score examiners award.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Rubric title (e.g. Final Year Defense Assessment Rubric)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputClass} w-full`}
          />

          <div className="space-y-2">
            {drafts.map((draft, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder={`Criterion ${index + 1} title`}
                  value={draft.title}
                  onChange={(e) => updateDraft(index, 'title', e.target.value)}
                  className={`${inputClass} flex-1 min-w-0`}
                />
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Points"
                  value={draft.maxPoints}
                  onChange={(e) => updateDraft(index, 'maxPoints', e.target.value)}
                  className={`${inputClass} w-28 tabular-nums`}
                />
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  disabled={drafts.length <= 1}
                  title="Remove criterion"
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 disabled:opacity-30 disabled:hover:bg-slate-800 disabled:hover:text-slate-400 text-slate-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={addCriterion}
              className="px-3.5 py-2 min-h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add criterion
            </button>
            <div className="text-sm text-slate-400">
              Total score:{' '}
              <span className="font-bold text-indigo-400 tabular-nums">{draftTotal} pts</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={createRubric.isPending || !isValid}
            className="w-full py-2.5 px-4 min-h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
          >
            {createRubric.isPending ? 'Creating rubric...' : 'Create Rubric'}
          </button>
        </form>
      </section>
    </div>
  );
};
