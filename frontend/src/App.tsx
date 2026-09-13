import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Proposals } from './pages/Proposals';
import { MyTeam } from './pages/MyTeam';
import { Supervision } from './pages/Supervision';
import { Rubrics } from './pages/Rubrics';
import { Defense } from './pages/Defense';
import { Reports } from './pages/Reports';
import { NotFound } from './pages/NotFound';

import { RequireAuth } from './routes/RequireAuth';
import { DashboardLayout } from './layouts/DashboardLayout';

export const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    {/* Everything below requires a session. The layout stays mounted across
        navigation so the websocket subscription is not torn down each time. */}
    <Route element={<RequireAuth />}>
      <Route element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="proposals" element={<Proposals />} />

        <Route element={<RequireAuth roles={['student']} />}>
          <Route path="team" element={<MyTeam />} />
        </Route>

        <Route element={<RequireAuth roles={['coordinator', 'admin']} />}>
          <Route path="supervision" element={<Supervision />} />
          <Route path="rubrics" element={<Rubrics />} />
        </Route>

        <Route element={<RequireAuth roles={['supervisor', 'coordinator', 'admin', 'panel_member']} />}>
          <Route path="defense" element={<Defense />} />
        </Route>

        <Route element={<RequireAuth roles={['coordinator', 'admin', 'supervisor']} />}>
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
