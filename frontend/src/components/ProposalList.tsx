import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/axios';

interface ProposalListProps {
  topics: any[];
  isStudent: boolean;
  isCoordinator: boolean;
  onRefresh: () => void;
  setMessage: (msg: string) => void;
}

export const ProposalList: React.FC<ProposalListProps> = ({
  topics,
  isStudent,
  isCoordinator,
  onRefresh,
  setMessage,
}) => {
  const handleTopicReview = async (topicId: number, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/topics/${topicId}/review`, { status });
      setMessage(`Topic status updated to ${status}`);
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Review action failed');
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-400" />
        {isStudent ? "My Team's Proposals & Approved Topics Bank" : "Department Proposal Submissions & Review Queue"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            No project proposals submitted yet.
          </div>
        ) : (
          topics.map((t) => {
            const stackList = Array.isArray(t.tech_stack)
              ? t.tech_stack
              : (typeof t.tech_stack === 'string' ? JSON.parse(t.tech_stack || '[]') : []);

            return (
              <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-100 text-base">{t.title}</h4>
                    <p className="text-xs text-slate-400">Team: {t.team?.name || 'Team 1'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    t.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    t.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3">{t.abstract}</p>

                {/* Tech Stack Pills */}
                {stackList && stackList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stackList.map((tech: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Coordinator Approval Action Buttons */}
                {isCoordinator && t.status === 'submitted' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleTopicReview(t.id, 'approved')}
                      className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleTopicReview(t.id, 'rejected')}
                      className="flex-1 py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-medium rounded-xl border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all"
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
    </section>
  );
};
