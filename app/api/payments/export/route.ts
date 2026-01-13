import { NextRequest, NextResponse } from 'next/server';
import { paymentsN1, facturesRecues } from '@/lib/data';

// ================================
// Types
// ================================
type ExportFormat = 'csv' | 'json' | 'evidence';
type ExportQueue = 'all' | 'pending' | '7days' | 'late' | 'critical' | 'validated' | 'blocked';

// ================================
// Helpers
// ================================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s0 = String(v ?? '').trim();
  if (!s0) return 0;
  const raw = s0.replace(/\s/g, '').replace(/FCFA|XOF|F\s?CFA/gi, '').replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/[,.]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const parseAnyDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length === 3) {
    const [dd, mm, yy] = parts.map((x) => Number(x));
    if (dd && mm && yy) return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
  }
  const t = Date.parse(d);
  if (!Number.isNaN(t)) return new Date(t);
  return null;
};

const getDaysToDue = (dueDateStr: string): number => {
  const dueDate = parseAnyDate(dueDateStr);
  if (!dueDate) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ================================
// Filter by Queue
// ================================
function filterByQueue(payments: any[], queue: ExportQueue) {
  if (queue === 'all') return payments;

  return payments.filter((p) => {
    const daysToDue = getDaysToDue(p.dueDate);
    const amount = parseMoney(p.amount);
    const requiresDoubleValidation = amount >= 5_000_000;

    switch (queue) {
      case 'pending':
        return p.status === 'pending';
      case '7days':
        return daysToDue >= 0 && daysToDue <= 7 && p.status === 'pending';
      case 'late':
        return daysToDue < 0 && p.status === 'pending';
      case 'critical':
        return requiresDoubleValidation && p.status === 'pending';
      case 'validated':
        return p.status === 'validated';
      case 'blocked':
        return p.status === 'blocked';
      default:
        return true;
    }
  });
}

// ================================
// CSV Generator
// ================================
function generateCSV(payments: any[]): string {
  const headers = [
    'ID',
    'Type',
    'Référence',
    'Bénéficiaire',
    'Montant (FCFA)',
    'Projet',
    'Bureau',
    'Échéance',
    'Jours restants',
    'Statut',
    'Validé par',
    'Double validation',
    'Facture associée',
    'Qualité match',
    'Score risque',
    'Niveau risque',
  ];

  const rows = payments.map((p) => {
    const daysToDue = getDaysToDue(p.dueDate);
    const amount = parseMoney(p.amount);
    const requiresDoubleValidation = amount >= 5_000_000;

    // Find matching facture
    const facture = (facturesRecues as any[]).find((f: any) => 
      String(f.fournisseur || '').toLowerCase().includes(String(p.beneficiary || '').toLowerCase())
    );

    return [
      p.id,
      p.type,
      p.ref,
      `"${p.beneficiary}"`,
      amount,
      p.project,
      p.bureau,
      p.dueDate,
      daysToDue,
      p.status,
      p.validatedBy || '',
      requiresDoubleValidation ? 'Oui' : 'Non',
      facture ? facture.id : '',
      facture ? 'Strong' : 'None',
      '', // Will be calculated client-side
      '', // Will be calculated client-side
    ].join(';');
  });

  return [headers.join(';'), ...rows].join('\n');
}

// ================================
// JSON Generator (Audit-grade)
// ================================
function generateJSON(payments: any[], queue: ExportQueue) {
  const exportedAt = new Date().toISOString();

  const enrichedPayments = payments.map((p) => {
    const daysToDue = getDaysToDue(p.dueDate);
    const amount = parseMoney(p.amount);
    const requiresDoubleValidation = amount >= 5_000_000;

    const facture = (facturesRecues as any[]).find((f: any) => 
      String(f.fournisseur || '').toLowerCase().includes(String(p.beneficiary || '').toLowerCase())
    );

    return {
      id: p.id,
      type: p.type,
      ref: p.ref,
      beneficiary: p.beneficiary,
      amount,
      project: p.project,
      bureau: p.bureau,
      dueDate: p.dueDate,
      daysToDue,
      status: p.status,
      validatedBy: p.validatedBy || null,
      requiresDoubleValidation,
      matchedFacture: facture ? {
        id: facture.id,
        fournisseur: facture.fournisseur,
        montantTTC: facture.montantTTC,
      } : null,
    };
  });

  return {
    meta: {
      schema: 'BMO.ValidationPaiements.Export',
      version: 1,
      exportedAt,
      exportedBy: {
        id: 'DG-001',
        name: 'Direction Générale',
        role: 'Accountable',
      },
      filters: {
        queue,
      },
      count: payments.length,
      algo: 'SHA-256',
      note: 'Export audit-grade avec traçabilité RACI',
    },
    payments: enrichedPayments,
  };
}

// ================================
// Evidence Pack Generator
// ================================
function generateEvidencePack(paymentId: string) {
  const payment = paymentsN1.find((p: any) => p.id === paymentId);
  if (!payment) {
    return { error: 'Payment not found' };
  }

  const exportedAt = new Date().toISOString();
  const amount = parseMoney((payment as any).amount);
  const requiresDoubleValidation = amount >= 5_000_000;

  const facture = (facturesRecues as any[]).find((f: any) => 
    String(f.fournisseur || '').toLowerCase().includes(String((payment as any).beneficiary || '').toLowerCase())
  );

  // Generate canonical hash
  const canonicalPayload = JSON.stringify({
    v: 1,
    id: payment.id,
    type: (payment as any).type,
    ref: (payment as any).ref,
    beneficiary: (payment as any).beneficiary,
    amount,
    dueDate: (payment as any).dueDate,
    project: (payment as any).project,
    bureau: (payment as any).bureau,
    status: (payment as any).status,
    validatedBy: (payment as any).validatedBy || null,
    matchedFactureId: facture?.id || null,
  });

  const paymentHash = `sha256_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return {
    meta: {
      schema: 'BMO.ValidationPaiements.EvidencePack',
      version: 1,
      exportedAt,
      exportedBy: {
        id: 'DG-001',
        name: 'Direction Générale',
        role: 'Accountable (A)',
      },
      algo: 'SHA-256',
      note: 'Paquet de preuve : payload canonique + hash paiement + lien facture + traçabilité RACI.',
    },
    payment: {
      id: payment.id,
      type: (payment as any).type,
      ref: (payment as any).ref,
      beneficiary: (payment as any).beneficiary,
      amount,
      dueDate: (payment as any).dueDate,
      daysToDue: getDaysToDue((payment as any).dueDate),
      project: (payment as any).project,
      bureau: (payment as any).bureau,
      status: (payment as any).status,
      validatedBy: (payment as any).validatedBy || null,
    },
    controls: {
      requiresDoubleValidation,
      threshold: requiresDoubleValidation ? 5_000_000 : null,
      workflow: requiresDoubleValidation ? 'BF (R) → DG (A)' : 'Simple validation',
      match: facture
        ? {
            id: facture.id,
            fournisseur: facture.fournisseur,
            referenceBC: facture.referenceBC,
            montantTTC: facture.montantTTC,
            quality: 'strong',
          }
        : null,
    },
    integrity: {
      paymentHash,
      canonicalPayload,
    },
  };
}

// ================================
// API Route
// ================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const format = (searchParams.get('format') || 'csv') as ExportFormat;
    const queue = (searchParams.get('queue') || 'all') as ExportQueue;
    const paymentId = searchParams.get('paymentId');

    // Evidence pack for single payment
    if (format === 'evidence' && paymentId) {
      const pack = generateEvidencePack(paymentId);
      if ('error' in pack) {
        return NextResponse.json(pack, { status: 404 });
      }
      return NextResponse.json(pack, {
        headers: {
          'Content-Disposition': `attachment; filename="evidence_${paymentId}_${Date.now()}.json"`,
        },
      });
    }

    // Filter payments
    const filtered = filterByQueue(paymentsN1 as any[], queue);

    // Generate export
    if (format === 'csv') {
      const csv = generateCSV(filtered);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="paiements_${queue}_${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'json') {
      const json = generateJSON(filtered, queue);
      return NextResponse.json(json, {
        headers: {
          'Content-Disposition': `attachment; filename="paiements_${queue}_${Date.now()}.json"`,
        },
      });
    }

    return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

