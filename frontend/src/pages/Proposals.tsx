import React from 'react';
import { ProposalList } from '../components/ProposalList';
import { ProposalForm } from '../components/ProposalForm';
import { useAuthStore } from '../store/useAuthStore';

export const Proposals: React.FC = () => {
  const hasRole = useAuthStore((state) => state.hasRole);

  return (
    <div className="space-y-8">
      {hasRole('student') && <ProposalForm />}
      <ProposalList />
    </div>
  );
};
