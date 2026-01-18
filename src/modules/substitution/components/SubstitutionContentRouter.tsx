/**
 * Router de contenu pour le module Substitution
 */

'use client';

import React from 'react';
import type { SubstitutionMainCategory } from '../types/substitutionTypes';

interface SubstitutionContentRouterProps {
  mainCategory: SubstitutionMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function SubstitutionContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: SubstitutionContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Toutes les substitutions</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'summary') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Résumé</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'today') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Substitutions d'aujourd'hui</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Critiques
  if (mainCategory === 'critical') {
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
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Substitutions critiques{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'urgent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Urgentes{filterText}</h2>
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

  // En attente
  if (mainCategory === 'pending') {
    let filterBureau: 'BF' | 'BJ' | undefined;
    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
    }

    const filterText = filterBureau ? ` (Bureau: ${filterBureau})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Substitutions en attente{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'no-substitute') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Sans substitut{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'validation') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">En validation{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Absences
  if (mainCategory === 'absences') {
    if (subCategory === 'current' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Absences en cours</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'upcoming') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Absences à venir</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'planned') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Absences planifiées</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Délégations
  if (mainCategory === 'delegations') {
    if (subCategory === 'active' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Délégations actives</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'temporary') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Délégations temporaires</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'permanent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Délégations permanentes</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Terminées
  if (mainCategory === 'completed') {
    if (subCategory === 'recent' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Substitutions récentes</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'week') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Cette semaine</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'month') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Ce mois</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Historique
  if (mainCategory === 'historique') {
    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Historique complet</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'by-employee') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Par employé</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'by-bureau') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Par bureau</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Analytiques
  if (mainCategory === 'analytics') {
    if (subCategory === 'dashboard' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tableau de bord analytique</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'statistics') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Statistiques</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'trends') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tendances</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Paramètres
  if (mainCategory === 'settings') {
    if (subCategory === 'general' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Paramètres généraux</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'rules') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Règles de substitution</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'notifications') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Notifications</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Substitution</h2>
      <p className="text-slate-400">Sélectionnez une catégorie dans le menu</p>
    </div>
  );
}

