import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import api from './api/axios';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CoordinatorTools } from './components/CoordinatorTools';
import { ProposalList } from './components/ProposalList';
import { ProposalForm } from './components/ProposalForm';
import { DeliverablesForm } from './components/DeliverablesForm';
import { PeerEvaluationForm } from './components/PeerEvaluationForm';
import { DefenseScoringForm } from './components/DefenseScoringForm';

import { NotificationToast } from './components/NotificationToast';
import { echo } from './api/echo';

export const App: React.FC = () => {
  const { user, token, fetchMe } = useAuthStore();

  const [topics, setTopics] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [panels, setPanels] = useState<any[]>([]);
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Listen for real-time WebSocket events from Soketi
    if (!echo) return;

    const channel = echo.channel('fyp-notifications');

    channel.listen('.topic.updated', (e: any) => {
      setLiveNotifications((prev) => [e, ...prev]);
      loadDashboardData();
    });

    channel.listen('.supervisor.assigned', (e: any) => {
      setLiveNotifications((prev) => [e, ...prev]);
      loadDashboardData();
    });

    return () => {
      echo?.leaveChannel('fyp-notifications');
    };
  }, []);

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
    const [topicsRes, teamsRes, supervisionsRes, defenseRes] = await Promise.allSettled([
      api.get('/topics'),
      api.get('/teams'),
      api.get('/supervisions'),
      api.get('/defense/panels'),
    ]);

    if (topicsRes.status === 'fulfilled') setTopics(topicsRes.value.data.topics ?? []);
    if (teamsRes.status === 'fulfilled') setTeams(teamsRes.value.data.teams ?? []);
    if (supervisionsRes.status === 'fulfilled') setSupervisors(supervisionsRes.value.data.supervisors ?? []);
    if (defenseRes.status === 'fulfilled') {
      setPanels(defenseRes.value.data.panels ?? []);
      setRubrics(defenseRes.value.data.rubrics ?? []);
    }
  };

  if (!token || !user) {
    return <Login />;
  }

  const isStudent = user.roles.includes('student');
  const isCoordinator = user.roles.includes('coordinator') || user.roles.includes('admin');
  const isSupervisor = user.roles.includes('supervisor');

  // Resolved once here rather than guessed inside each form. When a student
  // belongs to no team this stays null and the forms disable themselves,
  // instead of silently falling back to somebody else's team.
  const myTeam = teams.find((t: any) => t.members?.some((m: any) => m.id === user.id)) ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {message && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-xs underline text-indigo-400">Dismiss</button>
          </div>
        )}

        <HeroBanner />

        {isCoordinator && (
          <CoordinatorTools
            teams={teams}
            supervisors={supervisors}
            onRefresh={loadDashboardData}
            setMessage={setMessage}
          />
        )}

        <ProposalList
          topics={topics}
          isStudent={isStudent}
          isCoordinator={isCoordinator}
          onRefresh={loadDashboardData}
          setMessage={setMessage}
        />

        {isStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProposalForm
              team={myTeam}
              onRefresh={loadDashboardData}
              setMessage={setMessage}
            />
            <DeliverablesForm
              team={myTeam}
              onRefresh={loadDashboardData}
              setMessage={setMessage}
            />
          </div>
        )}

        {isStudent && (
          <PeerEvaluationForm
            team={myTeam}
            user={user}
            setMessage={setMessage}
          />
        )}

        {(isSupervisor || isCoordinator) && (
          <DefenseScoringForm
            teams={teams}
            panels={panels}
            rubrics={rubrics}
            setMessage={setMessage}
          />
        )}
      </main>

      <NotificationToast
        notifications={liveNotifications}
        onDismiss={(index) => setLiveNotifications((prev) => prev.filter((_, i) => i !== index))}
      />
    </div>
  );
};

export default App;
