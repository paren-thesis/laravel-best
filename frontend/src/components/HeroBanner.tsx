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
    // The accent wash reads as a tint of whichever ground is behind it, so the
    // same gradient works on the dark panel and on white.
    <section className="bg-gradient-to-r from-accent/15 via-panel to-panel border border-line rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Authenticated Role Dashboard
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Welcome back, {user.name}
        </h2>
        <p className="text-ink-muted text-sm max-w-2xl">
          {isCoordinator && "Coordinator Dashboard: Review submitted proposals, trigger student auto-grouping, and manage supervisor workload capacity."}
          {isStudent && "Student Dashboard: Create your project team, submit project proposal topics, and upload GitHub & Drive deliverables."}
          {isSupervisor && "Supervisor Dashboard: Manage your assigned project teams and review testing environments."}
        </p>
      </div>
    </section>
  );
};
