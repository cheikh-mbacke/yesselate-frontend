/**
 * Page : Par statut > Rejetés
 */

'use client';

import React, { useState } from 'react';
import { useValidationData, useValidationFilters } from '../../hooks';
import { DocumentCard, DocumentDetailsModal } from '../../components';
import type { DocumentValidation } from '../../types/validationTypes';
import { XCircle } from 'lucide-react';

export function RejetesPage() {
  const { filtres } = useValidationFilters();
  const { data: documents, isLoading, error } = useValidationData({
    ...filtres,
    statuts: ['REJETE'],
  });

  const [selectedDocument, setSelectedDocument] = useState<DocumentValidation | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des documents rejetés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement</div>
      </div>
    );
  }

  const handleView = (id: string) => {
    const doc = documents?.find((d) => d.id === id);
    if (doc) {
      setSelectedDocument(doc);
      setDetailsModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold text-slate-200">Documents rejetés</h2>
        </div>
        <p className="text-sm text-slate-400">
          Historique des documents rejetés ({documents?.length || 0})
        </p>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucun document rejeté</div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedDocument && (
        <DocumentDetailsModal
          open={detailsModalOpen}
          document={selectedDocument}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}

