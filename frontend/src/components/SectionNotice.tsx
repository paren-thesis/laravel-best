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
  <section className="bg-panel border border-line rounded-2xl p-6 space-y-3">
    <h3 className="text-base font-semibold text-ink flex items-center gap-2">
      <TitleIcon className="w-4 h-4 text-accent" /> {title}
    </h3>
    <div className="flex items-start gap-3 text-sm text-ink-muted">
      <NoticeIcon className="w-5 h-5 shrink-0 text-ink-subtle mt-0.5" />
      <p>{message}</p>
    </div>
  </section>
);
