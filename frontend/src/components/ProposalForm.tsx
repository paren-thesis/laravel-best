import React, { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../api/axios';

interface ProposalFormProps {
  teams: any[];
  user: any;
  onRefresh: () => void;
  setMessage: (msg: string) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  teams,
  user,
  onRefresh,
  setMessage,
}) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalAbstract, setProposalAbstract] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const myTeam = teams.find((t: any) => t.members?.some((m: any) => m.id === user?.id)) || teams[0];
      const teamId = myTeam?.id || 1;
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
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error submitting proposal');
    }
  };

  return (
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
  );
};
