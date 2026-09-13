import React, { useState } from 'react';
import { AlertCircle, UsersRound } from 'lucide-react';
import { errorMessage, useCreateTeam } from '../api/queries';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { SectionNotice } from './SectionNotice';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 min-h-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500';

export const CreateTeamForm: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setMessage = useUiStore((state) => state.setMessage);
  const createTeam = useCreateTeam();

  const [name, setName] = useState('');

  // There is no /courses endpoint, and a student's team belongs to their own
  // course anyway, so this comes from their profile rather than a picker.
  const course = user?.profile?.course ?? null;
  const courseId = user?.profile?.course_id ?? null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    createTeam.mutate(
      { name: name.trim(), course_id: courseId },
      {
        onSuccess: (data) => {
          setMessage(data.message ?? 'Team created successfully');
          setName('');
        },
        onError: (error) => setMessage(errorMessage(error, 'Could not create the team')),
      },
    );
  };

  if (!courseId) {
    return (
      <SectionNotice
        title="Create a Project Team"
        titleIcon={UsersRound}
        noticeIcon={AlertCircle}
        message="Your student profile has no course assigned, so a team cannot be created yet. Ask the project coordinator to set your course."
      />
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <UsersRound className="w-4 h-4 text-indigo-400" /> Create a Project Team
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          You will be registered as the team leader. Teams are created under your own course
          {course ? (
            <>
              , <span className="text-indigo-400 font-medium">{course.name}</span>
            </>
          ) : null}
          .
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          maxLength={255}
          placeholder="Team name (e.g. Team Horizon)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={createTeam.isPending || name.trim().length === 0}
          className="w-full py-2.5 px-4 min-h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {createTeam.isPending ? 'Creating team...' : 'Create Team'}
        </button>
      </form>
    </section>
  );
};
