/**
 * Script de création de données de test réalistes
 * Génère 50 dossiers bloqués avec différents états
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Types de blocages réalistes
const BLOCAGE_TYPES = [
  { type: 'paiement', subject: 'Retard paiement fournisseur', description: 'Facture en attente de validation comptable' },
  { type: 'contrat', subject: 'Validation contrat prestataire', description: 'Contrat en attente signature juridique' },
  { type: 'rh', subject: 'Recrutement bloqué', description: 'Fiche de poste non validée' },
  { type: 'technique', subject: 'Problème infrastructure', description: 'Serveur en panne, intervention requise' },
  { type: 'legal', subject: 'Document juridique manquant', description: 'Attestation administrative non fournie' },
  { type: 'contrat', subject: 'Avenant contrat en attente', description: 'Modification contrat en cours de validation' },
  { type: 'paiement', subject: 'Déblocage budget urgent', description: 'Ligne budgétaire à valider' },
  { type: 'rh', subject: 'Formation employé', description: 'Budget formation non alloué' },
  { type: 'technique', subject: 'Maintenance équipement', description: 'Devis maintenance à approuver' },
  { type: 'legal', subject: 'Litige fournisseur', description: 'Contentieux en cours' },
];

const BUREAUX = ['BF', 'BCG', 'BJA', 'BOP', 'BRH', 'BTP', 'BJ', 'BS'];
const IMPACTS = ['critical', 'high', 'medium', 'low'];
const PRIORITIES = ['urgent', 'high', 'normal', 'low'];
const STATUSES = ['pending', 'escalated', 'resolved', 'substituted'];

const USERS = [
  { id: 'user1', name: 'Marie Dupont' },
  { id: 'user2', name: 'Jean Martin' },
  { id: 'user3', name: 'Sophie Bernard' },
  { id: 'user4', name: 'Pierre Dubois' },
  { id: 'user5', name: 'Claire Laurent' },
];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌱 Création de données de test...\n');

  // Nettoyer les données existantes
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.blockedComment.deleteMany();
  await prisma.blockedAuditLog.deleteMany();
  await prisma.blockedDossier.deleteMany();
  console.log('   ✅ Nettoyage terminé\n');

  const dossiers = [];
  const now = new Date();

  // Créer 50 dossiers avec différents états
  console.log('📝 Création de 50 dossiers...');
  
  for (let i = 0; i < 50; i++) {
    const template = randomItem(BLOCAGE_TYPES);
    const impact = randomItem(IMPACTS);
    const bureau = randomItem(BUREAUX);
    const status = randomItem(STATUSES);
    const user = randomItem(USERS);
    
    // Calculer le délai (plus ancien = plus grand délai)
    const createdDaysAgo = Math.floor(Math.random() * 60); // 0-60 jours
    const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
    
    // SLA selon l'impact
    const slaHours = impact === 'critical' ? 24 : impact === 'high' ? 48 : impact === 'medium' ? 72 : 120;
    const slaDueDate = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
    
    const dossier = await prisma.blockedDossier.create({
      data: {
        subject: `${template.subject} - ${bureau}-${i.toString().padStart(3, '0')}`,
        description: template.description,
        impact,
        priority: randomItem(PRIORITIES),
        status,
        type: template.type,
        bureau,
        assignedToId: user.id,
        assignedToName: user.name,
        amount: Math.floor(Math.random() * 50000000) + 500000, // 500k - 50M FCFA
        currency: 'XOF',
        delay: createdDaysAgo,
        slaTarget: slaDueDate,
        resolutionDate: status === 'resolved' ? new Date() : null,
        escalatedTo: status === 'escalated' ? 'Direction Générale' : null,
        escalationReason: status === 'escalated' ? 'Dépassement SLA critique' : null,
        tags: JSON.stringify([bureau, template.type, impact]),
        createdAt,
        updatedAt: new Date(),
      },
    });

    dossiers.push(dossier);

    // Créer un log d'audit initial
    await prisma.blockedAuditLog.create({
      data: {
        dossierId: dossier.id,
        actorId: 'system',
        actorName: 'Système',
        action: 'CREATED',
        details: JSON.stringify({ 
          reason: 'Création initiale',
          source: 'Test data generation'
        }),
        eventHash: `hash-${dossier.id}-created`,
      },
    });

    // Ajouter des événements supplémentaires pour certains dossiers
    if (status === 'escalated') {
      await prisma.blockedAuditLog.create({
        data: {
          dossierId: dossier.id,
          actorId: user.id,
          actorName: user.name,
          action: 'ESCALATED',
          details: JSON.stringify({ 
            reason: 'Dépassement SLA',
            escalatedTo: 'Direction Générale'
          }),
          previousHash: `hash-${dossier.id}-created`,
          eventHash: `hash-${dossier.id}-escalated`,
        },
      });
    }

    if (status === 'resolved') {
      await prisma.blockedAuditLog.create({
        data: {
          dossierId: dossier.id,
          actorId: user.id,
          actorName: user.name,
          action: 'RESOLVED',
          details: JSON.stringify({ 
            resolution: 'Validation obtenue',
            method: 'Standard process'
          }),
          previousHash: `hash-${dossier.id}-created`,
          eventHash: `hash-${dossier.id}-resolved`,
        },
      });
    }

    // Ajouter 1-3 commentaires pour certains dossiers
    if (Math.random() > 0.5) {
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < numComments; c++) {
        const commentUser = randomItem(USERS);
        await prisma.blockedComment.create({
          data: {
            dossierId: dossier.id,
            authorId: commentUser.id,
            authorName: commentUser.name,
            content: [
              'En cours de traitement',
              'Contact établi avec le bureau concerné',
              'Documents reçus, en attente de validation',
              'Escalade nécessaire si pas de retour sous 48h',
              'Priorisation requise',
            ][c % 5],
            visibility: Math.random() > 0.3 ? 'internal' : 'shared',
            createdAt: randomDate(createdAt, now),
          },
        });
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`   ✓ ${i + 1}/50 dossiers créés`);
    }
  }

  console.log('   ✅ 50 dossiers créés\n');

  // Statistiques
  console.log('📊 Statistiques des données créées :');
  
  const stats = {
    total: await prisma.blockedDossier.count(),
    critical: await prisma.blockedDossier.count({ where: { impact: 'critical' } }),
    high: await prisma.blockedDossier.count({ where: { impact: 'high' } }),
    medium: await prisma.blockedDossier.count({ where: { impact: 'medium' } }),
    low: await prisma.blockedDossier.count({ where: { impact: 'low' } }),
    pending: await prisma.blockedDossier.count({ where: { status: 'pending' } }),
    escalated: await prisma.blockedDossier.count({ where: { status: 'escalated' } }),
    resolved: await prisma.blockedDossier.count({ where: { status: 'resolved' } }),
    auditLogs: await prisma.blockedAuditLog.count(),
    comments: await prisma.blockedComment.count(),
  };

  console.log(`   Total dossiers    : ${stats.total}`);
  console.log(`   ├─ Critiques      : ${stats.critical}`);
  console.log(`   ├─ Élevés         : ${stats.high}`);
  console.log(`   ├─ Moyens         : ${stats.medium}`);
  console.log(`   └─ Faibles        : ${stats.low}`);
  console.log('');
  console.log(`   Par statut :`);
  console.log(`   ├─ En attente     : ${stats.pending}`);
  console.log(`   ├─ Escaladés      : ${stats.escalated}`);
  console.log(`   └─ Résolus        : ${stats.resolved}`);
  console.log('');
  console.log(`   Logs d'audit      : ${stats.auditLogs}`);
  console.log(`   Commentaires      : ${stats.comments}`);
  console.log('');

  // Dossiers critiques
  const criticalDossiers = await prisma.blockedDossier.findMany({
    where: { impact: 'critical', status: 'pending' },
    take: 5,
    orderBy: { delay: 'desc' },
  });

  if (criticalDossiers.length > 0) {
    console.log('🔴 Top 5 dossiers critiques :');
    criticalDossiers.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.subject} (${d.delay}j - ${d.bureau})`);
    });
    console.log('');
  }

  console.log('✨ Données de test créées avec succès !');
  console.log('');
  console.log('💡 Vous pouvez maintenant :');
  console.log('   - Lancer le serveur : npm run dev');
  console.log('   - Voir les données : npx prisma studio');
  console.log('   - Tester l\'API : curl http://localhost:3000/api/bmo/blocked/stats');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

