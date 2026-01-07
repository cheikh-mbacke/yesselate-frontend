import type { ReactNode } from 'react';
import { BMOLayout } from '@/components/shared/layouts/BMOLayout';

export default function MaitreOuvrageLayout({ children }: { children: ReactNode }) {
  return (
    <BMOLayout>
      {/* Plein écran + scroll interne propre */}
      <div className="h-dvh w-full overflow-hidden">
        <main className="h-full min-h-0 overflow-y-auto">{children}</main>
      </div>
    </BMOLayout>
  );
}
