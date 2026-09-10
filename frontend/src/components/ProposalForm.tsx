import React, { useState } from 'react';
import { Send, UsersRound } from 'lucide-react';
import { errorMessage, useCreateTopic } from '../api/queries';
import { useMyTeam } from '../hooks/useMyTeam';
import { useUiStore } from '../store/useUiStore';
import { SectionNotice } from './SectionNotice';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500';

export const ProposalForm: React.FC = () => {
  const { team, isLoading } = useMyTeam();
  const setMessage = useUiStore((state) => state.setMessage);
  const createTopic = useCreateTopic();

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [techStack, setTechStack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    createTopic.mutate(
      {
        team_id: team.id,
        title,
        abstract,
        problem_statement: problemStatement,
        proposed_solution: proposedSolution,
        tech_stack: techStack.split(',').map((tech) => tech.trim()).filter(Boolean),
      },
      {
        onSuccess: () => {
          setMessage('Project proposal submitted successfully!');
          setTitle('');
          setAbstract('');
          setProblemStatement('');
          setProposedSolution('');
          setTechStack('');
        },
        onError: (error) => setMessage(errorMessage(error, 'Error submitting proposal')),
      },
    );
  };

  if (isLoading) {
    return (
      <SectionNotice
        title="Submit New Project Proposal"
        titleIcon={Send}
        message="Loading your team..."
      />
    );
  }

  if (!team) {
    return (
      <SectionNotice
        title="Submit New Project Proposal"
        titleIcon={Send}
        noticeIcon={UsersRound}
        message="You are not a member of any project team yet. Join or create a team before submitting a proposal."
      />
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <textarea
          required
          rows={3}
          placeholder="Project Abstract"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
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
          disabled={createTopic.isPending}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
        >
          {createTopic.isPending ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </section>
  );
};
