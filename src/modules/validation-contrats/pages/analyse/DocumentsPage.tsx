/**
 * Page : Analyse & gouvernance > Documents liés
 */

'use client';

import React from 'react';
import { useContratsData } from '../../hooks';
import { FileText } from 'lucide-react';

export function DocumentsPage() {
  const { data: response, isLoading } = useContratsData();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des documents...</div>
      </div>
    );
  }

  const contrats = response?.contrats || [];
  const allDocuments = contrats.flatMap((c) => c.documents || []);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Documents liés</h2>
        <p className="text-sm text-slate-400">{allDocuments.length} document(s) au total</p>
      </div>

      {allDocuments.length === 0 ? (
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="h-5 w-5" />
          <span>Aucun document</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {allDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-slate-200">{doc.nom}</div>
                  <div className="text-xs text-slate-400">{doc.type}</div>
                </div>
              </div>
              <div className="text-xs text-slate-400">{doc.dateUpload}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

