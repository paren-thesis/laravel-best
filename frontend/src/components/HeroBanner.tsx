import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const HeroBanner: React.FC = () => {
  const { user } = useAuthStore();
  if (!user) return null;

  const isStudent = user.roles.includes('student');
  const isCoordinator = user.roles.includes('coordinator') || user.roles.includes('admin');
  const isSupervisor = user.roles.includes('supervisor');

  return (
    <section className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Authenticated Role Dashboard
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome back, {user.name}
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl">
          {isCoordinator && "Coordinator Dashboard: Review submitted proposals, trigger student auto-grouping, and manage supervisor workload capacity."}
          {isStudent && "Student Dashboard: Create your project team, submit project proposal topics, and upload GitHub & Drive deliverables."}
          {isSupervisor && "Supervisor Dashboard: Manage your assigned project teams and review testing environments."}
        </p>
      </div>
    </section>
  );
};
