// src/ui/hooks/useBcAudit.ts
import { useState } from "react";
import type { BonCommande } from "../../domain/bcTypes";
import type { AuditContext, AuditReport } from "../../domain/bcAudit";
import { runBCAuditDeep } from "../../domain/bcAudit";

export function useBcAudit() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);

  async function run(bc: BonCommande, ctx: AuditContext) {
    setRunning(true);
    try {
      const r = await runBCAuditDeep(bc, ctx);
      setReport(r);
      return r;
    } finally {
      setRunning(false);
    }
  }

  return { running, report, run };
}

