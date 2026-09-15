import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { errorMessage, useReviewTopic, useTopics } from '../api/queries';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { parseTechStack } from '../types';
import type { TopicStatus } from '../types';

const statusClass = (status: TopicStatus): string => {
  if (status === 'approved') return 'bg-ok/10 text-ok border-ok/20';
  if (status === 'rejected') return 'bg-danger/10 text-danger border-danger/20';
  return 'bg-warn/10 text-warn border-warn/20';
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
      <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
        <FileText className="w-5 h-5 text-accent" />
        {isStudent
          ? "My Team's Proposals & Approved Topics Bank"
          : 'Department Proposal Submissions & Review Queue'}
      </h3>

      {isLoading && (
        <div className="p-8 text-center bg-panel/60 border border-line rounded-2xl text-ink-subtle text-sm">
          Loading proposals...
        </div>
      )}

      {isError && (
        <div className="p-8 text-center bg-danger/5 border border-danger/20 rounded-2xl text-danger text-sm">
          Could not load proposals. Check that the API is running.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.length === 0 ? (
            <div className="md:col-span-2 p-8 text-center bg-panel/60 border border-line rounded-2xl text-ink-subtle text-sm">
              No project proposals submitted yet.
            </div>
          ) : (
            topics.map((t) => {
              const stackList = parseTechStack(t.tech_stack);

              return (
                <div key={t.id} className="bg-panel border border-line rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-ink text-base">{t.title}</h4>
                      <p className="text-xs text-ink-muted">Team: {t.team?.name ?? 'Unassigned'}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shrink-0 ${statusClass(t.status)}`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <p className="text-xs text-ink-body line-clamp-3">{t.abstract}</p>

                  {stackList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stackList.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-raised text-ink-muted text-[10px] font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {canReview && t.status === 'submitted' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-line">
                      <button
                        onClick={() => handleReview(t.id, 'approved')}
                        disabled={reviewTopic.isPending}
                        className="flex-1 py-2 px-3 min-h-11 bg-ok/15 hover:bg-ok/25 disabled:opacity-50 text-ok text-xs font-medium rounded-xl border border-ok/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(t.id, 'rejected')}
                        disabled={reviewTopic.isPending}
                        className="flex-1 py-2 px-3 min-h-11 bg-danger/15 hover:bg-danger/25 disabled:opacity-50 text-danger text-xs font-medium rounded-xl border border-danger/30 flex items-center justify-center gap-1.5 transition-all"
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
