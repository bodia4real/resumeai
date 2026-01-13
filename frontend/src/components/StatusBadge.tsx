import { cn } from '@/lib/utils';

type Status = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  saved: {
    label: 'Saved',
    className: 'status-saved',
  },
  applied: {
    label: 'Applied',
    className: 'status-applied',
  },
  interview: {
    label: 'Interview',
    className: 'status-interview',
  },
  offer: {
    label: 'Offer',
    className: 'status-offer',
  },
  rejected: {
    label: 'Rejected',
    className: 'status-rejected',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
