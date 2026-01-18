/**
 * Router de contenu pour le module Dashboard
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
import {
  OverviewView,
  PerformanceView,
  ActionsView,
  RisksView,
  DecisionsView,
  RealtimeView,
} from '@/components/features/bmo/dashboard/command-center/views';

interface DashboardContentRouterProps {
  mainCategory: DashboardMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function DashboardContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: DashboardContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'summary') {
      if (subSubCategory === 'dashboard' || !subSubCategory) {
        return <OverviewView />;
      }
      if (subSubCategory === 'highlights') {
        return <OverviewView />;
      }
    }

    if (subCategory === 'kpis') {
      if (subSubCategory === 'projets' || !subSubCategory) {
        return <OverviewView />;
      }
      if (subSubCategory === 'demandes') {
        return <OverviewView />;
      }
      if (subSubCategory === 'budget') {
        return <OverviewView />;
      }
    }

    if (subCategory === 'bureaux') {
      return <OverviewView />;
    }

    if (subCategory === 'trends') {
      return <OverviewView />;
    }

    // Par défaut pour overview
    return <OverviewView />;
  }

  // Performance & KPIs
  if (mainCategory === 'performance') {
    if (subCategory === 'validation') {
      return <PerformanceView />;
    }
    if (subCategory === 'budget') {
      return <PerformanceView />;
    }
    if (subCategory === 'delays') {
      return <PerformanceView />;
    }
    if (subCategory === 'comparison') {
      return <PerformanceView />;
    }
    // Par défaut pour performance
    return <PerformanceView />;
  }

  // Actions prioritaires
  if (mainCategory === 'actions') {
    if (subCategory === 'all') {
      return <ActionsView />;
    }
    if (subCategory === 'urgent') {
      return <ActionsView />;
    }
    if (subCategory === 'blocked') {
      return <ActionsView />;
    }
    if (subCategory === 'pending') {
      return <ActionsView />;
    }
    if (subCategory === 'completed') {
      return <ActionsView />;
    }
    // Par défaut pour actions
    return <ActionsView />;
  }

  // Risques & Santé
  if (mainCategory === 'risks') {
    if (subCategory === 'critical') {
      return <RisksView />;
    }
    if (subCategory === 'warnings') {
      return <RisksView />;
    }
    if (subCategory === 'blocages') {
      return <RisksView />;
    }
    if (subCategory === 'payments') {
      return <RisksView />;
    }
    if (subCategory === 'contracts') {
      return <RisksView />;
    }
    // Par défaut pour risks
    return <RisksView />;
  }

  // Décisions & Timeline
  if (mainCategory === 'decisions') {
    if (subCategory === 'pending') {
      return <DecisionsView />;
    }
    if (subCategory === 'executed') {
      return <DecisionsView />;
    }
    if (subCategory === 'timeline') {
      return <DecisionsView />;
    }
    if (subCategory === 'audit') {
      return <DecisionsView />;
    }
    // Par défaut pour decisions
    return <DecisionsView />;
  }

  // Temps réel
  if (mainCategory === 'realtime') {
    if (subCategory === 'live') {
      return <RealtimeView />;
    }
    if (subCategory === 'alerts') {
      return <RealtimeView />;
    }
    if (subCategory === 'notifications') {
      return <RealtimeView />;
    }
    if (subCategory === 'sync') {
      return <RealtimeView />;
    }
    // Par défaut pour realtime
    return <RealtimeView />;
  }

  // Par défaut
  return <OverviewView />;
}

