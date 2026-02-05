/**
 * Service d'Alertes Intelligentes
 * =================================
 * 
 * Système proactif d'alertes basé sur des règles métier configurables
 */

// ============================================
// TYPES
// ============================================

export type AlertType = 'warning' | 'danger' | 'info' | 'success';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'ignored';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  module: string;
  titre: string;
  description: string;
  entityId?: string;
  entityType?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  module: string;
  severity: AlertSeverity;
  enabled: boolean;
  condition: (data: unknown) => boolean;
  generateAlert: (data: unknown) => Omit<Alert, 'id' | 'createdAt' | 'status'>;
  checkInterval?: number; // ms, par défaut 60000 (1 min)
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  parSeverity: Array<{ severity: AlertSeverity; count: number }>;
  parModule: Array<{ module: string; count: number }>;
  criticalUnresolved: number;
}

// ============================================
// RÈGLES D'ALERTES PRÉDÉFINIES
// ============================================

export const defaultAlertRules: AlertRule[] = [
  // Règle 1: SLA Ticket Dépassé
  {
    id: 'sla_ticket_depassement',
    name: 'SLA Ticket Dépassé',
    description: 'Alerte lorsqu\'un ticket client dépasse son SLA',
    module: 'tickets-clients',
    severity: 'critical',
    enabled: true,
    condition: (data: any) => data.slaDepassement === true,
    generateAlert: (data: any) => ({
      type: 'danger',
      severity: 'critical',
      module: 'tickets-clients',
      titre: 'SLA Ticket Dépassé',
      description: `Le ticket ${data.numero} a dépassé son SLA de ${data.slaEcoule - data.slaDelai}h`,
      entityId: data.id,
      entityType: 'ticket',
      actionRequired: true,
      actionUrl: `/maitre-ouvrage/tickets-clients?ticket=${data.id}`,
      actionLabel: 'Traiter le ticket',
    }),
  },

  // Règle 2: Trésorerie Faible
  {
    id: 'tresorerie_faible',
    name: 'Trésorerie Critique',
    description: 'Alerte si la trésorerie est inférieure au seuil',
    module: 'finances',
    severity: 'high',
    enabled: true,
    condition: (data: any) => data.tresorerie < 1000000, // < 1M FCFA
    generateAlert: (data: any) => ({
      type: 'warning',
      severity: 'high',
      module: 'finances',
      titre: 'Trésorerie Faible',
      description: `Trésorerie actuelle: ${(data.tresorerie / 1000000).toFixed(2)}M FCFA (seuil: 1M)`,
      actionRequired: true,
      actionUrl: '/maitre-ouvrage/finances',
      actionLabel: 'Voir la trésorerie',
    }),
  },

  // Règle 3: Projet Bloqué Longue Durée
  {
    id: 'projet_bloque_longue_duree',
    name: 'Projet Bloqué > 7 Jours',
    description: 'Alerte si un projet est bloqué depuis plus de 7 jours',
    module: 'projets',
    severity: 'critical',
    enabled: true,
    condition: (data: any) => {
      if (data.status !== 'bloque') return false;
      const daysSinceBlock = Math.floor(
        (Date.now() - new Date(data.dateBlock).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceBlock > 7;
    },
    generateAlert: (data: any) => {
      const daysSinceBlock = Math.floor(
        (Date.now() - new Date(data.dateBlock).getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        type: 'danger',
        severity: 'critical',
        module: 'projets',
        titre: 'Projet Bloqué Depuis Longtemps',
        description: `${data.titre} est bloqué depuis ${daysSinceBlock} jours`,
        entityId: data.id,
        entityType: 'projet',
        actionRequired: true,
        actionUrl: `/maitre-ouvrage/projets-en-cours?projet=${data.id}`,
        actionLabel: 'Débloquer le projet',
      };
    },
  },

  // Règle 4: BC en Attente Validation > 48h
  {
    id: 'bc_attente_validation',
    name: 'BC en Attente > 48h',
    description: 'Alerte si un BC attend validation depuis plus de 48h',
    module: 'validation-bc',
    severity: 'high',
    enabled: true,
    condition: (data: any) => {
      if (data.status !== 'en_attente') return false;
      const hoursSince = (Date.now() - new Date(data.dateCreation).getTime()) / (1000 * 60 * 60);
      return hoursSince > 48;
    },
    generateAlert: (data: any) => {
      const hoursSince = Math.floor(
        (Date.now() - new Date(data.dateCreation).getTime()) / (1000 * 60 * 60)
      );
      return {
        type: 'warning',
        severity: 'high',
        module: 'validation-bc',
        titre: 'BC en Attente de Validation',
        description: `Le BC ${data.numero} attend validation depuis ${hoursSince}h`,
        entityId: data.id,
        entityType: 'bc',
        actionRequired: true,
        actionUrl: `/maitre-ouvrage/validation-bc?bc=${data.id}`,
        actionLabel: 'Valider le BC',
      };
    },
  },

  // Règle 5: Employé SPOF Identifié
  {
    id: 'employe_spof',
    name: 'Employé SPOF Détecté',
    description: 'Alerte lorsqu\'un employé est identifié comme SPOF',
    module: 'employes',
    severity: 'medium',
    enabled: true,
    condition: (data: any) => data.isSPOF === true,
    generateAlert: (data: any) => ({
      type: 'warning',
      severity: 'medium',
      module: 'employes',
      titre: 'Employé SPOF Identifié',
      description: `${data.prenom} ${data.nom} possède des compétences uniques critiques`,
      entityId: data.id,
      entityType: 'employe',
      actionRequired: true,
      actionUrl: `/maitre-ouvrage/employes?employe=${data.id}`,
      actionLabel: 'Voir le profil',
      tags: ['SPOF', 'risque'],
    }),
  },

  // Règle 6: Budget Projet Dépassé
  {
    id: 'budget_projet_depasse',
    name: 'Budget Projet Dépassé',
    description: 'Alerte si le budget consommé dépasse le budget alloué',
    module: 'projets',
    severity: 'high',
    enabled: true,
    condition: (data: any) => data.budgetConsomme > data.budget,
    generateAlert: (data: any) => ({
      type: 'danger',
      severity: 'high',
      module: 'projets',
      titre: 'Dépassement Budgétaire',
      description: `Le projet ${data.titre} a dépassé son budget de ${((data.budgetConsomme - data.budget) / 1000000).toFixed(2)}M FCFA`,
      entityId: data.id,
      entityType: 'projet',
      actionRequired: true,
      actionUrl: `/maitre-ouvrage/projets-en-cours?projet=${data.id}`,
      actionLabel: 'Voir le projet',
    }),
  },

  // Règle 7: Créance en Retard > 90j
  {
    id: 'creance_retard_longue',
    name: 'Créance en Retard > 90j',
    description: 'Alerte pour créances impayées depuis plus de 90 jours',
    module: 'recouvrements',
    severity: 'high',
    enabled: true,
    condition: (data: any) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(data.dateEcheance).getTime()) / (1000 * 60 * 60 * 24)
      );
      return data.status === 'en_retard' && daysSince > 90;
    },
    generateAlert: (data: any) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(data.dateEcheance).getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        type: 'danger',
        severity: 'high',
        module: 'recouvrements',
        titre: 'Créance en Retard Important',
        description: `Créance de ${(data.montant / 1000000).toFixed(2)}M FCFA impayée depuis ${daysSince} jours`,
        entityId: data.id,
        entityType: 'creance',
        actionRequired: true,
        actionUrl: `/maitre-ouvrage/recouvrements?creance=${data.id}`,
        actionLabel: 'Gérer la créance',
      };
    },
  },
];

