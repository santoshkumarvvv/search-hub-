import Link from 'next/link';
import { SearchX } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({ title, description, ctaLabel, ctaHref }: Props) {
  return (
    <div className="card-surface grid place-items-center px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-elevated text-muted">
        <SearchX size={24} />
      </span>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary mt-6 px-5 py-2.5 text-sm">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
