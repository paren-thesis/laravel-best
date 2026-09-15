import React, { useState } from 'react';
import { AlertCircle, Check, Copy, KeyRound } from 'lucide-react';
import type { Team } from '../types';

interface TeamInviteCodeProps {
  team: Team;
}

export const TeamInviteCode: React.FC<TeamInviteCodeProps> = ({ team }) => {
  const [copied, setCopied] = useState(false);

  const maxMembers = team.max_members ?? 4;
  const spacesLeft = Math.max(0, maxMembers - team.members.length);

  const handleCopy = async () => {
    if (!team.invite_code) return;
    try {
      await navigator.clipboard.writeText(team.invite_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the code is on screen to read anyway.
    }
  };

  // Teams that existed before the invite_code column was added have none, and
  // the generator only runs when a team is created.
  if (!team.invite_code) {
    return (
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400/80 mt-0.5" />
        <div className="text-sm text-slate-400">
          <span className="text-slate-300 font-medium">No invite code yet.</span> This team was
          created before invite codes existed, so there is nothing to share. A coordinator needs to
          issue one before anyone can join with a code.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Invite code
          </div>
          <div className="text-xl font-bold font-mono tracking-[0.3em] text-indigo-400 mt-1">
            {team.invite_code}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="py-2 px-4 min-h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all flex items-center gap-2 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400">
        {spacesLeft > 0 ? (
          <>
            Share this with teammates so they can join.{' '}
            <span className="text-slate-300">
              {spacesLeft} place{spacesLeft === 1 ? '' : 's'} left
            </span>{' '}
            of {maxMembers}.
          </>
        ) : (
          <>This team is full — {maxMembers} of {maxMembers} places taken.</>
        )}
      </p>
    </div>
  );
};
