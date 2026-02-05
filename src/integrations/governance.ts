/**
 * Points d'intégration du module Gouvernance avec le reste de l'application
 * Ce fichier documente comment intégrer le module Gouvernance avec d'autres modules
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. NAVIGATION GLOBALE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lien à ajouter dans votre navigation principale
 */
export const governanceNavigationLink = {
  label: 'Gouvernance',
  href: '/maitre-ouvrage/governance',
  icon: 'LayoutDashboard', // ou votre icône préférée
  description: 'Centre de commandement stratégique',
  requiredPermission: 'governance:view',
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. NOTIFICATIONS GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comment écouter les événements de gouvernance dans votre système de notifications global
 */
export const governanceNotificationEvents = {
  // Événements à écouter
  DECISION_PENDING: 'governance:decision:pending',
  ESCALATION_CREATED: 'governance:escalation:created',
  ALERT_CRITICAL: 'governance:alert:critical',
  PROJECT_AT_RISK: 'governance:project:at-risk',
  BUDGET_EXCEEDED: 'governance:budget:exceeded',
  DEADLINE_APPROACHING: 'governance:deadline:approaching',
};

/**
 * Exemple d'intégration avec un système d'événements global
 */
/*
import { eventBus } from '@/lib/eventBus';
import { governanceNotificationEvents } from '@/integrations/governance';

// Écouter les événements
eventBus.on(governanceNotificationEvents.DECISION_PENDING, (data) => {
  // Afficher une notification toast
  toast.warning(`Décision en attente: ${data.subject}`);
});

eventBus.on(governanceNotificationEvents.ALERT_CRITICAL, (data) => {
  // Notification critique
  toast.error(`Alerte critique: ${data.title}`, { duration: 10000 });
});
*/

// ═══════════════════════════════════════════════════════════════════════════
// 3. PERMISSIONS & CONTRÔLE D'ACCÈS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Liste des permissions utilisées par le module Gouvernance
 * À intégrer dans votre système de gestion des permissions
 */
export const governancePermissions = {
  // Lecture
  VIEW_DASHBOARD: 'governance:dashboard:view',
  VIEW_PROJECTS: 'governance:projects:view',
  VIEW_RISKS: 'governance:risks:view',
  VIEW_ALERTS: 'governance:alerts:view',
  VIEW_DECISIONS: 'governance:decisions:view',
  VIEW_FINANCIALS: 'governance:financials:view',
  VIEW_COMPLIANCE: 'governance:compliance:view',
  VIEW_PROCESSES: 'governance:processes:view',
  
  // Écriture
  EDIT_PROJECTS: 'governance:projects:edit',
  EDIT_RISKS: 'governance:risks:edit',
  CREATE_RISKS: 'governance:risks:create',
  RESOLVE_ALERTS: 'governance:alerts:resolve',
  
  // Actions spéciales
  APPROVE_DECISIONS: 'governance:decisions:approve',
  REJECT_DECISIONS: 'governance:decisions:reject',
  CREATE_ESCALATION: 'governance:escalations:create',
  RESOLVE_ESCALATION: 'governance:escalations:resolve',
  
  // Administration
  EXPORT_DATA: 'governance:export',
  MANAGE_SETTINGS: 'governance:settings:manage',
  VIEW_AUDIT_LOGS: 'governance:audit:view',
};

/**
 * Exemple de vérification de permissions dans vos composants
 */
/*
import { usePermissions } from '@/hooks/usePermissions';
import { governancePermissions } from '@/integrations/governance';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  const canApproveDecisions = hasPermission(governancePermissions.APPROVE_DECISIONS);
  
  return (
    <div>
      {canApproveDecisions && (
        <Button onClick={handleApprove}>Approuver</Button>
      )}
    </div>
  );
}
*/

// ═══════════════════════════════════════════════════════════════════════════
// 4. WEBHOOKS & INTÉGRATIONS EXTERNES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Événements qui peuvent déclencher des webhooks
 */
export const governanceWebhookEvents = [
  'project.created',
  'project.updated',
  'project.status_changed',
  'risk.created',
  'risk.status_changed',
  'alert.created',
  'decision.pending',
  'decision.approved',
  'decision.rejected',
  'escalation.created',
  'escalation.resolved',
  'budget.threshold_exceeded',
  'deadline.missed',
];

/**
 * Format de payload pour les webhooks
 */
export interface GovernanceWebhookPayload {
  event: string;
  timestamp: string;
  data: {
    id: string;
    type: string;
    [key: string]: any;
  };
  metadata: {
    userId?: string;
    source: 'governance-module';
    version: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. INTÉGRATION MS TEAMS / SLACK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Templates de messages pour MS Teams
 */
export const teamsMessageTemplates = {
  decisionPending: (decision: any) => ({
    "@type": "MessageCard",
    "summary": `Décision en attente: ${decision.subject}`,
    "sections": [{
      "activityTitle": "🔔 Nouvelle décision à valider",
      "activitySubtitle": decision.subject,
      "facts": [
        { "name": "Type:", "value": decision.type },
        { "name": "Impact:", "value": decision.impact },
        { "name": "Échéance:", "value": decision.deadline },
      ],
    }],
    "potentialAction": [{
      "@type": "OpenUri",
      "name": "Voir la décision",
      "targets": [{ "os": "default", "uri": `${process.env.NEXT_PUBLIC_APP_URL}/governance?modal=decision&id=${decision.id}` }]
    }]
  }),
  
  alertCritical: (alert: any) => ({
    "@type": "MessageCard",
    "themeColor": "FF0000",
    "summary": `Alerte critique: ${alert.title}`,
    "sections": [{
      "activityTitle": "⚠️ ALERTE CRITIQUE",
      "activitySubtitle": alert.title,
      "text": alert.description,
    }],
  }),
};

/**
 * Templates de messages pour Slack
 */
export const slackMessageTemplates = {
  decisionPending: (decision: any) => ({
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🔔 Nouvelle décision à valider" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Sujet:*\n${decision.subject}` },
          { type: "mrkdwn", text: `*Type:*\n${decision.type}` },
          { type: "mrkdwn", text: `*Impact:*\n${decision.impact}` },
          { type: "mrkdwn", text: `*Échéance:*\n${decision.deadline}` },
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Voir la décision" },
            url: `${process.env.NEXT_PUBLIC_APP_URL}/governance?modal=decision&id=${decision.id}`
          }
        ]
      }
    ]
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. ANALYTICS & TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Événements à tracker dans votre système d'analytics (GA, Mixpanel, etc.)
 */
export const governanceAnalyticsEvents = {
  // Navigation
  VIEW_DASHBOARD: 'governance_view_dashboard',
  VIEW_PROJECT_DETAILS: 'governance_view_project_details',
  VIEW_RISK_DETAILS: 'governance_view_risk_details',
  
  // Actions
  APPROVE_DECISION: 'governance_approve_decision',
  REJECT_DECISION: 'governance_reject_decision',
  CREATE_ESCALATION: 'governance_create_escalation',
  EXPORT_DATA: 'governance_export_data',
  
  // Recherche
  SEARCH_COMMAND_PALETTE: 'governance_search_command_palette',
  APPLY_FILTER: 'governance_apply_filter',
  
  // Engagement
  TIME_ON_DASHBOARD: 'governance_time_on_dashboard',
  KPI_CLICKED: 'governance_kpi_clicked',
};

/**
 * Exemple d'intégration avec Google Analytics
 */
/*
import { trackEvent } from '@/lib/analytics';
import { governanceAnalyticsEvents } from '@/integrations/governance';

// Dans vos composants
const handleApproveDecision = (decision) => {
  trackEvent(governanceAnalyticsEvents.APPROVE_DECISION, {
    decision_id: decision.id,
    decision_type: decision.type,
    impact: decision.impact,
  });
  
  // ... reste de la logique
};
*/

// ═══════════════════════════════════════════════════════════════════════════
// 7. LIENS INTER-MODULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comment créer des liens vers le module Gouvernance depuis d'autres modules
 */
export const createGovernanceLink = {
  // Ouvrir un projet spécifique
  toProject: (projectId: string) => 
    `/maitre-ouvrage/governance?view=projets&id=${projectId}`,
  
  // Ouvrir un risque spécifique
  toRisk: (riskId: string) => 
    `/maitre-ouvrage/governance?view=risques&id=${riskId}`,
  
  // Ouvrir une alerte spécifique
  toAlert: (alertId: string) => 
    `/maitre-ouvrage/governance?view=pilotage&modal=alert&id=${alertId}`,
  
  // Ouvrir une décision spécifique
  toDecision: (decisionId: string) => 
    `/maitre-ouvrage/governance?modal=decision&id=${decisionId}`,
  
  // Ouvrir le dashboard avec un filtre
  toDashboardFiltered: (filter: string, value: string) => 
    `/maitre-ouvrage/governance?filter=${filter}&value=${value}`,
};

// ═══════════════════════════════════════════════════════════════════════════
// 8. PARTAGE D'ÉTAT ENTRE MODULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Comment accéder au store Gouvernance depuis d'autres modules
 */
/*
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

function ExternalComponent() {
  // Accéder à l'état de navigation actuel
  const currentNavigation = useGovernanceCommandCenterStore((state) => state.currentNavigation);
  
  // Déclencher une navigation depuis l'extérieur
  const { goTo } = useGovernanceCommandCenterStore();
  
  const handleNavigateToRisks = () => {
    goTo(['surveillance', 'risques', 'registre']);
  };
  
  // Ouvrir une modale depuis l'extérieur
  const { openModal } = useGovernanceCommandCenterStore();
  
  const handleShowProject = (projectId: string) => {
    openModal('detail', {
      type: 'project',
      id: projectId,
    });
  };
  
  return <div>...</div>;
}
*/

// ═══════════════════════════════════════════════════════════════════════════
// 9. API ENDPOINTS À IMPLÉMENTER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Liste complète des endpoints API attendus par le module
 * À implémenter dans votre backend
 */
export const governanceApiEndpoints = {
  // Projects
  'GET /api/governance/projects': 'Liste des projets (paginée)',
  'GET /api/governance/projects/:id': 'Détails d\'un projet',
  'PATCH /api/governance/projects/:id': 'Mise à jour d\'un projet',
  
  // Risks
  'GET /api/governance/risks': 'Liste des risques (paginée)',
  'POST /api/governance/risks': 'Création d\'un risque',
  'GET /api/governance/risks/:id': 'Détails d\'un risque',
  'PATCH /api/governance/risks/:id': 'Mise à jour d\'un risque',
  
  // Alerts
  'GET /api/governance/alerts': 'Liste des alertes (paginée)',
  'POST /api/governance/alerts/:id/read': 'Marquer une alerte comme lue',
  'POST /api/governance/alerts/read-all': 'Marquer toutes les alertes comme lues',
  'POST /api/governance/alerts/:id/resolve': 'Résoudre une alerte',
  'POST /api/governance/alerts/:id/dismiss': 'Ignorer une alerte',
  
  // Decisions
  'GET /api/governance/decisions': 'Liste des décisions (paginée)',
  'POST /api/governance/decisions': 'Création d\'une décision',
  'GET /api/governance/decisions/:id': 'Détails d\'une décision',
  'POST /api/governance/decisions/:id/approve': 'Approuver une décision',
  'POST /api/governance/decisions/:id/reject': 'Rejeter une décision',
  'POST /api/governance/decisions/:id/defer': 'Différer une décision',
  
  // Escalations
  'GET /api/governance/escalations': 'Liste des escalades (paginée)',
  'POST /api/governance/escalations': 'Création d\'une escalade',
  'GET /api/governance/escalations/:id': 'Détails d\'une escalade',
  'POST /api/governance/escalations/:id/resolve': 'Résoudre une escalade',
  
  // KPIs
  'GET /api/governance/kpis': 'Tous les KPIs',
  'GET /api/governance/kpis/:id': 'Un KPI spécifique avec historique',
  
  // Dashboard
  'GET /api/governance/dashboard': 'Données du dashboard',
  
  // Export
  'POST /api/governance/export': 'Export de données (format configurable)',
};

// ═══════════════════════════════════════════════════════════════════════════
// 10. EXEMPLES D'UTILISATION DANS D'AUTRES MODULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exemple 1: Afficher un widget Gouvernance dans un autre module
 */
/*
import { useProjects } from '@/lib/hooks/useGovernanceData';
import { createGovernanceLink } from '@/integrations/governance';

function ProjectsWidget() {
  const { data: projects, isLoading } = useProjects({ 
    status: 'active',
    healthStatus: 'at-risk' 
  });
  
  return (
    <div className="widget">
      <h3>Projets à risque</h3>
      {projects?.data.map(project => (
        <Link 
          key={project.id} 
          href={createGovernanceLink.toProject(project.id)}
        >
          {project.name}
        </Link>
      ))}
    </div>
  );
}
*/

/**
 * Exemple 2: Utiliser les helpers métier dans un autre contexte
 */
/*
import { calculateProjectHealth, formatCurrency } from '@/lib/utils/governanceHelpers';

function ProjectCard({ project }) {
  const health = calculateProjectHealth(project);
  const remainingBudget = project.budget - project.budgetConsumed;
  
  return (
    <div>
      <h3>{project.name}</h3>
      <span className={`status-${health}`}>{health}</span>
      <p>Budget restant: {formatCurrency(remainingBudget)}</p>
    </div>
  );
}
*/

/**
 * Exemple 3: Écouter les changements du store Gouvernance
 */
/*
import { useEffect } from 'react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

function SyncComponent() {
  // S'abonner aux changements de navigation
  useEffect(() => {
    const unsubscribe = useGovernanceCommandCenterStore.subscribe(
      (state) => state.currentNavigation,
      (currentNavigation) => {
        console.log('Navigation changed:', currentNavigation);
        // Synchroniser avec votre système de routing global
      }
    );
    
    return unsubscribe;
  }, []);
  
  return null;
}
*/

export default {
  navigationLink: governanceNavigationLink,
  notificationEvents: governanceNotificationEvents,
  permissions: governancePermissions,
  webhookEvents: governanceWebhookEvents,
  analyticsEvents: governanceAnalyticsEvents,
  createLink: createGovernanceLink,
  apiEndpoints: governanceApiEndpoints,
};

