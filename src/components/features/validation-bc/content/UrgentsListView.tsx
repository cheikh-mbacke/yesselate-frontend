/**
 * Vue liste des Documents Urgents
 */

'use client';

import React from 'react';
import { ValidationBCDocumentsList } from './ValidationBCDocumentsList';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';
import { AlertTriangle } from 'lucide-react';

interface UrgentsListViewProps {
  subCategory?: string;
  onDocumentClick?: (doc: ValidationDocument) => void;
  onValidate?: (doc: ValidationDocument) => void;
  onReject?: (doc: ValidationDocument) => void;
}

export function UrgentsListView({
  subCategory = 'all',
  onDocumentClick,
  onValidate,
  onReject,
}: UrgentsListViewProps) {
  const filters: any = {
    urgent: true,
  };

  // Appliquer les filtres de sous-catégorie
  if (subCategory === 'sla') {
    filters.queue = 'sla_exceeded';
  } else if (subCategory === 'montant') {
    filters.minAmount = 10000000; // 10M FCFA
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-200">Documents Urgents</h2>
            <p className="text-slate-400 text-sm">
              {subCategory === 'sla' && 'Documents avec dépassement de SLA'}
              {subCategory === 'montant' && 'Documents à montant élevé (> 10M FCFA)'}
              {subCategory === 'all' && 'Tous les documents urgents à traiter'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerte */}
      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">
              Attention - Action rapide requise
            </p>
            <p className="text-sm text-slate-400">
              Ces documents nécessitent une validation prioritaire.
              Ils peuvent avoir un impact sur les délais ou le budget.
            </p>
          </div>
        </div>
      </div>

      <ValidationBCDocumentsList
        filters={filters}
        onDocumentClick={onDocumentClick}
        onValidate={onValidate}
        onReject={onReject}
        emptyMessage="Aucun document urgent"
      />
    </div>
  );
}

