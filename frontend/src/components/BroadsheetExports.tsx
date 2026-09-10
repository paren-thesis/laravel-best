import React, { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { downloadFile, readApiError } from '../api/download';
import { useUiStore } from '../store/useUiStore';

type ExportFormat = 'csv' | 'pdf';

export const BroadsheetExports: React.FC = () => {
  const setMessage = useUiStore((state) => state.setMessage);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      await downloadFile(`/exports/broadsheet/${format}`, `htu_fyp_broadsheet.${format}`);
      setMessage(`Broadsheet downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      setMessage(await readApiError(err, `${format.toUpperCase()} export failed`));
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <FileDown className="w-5 h-5 text-indigo-400" /> Department Broadsheet Exports
      </h3>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <p className="text-sm text-slate-400 max-w-2xl">
          Exports every team with its course, members, approved topic and assigned supervisor.
          The file downloads through your signed-in session.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-50 text-emerald-300 border border-emerald-500/30 font-medium text-sm rounded-xl transition-all flex items-center gap-2"
          >
            {exporting === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Export as CSV
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-300 border border-rose-500/30 font-medium text-sm rounded-xl transition-all flex items-center gap-2"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Export as PDF
          </button>
        </div>
      </div>
    </section>
  );
};
