/**
 * Router de contenu pour le module Centre d'Alerte
 * Affiche la bonne page selon la navigation
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  IndicateursPage,
  TypologiePage,
  BureauPage,
} from '../pages/overview';
import {
  PaiementsBloquesPage,
  ValidationsBloqueesPage,
  JustificatifsManquantsPage,
  RisquesFinanciersPage,
} from '../pages/critiques';
import {
  SlaDepassesPage,
  SlaRisquePage,
  SlaEnAttentePage,
} from '../pages/sla';
import {
  AbsencesBloquantesPage,
  SurallocationPage,
  RetardsRhPage,
} from '../pages/rh';
import {
  RetardsDetectesPage,
  JalonsNonTenusPage,
  BlocagesMoaMoePage,
} from '../pages/projets';
import {
  HistoriqueAlertesPage,
  ReglesAlertesPage,
  EscaladesPage,
} from '../pages/historique';

interface AlertesContentRouterProps {
  mainCategory?: string;
  subCategory?: string | null;
  subSubCategory?: string | null;
}

export function AlertesContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: AlertesContentRouterProps) {
  const pathname = usePathname();

  // Router basé sur l'URL plutôt que sur les props (plus simple avec Next.js)
  if (!pathname) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  // Vue d'ensemble
  if (pathname.includes('/overview/indicateurs') || (mainCategory === 'overview' && (!subCategory || subCategory === 'indicateurs'))) {
    return <IndicateursPage />;
  }

  if (pathname.includes('/overview/typologie') || (mainCategory === 'overview' && subCategory === 'typologie')) {
    return <TypologiePage />;
  }

  if (pathname.includes('/overview/bureau') || (mainCategory === 'overview' && subCategory === 'bureau')) {
    return <BureauPage />;
  }

  if (pathname.includes('/overview') || mainCategory === 'overview') {
    return <IndicateursPage />;
  }

  // Alertes critiques
  if (pathname.includes('/critiques/paiements') || (mainCategory === 'critiques' && subCategory === 'paiements')) {
    return <PaiementsBloquesPage />;
  }

  if (pathname.includes('/critiques/validations') || (mainCategory === 'critiques' && subCategory === 'validations')) {
    return <ValidationsBloqueesPage />;
  }

  if (pathname.includes('/critiques/justificatifs') || (mainCategory === 'critiques' && subCategory === 'justificatifs')) {
    return <JustificatifsManquantsPage />;
  }

  if (pathname.includes('/critiques/financiers') || (mainCategory === 'critiques' && subCategory === 'financiers')) {
    return <RisquesFinanciersPage />;
  }

  // Alertes SLA
  if (pathname.includes('/sla/depasse') || (mainCategory === 'sla' && subCategory === 'depasse')) {
    return <SlaDepassesPage />;
  }

  if (pathname.includes('/sla/risque') || (mainCategory === 'sla' && subCategory === 'risque')) {
    return <SlaRisquePage />;
  }

  if (pathname.includes('/sla/attente') || (mainCategory === 'sla' && subCategory === 'attente')) {
    return <SlaEnAttentePage />;
  }

  // Alertes RH
  if (pathname.includes('/rh/absences') || (mainCategory === 'rh' && subCategory === 'absences')) {
    return <AbsencesBloquantesPage />;
  }

  if (pathname.includes('/rh/surallocation') || (mainCategory === 'rh' && subCategory === 'surallocation')) {
    return <SurallocationPage />;
  }

  if (pathname.includes('/rh/retards') || (mainCategory === 'rh' && subCategory === 'retards')) {
    return <RetardsRhPage />;
  }

  // Alertes projets
  if (pathname.includes('/projets/retards') || (mainCategory === 'projets' && subCategory === 'retards')) {
    return <RetardsDetectesPage />;
  }

  if (pathname.includes('/projets/jalons') || (mainCategory === 'projets' && subCategory === 'jalons')) {
    return <JalonsNonTenusPage />;
  }

  if (pathname.includes('/projets/blocages') || (mainCategory === 'projets' && subCategory === 'blocages')) {
    return <BlocagesMoaMoePage />;
  }

  // Historique
  if (pathname.includes('/historique/alertes') || (mainCategory === 'historique' && subCategory === 'alertes')) {
    return <HistoriqueAlertesPage />;
  }

  if (pathname.includes('/historique/regles') || (mainCategory === 'historique' && subCategory === 'regles')) {
    return <ReglesAlertesPage />;
  }

  if (pathname.includes('/historique/escalades') || (mainCategory === 'historique' && subCategory === 'escalades')) {
    return <EscaladesPage />;
  }

  // Vue par défaut
  return <IndicateursPage />;
}

