#!/usr/bin/env node

/**
 * Script de vérification du module Gouvernance
 * Vérifie que tous les fichiers et dépendances sont en place
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Fichiers requis
const requiredFiles = [
  // Store
  'src/lib/stores/governanceCommandCenterStore.ts',
  
  // Services
  'src/lib/services/governanceService.ts',
  
  // Mocks
  'src/lib/mocks/governanceMockData.ts',
  
  // Utils
  'src/lib/utils/governanceHelpers.ts',
  
  // Constants
  'src/lib/constants/governanceConstants.ts',
  
  // Hooks
  'src/lib/hooks/useGovernanceData.ts',
  
  // Components - Main
  'src/components/features/bmo/governance/command-center/CommandCenterSidebar.tsx',
  'src/components/features/bmo/governance/command-center/SubNavigation.tsx',
  'src/components/features/bmo/governance/command-center/KPIBar.tsx',
  'src/components/features/bmo/governance/command-center/ContentRouter.tsx',
  'src/components/features/bmo/governance/command-center/SurveillanceTable.tsx',
  'src/components/features/bmo/governance/command-center/DetailModal.tsx',
  'src/components/features/bmo/governance/command-center/DetailPanel.tsx',
  'src/components/features/bmo/governance/command-center/CommandPalette.tsx',
  'src/components/features/bmo/governance/command-center/NotificationsPanel.tsx',
  'src/components/features/bmo/governance/command-center/ActionsMenu.tsx',
  'src/components/features/bmo/governance/command-center/BatchActionsBar.tsx',
  'src/components/features/bmo/governance/command-center/EmptyState.tsx',
  
  // Components - Views
  'src/components/features/bmo/governance/command-center/views/OverviewView.tsx',
  'src/components/features/bmo/governance/command-center/views/ProjectsView.tsx',
  'src/components/features/bmo/governance/command-center/views/RisksView.tsx',
  'src/components/features/bmo/governance/command-center/views/ResourcesView.tsx',
  'src/components/features/bmo/governance/command-center/views/FinancialView.tsx',
  'src/components/features/bmo/governance/command-center/views/ComplianceView.tsx',
  'src/components/features/bmo/governance/command-center/views/ProcessesView.tsx',
  
  // Components - Modals
  'src/components/features/bmo/governance/command-center/modals/DecisionModal.tsx',
  'src/components/features/bmo/governance/command-center/modals/EscalationModal.tsx',
  'src/components/features/bmo/governance/command-center/modals/FiltersModal.tsx',
  'src/components/features/bmo/governance/command-center/modals/ExportModal.tsx',
  'src/components/features/bmo/governance/command-center/modals/ConfirmDialog.tsx',
  
  // Config & Types
  'src/components/features/bmo/governance/command-center/config.ts',
  'src/components/features/bmo/governance/command-center/types.ts',
  
  // Index files
  'src/components/features/bmo/governance/command-center/index.ts',
  'src/components/features/bmo/governance/command-center/modals/index.ts',
  'src/components/features/bmo/governance/command-center/views/index.ts',
  
  // Page
  'app/(portals)/maitre-ouvrage/governance/page.tsx',
  
  // Documentation
  'src/components/features/bmo/governance/command-center/README.md',
  'INSTALLATION_GOVERNANCE.md',
];

// Dépendances npm requises
const requiredDependencies = [
  'lucide-react',
  'zustand',
  'recharts',
  'next',
  'react',
  'react-dom',
];

// Dépendances optionnelles (recommandées)
const optionalDependencies = [
  '@tanstack/react-query',
];

console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}  Vérification du Module Gouvernance${colors.reset}`);
console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

// Vérification des fichiers
console.log(`${colors.yellow}📁 Vérification des fichiers...${colors.reset}\n`);

let missingFiles = 0;
let existingFiles = 0;

requiredFiles.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`${colors.green}✓${colors.reset} ${file}`);
    existingFiles++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${file} ${colors.red}(MANQUANT)${colors.reset}`);
    missingFiles++;
  }
});

console.log(`\n${colors.blue}Résumé:${colors.reset} ${existingFiles}/${requiredFiles.length} fichiers présents\n`);

// Vérification des dépendances
console.log(`${colors.yellow}📦 Vérification des dépendances npm...${colors.reset}\n`);

let packageJson;
try {
  packageJson = require(path.join(process.cwd(), 'package.json'));
} catch (error) {
  console.log(`${colors.red}✗ Impossible de lire package.json${colors.reset}\n`);
  process.exit(1);
}

const allDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

let missingDeps = 0;
let existingDeps = 0;

requiredDependencies.forEach((dep) => {
  if (allDependencies[dep]) {
    console.log(`${colors.green}✓${colors.reset} ${dep} (${allDependencies[dep]})`);
    existingDeps++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${dep} ${colors.red}(MANQUANT)${colors.reset}`);
    missingDeps++;
  }
});

console.log(`\n${colors.blue}Dépendances optionnelles:${colors.reset}\n`);

optionalDependencies.forEach((dep) => {
  if (allDependencies[dep]) {
    console.log(`${colors.green}✓${colors.reset} ${dep} (${allDependencies[dep]}) ${colors.green}(installé)${colors.reset}`);
  } else {
    console.log(`${colors.yellow}○${colors.reset} ${dep} ${colors.yellow}(optionnel, recommandé)${colors.reset}`);
  }
});

// Vérification de la configuration
console.log(`\n${colors.yellow}⚙️  Vérification de la configuration...${colors.reset}\n`);

const envFiles = ['.env.local', '.env'];
let envFound = false;

for (const envFile of envFiles) {
  if (fs.existsSync(path.join(process.cwd(), envFile))) {
    console.log(`${colors.green}✓${colors.reset} Fichier de configuration trouvé: ${envFile}`);
    envFound = true;
    break;
  }
}

if (!envFound) {
  console.log(`${colors.yellow}⚠${colors.reset}  Aucun fichier .env trouvé (optionnel)`);
  console.log(`${colors.yellow}  → Copiez .env.governance.example vers .env.local si nécessaire${colors.reset}`);
}

// Résumé final
console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}  Résumé${colors.reset}`);
console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

if (missingFiles === 0 && missingDeps === 0) {
  console.log(`${colors.green}✓ Tous les fichiers et dépendances requis sont présents !${colors.reset}`);
  console.log(`${colors.green}✓ Le module Gouvernance est prêt à être utilisé.${colors.reset}\n`);
  
  console.log(`${colors.blue}Prochaines étapes:${colors.reset}`);
  console.log(`  1. Configurez votre .env.local si nécessaire`);
  console.log(`  2. Lancez le serveur de développement: npm run dev`);
  console.log(`  3. Accédez à: http://localhost:3000/maitre-ouvrage/governance\n`);
  
  process.exit(0);
} else {
  console.log(`${colors.red}✗ Installation incomplète${colors.reset}\n`);
  
  if (missingFiles > 0) {
    console.log(`${colors.red}  → ${missingFiles} fichier(s) manquant(s)${colors.reset}`);
  }
  
  if (missingDeps > 0) {
    console.log(`${colors.red}  → ${missingDeps} dépendance(s) manquante(s)${colors.reset}`);
    console.log(`${colors.yellow}  → Installez-les avec: npm install ${requiredDependencies.join(' ')}${colors.reset}`);
  }
  
  console.log();
  process.exit(1);
}

