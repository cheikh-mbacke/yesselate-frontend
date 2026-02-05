/**
 * Router de contenu pour le module Blocked
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { BlockedMainCategory } from '../types/blockedTypes';

interface BlockedContentRouterProps {
  mainCategory: BlockedMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function BlockedContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: BlockedContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'summary' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Synthèse</h2>
          <p className="text-slate-400">Contenu de la synthèse à venir</p>
        </div>
      );
    }
    if (subCategory === 'kpis') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">KPIs</h2>
          <p className="text-slate-400">Contenu des KPIs à venir</p>
        </div>
      );
    }
    if (subCategory === 'trends') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tendances</h2>
          <p className="text-slate-400">Contenu des tendances à venir</p>
        </div>
      );
    }
    if (subCategory === 'alerts') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Alertes</h2>
          <p className="text-slate-400">Contenu des alertes à venir</p>
        </div>
      );
    }
  }

  // Files d'attente
  if (mainCategory === 'queue') {
    let filterPriority: 'critical' | 'high' | 'medium' | 'low' | undefined;
    let filterBureau: 'BF' | 'BJ' | 'BT' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('critical')) filterPriority = 'critical';
      if (subSubCategory.includes('high')) filterPriority = 'high';
      if (subSubCategory.includes('medium')) filterPriority = 'medium';
      if (subSubCategory.includes('low')) filterPriority = 'low';
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('bureau-travaux')) filterBureau = 'BT';
    }

    const priorityText = filterPriority ? ` (Priorité: ${filterPriority})` : '';
    const bureauText = filterBureau ? ` (Bureau: ${filterBureau})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tous les blocages{priorityText}{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'critical') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Blocages critiques{priorityText}{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'high') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Priorité haute{priorityText}{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'medium') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Priorité moyenne{priorityText}{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'low') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Priorité basse{priorityText}{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Critiques
  if (mainCategory === 'critical') {
    let filterBureau: 'BF' | 'BJ' | undefined;
    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
    }

    const filterText = filterBureau ? ` (Bureau: ${filterBureau})` : '';

    if (subCategory === 'urgent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Blocages urgents{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'sla') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">SLA dépassés{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'escalated') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Escaladés{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Matrice urgence
  if (mainCategory === 'matrix') {
    let filterImpact: 'critical' | 'high' | 'medium' | 'low' | undefined;
    let filterDelay: 'overdue' | 'today' | 'week' | undefined;
    let filterAmount: 'high' | 'medium' | 'low' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('impact-critical')) filterImpact = 'critical';
      if (subSubCategory.includes('impact-high')) filterImpact = 'high';
      if (subSubCategory.includes('impact-medium')) filterImpact = 'medium';
      if (subSubCategory.includes('impact-low')) filterImpact = 'low';
      if (subSubCategory.includes('delay-overdue')) filterDelay = 'overdue';
      if (subSubCategory.includes('delay-today')) filterDelay = 'today';
      if (subSubCategory.includes('delay-week')) filterDelay = 'week';
      if (subSubCategory.includes('amount-high')) filterAmount = 'high';
      if (subSubCategory.includes('amount-medium')) filterAmount = 'medium';
      if (subSubCategory.includes('amount-low')) filterAmount = 'low';
    }

    const impactText = filterImpact ? ` (Impact: ${filterImpact})` : '';
    const delayText = filterDelay ? ` (Délai: ${filterDelay})` : '';
    const amountText = filterAmount ? ` (Montant: ${filterAmount})` : '';

    if (subCategory === 'impact') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Par impact{impactText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'delay') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Par délai{delayText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'amount') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Par montant{amountText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'combined') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Vue combinée{impactText}{delayText}{amountText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Par bureau
  if (mainCategory === 'bureaux') {
    let filterBureau: 'BF' | 'BJ' | 'BT' | undefined;
    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('bureau-travaux')) filterBureau = 'BT';
    }

    const filterText = filterBureau ? ` (Bureau: ${filterBureau})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tous les bureaux{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'most') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Plus impactés{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'comparison') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Comparaison{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Timeline
  if (mainCategory === 'timeline') {
    let filterPeriode: 'today' | 'week' | 'month' | undefined;
    let filterType: 'resolved' | 'pending' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('today')) filterPeriode = 'today';
      if (subSubCategory.includes('week')) filterPeriode = 'week';
      if (subSubCategory.includes('month')) filterPeriode = 'month';
      if (subSubCategory.includes('resolved')) filterType = 'resolved';
      if (subSubCategory.includes('pending')) filterType = 'pending';
    }

    const periodeText = filterPeriode ? ` (Période: ${filterPeriode})` : '';
    const typeText = filterType ? ` (Type: ${filterType})` : '';

    if (subCategory === 'recent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Récents{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'week') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Cette semaine{typeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'month') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Ce mois{typeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'history') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Historique{typeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Décisions
  if (mainCategory === 'decisions') {
    let filterBureau: 'BF' | 'BJ' | undefined;
    let filterPeriode: 'today' | 'week' | 'month' | 'recent' | 'history' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('today')) filterPeriode = 'today';
      if (subSubCategory.includes('week')) filterPeriode = 'week';
      if (subSubCategory.includes('month')) filterPeriode = 'month';
      if (subSubCategory.includes('recent')) filterPeriode = 'recent';
      if (subSubCategory.includes('history')) filterPeriode = 'history';
    }

    const bureauText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const periodeText = filterPeriode ? ` (Période: ${filterPeriode})` : '';

    if (subCategory === 'pending') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">En attente{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'resolved') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Résolus{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'escalated') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Escaladés{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'substituted') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Substitués{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Audit
  if (mainCategory === 'audit') {
    if (subCategory === 'trail' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Trace d'audit</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'chain') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Chaîne de hash</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'reports') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Rapports d'audit</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'export') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Export</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Par défaut
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Dossiers Bloqués</h2>
      <p className="text-slate-400">Sélectionnez une catégorie dans le menu</p>
    </div>
  );
}

