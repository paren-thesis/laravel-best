import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { errorMessage, useJoinTeam } from '../api/queries';
import { useUiStore } from '../store/useUiStore';

const INVITE_CODE_LENGTH = 6;

export const JoinTeamForm: React.FC = () => {
  const setMessage = useUiStore((state) => state.setMessage);
  const joinTeam = useJoinTeam();

  const [code, setCode] = useState('');

  // Codes are generated uppercase and the API uppercases on the way in, so
  // normalising here keeps what is typed and what is sent the same thing.
  const handleChange = (value: string) => {
    setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, INVITE_CODE_LENGTH));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 0) return;

    joinTeam.mutate(
      { invite_code: code },
      {
        onSuccess: (data) => {
          setMessage(data.message ?? 'Successfully joined the project team.');
          setCode('');
        },
        onError: (error) => setMessage(errorMessage(error, 'Could not join that team')),
      },
    );
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" /> Join an Existing Team
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Ask the team leader for their invite code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Invite code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Invite code"
          className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 min-h-11 text-sm text-slate-200 placeholder-slate-600 font-mono tracking-[0.3em] uppercase focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={joinTeam.isPending || code.length === 0}
          className="py-2.5 px-5 min-h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shrink-0"
        >
          {joinTeam.isPending ? 'Joining...' : 'Join Team'}
        </button>
      </form>
    </section>
  );
};
