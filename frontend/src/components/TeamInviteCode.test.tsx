import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TeamInviteCode } from './TeamInviteCode';
import { makeMember, makeTeam } from '../test/utils';

const members = (count: number) =>
  Array.from({ length: count }, (_, i) => makeMember(10 + i, `Member ${i + 1}`, i === 0));

describe('TeamInviteCode', () => {
  it('shows the code so a member can share it', () => {
    render(<TeamInviteCode team={makeTeam(1, 'Team Alpha', members(2), 'UWFVCW')} />);

    expect(screen.getByText('UWFVCW')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy/ })).toBeInTheDocument();
  });

  it('reports how many places are left', () => {
    render(<TeamInviteCode team={makeTeam(1, 'Team Alpha', members(2), 'UWFVCW')} />);

    expect(screen.getByText(/2 places left/)).toBeInTheDocument();
  });

  it('uses the singular when one place remains', () => {
    render(<TeamInviteCode team={makeTeam(1, 'Team Alpha', members(3), 'UWFVCW')} />);

    expect(screen.getByText(/1 place left/)).toBeInTheDocument();
  });

  it('says so when the team is full instead of offering places', () => {
    render(<TeamInviteCode team={makeTeam(1, 'Team Alpha', members(4), 'UWFVCW')} />);

    expect(screen.getByText(/This team is full/)).toBeInTheDocument();
    expect(screen.queryByText(/places left/)).not.toBeInTheDocument();
  });

  // Every team seeded before the invite_code column was added has none, since
  // the generator only runs in a `creating` hook.
  it('explains itself for a team that has no code, rather than showing a blank', () => {
    render(<TeamInviteCode team={makeTeam(1, 'Team Alpha', members(2), null)} />);

    expect(screen.getByText(/No invite code yet/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copy/ })).not.toBeInTheDocument();
  });
});
