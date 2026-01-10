/**
 * Script d'initialisation de la base de données pour le module Blocked
 * À exécuter une seule fois : node scripts/init-blocked-db.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation des tables Blocked...\n');

  try {
    // Vérifier si les tables existent en essayant de compter
    const count = await prisma.blockedDossier.count();
    console.log(`✅ Les tables existent déjà. ${count} dossiers bloqués trouvés.`);
    
    // Créer des données de test si la table est vide
    if (count === 0) {
      console.log('\n📝 Création de données de test...');
      
      const testDossier = await prisma.blockedDossier.create({
        data: {
          subject: 'Test - Blocage contrat fournisseur',
          description: 'Dossier de test pour validation du système',
          impact: 'high',
          priority: 'urgent',
          status: 'pending',
          type: 'contrat',
          bureau: 'BF',
          assignedToName: 'Test User',
          amount: 5000000,
          currency: 'XOF',
          delay: 10,
          slaTarget: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tags: JSON.stringify(['test', 'initial']),
        },
      });
      
      console.log(`✅ Dossier test créé : ${testDossier.id}`);
      
      // Créer un log d'audit
      const auditLog = await prisma.blockedAuditLog.create({
        data: {
          dossierId: testDossier.id,
          actorId: 'system',
          actorName: 'Système',
          action: 'CREATED',
          details: JSON.stringify({ reason: 'Initialisation' }),
          eventHash: 'test-hash-' + Date.now(),
        },
      });
      
      console.log(`✅ Log d'audit créé : ${auditLog.id}`);
      
      console.log('\n✨ Données de test créées avec succès !');
    }
    
    console.log('\n📊 Statistiques :');
    const stats = await prisma.blockedDossier.groupBy({
      by: ['status'],
      _count: true,
    });
    
    stats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count} dossier(s)`);
    });
    
    console.log('\n✅ Initialisation terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n⚠️  Les tables n\'existent pas encore.');
      console.log('📝 Vous devez exécuter la migration Prisma manuellement :');
      console.log('\n   Ouvrez un terminal PowerShell et exécutez :');
      console.log('   npx prisma migrate dev --name add-blocked-dossiers\n');
    }
    
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

