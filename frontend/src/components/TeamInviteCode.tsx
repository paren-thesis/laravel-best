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
      <div className="bg-sunken border border-line rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-warn/80 mt-0.5" />
        <div className="text-sm text-ink-muted">
          <span className="text-ink-body font-medium">No invite code yet.</span> This team was
          created before invite codes existed, so there is nothing to share. A coordinator needs to
          issue one before anyone can join with a code.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sunken border border-line rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-subtle flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Invite code
          </div>
          <div className="text-xl font-bold font-mono tracking-[0.3em] text-accent mt-1">
            {team.invite_code}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="py-2 px-4 min-h-11 rounded-xl bg-raised hover:bg-raised-hover text-ink-body text-sm font-medium transition-all flex items-center gap-2 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-ok" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-ink-muted">
        {spacesLeft > 0 ? (
          <>
            Share this with teammates so they can join.{' '}
            <span className="text-ink-body">
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
