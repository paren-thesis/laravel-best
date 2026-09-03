import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import api from './api/axios';
import {
  GraduationCap, LogOut, CheckCircle2, XCircle, Clock, Plus,
  FileText, Users, Award, ExternalLink, Github, Database, Sparkles, Send
} from 'lucide-react';

export const App: React.FC = () => {
  const { user, token, fetchMe, logout } = useAuthStore();

  const [topics, setTopics] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [rubrics, setRubrics] = useState<any[]>([]);

  // Form states
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalAbstract, setProposalAbstract] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [envDetails, setEnvDetails] = useState('');
  const [selectedTeamForAssign, setSelectedTeamForAssign] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [topicsRes, teamsRes, supervisionsRes, defenseRes] = await Promise.allSettled([
        api.get('/topics'),
        api.get('/teams'),
        api.get('/supervisions'),
        api.get('/defense/panels')
      ]);

      if (topicsRes.status === 'fulfilled') setTopics(topicsRes.value.data.topics);
      if (teamsRes.status === 'fulfilled') setTeams(teamsRes.value.data.teams);
      if (supervisionsRes.status === 'fulfilled') setSupervisors(supervisionsRes.value.data.supervisors);
      if (defenseRes.status === 'fulfilled') setRubrics(defenseRes.value.data.rubrics);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teamId = teams[0]?.id || 1;
      await api.post('/topics', {
        team_id: teamId,
        title: proposalTitle,
        abstract: proposalAbstract,
        problem_statement: problemStatement,
        proposed_solution: proposedSolution,
        tech_stack: ['React', 'Laravel', 'Docker', 'MySQL'],
      });
      setMessage('Project proposal submitted successfully!');
      setProposalTitle('');
      setProposalAbstract('');
      setProblemStatement('');
      setProposedSolution('');
      loadDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error submitting proposal');
    }
  };

  const handleTopicReview = async (topicId: number, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/topics/${topicId}/review`, { status });
      setMessage(`Topic status updated to ${status}`);
      loadDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Review action failed');
    }
  };

  const handleAutoGroup = async () => {
    try {
      const res = await api.post('/teams/auto-group', { course_id: 1 });
      setMessage(res.data.message);
      loadDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Auto-grouping failed');
    }
  };

  const handleAssignSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/supervisions/assign', {
        team_id: selectedTeamForAssign,
        supervisor_id: selectedSupervisor,
      });
      setMessage('Supervisor allocated successfully');
      loadDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Allocation failed');
    }
  };

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teamId = teams[0]?.id || 1;
      await api.post('/deliverables', {
        team_id: teamId,
        github_repository_url: githubUrl,
        google_drive_url: driveUrl,
        environment_details: envDetails,
      });
      setMessage('Deliverable links submitted successfully!');
      loadDashboardData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Submission failed');
    }
  };

  if (!token || !user) {
    return <Login />;
  }

  const isStudent = user.roles.includes('student');
  const isCoordinator = user.roles.includes('coordinator') || user.roles.includes('admin');
  const isSupervisor = user.roles.includes('supervisor');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 tracking-tight text-base">HTU Final Year Project System</h1>
              <p className="text-xs text-slate-400">Ho Technical University — CS Department</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-200">{user.name}</div>
              <div className="text-xs text-indigo-400 capitalize font-mono">
                {user.roles.join(' • ')}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Status Message Banner */}
        {message && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-xs underline text-indigo-400">Dismiss</button>
          </div>
        )}

        {/* Hero Role Indicator Banner */}
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

        {/* Coordinator Controls Section */}
        {isCoordinator && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Coordinator Management Tools
              </h3>
              <button
                onClick={handleAutoGroup}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Run Auto-Grouping Tool
              </button>
            </div>

            {/* Supervisor Allocation Form */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-slate-200 mb-4">Allocate Supervisor to Team (Capacity Enforced)</h4>
              <form onSubmit={handleAssignSupervisor} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  required
                  value={selectedTeamForAssign}
                  onChange={(e) => setSelectedTeamForAssign(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Team...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <select
                  required
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Supervisor...</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.assigned_count}/{s.capacity} teams)
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Assign Supervisor
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Proposals List Section */}
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
              topics.map((t) => (
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
                  {t.tech_stack && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.tech_stack.map((tech: string, i: number) => (
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
              ))
            )}
          </div>
        </section>

        {/* Student Submission Forms */}
        {isStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Proposal Form */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" /> Submit New Project Proposal
              </h3>
              <form onSubmit={handleProposalSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Project Title"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Project Abstract"
                  value={proposalAbstract}
                  onChange={(e) => setProposalAbstract(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Problem Statement"
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Proposed Solution"
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Submit Proposal
                </button>
              </form>
            </section>

            {/* Deliverables Form */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Github className="w-4 h-4 text-indigo-400" /> Submit GitHub & Drive Links
              </h3>
              <form onSubmit={handleDeliverableSubmit} className="space-y-3">
                <input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="url"
                  placeholder="https://drive.google.com/folder-url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={3}
                  placeholder="Environment Credentials / Testing Details for Supervisor"
                  value={envDetails}
                  onChange={(e) => setEnvDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all"
                >
                  Submit Deliverable Links
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
