'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton as Button } from '@/components/ui/fluent-button';

export function RequestComplementModal({
  open,
  onOpenChange,
  demandId,
  onSend,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  demandId: string | null;
  onSend: (message: string) => Promise<void> | void;
}) {
  const [message, setMessage] = useState('');

  return (
    <FluentModal open={open} onClose={() => onOpenChange(false)} title="Demander un complément">
      <div className="space-y-4">
        <div className="text-sm text-[rgb(var(--muted))]">
          Demande: <span className="font-mono">{demandId ?? '—'}</span>
        </div>

        <textarea
          className="w-full min-h-[140px] rounded-xl border border-[rgb(var(--border)/0.55)] bg-transparent p-3 text-sm outline-none"
          placeholder="Explique précisément le complément attendu (pièces, justificatifs, clarification, etc.)…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onSend(message.trim())}
            disabled={!demandId || !message.trim()}
          >
            Envoyer
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

