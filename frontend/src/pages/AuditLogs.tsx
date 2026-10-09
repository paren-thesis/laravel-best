import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Filter,
  RefreshCw,
  ScrollText,
  Search,
  User,
} from 'lucide-react';
import { useAuditLogs } from '../api/queries';

const actionBadges: Record<string, { label: string; color: string }> = {
  'user.login': { label: 'LOGIN', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'user.logout': { label: 'LOGOUT', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'topic.submitted': { label: 'PROPOSAL SUBMITTED', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'topic.approved': { label: 'PROPOSAL APPROVED', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'topic.rejected': { label: 'PROPOSAL REJECTED', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  'topic.revision_requested': { label: 'REVISION REQUESTED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'team.created': { label: 'TEAM CREATED', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'team.joined': { label: 'TEAM JOINED', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'team.auto_grouped': { label: 'AUTO GROUPED', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'peer_evaluation.submitted': { label: 'PEER EVALUATION', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  'supervisor.assigned': { label: 'SUPERVISOR ASSIGNED', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  'deliverable.submitted': { label: 'DELIVERABLE UPLOADED', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  'rubric.created': { label: 'RUBRIC CREATED', color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
  'defense.evaluated': { label: 'DEFENSE EVALUATED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

export const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useAuditLogs({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    action: actionFilter || undefined,
  });

  const togglePayload = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-indigo-400" /> System Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable system event trailing for proposals, team changes, defense scoring, and security events.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, action, or IP address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Filter dropdown */}
        <div className="relative w-full md:w-64">
          <Filter className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">All Event Actions</option>
            <option value="user.login">Login Events</option>
            <option value="user.logout">Logout Events</option>
            <option value="topic.submitted">Proposal Submissions</option>
            <option value="topic.approved">Approved Proposals</option>
            <option value="topic.rejected">Rejected Proposals</option>
            <option value="topic.revision_requested">Revision Requests</option>
            <option value="team.created">Team Creations</option>
            <option value="team.joined">Team Joins</option>
            <option value="team.auto_grouped">Auto Groupings</option>
            <option value="peer_evaluation.submitted">Peer Evaluations</option>
            <option value="supervisor.assigned">Supervisor Allocations</option>
            <option value="deliverable.submitted">Deliverable Uploads</option>
            <option value="rubric.created">Rubric Creations</option>
            <option value="defense.evaluated">Defense Scoring</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
            <p className="text-sm">Loading audit events...</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ScrollText className="w-10 h-10 mx-auto text-slate-600" />
            <p className="font-medium text-slate-300">No audit log entries found</p>
            <p className="text-xs text-slate-500">Try broadening your search or action filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Action</th>
                  <th className="px-6 py-3.5 font-semibold">Description</th>
                  <th className="px-6 py-3.5 font-semibold">IP Address</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.data.map((log) => {
                  const badge = actionBadges[log.action] ?? {
                    label: log.action.toUpperCase(),
                    color: 'bg-slate-800 text-slate-300 border-slate-700',
                  };
                  const isExpanded = expandedId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold text-xs">
                                {log.user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-medium text-white">{log.user.name}</div>
                                <div className="text-[11px] text-slate-400">{log.user.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 italic">
                              <User className="w-3.5 h-3.5" /> System / Guest
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-200 max-w-md break-words">
                          {log.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                          {log.ip_address || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {log.payload && Object.keys(log.payload).length > 0 ? (
                            <button
                              onClick={() => togglePayload(log.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isExpanded
                                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                              }`}
                              title="Toggle payload JSON"
                            >
                              <Code2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Payload Viewer */}
                      {isExpanded && log.payload ? (
                        <tr className="bg-slate-950/90 border-b border-slate-800">
                          <td colSpan={6} className="px-6 py-3">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-sans mb-1 font-semibold">
                                Event Metadata Payload:
                              </div>
                              <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Standard Pagination Footer */}
        {data && data.last_page > 1 ? (
          <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-200">{data.from}</span> to{' '}
              <span className="font-semibold text-slate-200">{data.to}</span> of{' '}
              <span className="font-semibold text-slate-200">{data.total}</span> audit records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.current_page === 1 || isFetching}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs text-slate-400 px-2 font-mono">
                Page <span className="text-slate-200 font-semibold">{data.current_page}</span> of{' '}
                <span className="text-slate-200 font-semibold">{data.last_page}</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                disabled={data.current_page === data.last_page || isFetching}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs text-slate-200 font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
