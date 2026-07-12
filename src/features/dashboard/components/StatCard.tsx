import type { ReactNode } from 'react';
import Card from '@shared/ui/Card';

type Tone = 'entrada' | 'saida' | 'info' | 'alerta' | 'primary';
const toneText: Record<Tone, string> = {
  entrada: 'text-feira-entrada', saida: 'text-feira-saida', info: 'text-feira-info',
  alerta: 'text-feira-alerta', primary: 'text-feira-primary dark:text-white'
};
const toneBg: Record<Tone, string> = {
  entrada: 'bg-feira-entrada/10', saida: 'bg-feira-saida/10', info: 'bg-feira-info/10',
  alerta: 'bg-feira-alerta/15', primary: 'bg-feira-primary/10'
};

export default function StatCard({ label, value, tone = 'primary', icon, sub }: {
  label: string; value: string; tone?: Tone; icon?: ReactNode; sub?: string;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
        {icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneBg[tone]} ${toneText[tone]}`}>{icon}</div>}
      </div>
      <span className={`font-display font-semibold text-xl md:text-2xl ${toneText[tone]}`}>{value}</span>
      {sub && <span className="text-xs text-neutral-400">{sub}</span>}
    </Card>
  );
}
