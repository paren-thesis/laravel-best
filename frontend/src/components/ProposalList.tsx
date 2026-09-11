import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { errorMessage, useReviewTopic, useTopics } from '../api/queries';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { parseTechStack } from '../types';
import type { TopicStatus } from '../types';

const statusClass = (status: TopicStatus): string => {
  if (status === 'approved') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (status === 'rejected') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
};

export const ProposalList: React.FC = () => {
  const { data: topics = [], isLoading, isError } = useTopics();
  const hasRole = useAuthStore((state) => state.hasRole);
  const setMessage = useUiStore((state) => state.setMessage);
  const reviewTopic = useReviewTopic();

  const isStudent = hasRole('student');
  const canReview = hasRole('coordinator', 'admin');

  const handleReview = (topicId: number, status: 'approved' | 'rejected') => {
    reviewTopic.mutate(
      { topicId, status },
      {
        onSuccess: () => setMessage(`Topic status updated to ${status}`),
        onError: (error) => setMessage(errorMessage(error, 'Review action failed')),
      },
    );
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-400" />
        {isStudent
          ? "My Team's Proposals & Approved Topics Bank"
          : 'Department Proposal Submissions & Review Queue'}
      </h3>

      {isLoading && (
        <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          Loading proposals...
        </div>
      )}

      {isError && (
        <div className="p-8 text-center bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          Could not load proposals. Check that the API is running.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.length === 0 ? (
            <div className="md:col-span-2 p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              No project proposals submitted yet.
            </div>
          ) : (
            topics.map((t) => {
              const stackList = parseTechStack(t.tech_stack);

              return (
                <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-base">{t.title}</h4>
                      <p className="text-xs text-slate-400">Team: {t.team?.name ?? 'Unassigned'}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shrink-0 ${statusClass(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3">{t.abstract}</p>

                  {stackList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stackList.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {canReview && t.status === 'submitted' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleReview(t.id, 'approved')}
                        disabled={reviewTopic.isPending}
                        className="flex-1 py-2 px-3 min-h-11 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-50 text-emerald-400 text-xs font-medium rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(t.id, 'rejected')}
                        disabled={reviewTopic.isPending}
                        className="flex-1 py-2 px-3 min-h-11 bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-400 text-xs font-medium rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
