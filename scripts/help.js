#!/usr/bin/env node

/**
 * CLI Help - Guide d'utilisation des scripts
 */

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

log(`\n${'='.repeat(70)}`, 'bold');
log(`🚀 HARMONISATION BMO - CLI TOOLS`, 'bold');
log(`${'='.repeat(70)}\n`, 'bold');

log(`📋 COMMANDES DISPONIBLES\n`, 'cyan');

log(`  1. Générer un nouveau module harmonisé:`, 'bold');
log(`     node scripts/generate-modals.js [MODULE_NAME] [COLOR]\n`, 'green');
log(`     Exemple:`);
log(`     node scripts/generate-modals.js Delegations purple`, 'yellow');
log(`     node scripts/generate-modals.js Finances emerald\n`);

log(`  2. Afficher l'aide:`, 'bold');
log(`     node scripts/help.js\n`, 'green');

log(`\n📁 FICHIERS GÉNÉRÉS\n`, 'cyan');
log(`  Pour chaque module, génère automatiquement:`);
log(`     • [Module]Modals.tsx - 6 modales standardisées`);
log(`     • [Module]NotificationPanel.tsx - Panneau de notifications`);
log(`     • index.ts - Exports centralisés\n`);

log(`\n🎨 COULEURS DISPONIBLES\n`, 'cyan');
const colorExamples = [
  { module: 'Finance/Money', color: 'emerald, green' },
  { module: 'Urgent/Risque', color: 'red' },
  { module: 'Warning', color: 'amber, orange' },
  { module: 'Info/Général', color: 'blue' },
  { module: 'RH/Employes', color: 'teal, cyan' },
  { module: 'Analytics', color: 'purple' },
];

colorExamples.forEach(({ module, color }) => {
  console.log(`     ${module.padEnd(20)} → ${color}`);
});

log(`\n⚡ WORKFLOW RAPIDE\n`, 'cyan');
log(`  1. Générer: node scripts/generate-modals.js [MODULE] [COLOR]`);
log(`  2. Adapter: Ouvrir les fichiers et personnaliser`);
log(`  3. Intégrer: Suivre docs/GUIDE-HARMONISATION-RAPIDE.md`);
log(`  4. Tester: npm run lint\n`);

log(`\n📚 DOCUMENTATION\n`, 'cyan');
log(`     docs/README.md - Start here`);
log(`     docs/GUIDE-HARMONISATION-RAPIDE.md - Guide complet`);
log(`     docs/INDEX.md - Index de la documentation\n`);

log(`\n💡 EXEMPLES\n`, 'cyan');

const examples = [
  { cmd: 'node scripts/generate-modals.js Delegations purple', desc: 'Module Delegations (violet)' },
  { cmd: 'node scripts/generate-modals.js Finances emerald', desc: 'Module Finances (vert)' },
  { cmd: 'node scripts/generate-modals.js Projets blue', desc: 'Module Projets (bleu)' },
  { cmd: 'node scripts/generate-modals.js Litiges red', desc: 'Module Litiges (rouge)' },
];

examples.forEach(({ cmd, desc }, i) => {
  log(`  ${i + 1}. ${desc}`, 'bold');
  log(`     ${cmd}\n`, 'yellow');
});

log(`\n⏱️  TEMPS ESTIMÉ PAR MODULE\n`, 'cyan');
log(`     Sans CLI: ~3 heures`);
log(`     Avec CLI: ~1.5 heures`, 'green');
log(`     Gain: 50% ⚡\n`, 'yellow');

log(`\n🎯 STATISTIQUES ACTUELLES\n`, 'cyan');
log(`     Modules harmonisés: 13/36 (36%)`);
log(`     Modules restants: 23`);
log(`     Template disponible: ✅`);
log(`     Documentation: 9 fichiers ✅\n`);

log(`${'='.repeat(70)}`, 'bold');
log(`\n✅ Prêt à harmoniser! Consultez docs/README.md pour commencer.\n`, 'green');

