import type { ReactNode } from 'react';
import Card from '@shared/ui/Card';

export default function ChartCard({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold">{title}</p>
      {subtitle && <p className="text-xs text-neutral-400 mb-1">{subtitle}</p>}
      <div className="mt-2 h-64 w-full">{children}</div>
    </Card>
  );
}
