/**
 * Utilitaires pour la navigation Calendrier
 * Validation et coercition des paramètres URL
 */

import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';
import { getSectionsForDomain } from '@/components/features/bmo/calendrier/command-center/CalendrierSubNavigation';

export interface CalendrierNavigationState {
  domain: CalendrierDomain;
  section: CalendrierSection | null;
  view: CalendrierView | null;
  period: 'week' | 'month' | 'quarter';
}

const DEFAULT_STATE: CalendrierNavigationState = {
  domain: 'overview',
  section: 'global',
  view: 'gantt',
  period: 'month',
};

/**
 * Valide et corrige les paramètres de navigation depuis l'URL
 * Garantit que domain/section/view sont cohérents
 */
export function coerceNavigationState(
  raw: Partial<Record<string, string | null>>
): CalendrierNavigationState {
  // Valider le domaine
  const domainCandidate = raw.domain as CalendrierDomain | null;
  const validDomains: CalendrierDomain[] = ['overview', 'milestones', 'absences', 'events'];
  const domain: CalendrierDomain = domainCandidate && validDomains.includes(domainCandidate)
    ? domainCandidate
    : DEFAULT_STATE.domain;

  // Récupérer les sections du domaine
  const domainSections = getSectionsForDomain(domain);
  if (domainSections.length === 0) {
    return DEFAULT_STATE;
  }

  // Valider la section
  const sectionCandidate = raw.section as CalendrierSection | null;
  const sectionData = sectionCandidate
    ? domainSections.find(s => s.id === sectionCandidate)
    : null;
  const section: CalendrierSection | null = sectionData
    ? sectionData.id
    : domainSections[0].id;

  // Récupérer la section validée
  const validatedSection = domainSections.find(s => s.id === section) || domainSections[0];
  const allowedViews = validatedSection.views || [];

  // Valider la vue
  const viewCandidate = raw.view as CalendrierView | null;
  const view: CalendrierView | null = viewCandidate && allowedViews.some(v => v.id === viewCandidate)
    ? viewCandidate
    : allowedViews.length > 0
    ? allowedViews[0].id
    : null;

  // Valider la période
  const periodCandidate = raw.period as 'week' | 'month' | 'quarter' | null;
  const validPeriods: Array<'week' | 'month' | 'quarter'> = ['week', 'month', 'quarter'];
  const period: 'week' | 'month' | 'quarter' = periodCandidate && validPeriods.includes(periodCandidate)
    ? periodCandidate
    : DEFAULT_STATE.period;

  return { domain, section, view, period };
}

/**
 * Construit les paramètres URL depuis l'état de navigation
 */
export function buildNavigationParams(state: CalendrierNavigationState): URLSearchParams {
  const params = new URLSearchParams();
  params.set('domain', state.domain);
  if (state.section) {
    params.set('section', state.section);
  }
  if (state.view) {
    params.set('view', state.view);
  }
  if (state.period) {
    params.set('period', state.period);
  }
  return params;
}

