/**
 * Templates de résolution pour les alertes récurrentes
 * Gestion des réponses rapides et templates personnalisés
 */

export interface ResolutionTemplate {
  id: string;
  title: string;
  type: 'payment' | 'contract' | 'sla' | 'blocked' | 'system' | 'budget' | 'custom';
  template: string;
  variables: string[]; // Variables à remplacer dans le template
  resolutionType: 'fixed' | 'workaround' | 'duplicate' | 'wont-fix' | 'false-positive';
  category?: string;
  tags?: string[];
  usageCount: number;
  createdBy?: string;
  lastUsed?: string;
  estimatedTimeMinutes?: number;
}

// ================================
// Templates prédéfinis
// ================================

export const DEFAULT_TEMPLATES: ResolutionTemplate[] = [
  {
    id: 'payment-validated',
    title: 'Paiement validé',
    type: 'payment',
    template: 'Paiement de {amount}€ validé le {date}. Référence: {ref}. Créditeur: {creditor}.',
    variables: ['amount', 'date', 'ref', 'creditor'],
    resolutionType: 'fixed',
    usageCount: 245,
    estimatedTimeMinutes: 2,
  },
  {
    id: 'payment-rejected',
    title: 'Paiement rejeté',
    type: 'payment',
    template: 'Paiement de {amount}€ rejeté. Raison: {reason}. Action requise: {action}.',
    variables: ['amount', 'reason', 'action'],
    resolutionType: 'fixed',
    usageCount: 87,
    estimatedTimeMinutes: 5,
  },
  {
    id: 'false-positive',
    title: 'Faux positif',
    type: 'system',
    template: 'Faux positif confirmé. Règle "{rule}" à ajuster. Détails: {details}',
    variables: ['rule', 'details'],
    resolutionType: 'false-positive',
    usageCount: 156,
    estimatedTimeMinutes: 3,
  },
  {
    id: 'sla-extended',
    title: 'SLA prolongé',
    type: 'sla',
    template: 'SLA prolongé de {days} jours. Raison: {reason}. Nouvelle échéance: {newDate}.',
    variables: ['days', 'reason', 'newDate'],
    resolutionType: 'fixed',
    usageCount: 123,
    estimatedTimeMinutes: 4,
  },
  {
    id: 'document-provided',
    title: 'Document fourni',
    type: 'blocked',
    template: 'Document "{docType}" fourni par {provider} le {date}. Référence: {ref}.',
    variables: ['docType', 'provider', 'date', 'ref'],
    resolutionType: 'fixed',
    usageCount: 198,
    estimatedTimeMinutes: 3,
  },
  {
    id: 'duplicate-alert',
    title: 'Doublon',
    type: 'custom',
    template: 'Doublon de l\'alerte #{originalId}. Voir alerte originale pour le suivi.',
    variables: ['originalId'],
    resolutionType: 'duplicate',
    usageCount: 92,
    estimatedTimeMinutes: 1,
  },
  {
    id: 'budget-approved',
    title: 'Budget approuvé',
    type: 'budget',
    template: 'Budget de {amount}€ approuvé par {approver} le {date}. Projet: {project}.',
    variables: ['amount', 'approver', 'date', 'project'],
    resolutionType: 'fixed',
    usageCount: 167,
    estimatedTimeMinutes: 2,
  },
  {
    id: 'contract-signed',
    title: 'Contrat signé',
    type: 'contract',
    template: 'Contrat "{contractName}" signé le {date}. Parties: {parties}. Montant: {amount}€.',
    variables: ['contractName', 'date', 'parties', 'amount'],
    resolutionType: 'fixed',
    usageCount: 134,
    estimatedTimeMinutes: 3,
  },
  {
    id: 'technical-fix',
    title: 'Correction technique',
    type: 'system',
    template: 'Problème technique résolu. Solution: {solution}. Durée: {duration}. Tests: {tests}.',
    variables: ['solution', 'duration', 'tests'],
    resolutionType: 'fixed',
    usageCount: 211,
    estimatedTimeMinutes: 15,
  },
  {
    id: 'escalated-to-support',
    title: 'Escaladé au support',
    type: 'custom',
    template: 'Escaladé au support niveau {level}. Ticket: {ticketId}. Assigné à: {assignee}.',
    variables: ['level', 'ticketId', 'assignee'],
    resolutionType: 'workaround',
    usageCount: 78,
    estimatedTimeMinutes: 5,
  },
];

// ================================
// Fonctions utilitaires
// ================================

/**
 * Obtenir tous les templates
 */
