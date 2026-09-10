import React from 'react';
import { Info, type LucideIcon } from 'lucide-react';

interface SectionNoticeProps {
  title: string;
  titleIcon: LucideIcon;
  message: string;
  noticeIcon?: LucideIcon;
}

/** A section header with an explanation in place of a form that cannot be used yet. */
export const SectionNotice: React.FC<SectionNoticeProps> = ({
  title,
  titleIcon: TitleIcon,
  message,
  noticeIcon: NoticeIcon = Info,
}) => (
  <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
    <h3 className="text-base font-semibold text-white flex items-center gap-2">
      <TitleIcon className="w-4 h-4 text-indigo-400" /> {title}
    </h3>
    <div className="flex items-start gap-3 text-sm text-slate-400">
      <NoticeIcon className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" />
      <p>{message}</p>
    </div>
  </section>
);
