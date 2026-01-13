/**
 * Seed script pour les Délégations v2 (modèle métier complet)
 * ===========================================================
 * 
 * Usage: node prisma/seed-delegations-v2.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// ============================================
// HELPERS
// ============================================

function stableStringify(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';
  const sorted = Object.keys(obj).sort().map(k => `"${k}":${stableStringify(obj[k])}`);
  return '{' + sorted.join(',') + '}';
}

function hashDecision(payload) {
  return crypto.createHash('sha256').update(stableStringify(payload), 'utf8').digest('hex');
}

function hashChain(prev, payload) {
  return crypto.createHash('sha256').update(prev + ':' + stableStringify(payload), 'utf8').digest('hex');
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ============================================
// DATA
// ============================================

const bureaux = [
  'Bureau Travaux',
  'Bureau Études',
  'Bureau Finances',
  'Bureau Juridique',
  'Direction Générale',
  'Bureau Achats',
];

const categories = ['SIGNATURE', 'ENGAGEMENT', 'PAIEMENT', 'VALIDATION', 'REPRESENTATION', 'OPERATIONNEL'];

const actions = [
  'APPROVE_PAYMENT',
  'SIGN_CONTRACT',
  'APPROVE_PURCHASE_ORDER',
  'VALIDATE_CHANGE_ORDER',
  'APPROVE_RECEPTION',
  'COMMIT_BUDGET',
];

const people = [
  { id: 'USR-001', name: 'M. Konaté Ibrahim', role: 'Directeur Général', email: 'konate@yesselate.ci' },
  { id: 'USR-002', name: 'Mme Diallo Fatou', role: 'Directrice Financière', email: 'diallo@yesselate.ci' },
  { id: 'USR-003', name: 'M. Touré Ahmed', role: 'Chef Bureau Travaux', email: 'toure@yesselate.ci' },
  { id: 'USR-004', name: 'M. Bamba Sékou', role: 'Chef Bureau Études', email: 'bamba@yesselate.ci' },
  { id: 'USR-005', name: 'Mme Koné Aminata', role: 'Responsable Achats', email: 'kone@yesselate.ci' },
  { id: 'USR-006', name: 'M. Ouattara Drissa', role: 'Juriste principal', email: 'ouattara@yesselate.ci' },
  { id: 'USR-007', name: 'M. Cissé Mamadou', role: 'Chef de projet', email: 'cisse@yesselate.ci' },
  { id: 'USR-008', name: 'Mme Sanogo Mariame', role: 'Contrôleur interne', email: 'sanogo@yesselate.ci' },
];

const now = new Date();

// ============================================
// SEED
// ============================================

async function main() {
  console.log('🌱 Seeding delegations v2...');

  // Nettoyer
  await prisma.delegationUsage.deleteMany();
  await prisma.delegationEvent.deleteMany();
  await prisma.delegationEngagement.deleteMany();
  await prisma.delegationActor.deleteMany();
  await prisma.delegationPolicy.deleteMany();
  await prisma.delegation.deleteMany();

  // Créer les délégations
  const delegations = [
    {
      id: 'DEL-2024-001',
      code: 'DEL-001',
      title: 'Délégation signature BC - Bureau Travaux',
      category: 'SIGNATURE',
      status: 'active',
      object: 'Signature des bons de commande pour les travaux de construction',
      description: 'Cette délégation autorise M. Touré à signer les bons de commande relatifs aux travaux de construction, dans la limite de 50 millions XOF par opération.',
      legalBasis: 'Décision DG n°2024-012 du 15/01/2024',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      grantorRole: 'Directeur Général',
      grantorEmail: 'konate@yesselate.ci',
      delegateId: 'USR-003',
      delegateName: 'M. Touré Ahmed',
      delegateRole: 'Chef Bureau Travaux',
      delegateEmail: 'toure@yesselate.ci',
      bureau: 'Bureau Travaux',
      startsAt: addDays(now, -60),
      endsAt: addDays(now, 120),
      extendable: 1,
      maxExtensions: 2,
      extensionDays: 90,
      projectScopeMode: 'ALL',
      bureauScopeMode: 'INCLUDE',
      bureauScopeList: JSON.stringify(['Bureau Travaux']),
      supplierScopeMode: 'ALL',
      maxAmount: 50000000,
      maxTotalAmount: 500000000,
      currency: 'XOF',
      requiresDualControl: 1,
      requiresFinanceCheck: 1,
      usageCount: 12,
      usageTotalAmount: 145000000,
      decisionRef: 'DG-2024-012',
      decisionDate: addDays(now, -65),
    },
    {
      id: 'DEL-2024-002',
      code: 'DEL-002',
      title: 'Délégation validation paiements - Direction Finance',
      category: 'PAIEMENT',
      status: 'active',
      object: 'Validation des paiements fournisseurs jusqu\'à 25M XOF',
      description: 'Mme Diallo est habilitée à valider les paiements fournisseurs dans la limite de 25 millions XOF par opération, avec obligation de double validation au-delà de 15M.',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      delegateId: 'USR-002',
      delegateName: 'Mme Diallo Fatou',
      delegateRole: 'Directrice Financière',
      bureau: 'Bureau Finances',
      startsAt: addDays(now, -90),
      endsAt: addDays(now, 90),
      maxAmount: 25000000,
      maxTotalAmount: 300000000,
      currency: 'XOF',
      requiresDualControl: 0,
      usageCount: 34,
      usageTotalAmount: 280000000,
    },
    {
      id: 'DEL-2024-003',
      code: 'DEL-003',
      title: 'Délégation engagement marchés - Bureau Achats',
      category: 'ENGAGEMENT',
      status: 'active',
      object: 'Engagement des marchés publics et contrats fournisseurs',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      delegateId: 'USR-005',
      delegateName: 'Mme Koné Aminata',
      delegateRole: 'Responsable Achats',
      bureau: 'Bureau Achats',
      startsAt: addDays(now, -30),
      endsAt: addDays(now, 10), // Expire bientôt!
      maxAmount: 30000000,
      currency: 'XOF',
      requiresLegalReview: 1,
      usageCount: 5,
      usageTotalAmount: 78000000,
    },
    {
      id: 'DEL-2024-004',
      code: 'DEL-004',
      title: 'Délégation signature contrats - Juridique',
      category: 'SIGNATURE',
      status: 'suspended',
      object: 'Signature des contrats et avenants',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      delegateId: 'USR-006',
      delegateName: 'M. Ouattara Drissa',
      delegateRole: 'Juriste principal',
      bureau: 'Bureau Juridique',
      startsAt: addDays(now, -120),
      endsAt: addDays(now, 60),
      maxAmount: 100000000,
      currency: 'XOF',
      requiresDualControl: 1,
      suspendedAt: addDays(now, -5),
      suspendedById: 'USR-001',
      suspendedByName: 'M. Konaté Ibrahim',
      suspendReason: 'Audit interne en cours',
      usageCount: 8,
      usageTotalAmount: 320000000,
    },
    {
      id: 'DEL-2024-005',
      code: 'DEL-005',
      title: 'Délégation validation études - Bureau Études',
      category: 'VALIDATION',
      status: 'active',
      object: 'Validation technique des études et livrables',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      delegateId: 'USR-004',
      delegateName: 'M. Bamba Sékou',
      delegateRole: 'Chef Bureau Études',
      bureau: 'Bureau Études',
      startsAt: addDays(now, -45),
      endsAt: addDays(now, 180),
      projectScopeMode: 'ALL',
      maxAmount: 20000000,
      currency: 'XOF',
      usageCount: 15,
      usageTotalAmount: 89000000,
    },
    {
      id: 'DEL-2024-006',
      code: 'DEL-006',
      title: 'Délégation expirée - ancien projet',
      category: 'OPERATIONNEL',
      status: 'expired',
      object: 'Gestion opérationnelle du projet Alpha (terminé)',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      delegateId: 'USR-007',
      delegateName: 'M. Cissé Mamadou',
      bureau: 'Bureau Travaux',
      startsAt: addDays(now, -365),
      endsAt: addDays(now, -30),
      maxAmount: 15000000,
      currency: 'XOF',
      usageCount: 45,
      usageTotalAmount: 420000000,
    },
    {
      id: 'DEL-2024-007',
      code: 'DEL-007',
      title: 'Délégation révoquée - fraude détectée',
      category: 'PAIEMENT',
      status: 'revoked',
      object: 'Validation paiements (révoquée)',
      grantorId: 'USR-001',
      grantorName: 'M. Konaté Ibrahim',
      delegateId: 'USR-007',
      delegateName: 'M. Cissé Mamadou',
      bureau: 'Bureau Travaux',
      startsAt: addDays(now, -200),
      endsAt: addDays(now, -50),
      maxAmount: 10000000,
      currency: 'XOF',
      revokedAt: addDays(now, -100),
      revokedById: 'USR-001',
      revokedByName: 'M. Konaté Ibrahim',
      revokeReason: 'Suspicion de fraude - enquête en cours',
      usageCount: 3,
      usageTotalAmount: 25000000,
    },
  ];

  for (const del of delegations) {
    const decisionHash = hashDecision(del);
    const headHash = hashChain(decisionHash, { action: 'CREATED', actorId: del.grantorId });

    await prisma.delegation.create({
      data: {
        ...del,
        decisionHash,
        headHash,
      },
    });

    // Ajouter l'événement de création
    await prisma.delegationEvent.create({
      data: {
        delegationId: del.id,
        eventType: 'CREATED',
        actorId: del.grantorId,
        actorName: del.grantorName,
        summary: 'Création de la délégation',
        previousHash: null,
        eventHash: headHash,
      },
    });

    // Si suspendue, ajouter l'événement
    if (del.status === 'suspended') {
      const suspendHash = hashChain(headHash, { action: 'SUSPENDED', reason: del.suspendReason });
      await prisma.delegationEvent.create({
        data: {
          delegationId: del.id,
          eventType: 'SUSPENDED',
          actorId: del.suspendedById,
          actorName: del.suspendedByName,
          summary: del.suspendReason,
          previousHash: headHash,
          eventHash: suspendHash,
          createdAt: del.suspendedAt,
        },
      });
    }

    // Si révoquée, ajouter l'événement
    if (del.status === 'revoked') {
      const revokeHash = hashChain(headHash, { action: 'REVOKED', reason: del.revokeReason });
      await prisma.delegationEvent.create({
        data: {
          delegationId: del.id,
          eventType: 'REVOKED',
          actorId: del.revokedById,
          actorName: del.revokedByName,
          summary: del.revokeReason,
          previousHash: headHash,
          eventHash: revokeHash,
          createdAt: del.revokedAt,
        },
      });
    }

    console.log(`  ✓ ${del.id}: ${del.title}`);
  }

  // Ajouter des policies à certaines délégations
  const policies = [
    {
      delegationId: 'DEL-2024-001',
      action: 'APPROVE_PURCHASE_ORDER',
      maxAmount: 50000000,
      currency: 'XOF',
      requiresDualControl: 1,
      requiresFinanceCheck: 1,
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-001',
      action: 'SIGN_CONTRACT',
      maxAmount: 25000000,
      currency: 'XOF',
      requiresDualControl: 1,
      requiresLegalReview: 1,
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-002',
      action: 'APPROVE_PAYMENT',
      maxAmount: 25000000,
      currency: 'XOF',
      stepUpThreshold: 15000000,
      requiresDualControl: 0,
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-003',
      action: 'SIGN_CONTRACT',
      maxAmount: 30000000,
      currency: 'XOF',
      requiresLegalReview: 1,
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-005',
      action: 'VALIDATE_CHANGE_ORDER',
      maxAmount: 20000000,
      currency: 'XOF',
      enabled: 1,
    },
  ];

  for (const pol of policies) {
    await prisma.delegationPolicy.create({ data: pol });
  }
  console.log(`  ✓ ${policies.length} policies créées`);

  // Ajouter des acteurs
  const actors = [
    { delegationId: 'DEL-2024-001', userId: 'USR-001', userName: 'M. Konaté Ibrahim', userRole: 'DG', roleType: 'GRANTOR', required: 1, canRevoke: 1 },
    { delegationId: 'DEL-2024-001', userId: 'USR-003', userName: 'M. Touré Ahmed', userRole: 'Chef Bureau', roleType: 'DELEGATE', required: 1, canApprove: 1 },
    { delegationId: 'DEL-2024-001', userId: 'USR-002', userName: 'Mme Diallo Fatou', userRole: 'DAF', roleType: 'CO_APPROVER', required: 1, canApprove: 1 },
    { delegationId: 'DEL-2024-001', userId: 'USR-008', userName: 'Mme Sanogo Mariame', userRole: 'Contrôle', roleType: 'CONTROLLER', mustBeNotified: 1 },
    
    { delegationId: 'DEL-2024-002', userId: 'USR-001', userName: 'M. Konaté Ibrahim', roleType: 'GRANTOR', required: 1, canRevoke: 1 },
    { delegationId: 'DEL-2024-002', userId: 'USR-002', userName: 'Mme Diallo Fatou', roleType: 'DELEGATE', required: 1, canApprove: 1 },
    { delegationId: 'DEL-2024-002', userId: 'USR-008', userName: 'Mme Sanogo Mariame', roleType: 'AUDITOR', mustBeNotified: 1 },
  ];

  for (const act of actors) {
    await prisma.delegationActor.create({ data: act });
  }
  console.log(`  ✓ ${actors.length} acteurs créés`);

  // Ajouter des engagements
  const engagements = [
    {
      delegationId: 'DEL-2024-001',
      engagementType: 'OBLIGATION',
      title: 'Vérification du budget disponible',
      description: 'Avant toute signature, vérifier la disponibilité budgétaire sur le projet concerné.',
      criticality: 'HIGH',
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-001',
      engagementType: 'DOCUMENTATION',
      title: 'Pièces justificatives obligatoires',
      description: 'Joindre systématiquement : devis, bon de commande, visa DAF.',
      criticality: 'CRITICAL',
      requiredDocs: JSON.stringify([
        { type: 'Devis', description: 'Devis fournisseur', mandatory: true },
        { type: 'BC', description: 'Bon de commande signé', mandatory: true },
        { type: 'Visa DAF', description: 'Visa direction financière', mandatory: true },
      ]),
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-001',
      engagementType: 'PROHIBITION',
      title: 'Interdiction auto-validation',
      description: 'Ne jamais valider un document dont vous êtes le demandeur initial.',
      criticality: 'CRITICAL',
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-001',
      engagementType: 'REPORTING',
      title: 'Reporting hebdomadaire',
      description: 'Transmettre un état des utilisations chaque vendredi au DG et à la DAF.',
      criticality: 'MEDIUM',
      frequency: 'WEEKLY',
      enabled: 1,
    },
    {
      delegationId: 'DEL-2024-002',
      engagementType: 'ALERT',
      title: 'Alerte dépassement seuil',
      description: 'Alerter immédiatement le DG si le cumul dépasse 80% du plafond.',
      criticality: 'HIGH',
      enabled: 1,
    },
  ];

  for (const eng of engagements) {
    await prisma.delegationEngagement.create({ data: eng });
  }
  console.log(`  ✓ ${engagements.length} engagements créés`);

  // Ajouter quelques usages
  const usages = [
    {
      delegationId: 'DEL-2024-001',
      documentRef: 'BC-2024-0145',
      documentType: 'BC',
      documentDate: addDays(now, -10),
      amount: 12500000,
      currency: 'XOF',
      bureau: 'Bureau Travaux',
      projectName: 'Construction école Bouaké',
      supplierName: 'CIAT Construction',
      usedById: 'USR-003',
      usedByName: 'M. Touré Ahmed',
      status: 'AUTHORIZED',
    },
    {
      delegationId: 'DEL-2024-001',
      documentRef: 'BC-2024-0152',
      documentType: 'BC',
      documentDate: addDays(now, -5),
      amount: 8700000,
      currency: 'XOF',
      bureau: 'Bureau Travaux',
      projectName: 'Réhabilitation route N7',
      supplierName: 'SOGEA-SATOM',
      usedById: 'USR-003',
      usedByName: 'M. Touré Ahmed',
      status: 'AUTHORIZED',
      dualControlById: 'USR-002',
      dualControlByName: 'Mme Diallo Fatou',
      dualControlAt: addDays(now, -4),
    },
    {
      delegationId: 'DEL-2024-002',
      documentRef: 'PAY-2024-0891',
      documentType: 'PAIEMENT',
      documentDate: addDays(now, -2),
      amount: 18500000,
      currency: 'XOF',
      bureau: 'Bureau Finances',
      supplierName: 'CIMAF',
      usedById: 'USR-002',
      usedByName: 'Mme Diallo Fatou',
      status: 'PENDING_CONTROL',
      notes: 'En attente validation DG (montant > 15M)',
    },
  ];

  for (const usg of usages) {
    await prisma.delegationUsage.create({ data: usg });
  }
  console.log(`  ✓ ${usages.length} usages créés`);

  console.log('\n✅ Seed delegations v2 terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

