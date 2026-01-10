'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Input } from '@/components/ui/input';

export function AssignModal({
  open,
  onOpenChange,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAssign: (payload: { employeeId: string; employeeName: string }) => Promise<void> | void;
}) {
  const [employeeId, setEmployeeId] = useState('EMP-001');
  const [employeeName, setEmployeeName] = useState('Agent 1');

  return (
    <FluentModal open={open} onClose={() => onOpenChange(false)} title="Affecter">
      <div className="space-y-4">
        <div className="text-sm text-[rgb(var(--muted))]">
          Affectation réelle = écriture DB + audit. (Tu brancheras plus tard un référentiel RH.)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">Employee ID</div>
            <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">Nom</div>
            <Input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAssign({ employeeId: employeeId.trim(), employeeName: employeeName.trim() })}
            disabled={!employeeId.trim() || !employeeName.trim()}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

