import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding extended data (stakeholders, tasks, risks)...');

  // Utilisons la première demande existante
  const demand = await prisma.demand.findFirst();
  
  if (!demand) {
    console.log('❌ No demands found. Run seed.ts first!');
    return;
  }

  const demandId = demand.id;
  console.log(`📄 Using demand: ${demandId}`);

  // ============================================
  // STAKEHOLDERS
  // ============================================
  
  await prisma.demandStakeholder.deleteMany({ where: { demandId } });
  
  const stakeholders = [
    {
      demandId,
      personId: 'USR-001',
      personName: 'Alice DUPONT',
      role: 'OWNER',
      required: 1,
      note: 'Chef de projet, pilote le dossier',
    },
    {
      demandId,
      personId: 'USR-002',
      personName: 'Bob MARTIN',
      role: 'APPROVER',
      required: 1,
      note: 'Directeur Général, validation finale',
    },
    {
      demandId,
      personId: 'USR-003',
      personName: 'Claire BERNARD',
      role: 'REVIEWER',
      required: 1,
      note: 'Juriste, contrôle conformité',
    },
    {
      demandId,
      personId: 'USR-004',
      personName: 'David LEROY',
      role: 'CONTRIBUTOR',
      required: 0,
      note: 'Expert technique',
    },
    {
      demandId,
      personId: 'USR-005',
      personName: 'Émilie THOMAS',
      role: 'INFORMED',
      required: 0,
      note: 'Responsable communication',
    },
  ];

  for (const s of stakeholders) {
    await prisma.demandStakeholder.create({ data: s });
    console.log(`✅ Stakeholder: ${s.personName} (${s.role})`);
  }

  // ============================================
  // TASKS
  // ============================================
  
  await prisma.demandTask.deleteMany({ where: { demandId } });
  
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const tasks = [
    {
      demandId,
      title: 'Valider le budget avec la DAF',
      description: 'Obtenir validation formelle du budget 150k€',
      status: 'OPEN',
      dueAt: in3Days,
      assignedToId: 'USR-001',
      assignedToName: 'Alice DUPONT',
    },
    {
      demandId,
      title: 'Rédiger le cahier des charges',
      description: 'Spécifications détaillées du projet',
      status: 'IN_PROGRESS',
      dueAt: in7Days,
      assignedToId: 'USR-004',
      assignedToName: 'David LEROY',
    },
    {
      demandId,
      title: 'Consultation juridique',
      description: 'Vérification conformité RGPD et contrats',
      status: 'DONE',
      dueAt: yesterday,
      assignedToId: 'USR-003',
      assignedToName: 'Claire BERNARD',
      completedAt: yesterday,
    },
    {
      demandId,
      title: 'Sourcing fournisseurs',
      description: 'Identifier 3 fournisseurs potentiels',
      status: 'BLOCKED',
      dueAt: now,
      assignedToId: null,
      assignedToName: null,
    },
  ];

  for (const t of tasks) {
    await prisma.demandTask.create({ data: t });
    console.log(`✅ Task: ${t.title} [${t.status}]`);
  }

  // ============================================
  // RISKS
  // ============================================
  
  await prisma.demandRisk.deleteMany({ where: { demandId } });
  
  const risks = [
    {
      demandId,
      category: 'Budget',
      opportunity: 0,
      probability: 4, // Élevée
      impact: 5,      // Critique
      mitigation: 'Validation préalable du DG + provision 10%',
      ownerName: 'Alice DUPONT',
    },
    {
      demandId,
      category: 'SLA',
      opportunity: 0,
      probability: 3, // Moyenne
      impact: 4,      // Forte
      mitigation: 'Points hebdomadaires + buffer de 2 semaines',
      ownerName: 'Alice DUPONT',
    },
    {
      demandId,
      category: 'Juridique',
      opportunity: 0,
      probability: 2, // Faible
      impact: 5,      // Critique
      mitigation: 'Revue systématique par juriste avant signature',
      ownerName: 'Claire BERNARD',
    },
    {
      demandId,
      category: 'Réputation',
      opportunity: 1, // Opportunité
      probability: 4, // Élevée
      impact: 4,      // Forte
      mitigation: 'Campagne de communication interne et externe',
      ownerName: 'Émilie THOMAS',
    },
    {
      demandId,
      category: 'Technique',
      opportunity: 0,
      probability: 3,
      impact: 3,
      mitigation: 'PoC technique + expertise externe si nécessaire',
      ownerName: 'David LEROY',
    },
  ];

  for (const r of risks) {
    await prisma.demandRisk.create({ data: r });
    const type = r.opportunity === 1 ? 'Opportunité' : 'Risque';
    const score = r.probability * r.impact;
    console.log(`✅ ${type}: ${r.category} (Score: ${score})`);
  }

  console.log('');
  console.log('✨ Extended seeding completed!');
  console.log(`📊 ${stakeholders.length} stakeholders`);
  console.log(`📋 ${tasks.length} tasks`);
  console.log(`⚠️  ${risks.length} risks/opportunities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

