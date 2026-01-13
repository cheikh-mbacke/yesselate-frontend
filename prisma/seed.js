const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Supprimer les données existantes
  await prisma.delegationEvent.deleteMany();
  await prisma.delegation.deleteMany();
  await prisma.demandEvent.deleteMany();
  await prisma.demandStakeholder.deleteMany();
  await prisma.demandTask.deleteMany();
  await prisma.demandRisk.deleteMany();
  await prisma.demand.deleteMany();

  // Demandes de test avec contexte complet
  const demands = [
    {
      id: 'REQ-2024-001',
      subject: 'Avenant — lots complémentaires',
      bureau: 'FIN',
      type: 'Juridique',
      priority: 'urgent',
      status: 'pending',
      amount: 3200000,
      // Demandeur
      requesterId: 'USR-003',
      requesterName: 'M. KONÉ',
      requesterEmail: 'm.kone@nice-renovation.sn',
      requesterPhone: '+221 77 123 45 67',
      requesterService: 'Direction Financière',
      // Contexte
      description: 'Demande d\'avenant au marché N°2024-BTP-045 pour l\'ajout de lots complémentaires identifiés lors de la phase de diagnostic approfondi.',
      justification: 'Lors du diagnostic technique réalisé en décembre 2024, des travaux supplémentaires ont été identifiés comme indispensables pour la conformité aux normes de sécurité incendie. Le non-traitement de ces lots compromettrait l\'obtention du permis d\'exploitation.',
      objectives: '1. Mise en conformité incendie du bâtiment B\n2. Installation des issues de secours supplémentaires\n3. Mise à jour du système de désenfumage',
      beneficiaries: 'Direction Générale, Occupants du bâtiment B (environ 150 personnes), Service HSE',
      urgencyReason: 'Le permis d\'exploitation doit être renouvelé avant le 15 février 2026. Sans ces travaux, le renouvellement sera refusé.',
      // Budget
      budgetCode: 'BUD-2024-INV-045',
      budgetLine: 'Investissements immobiliers',
      budgetAvailable: 5000000,
      // Dates
      expectedDate: new Date('2026-01-20'),
      deadline: new Date('2026-02-15'),
      // Documents
      documents: JSON.stringify([
        { name: 'Diagnostic technique.pdf', type: 'pdf', size: '2.4 MB' },
        { name: 'Devis entreprise BTP.xlsx', type: 'excel', size: '156 KB' },
        { name: 'Plan des travaux.dwg', type: 'cad', size: '8.1 MB' },
        { name: 'Rapport conformité incendie.pdf', type: 'pdf', size: '1.2 MB' },
      ]),
      // Recommandation
      recommendation: 'AVIS FAVORABLE - La direction technique recommande l\'approbation de cet avenant. Les travaux sont indispensables pour la mise en conformité réglementaire. Le montant est conforme aux prix du marché.',
    },
    {
      id: 'REQ-2024-002',
      subject: 'Fournitures bureau Q1 2026',
      bureau: 'LOG',
      type: 'Achat',
      priority: 'normal',
      status: 'pending',
      amount: 450000,
      requesterId: 'USR-007',
      requesterName: 'A. SECK',
      requesterEmail: 'a.seck@nice-renovation.sn',
      requesterPhone: '+221 77 234 56 78',
      requesterService: 'Service Logistique',
      description: 'Commande trimestrielle de fournitures de bureau pour l\'ensemble des services.',
      justification: 'Réapprovisionnement régulier des stocks de fournitures. Le stock actuel couvre seulement 2 semaines de consommation normale.',
      objectives: 'Assurer la continuité des opérations administratives avec un stock de sécurité de 6 semaines.',
      beneficiaries: 'Tous les services (environ 80 collaborateurs)',
      budgetCode: 'BUD-2024-FONC-012',
      budgetLine: 'Fournitures de bureau',
      budgetAvailable: 600000,
      expectedDate: new Date('2026-01-25'),
      documents: JSON.stringify([
        { name: 'Liste fournitures.xlsx', type: 'excel', size: '45 KB' },
        { name: 'Comparatif fournisseurs.pdf', type: 'pdf', size: '320 KB' },
      ]),
      recommendation: 'Demande standard conforme au budget. Vérifier les quantités avec le responsable logistique.',
    },
    {
      id: 'REQ-2024-003',
      subject: 'Rénovation façade — phase 1',
      bureau: 'BCT',
      type: 'Travaux',
      priority: 'high',
      status: 'pending',
      amount: 15000000,
      requesterId: 'USR-004',
      requesterName: 'S. TRAORÉ',
      requesterEmail: 's.traore@nice-renovation.sn',
      requesterPhone: '+221 77 345 67 89',
      requesterService: 'Bureau des Travaux',
      description: 'Travaux de rénovation de la façade principale du siège, incluant le ravalement, l\'isolation thermique et la mise aux normes énergétiques.',
      justification: 'La façade actuelle présente des dégradations importantes (fissures, infiltrations) et ne répond plus aux normes d\'isolation thermique en vigueur. La consommation énergétique du bâtiment est supérieure de 40% à la moyenne du secteur.',
      objectives: '1. Réduire la consommation énergétique de 30%\n2. Améliorer le confort thermique\n3. Valoriser l\'image du siège\n4. Respecter les nouvelles normes environnementales',
      beneficiaries: 'Tous les occupants du siège, Direction Générale (image de marque), Service Environnement',
      budgetCode: 'BUD-2024-INV-078',
      budgetLine: 'Travaux de rénovation',
      budgetAvailable: 20000000,
      expectedDate: new Date('2026-03-01'),
      deadline: new Date('2026-06-30'),
      documents: JSON.stringify([
        { name: 'Cahier des charges.pdf', type: 'pdf', size: '5.2 MB' },
        { name: 'Devis entreprises (3).zip', type: 'archive', size: '12.4 MB' },
        { name: 'Étude énergétique.pdf', type: 'pdf', size: '3.8 MB' },
        { name: 'Planning prévisionnel.xlsx', type: 'excel', size: '89 KB' },
        { name: 'Photos état actuel.zip', type: 'archive', size: '45 MB' },
      ]),
      recommendation: 'AVIS FAVORABLE SOUS RÉSERVE - Projet stratégique aligné avec les objectifs RSE. Recommandation de négocier le délai de paiement avec l\'entreprise retenue.',
    },
    {
      id: 'REQ-2024-004',
      subject: 'Maintenance serveurs annuelle',
      bureau: 'DSI',
      type: 'Service',
      priority: 'high',
      status: 'validated',
      amount: 800000,
      requesterId: 'USR-005',
      requesterName: 'K. CAMARA',
      requesterEmail: 'k.camara@nice-renovation.sn',
      requesterPhone: '+221 77 456 78 90',
      requesterService: 'Direction des Systèmes d\'Information',
      description: 'Contrat de maintenance préventive et corrective pour l\'infrastructure serveur du datacenter.',
      justification: 'Le contrat de maintenance actuel expire le 31 janvier 2026. La continuité du service est critique pour les opérations quotidiennes.',
      objectives: 'Garantir une disponibilité de 99.9% des systèmes critiques avec un temps de réponse inférieur à 4 heures.',
      beneficiaries: 'Tous les services utilisant le SI (100% des collaborateurs)',
      budgetCode: 'BUD-2024-IT-034',
      budgetLine: 'Maintenance informatique',
      budgetAvailable: 1000000,
      documents: JSON.stringify([
        { name: 'Proposition contrat.pdf', type: 'pdf', size: '890 KB' },
        { name: 'SLA détaillé.pdf', type: 'pdf', size: '234 KB' },
      ]),
      recommendation: 'VALIDÉ - Contrat critique pour la continuité d\'activité.',
    },
    {
      id: 'REQ-2024-005',
      subject: 'Formation équipes terrain',
      bureau: 'RH',
      type: 'Service',
      priority: 'normal',
      status: 'rejected',
      amount: 120000,
      requesterId: 'USR-006',
      requesterName: 'F. OUATTARA',
      requesterEmail: 'f.ouattara@nice-renovation.sn',
      requesterPhone: '+221 77 567 89 01',
      requesterService: 'Direction des Ressources Humaines',
      description: 'Programme de formation pour les équipes terrain sur les nouvelles méthodes de gestion de projet.',
      justification: 'Les équipes terrain n\'ont pas été formées aux nouvelles méthodologies depuis 2 ans. Un écart de compétences a été identifié lors des dernières évaluations.',
      objectives: 'Former 25 collaborateurs aux méthodes agiles et à la gestion de projet moderne.',
      beneficiaries: 'Équipes terrain (25 personnes), chefs de projet (5 personnes)',
      budgetCode: 'BUD-2024-RH-015',
      budgetLine: 'Formation professionnelle',
      budgetAvailable: 80000,
      documents: JSON.stringify([
        { name: 'Programme formation.pdf', type: 'pdf', size: '456 KB' },
        { name: 'Devis organisme.pdf', type: 'pdf', size: '123 KB' },
      ]),
      recommendation: 'REJETÉ - Budget insuffisant. Reporter au T2 2026 après réévaluation du budget formation.',
    },
  ];

  for (const d of demands) {
    await prisma.demand.create({
      data: {
        ...d,
        requestedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      }
    });
    console.log(`✅ ${d.id}: ${d.subject}`);
  }

  // Événements d'audit
  const events = [
    { demandId: 'REQ-2024-001', action: 'creation', actorId: 'USR-003', actorName: 'M. KONÉ', details: 'Demande créée' },
    { demandId: 'REQ-2024-001', action: 'review', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Revue initiale effectuée - en attente validation DG' },
    { demandId: 'REQ-2024-002', action: 'creation', actorId: 'USR-007', actorName: 'A. SECK', details: 'Demande créée' },
    { demandId: 'REQ-2024-003', action: 'creation', actorId: 'USR-004', actorName: 'S. TRAORÉ', details: 'Demande créée' },
    { demandId: 'REQ-2024-003', action: 'request_complement', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Merci de fournir le comparatif des 3 devis' },
    { demandId: 'REQ-2024-004', action: 'creation', actorId: 'USR-005', actorName: 'K. CAMARA', details: 'Demande créée' },
    { demandId: 'REQ-2024-004', action: 'validation', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Demande validée - Contrat critique' },
    { demandId: 'REQ-2024-005', action: 'creation', actorId: 'USR-006', actorName: 'F. OUATTARA', details: 'Demande créée' },
    { demandId: 'REQ-2024-005', action: 'rejection', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Budget insuffisant' },
  ];

  for (const e of events) {
    await prisma.demandEvent.create({ data: e });
  }
  console.log(`✅ ${events.length} événements d'audit créés`);

  // Stakeholders pour REQ-2024-001
  const stakeholders = [
    { demandId: 'REQ-2024-001', personId: 'USR-001', personName: 'A. DIALLO', role: 'APPROVER', required: 1, note: 'Validation finale' },
    { demandId: 'REQ-2024-001', personId: 'USR-003', personName: 'M. KONÉ', role: 'OWNER', required: 1, note: 'Porteur de la demande' },
    { demandId: 'REQ-2024-001', personId: 'USR-008', personName: 'B. NDIAYE', role: 'REVIEWER', required: 0, note: 'Avis technique' },
    { demandId: 'REQ-2024-003', personId: 'USR-001', personName: 'A. DIALLO', role: 'APPROVER', required: 1 },
    { demandId: 'REQ-2024-003', personId: 'USR-004', personName: 'S. TRAORÉ', role: 'OWNER', required: 1 },
  ];

  for (const s of stakeholders) {
    await prisma.demandStakeholder.create({ data: s });
  }
  console.log(`✅ ${stakeholders.length} parties prenantes créées`);

  // Risques pour REQ-2024-001
  const risks = [
    { demandId: 'REQ-2024-001', category: 'Réglementaire', probability: 4, impact: 5, mitigation: 'Suivi hebdomadaire avec le bureau de contrôle', ownerName: 'M. KONÉ' },
    { demandId: 'REQ-2024-001', category: 'Budget', probability: 2, impact: 3, mitigation: 'Marge de 10% prévue sur le devis', ownerName: 'A. DIALLO' },
    { demandId: 'REQ-2024-003', category: 'Délai', probability: 3, impact: 4, mitigation: 'Planning avec jalons intermédiaires', ownerName: 'S. TRAORÉ' },
  ];

  for (const r of risks) {
    await prisma.demandRisk.create({ data: r });
  }
  console.log(`✅ ${risks.length} risques créés`);

  // ============================================
  // DÉLÉGATIONS DE POUVOIRS
  // ============================================
  console.log('\n🔑 Seeding delegations...');

  // Calcul des dates dynamiques pour avoir des délégations qui expirent bientôt
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const in6Days = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

  const delegations = [
    {
      id: 'DEL-2024-001',
      type: 'Signature Bons de Commande',
      status: 'active',
      agentId: 'USR-002',
      agentName: 'M. BA',
      agentRole: 'Directeur Financier Adjoint',
      agentEmail: 'm.ba@nice-renovation.sn',
      agentPhone: '+221 77 111 22 33',
      bureau: 'FIN',
      scope: 'Signature des bons de commande inférieurs à 5 000 000 FCFA pour les achats courants de fonctionnement.',
      scopeDetails: 'Inclut les fournitures, consommables, services de maintenance courante. Exclut les investissements et marchés publics.',
      maxAmount: 5000000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-06-30'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 47,
      lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastUsedFor: 'BC-2025-0234',
      decisionId: 'DEC-2024-001',
      hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd',
      notes: 'Délégation permanente pour le DFA',
    },
    {
      id: 'DEL-2024-002',
      type: 'Validation Paiements',
      status: 'active',
      agentId: 'USR-003',
      agentName: 'M. KONÉ',
      agentRole: 'Chef Comptable',
      agentEmail: 'm.kone@nice-renovation.sn',
      agentPhone: '+221 77 222 33 44',
      bureau: 'FIN',
      scope: 'Validation des ordres de paiement pour les factures fournisseurs déjà approuvées.',
      maxAmount: 10000000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-02-28'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 156,
      lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastUsedFor: 'PAY-2025-0891',
      decisionId: 'DEC-2024-002',
      hash: 'b2c3d4e5f6789012345678901234567890123456789012345678901234abcde',
    },
    {
      id: 'DEL-2024-003',
      type: 'Engagement Marchés',
      status: 'active',
      agentId: 'USR-004',
      agentName: 'S. TRAORÉ',
      agentRole: 'Chef du Bureau Technique',
      agentEmail: 's.traore@nice-renovation.sn',
      agentPhone: '+221 77 333 44 55',
      bureau: 'BCT',
      scope: 'Engagement des marchés de travaux inférieurs à 50 000 000 FCFA après validation du comité d\'engagement.',
      maxAmount: 50000000,
      startDate: new Date('2024-06-01'),
      endDate: in3Days, // Expire dans 3 jours !
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 12,
      lastUsedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastUsedFor: 'MARCHE-2025-045',
      decisionId: 'DEC-2024-003',
      hash: 'c3d4e5f6789012345678901234567890123456789012345678901234abcdef',
    },
    {
      id: 'DEL-2024-004',
      type: 'Signature Contrats RH',
      status: 'suspended',
      agentId: 'USR-006',
      agentName: 'F. OUATTARA',
      agentRole: 'DRH Adjointe',
      agentEmail: 'f.ouattara@nice-renovation.sn',
      agentPhone: '+221 77 444 55 66',
      bureau: 'RH',
      scope: 'Signature des contrats de travail CDD et avenants pour le personnel non-cadre.',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-12-31'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 34,
      lastUsedAt: new Date('2024-11-15'),
      lastUsedFor: 'CONTRAT-2024-089',
      decisionId: 'DEC-2024-004',
      hash: 'd4e5f6789012345678901234567890123456789012345678901234abcdef01',
      suspendedAt: new Date('2024-12-01'),
      suspendedBy: 'A. DIALLO',
      suspendReason: 'Audit RH en cours - suspension temporaire',
    },
    {
      id: 'DEL-2024-005',
      type: 'Validation Achats IT',
      status: 'active',
      agentId: 'USR-005',
      agentName: 'K. CAMARA',
      agentRole: 'DSI',
      agentEmail: 'k.camara@nice-renovation.sn',
      agentPhone: '+221 77 555 66 77',
      bureau: 'DSI',
      scope: 'Validation des achats informatiques (matériel, logiciels, services cloud) inférieurs à 15 000 000 FCFA.',
      maxAmount: 15000000,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2026-06-30'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 28,
      lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastUsedFor: 'ACHAT-IT-2025-023',
      decisionId: 'DEC-2024-005',
      hash: 'e5f6789012345678901234567890123456789012345678901234abcdef0123',
    },
    {
      id: 'DEL-2024-006',
      type: 'Approbation Factures',
      status: 'active',
      agentId: 'USR-009',
      agentName: 'Mme DIOP',
      agentRole: 'Responsable Comptabilité Fournisseurs',
      agentEmail: 'diop@nice-renovation.sn',
      agentPhone: '+221 77 666 77 88',
      bureau: 'FIN',
      scope: 'Approbation des factures fournisseurs après contrôle de conformité.',
      maxAmount: 8000000,
      startDate: new Date('2024-09-01'),
      endDate: in5Days, // Expire dans 5 jours !
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 89,
      lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastUsedFor: 'FACT-2025-1234',
      decisionId: 'DEC-2024-006',
      hash: 'f6789012345678901234567890123456789012345678901234abcdef012345',
    },
    {
      id: 'DEL-2024-007',
      type: 'Signature Conventions',
      status: 'active',
      agentId: 'USR-010',
      agentName: 'M. FALL',
      agentRole: 'Directeur Juridique',
      agentEmail: 'fall@nice-renovation.sn',
      agentPhone: '+221 77 777 88 99',
      bureau: 'JUR',
      scope: 'Signature des conventions de partenariat et protocoles d\'accord.',
      startDate: new Date('2024-10-01'),
      endDate: in6Days, // Expire dans 6 jours !
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 5,
      lastUsedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastUsedFor: 'CONV-2025-008',
      decisionId: 'DEC-2024-007',
      hash: '6789012345678901234567890123456789012345678901234abcdef0123456',
    },
    {
      id: 'DEL-2023-001',
      type: 'Signature Marchés Publics',
      status: 'expired',
      agentId: 'USR-007',
      agentName: 'A. SECK',
      agentRole: 'Ancien Directeur des Achats',
      bureau: 'LOG',
      scope: 'Signature des marchés publics après avis favorable de la commission.',
      maxAmount: 100000000,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-12-31'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 8,
      lastUsedAt: new Date('2024-10-20'),
      lastUsedFor: 'MARCHE-2024-067',
      decisionId: 'DEC-2023-001',
      hash: '789012345678901234567890123456789012345678901234abcdef01234567',
    },
    {
      id: 'DEL-2023-002',
      type: 'Validation Missions',
      status: 'revoked',
      agentId: 'USR-008',
      agentName: 'B. NDIAYE',
      agentRole: 'Chef de Service Administratif',
      bureau: 'ADM',
      scope: 'Validation des ordres de mission et frais de déplacement.',
      maxAmount: 2000000,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 67,
      decisionId: 'DEC-2023-002',
      hash: '89012345678901234567890123456789012345678901234abcdef012345678',
      revokedAt: new Date('2024-03-15'),
      revokedBy: 'A. DIALLO',
      revokeReason: 'Changement de poste - fin de fonction',
    },
    {
      id: 'DEL-2023-003',
      type: 'Engagement Dépenses Courantes',
      status: 'revoked',
      agentId: 'USR-011',
      agentName: 'O. SARR',
      agentRole: 'Chef de Projet',
      bureau: 'BCT',
      scope: 'Engagement des dépenses courantes de projet inférieures à 3 000 000 FCFA.',
      maxAmount: 3000000,
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-08-31'),
      delegatorId: 'USR-004',
      delegatorName: 'S. TRAORÉ',
      usageCount: 23,
      decisionId: 'DEC-2023-003',
      hash: '9012345678901234567890123456789012345678901234abcdef0123456789',
      revokedAt: new Date('2024-06-01'),
      revokedBy: 'S. TRAORÉ',
      revokeReason: 'Projet terminé',
    },
    {
      id: 'DEL-2024-008',
      type: 'Validation Notes de Frais',
      status: 'suspended',
      agentId: 'USR-012',
      agentName: 'A. THIAM',
      agentRole: 'Responsable Administratif',
      agentEmail: 'thiam@nice-renovation.sn',
      bureau: 'ADM',
      scope: 'Validation des notes de frais du personnel.',
      maxAmount: 500000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      delegatorId: 'USR-001',
      delegatorName: 'A. DIALLO',
      usageCount: 145,
      lastUsedAt: new Date('2024-11-20'),
      lastUsedFor: 'NDF-2024-567',
      decisionId: 'DEC-2024-008',
      hash: '012345678901234567890123456789012345678901234abcdef01234567890',
      suspendedAt: new Date('2024-11-25'),
      suspendedBy: 'A. DIALLO',
      suspendReason: 'Contrôle interne en cours sur les notes de frais',
    },
  ];

  for (const d of delegations) {
    await prisma.delegation.create({ data: d });
    console.log(`✅ ${d.id}: ${d.type} → ${d.agentName}`);
  }

  // Événements de délégation
  const delegationEvents = [
    { delegationId: 'DEL-2024-001', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-001', action: 'used', actorId: 'USR-002', actorName: 'M. BA', details: 'Signature BC', targetDoc: 'BC-2025-0234', targetDocType: 'Bon de commande' },
    { delegationId: 'DEL-2024-001', action: 'used', actorId: 'USR-002', actorName: 'M. BA', details: 'Signature BC', targetDoc: 'BC-2025-0228', targetDocType: 'Bon de commande' },
    { delegationId: 'DEL-2024-002', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-002', action: 'used', actorId: 'USR-003', actorName: 'M. KONÉ', details: 'Validation paiement fournisseur', targetDoc: 'PAY-2025-0891', targetDocType: 'Ordre de paiement' },
    { delegationId: 'DEL-2024-003', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-003', action: 'extended', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Prolongée de 6 mois' },
    { delegationId: 'DEL-2024-004', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-004', action: 'suspended', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Audit RH en cours - suspension temporaire' },
    { delegationId: 'DEL-2024-005', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-005', action: 'used', actorId: 'USR-005', actorName: 'K. CAMARA', details: 'Achat serveur', targetDoc: 'ACHAT-IT-2025-023', targetDocType: 'Bon de commande IT' },
    { delegationId: 'DEL-2024-006', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-006', action: 'used', actorId: 'USR-009', actorName: 'Mme DIOP', details: 'Approbation facture EDF', targetDoc: 'FACT-2025-1234', targetDocType: 'Facture' },
    { delegationId: 'DEL-2024-007', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-007', action: 'used', actorId: 'USR-010', actorName: 'M. FALL', details: 'Signature convention partenariat', targetDoc: 'CONV-2025-008', targetDocType: 'Convention' },
    { delegationId: 'DEL-2024-008', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2024-008', action: 'suspended', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Contrôle interne en cours sur les notes de frais' },
    { delegationId: 'DEL-2023-001', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2023-001', action: 'expired', actorId: 'SYS', actorName: 'Système', details: 'Délégation expirée automatiquement' },
    { delegationId: 'DEL-2023-002', action: 'created', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Délégation créée' },
    { delegationId: 'DEL-2023-002', action: 'revoked', actorId: 'USR-001', actorName: 'A. DIALLO', details: 'Changement de poste - fin de fonction' },
    { delegationId: 'DEL-2023-003', action: 'created', actorId: 'USR-004', actorName: 'S. TRAORÉ', details: 'Délégation créée' },
    { delegationId: 'DEL-2023-003', action: 'revoked', actorId: 'USR-004', actorName: 'S. TRAORÉ', details: 'Projet terminé' },
  ];

  for (const e of delegationEvents) {
    await prisma.delegationEvent.create({ data: e });
  }
  console.log(`✅ ${delegationEvents.length} événements de délégation créés`);

  console.log('\n✨ Seed completed!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