export function getAllTemplates(): ResolutionTemplate[] {
  return DEFAULT_TEMPLATES.sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Obtenir les templates par type
 */
export function getTemplatesByType(type: ResolutionTemplate['type']): ResolutionTemplate[] {
  return DEFAULT_TEMPLATES.filter((t) => t.type === type);
}

/**
 * Rechercher des templates
 */
export function searchTemplates(query: string): ResolutionTemplate[] {
  const q = query.toLowerCase();
  return DEFAULT_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.template.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(q))
  );
}

/**
 * Obtenir un template par ID
 */
export function getTemplateById(id: string): ResolutionTemplate | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.id === id);
}

/**
 * Appliquer un template avec des valeurs
 */
export function applyTemplate(
  template: ResolutionTemplate,
  values: Record<string, string>
): string {
  let result = template.template;
  
  for (const variable of template.variables) {
    const value = values[variable] || `{${variable}}`;
    result = result.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
  }
  
  return result;
}

/**
 * Valider qu'un template a toutes les variables remplies
 */
export function validateTemplateValues(
  template: ResolutionTemplate,
  values: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing = template.variables.filter((v) => !values[v] || values[v].trim() === '');
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Obtenir les templates les plus utilisés
 */
export function getMostUsedTemplates(limit: number = 5): ResolutionTemplate[] {
  return [...DEFAULT_TEMPLATES]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

/**
 * Obtenir les templates suggérés pour une alerte
 */
export function getSuggestedTemplates(alert: {
  type: string;
  severity: string;
  title: string;
  description?: string;
}): ResolutionTemplate[] {
  // Logique de suggestion basée sur le type d'alerte
  const typeMap: Record<string, ResolutionTemplate['type']> = {
    payment: 'payment',
    contract: 'contract',
    sla: 'sla',
    blocked: 'blocked',
    system: 'system',
    budget: 'budget',
  };
  
  const templateType = typeMap[alert.type] || 'custom';
  const templates = getTemplatesByType(templateType);
  
  // Recherche par mots-clés dans le titre
  const keywords = alert.title.toLowerCase().split(' ');
  const scoredTemplates = templates.map((template) => {
    let score = 0;
    for (const keyword of keywords) {
      if (template.title.toLowerCase().includes(keyword)) score += 2;
      if (template.template.toLowerCase().includes(keyword)) score += 1;
    }
    return { template, score };
  });
  
  return scoredTemplates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.template);
}

/**
 * Créer un template personnalisé
 */
export function createCustomTemplate(
  title: string,
  template: string,
  type: ResolutionTemplate['type'] = 'custom',
  resolutionType: ResolutionTemplate['resolutionType'] = 'fixed'
): ResolutionTemplate {
  // Extraire les variables du template
  const variableRegex = /\{([^}]+)\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variableRegex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return {
    id: `custom-${Date.now()}`,
    title,
    type,
    template,
    variables,
    resolutionType,
    usageCount: 0,
  };
}

/**
 * Incrémenter le compteur d'utilisation d'un template
 */
export function incrementTemplateUsage(templateId: string): void {
  const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
  if (template) {
    template.usageCount++;
    template.lastUsed = new Date().toISOString();
  }
}

// ================================
// Réponses rapides
// ================================

export interface QuickResponse {
  id: string;
  text: string;
  category: 'acknowledge' | 'follow-up' | 'request-info' | 'escalation';
  usageCount: number;
}

export const QUICK_RESPONSES: QuickResponse[] = [
  {
    id: 'ack-investigating',
    text: 'Prise en charge, investigation en cours.',
    category: 'acknowledge',
    usageCount: 567,
  },
  {
    id: 'ack-working',
    text: 'En cours de traitement, mise à jour prochaine.',
    category: 'acknowledge',
    usageCount: 432,
  },
  {
    id: 'request-docs',
    text: 'Merci de fournir les documents suivants : ',
    category: 'request-info',
    usageCount: 345,
  },
  {
    id: 'request-details',
    text: 'Informations complémentaires requises pour le traitement.',
    category: 'request-info',
    usageCount: 289,
  },
  {
    id: 'follow-up-24h',
    text: 'Point de suivi prévu dans les 24h.',
    category: 'follow-up',
    usageCount: 234,
  },
  {
    id: 'escalation-needed',
    text: 'Nécessite une escalade pour décision.',
    category: 'escalation',
    usageCount: 187,
  },
];

export function getQuickResponsesByCategory(
  category: QuickResponse['category']
): QuickResponse[] {
  return QUICK_RESPONSES.filter((r) => r.category === category);
}

