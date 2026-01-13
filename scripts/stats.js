#!/usr/bin/env node

/**
 * CLI Stats - Statistiques en temps réel de l'harmonisation
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Scanner les modules générés
const bmoDir = path.join(__dirname, '..', 'src', 'components', 'features', 'bmo');
const generatedModules = [];
const totalModules = 36; // Total des modules BMO

if (fs.existsSync(bmoDir)) {
  const dirs = fs.readdirSync(bmoDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  dirs.forEach(dir => {
    const modalsPath = path.join(bmoDir, dir, `${dir.charAt(0).toUpperCase() + dir.slice(1)}Modals.tsx`);
    const notifPath = path.join(bmoDir, dir, `${dir.charAt(0).toUpperCase() + dir.slice(1)}NotificationPanel.tsx`);
    
    if (fs.existsSync(modalsPath) && fs.existsSync(notifPath)) {
      generatedModules.push(dir);
    }
  });
}

const harmonizedCount = generatedModules.length;
const percentage = Math.round((harmonizedCount / totalModules) * 100);
const remaining = totalModules - harmonizedCount;

log(`\n${'='.repeat(70)}`, 'bold');
log(`📊 STATISTIQUES HARMONISATION BMO`, 'bold');
log(`${'='.repeat(70)}\n`, 'bold');

log(`📅 Date: ${new Date().toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}\n`, 'cyan');

// Progression
log(`🎯 PROGRESSION GLOBALE\n`, 'yellow');
log(`   Modules harmonisés:  ${harmonizedCount}/${totalModules} (${percentage}%)`, harmonizedCount > 15 ? 'green' : 'yellow');
log(`   Modules restants:    ${remaining}`);

// Barre de progression
const barLength = 40;
const filled = Math.round((harmonizedCount / totalModules) * barLength);
const empty = barLength - filled;
const bar = '█'.repeat(filled) + '░'.repeat(empty);
log(`\n   [${bar}] ${percentage}%\n`, 'cyan');

// Modules générés
log(`✅ MODULES HARMONISÉS (${harmonizedCount})\n`, 'green');
generatedModules.sort().forEach((module, i) => {
  const color = i % 2 === 0 ? 'green' : 'cyan';
  log(`   ${(i + 1).toString().padStart(2)}. ${module}`, color);
});

// Temps économisé
const timeSaved = harmonizedCount * 1.5; // 1.5h par module
log(`\n⏱️  TEMPS ÉCONOMISÉ\n`, 'magenta');
log(`   Sans CLI:      ${harmonizedCount * 3}h`, 'yellow');
log(`   Avec CLI:      ${harmonizedCount * 1.5}h`, 'green');
log(`   Gagné:         ${timeSaved}h (${Math.round((timeSaved / (harmonizedCount * 3)) * 100)}%)`, 'bold');

// Estimation
const remainingHours = remaining * 1.5;
const remainingDays = Math.ceil(remainingHours / 8);
log(`\n🔮 ESTIMATION RESTANTE\n`, 'blue');
log(`   Modules restants:  ${remaining}`);
log(`   Temps estimé:      ${remainingHours}h (~${remainingDays} jours)`);
log(`   Avec 2 modules/jour: ${Math.ceil(remaining / 2)} jours\n`);

// Derniers modules générés (top 5)
log(`🆕 DERNIERS MODULES GÉNÉRÉS\n`, 'cyan');
const recentModules = generatedModules.slice(-5).reverse();
recentModules.forEach((module, i) => {
  const icon = ['🥇', '🥈', '🥉', '  ', '  '][i];
  log(`   ${icon} ${module}`, 'cyan');
});

log(`\n${'='.repeat(70)}`, 'bold');
log(`\n💡 Prochaine commande suggérée:`, 'yellow');
log(`   node scripts/generate-modals.js [MODULE_NAME] [COLOR]\n`, 'green');

log(`📚 Documentation:`, 'blue');
log(`   scripts/README.md`, 'cyan');
log(`   docs/GUIDE-HARMONISATION-RAPIDE.md\n`, 'cyan');

