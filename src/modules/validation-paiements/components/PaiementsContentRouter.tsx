/**
 * Router de contenu pour le module Validation-Paiements
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { PaiementsMainCategory } from '../types/paiementsTypes';

interface PaiementsContentRouterProps {
  mainCategory: PaiementsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function PaiementsContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: PaiementsContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'dashboard' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tableau de bord</h2>
          <p className="text-slate-400">Contenu du tableau de bord à venir</p>
        </div>
      );
    }
    if (subCategory === 'kpis') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Indicateurs clés</h2>
          <p className="text-slate-400">Contenu des indicateurs clés à venir</p>
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

  // À valider
  if (mainCategory === 'pending') {
    // Filtrage par niveau 3
    let filterBureau: 'BF' | 'DG' | undefined;
    let filterType: 'critiques' | 'haute-priorite' | 'standard' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('direction-generale')) filterBureau = 'DG';
      if (subSubCategory.includes('critiques')) filterType = 'critiques';
      if (subSubCategory.includes('haute-priorite')) filterType = 'haute-priorite';
      if (subSubCategory.includes('standard')) filterType = 'standard';
    }

    const filterText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const typeText = filterType ? ` (Type: ${filterType})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tous les paiements à valider{filterText}{typeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'bf-pending') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Bureau Finance{filterText}{typeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'dg-pending') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Direction Générale{filterText}{typeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Urgents
  if (mainCategory === 'urgent') {
    let filterBureau: 'BF' | 'DG' | undefined;
    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('direction-generale')) filterBureau = 'DG';
    }

    const filterText = filterBureau ? ` (Bureau: ${filterBureau})` : '';

    if (subCategory === 'critical') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Paiements critiques{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'high') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Haute priorité{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Validés
  if (mainCategory === 'validated') {
    let filterBureau: 'BF' | 'DG' | undefined;
    let filterPeriode: 'today' | 'week' | 'month' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('direction-generale')) filterBureau = 'DG';
      if (subSubCategory.includes('today')) filterPeriode = 'today';
      if (subSubCategory.includes('week')) filterPeriode = 'week';
      if (subSubCategory.includes('month')) filterPeriode = 'month';
    }

    const filterText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const periodeText = filterPeriode ? ` (Période: ${filterPeriode})` : '';

    if (subCategory === 'today') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Validés aujourd'hui{filterText}{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'week') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Validés cette semaine{filterText}{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'month') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Validés ce mois{filterText}{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Rejetés
  if (mainCategory === 'rejected') {
    if (subCategory === 'recent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Paiements rejetés récents</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'archived') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Paiements rejetés archivés</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Planifiés
  if (mainCategory === 'scheduled') {
    let filterPeriode: 'semaine' | 'mois' | undefined;
    if (subSubCategory) {
      if (subSubCategory.includes('semaine')) filterPeriode = 'semaine';
      if (subSubCategory.includes('mois')) filterPeriode = 'mois';
    }

    const periodeText = filterPeriode ? ` (Période: ${filterPeriode})` : '';

    if (subCategory === 'upcoming') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Paiements à venir{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'in-progress') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Paiements en cours{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Trésorerie
  if (mainCategory === 'tresorerie') {
    if (subCategory === 'overview-tresorerie' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Vue d'ensemble trésorerie</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'forecast') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Prévisions trésorerie</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'history') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Historique trésorerie</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Fournisseurs
  if (mainCategory === 'fournisseurs') {
    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tous les fournisseurs</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'active') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Fournisseurs actifs</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'watchlist') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Surveillance fournisseurs</h2>
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
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Piste d'audit</h2>
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
    if (subCategory === 'compliance') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Conformité</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Par défaut
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Validation Paiements</h2>
      <p className="text-slate-400">Sélectionnez une catégorie dans le menu</p>
    </div>
  );
}

