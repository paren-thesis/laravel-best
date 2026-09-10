import React, { useState } from 'react';
import { Send, UsersRound } from 'lucide-react';
import api from '../api/axios';

interface ProposalFormProps {
  team: any | null;
  onRefresh: () => void;
  setMessage: (msg: string) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  team,
  onRefresh,
  setMessage,
}) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalAbstract, setProposalAbstract] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [techStack, setTechStack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setIsSubmitting(true);
    try {
      await api.post('/topics', {
        team_id: team.id,
        title: proposalTitle,
        abstract: proposalAbstract,
        problem_statement: problemStatement,
        proposed_solution: proposedSolution,
        tech_stack: techStack
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean),
      });
      setMessage('Project proposal submitted successfully!');
      setProposalTitle('');
      setProposalAbstract('');
      setProblemStatement('');
      setProposedSolution('');
      setTechStack('');
      onRefresh();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error submitting proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

  if (!team) {
    return (
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-400" /> Submit New Project Proposal
        </h3>
        <div className="flex items-start gap-3 text-sm text-slate-400">
          <UsersRound className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
          <p>You are not a member of any project team yet. Join or create a team before submitting a proposal.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-400" /> Submit New Project Proposal
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Submitting on behalf of <span className="text-indigo-400 font-medium">{team.name}</span>
        </p>
      </div>
      <form onSubmit={handleProposalSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Project Title"
          value={proposalTitle}
          onChange={(e) => setProposalTitle(e.target.value)}
          className={inputClass}
        />
        <textarea
          required
          rows={3}
          placeholder="Project Abstract"
          value={proposalAbstract}
          onChange={(e) => setProposalAbstract(e.target.value)}
          className={inputClass}
        />
        <textarea
          required
          rows={2}
          placeholder="Problem Statement"
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          className={inputClass}
        />
        <textarea
          required
          rows={2}
          placeholder="Proposed Solution"
          value={proposedSolution}
          onChange={(e) => setProposedSolution(e.target.value)}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Tech Stack — comma separated (e.g. React, Laravel, MySQL)"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </section>
  );
};
