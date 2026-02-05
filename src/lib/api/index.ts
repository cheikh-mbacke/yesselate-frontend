/**
 * API centralisée - Point d'entrée unique pour toutes les API
 */

export * from './demands-api';

// Ici vous pourrez ajouter d'autres modules API :
// export * from './decisions-api';
// export * from './bureaux-api';
// export * from './employees-api';
// etc.

// Pilotage (BMO)
export * from './pilotage/dashboardClient';
export * from './pilotage/alertsClient';
export * from './pilotage/calendarClient';
export * from './pilotage/analyticsClient';

