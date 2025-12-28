// ============================================
// Export centralisé des données mockées BMO
// ============================================

// Partie 1 - Données principales
export {
  bureaux,
  employees,
  employeesDetails,
  projects,
  demands,
  delegations,
  decisions,
  substitutions,
  timeline,
} from './bmo-mock';

// Partie 2 - Validations, RH, Échanges, Finance
export {
  bcToValidate,
  contractsToSign,
  paymentsN1,
  facturesToValidate,
  avenantsToValidate,
  blockedDossiers,
  demandesRH,
  echangesBureaux,
  arbitrages,
  messagesExternes,
  recouvrements,
  litiges,
  systemAlerts,
  reminders,
  notes,
} from './bmo-mock-2';

// Partie 3 - Calendrier, Navigation, Performance
export {
  agendaEvents,
  performanceData,
  raciMatrix,
  auditItems,
  consignesBureaux,
  organigramme,
  navSections,
  financials,
  bureauPieData,
  projectStatusData,
} from './bmo-mock-3';