// ============================================
// SERVICE
// ============================================

class AlertingService {
  private baseUrl = '/api/alerts';
  private rules: AlertRule[] = [...defaultAlertRules];
  private activeAlerts: Alert[] = [];
  private checkIntervalId: NodeJS.Timeout | null = null;

  /**
   * Démarre la vérification périodique des alertes
   */
  startMonitoring(interval: number = 60000): void {
    if (this.checkIntervalId) {
      console.log('Monitoring déjà actif');
      return;
    }

    console.log('🔔 Démarrage du monitoring des alertes');

    // Vérification initiale
    void this.checkAlerts();

    // Vérification périodique
    this.checkIntervalId = setInterval(() => {
      void this.checkAlerts();
    }, interval);
  }

  /**
   * Arrête la vérification périodique
   */
  stopMonitoring(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      console.log('Monitoring des alertes arrêté');
    }
  }

  /**
   * Vérifie toutes les règles et génère les alertes
   */
  async checkAlerts(): Promise<Alert[]> {
    const newAlerts: Alert[] = [];

    // En production: récupérer les données depuis les APIs
    // Pour simulation, on utilise des données mock

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Simuler récupération des données du module
      const moduleData = await this.getModuleData(rule.module);

      // Vérifier chaque élément
      for (const item of moduleData) {
        try {
          if (rule.condition(item)) {
            // Condition remplie, générer alerte
            const existingAlert = this.activeAlerts.find(
              (a) => a.entityId === item.id && a.module === rule.module && a.status === 'active'
            );

            // Ne créer l'alerte que si elle n'existe pas déjà
            if (!existingAlert) {
              const alertData = rule.generateAlert(item);
              const alert: Alert = {
                ...alertData,
                id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: 'active',
                createdAt: new Date().toISOString(),
              };

              newAlerts.push(alert);
              this.activeAlerts.push(alert);

              console.log(`🚨 Nouvelle alerte: ${alert.titre}`);
            }
          }
        } catch (e) {
          console.error(`Erreur vérification règle ${rule.name}:`, e);
        }
      }
    }

    return newAlerts;
  }

  /**
   * Récupère les données d'un module (simulation)
   */
  private async getModuleData(module: string): Promise<any[]> {
    // En production: appeler les vrais services API
    // Pour simulation: retourner données mock

    switch (module) {
      case 'projets':
        return [
          { id: 'PRJ-001', titre: 'Route RN7', status: 'bloque', dateBlock: '2025-12-25', budget: 1000000, budgetConsomme: 1200000 },
        ];
      case 'tickets-clients':
        return [
          { id: 'TCK-001', numero: 'TCK-2026-001', slaDepassement: true, slaDelai: 24, slaEcoule: 48 },
        ];
      case 'finances':
        return [{ tresorerie: 800000 }];
      default:
        return [];
    }
  }

  /**
   * Récupère les alertes actives
   */
  async getActiveAlerts(filters?: {
    module?: string;
    severity?: AlertSeverity[];
    status?: AlertStatus[];
  }): Promise<Alert[]> {
    await this.delay(300);

    let alerts = [...this.activeAlerts];

    if (filters?.module) {
      alerts = alerts.filter((a) => a.module === filters.module);
    }

    if (filters?.severity) {
      alerts = alerts.filter((a) => filters.severity!.includes(a.severity));
    }

    if (filters?.status) {
      alerts = alerts.filter((a) => filters.status!.includes(a.status));
    }

    return alerts.sort((a, b) => {
      // Trier par sévérité puis par date
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (a.severity !== b.severity) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Accuse réception d'une alerte
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<Alert> {
    await this.delay(200);

    const alert = this.activeAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Alerte non trouvée');

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;

    return alert;
  }

  /**
   * Résout une alerte
   */
  async resolveAlert(alertId: string, userId: string): Promise<Alert> {
    await this.delay(200);

    const alert = this.activeAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Alerte non trouvée');

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = userId;

    return alert;
  }

  /**
   * Ignore une alerte
   */
  async ignoreAlert(alertId: string): Promise<void> {
    await this.delay(200);

    const alert = this.activeAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'ignored';
    }
  }

  /**
   * Récupère les statistiques des alertes
   */
  async getStats(): Promise<AlertStats> {
    await this.delay(200);

    const alerts = this.activeAlerts;

    return {
      total: alerts.length,
      active: alerts.filter((a) => a.status === 'active').length,
      acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
      parSeverity: [
        { severity: 'critical', count: alerts.filter((a) => a.severity === 'critical').length },
        { severity: 'high', count: alerts.filter((a) => a.severity === 'high').length },
        { severity: 'medium', count: alerts.filter((a) => a.severity === 'medium').length },
        { severity: 'low', count: alerts.filter((a) => a.severity === 'low').length },
      ],
      parModule: Array.from(new Set(alerts.map((a) => a.module))).map((module) => ({
        module,
        count: alerts.filter((a) => a.module === module).length,
      })),
      criticalUnresolved: alerts.filter(
        (a) => a.severity === 'critical' && a.status === 'active'
      ).length,
    };
  }

  /**
   * Ajoute une règle personnalisée
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
    console.log(`Règle ajoutée: ${rule.name}`);
  }

  /**
   * Active/désactive une règle
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(`Règle ${rule.name}: ${enabled ? 'activée' : 'désactivée'}`);
    }
  }

  /**
   * Récupère toutes les règles
   */
  getRules(): AlertRule[] {
    return [...this.rules];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const alertingService = new AlertingService();

