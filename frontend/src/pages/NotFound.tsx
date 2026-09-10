import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFound: React.FC = () => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
    <Compass className="w-10 h-10 text-slate-600 mx-auto" />
    <div>
      <h2 className="text-lg font-semibold text-slate-100">Page not found</h2>
      <p className="text-sm text-slate-400 mt-1">
        That address does not match any part of the portal.
      </p>
    </div>
    <Link
      to="/"
      className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all"
    >
      Back to overview
    </Link>
  </div>
);
