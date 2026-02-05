export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';

type DelegationExport = {
  id: string;
  type: string;
  bureau: string;
  agentName: string;
  agentRole: string | null;
  status: string;
  startDate: string;
  endDate: string;
  maxAmount: number | null;
  usageCount: number;
  delegatorName: string;
  hash: string | null;
  scope: string;
};

const toCsv = (rows: DelegationExport[]) => {
  const headers = [
    'id',
    'type',
    'bureau',
    'agentName',
    'agentRole',
    'status',
    'startDate',
    'endDate',
    'maxAmount',
    'usageCount',
    'delegatorName',
    'scope',
  ];
  const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => esc(r[h as keyof DelegationExport])).join(',')),
  ];
  return lines.join('\n');
};

const toHtml = (rows: DelegationExport[], queue: string) => {
  const dateStr = new Date().toLocaleString('fr-FR');
  const statusLabels: Record<string, string> = {
    active: 'Active',
    expired: 'Expirée',
    revoked: 'Révoquée',
    suspended: 'Suspendue',
  };
  
  const tableRows = rows.map(r => {
    const statusColor = r.status === 'active' ? '#10b981' : r.status === 'revoked' ? '#ef4444' : r.status === 'suspended' ? '#f59e0b' : '#64748b';
    const amount = r.maxAmount ? new Intl.NumberFormat('fr-FR').format(r.maxAmount) + ' FCFA' : '—';
    return `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:#7c3aed;">${r.id}</td>
        <td>${r.type}</td>
        <td>${r.agentName}<br/><small style="color:#64748b;">${r.agentRole ?? ''}</small></td>
        <td>${r.bureau}</td>
        <td>${new Date(r.startDate).toLocaleDateString('fr-FR')}</td>
        <td>${new Date(r.endDate).toLocaleDateString('fr-FR')}</td>
        <td><span style="color:${statusColor};font-weight:500;">${statusLabels[r.status] ?? r.status}</span></td>
        <td style="text-align:right;">${r.usageCount}</td>
        <td style="text-align:right;font-family:monospace;font-size:11px;">${amount}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Délégations - Export ${queue} - ${dateStr}</title>
  <style>
    @page { margin: 12mm; size: A4 landscape; }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #7c3aed; }
    .subtitle { font-size: 12px; color: #64748b; margin-bottom: 16px; }
    .meta { display: flex; gap: 24px; margin-bottom: 16px; font-size: 11px; color: #64748b; }
    .meta-item { display: flex; gap: 6px; align-items: center; }
    .meta-value { color: #0f172a; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
    th { text-align: left; padding: 8px 6px; border-bottom: 2px solid #e5e7eb; font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr:hover { background-color: #f8fafc; }
    .footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    .hash-info { background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 10px 14px; margin-top: 20px; font-size: 11px; }
    .hash-info strong { color: #7c3aed; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <h1>📋 Rapport des Délégations</h1>
  <div class="subtitle">Console métier — Gouvernance et traçabilité</div>
  
  <div class="meta">
    <div class="meta-item">File: <span class="meta-value">${queue}</span></div>
    <div class="meta-item">Total: <span class="meta-value">${rows.length} délégation(s)</span></div>
    <div class="meta-item">Exporté: <span class="meta-value">${dateStr}</span></div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Agent</th>
        <th>Bureau</th>
        <th>Début</th>
        <th>Fin</th>
        <th>Statut</th>
        <th style="text-align:right;">Usages</th>
        <th style="text-align:right;">Montant max</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  
  <div class="hash-info">
    <strong>🔒 Traçabilité:</strong> Chaque délégation est signée cryptographiquement (SHA3-256) pour garantir l'intégrité et l'anti-contestation.
  </div>
  
  <div class="footer">
    <span>Document généré automatiquement — Ne pas modifier</span>
    <span>Système de gestion des délégations — ${new Date().getFullYear()}</span>
  </div>
  
  <script class="no-print">
    // Auto-print si paramètre présent
    if (window.location.search.includes('print=true')) {
      window.onload = () => { window.print(); };
    }
  </script>
</body>
</html>`;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get('format') ?? 'csv').toLowerCase();
  const queue = searchParams.get('queue') ?? 'active';

  const now = new Date();
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Construire la clause where selon la queue
  const where: Record<string, unknown> = {};
  
  if (queue === 'active') {
    where.status = 'active';
    where.endDate = { gte: now };
  } else if (queue === 'expiring_soon') {
    where.status = 'active';
    where.endDate = { gte: now, lte: in7Days };
  } else if (queue === 'expired') {
    where.OR = [
      { status: 'expired' },
      { endDate: { lt: now }, status: { notIn: ['revoked', 'suspended'] } }
    ];
  } else if (queue === 'revoked') {
    where.status = 'revoked';
  } else if (queue === 'suspended') {
    where.status = 'suspended';
  }
  // 'all' = pas de filtre

  const items = await prisma.delegation.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy: { endsAt: 'asc' },
    take: 2000,
  });

  const payload: DelegationExport[] = items.map(d => ({
    id: d.id,
    type: d.object,
    bureau: d.bureau,
    agentName: d.delegateName,
    agentRole: d.delegateRole,
    status: d.status,
    startDate: d.startsAt.toISOString(),
    endDate: d.endsAt.toISOString(),
    maxAmount: d.maxAmount,
    usageCount: d.usageCount,
    delegatorName: d.grantorName,
    hash: d.headHash || d.decisionHash || null,
    scope: 'all',
  }));

  if (format === 'json') {
    return new Response(JSON.stringify({ items: payload, total: payload.length, exportedAt: new Date().toISOString() }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="delegations_${queue}_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  if (format === 'html' || format === 'pdf') {
    const html = toHtml(payload, queue);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  // default CSV
  const csv = toCsv(payload);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="delegations_${queue}_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

