import { cn } from '@/lib/utils';

type Status = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<Status, { label: string; className: string; dotColor: string }> = {
  saved: {
    label: 'Saved',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dotColor: 'bg-slate-500',
  },
  applied: {
    label: 'Applied',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dotColor: 'bg-blue-500',
  },
  interview: {
    label: 'Interview',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dotColor: 'bg-amber-500',
  },
  offer: {
    label: 'Offer',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dotColor: 'bg-red-500',
  },
};

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isInterview = status === 'interview';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all',
        config.className,
        isInterview && 'animate-subtle-pulse',
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            config.dotColor,
            isInterview && 'animate-pulse'
          )}
        />
      )}
      {config.label}
    </span>
  );
}
