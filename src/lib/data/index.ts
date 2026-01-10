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

// Partie 3 - Calendrier, Navigation, Performance, Finance enrichie
export {
  agendaEvents,
  plannedAbsences,
  performanceData,
  raciMatrix,
  auditItems,
  consignesBureaux,
  organigramme,
  navSections,
  // Finance enrichie
  financials,
  financialGains,
  financialLosses,
  treasuryEntries,
  // Charts
  bureauPieData,
  projectStatusData,
  // Stats Clients
  clientsStats,
  clientsGlobalStats,
  // Paramètres & Détails
  defaultUserSettings,
  bureauxDetails,
  budgetAlerts,
  projectBudgets,
  // RH Proactif
  missions,
  evaluations,
  criticalSkills,
  // Factures avec décision BMO
  facturesRecues,
} from './bmo-mock-3';

// Partie 4 - Projets & Clients - Écosystème vivant
export {
  // Types/Interfaces
  type Client,
  type ClientDemand,
  type ProjectTimeline,
  type ProjectTimelineEvent,
  type ClientHistory,
  type ClientHistoryEvent,
  // Données
  clients,
  clientDemands,
  projectTimelines,
  clientHistories,
  projectsEnriched,
  clientStats,
  clientDemandStats,
} from './bmo-mock-4';

// Bâtiments
export {
  buildings,
} from './buildings';

// Partie 5 - Gouvernance & Système
export {
  bureauxGovernance,
  orgChanges,
  delegationsEnriched,
  decisionsEnriched,
  raciEnriched,
  auditEnriched,
  apiEndpoints,
  apiIntegrations,
  aiModules,
  aiHistory,
  systemLogs,
} from './bmo-mock-5';

// Partie 6 - Coordination Stratégique
export {
  conferencesDecisionnelles,
} from './bmo-mock-6';

// Partie 7 - Nomenclature
export {
  NOMENCLATURE,
} from './nomenclature';

export {
  echangesStructures,
  arbitragesVivants,
  coordinationStats,
} from './bmo-mock-6';

// Avenants avec décision BMO
export {
  type Avenant,
  type AvenantStatut,
  avenants,
} from './avenants';

// Alertes & Risques (données enrichies)
export {
  type Alert,
  type AlertSeverity,
  type AlertType,
  type AlertStatus,
  type AlertAction,
  type AlertTimelineEvent,
  type AlertStats,
  alerts,
  filterAlertsByQueue,
  calculateAlertStats,
  getAlertById,
  searchAlerts,
} from './alerts';