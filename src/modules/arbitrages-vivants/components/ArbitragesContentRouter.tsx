/**
 * Router de contenu pour le module Arbitrages-Vivants
 */

'use client';

import React from 'react';
import type { ArbitragesMainCategory } from '../types/arbitragesTypes';

interface ArbitragesContentRouterProps {
  mainCategory: ArbitragesMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function ArbitragesContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: ArbitragesContentRouterProps) {
  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tous les arbitrages</h2>
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
    if (subCategory === 'highlights') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Points clés</h2>
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
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Arbitrages critiques{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'immediate') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Immédiats{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'urgent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Urgents{filterText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // En attente
  if (mainCategory === 'pending') {
    let filterBureau: 'BF' | 'BJ' | undefined;
    let filterPeriode: 'today' | 'week' | 'month' | 'archive' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('today')) filterPeriode = 'today';
      if (subSubCategory.includes('week')) filterPeriode = 'week';
      if (subSubCategory.includes('month')) filterPeriode = 'month';
      if (subSubCategory.includes('archive')) filterPeriode = 'archive';
    }

    const bureauText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const periodeText = filterPeriode ? ` (Période: ${filterPeriode})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Arbitrages en attente{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'recent') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Récents{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'old') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Anciens{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Résolus
  if (mainCategory === 'resolved') {
    let filterBureau: 'BF' | 'BJ' | undefined;
    let filterPeriode: 'week' | 'month' | 'year' | 'old' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('week')) filterPeriode = 'week';
      if (subSubCategory.includes('month')) filterPeriode = 'month';
      if (subSubCategory.includes('year')) filterPeriode = 'year';
      if (subSubCategory.includes('old')) filterPeriode = 'old';
    }

    const bureauText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const periodeText = filterPeriode ? ` (Période: ${filterPeriode})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Arbitrages résolus{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'this-week') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Cette semaine{bureauText}{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'this-month') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Ce mois{bureauText}{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'archived') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Archivés{periodeText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Escaladés
  if (mainCategory === 'escalated') {
    let filterBureau: 'BF' | 'BJ' | undefined;
    let filterNiveau: 'dg' | 'comex' | undefined;
    let filterStatus: 'pending' | 'resolved' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('dg')) filterNiveau = 'dg';
      if (subSubCategory.includes('comex')) filterNiveau = 'comex';
      if (subSubCategory.includes('pending')) filterStatus = 'pending';
      if (subSubCategory.includes('resolved')) filterStatus = 'resolved';
    }

    const bureauText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const niveauText = filterNiveau ? ` (Niveau: ${filterNiveau})` : '';
    const statusText = filterStatus ? ` (Status: ${filterStatus})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Arbitrages escaladés{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'dg') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Direction Générale{bureauText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'comex') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">COMEX{bureauText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Par catégorie
  if (mainCategory === 'categories') {
    let filterCategory: 'budget' | 'ressources' | 'planning' | 'technique' | undefined;
    let filterStatus: 'pending' | 'resolved' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('budget')) filterCategory = 'budget';
      if (subSubCategory.includes('ressources')) filterCategory = 'ressources';
      if (subSubCategory.includes('planning')) filterCategory = 'planning';
      if (subSubCategory.includes('technique')) filterCategory = 'technique';
      if (subSubCategory.includes('pending')) filterStatus = 'pending';
      if (subSubCategory.includes('resolved')) filterStatus = 'resolved';
    }

    const categoryText = filterCategory ? ` (Catégorie: ${filterCategory})` : '';
    const statusText = filterStatus ? ` (Status: ${filterStatus})` : '';

    if (subCategory === 'budget') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Arbitrages budgétaires{categoryText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'ressources') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Ressources{categoryText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'planning') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Planning{categoryText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'technique') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Technique{categoryText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  // Par bureau
  if (mainCategory === 'bureaux') {
    let filterBureau: 'BF' | 'BJ' | 'BT' | 'DAF' | 'DRH' | 'DSI' | undefined;
    let filterStatus: 'pending' | 'resolved' | undefined;

    if (subSubCategory) {
      if (subSubCategory.includes('bureau-finance')) filterBureau = 'BF';
      if (subSubCategory.includes('bureau-juridique')) filterBureau = 'BJ';
      if (subSubCategory.includes('bureau-travaux')) filterBureau = 'BT';
      if (subSubCategory.includes('daf')) filterBureau = 'DAF';
      if (subSubCategory.includes('drh')) filterBureau = 'DRH';
      if (subSubCategory.includes('dsi')) filterBureau = 'DSI';
      if (subSubCategory.includes('pending')) filterStatus = 'pending';
      if (subSubCategory.includes('resolved')) filterStatus = 'resolved';
    }

    const bureauText = filterBureau ? ` (Bureau: ${filterBureau})` : '';
    const statusText = filterStatus ? ` (Status: ${filterStatus})` : '';

    if (subCategory === 'all' || !subCategory) {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Tous les bureaux{bureauText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'daf') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">DAF{bureauText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'drh') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">DRH{bureauText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
    if (subCategory === 'dsi') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">DSI{bureauText}{statusText}</h2>
          <p className="text-slate-400">Contenu à venir</p>
        </div>
      );
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Arbitrages & Goulots</h2>
      <p className="text-slate-400">Sélectionnez une catégorie dans le menu</p>
    </div>
  );
}

