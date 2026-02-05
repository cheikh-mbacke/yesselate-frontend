/**
 * Exemple d'intégration complète du module Clients
 * Ce fichier montre comment utiliser tous les composants ensemble
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useClientsWorkspaceStore } from '@/lib/stores/clientsWorkspaceStore';
import { useClientsApi } from '@/lib/hooks/useClientsApi';
import { 
  ClientDetailModal, 
  InteractionModal, 
  LitigeDetailModal, 
  ExportModal,
  type InteractionFormData,
  type ExportConfig,
} from '@/components/features/bmo/clients/command-center/modals';
import type { Client, Prospect, Litige } from '@/lib/data/clientsMockData';

/**
 * Exemple 1: Page Clients complète avec tous les modals
 */
export function ClientsPageExample() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  // Store Zustand
  const { 
    activeCategory, 
    activeSubCategory,
    setActiveCategory,
    setActiveSubCategory,
    commandPaletteOpen,
    setCommandPaletteOpen,
  } = useClientsWorkspaceStore();

  // API Hook
  const api = useClientsApi();

  // Local state
  const [clients, setClients] = useState<Client[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [clientDetailOpen, setClientDetailOpen] = useState(false);
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [litigeModalOpen, setLitigeModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Selected items
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedLitige, setSelectedLitige] = useState<Litige | null>(null);

  // ========================================
  // DATA FETCHING
  // ========================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [clientsRes, prospectsRes, litigesRes] = await Promise.all([
          api.getClients(),
          api.getProspects(),
          api.getLitiges(),
        ]);

        setClients(clientsRes.data);
        setProspects(prospectsRes.data);
        setLitiges(litigesRes.data);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [api]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleClientClick = async (clientId: string) => {
    const client = await api.getClientById(clientId);
    if (client) {
      setSelectedClient(client);
      setClientDetailOpen(true);
    }
  };

  const handleNewInteraction = () => {
    setInteractionModalOpen(true);
  };

  const handleSaveInteraction = async (data: InteractionFormData) => {
    try {
      await api.createInteraction({
        ...data,
        clientId: selectedClient?.id,
        date: `${data.date}T${data.time}:00Z`,
      });
      
      // Refresh data
      console.log('Interaction créée avec succès');
      // TODO: Refresh interactions list
    } catch (error) {
      console.error('Erreur création interaction:', error);
    }
  };

  const handleLitigeClick = async (litigeId: string) => {
    const litige = await api.getLitigeById(litigeId);
    if (litige) {
      setSelectedLitige(litige);
      setLitigeModalOpen(true);
    }
  };

  const handleResolveLitige = async (resolution: string) => {
    if (!selectedLitige) return;
    
    try {
      await api.resolveLitige(selectedLitige.id, resolution);
      console.log('Litige résolu avec succès');
      // TODO: Refresh litiges list
    } catch (error) {
      console.error('Erreur résolution litige:', error);
    }
  };

  const handleExport = async (config: ExportConfig) => {
    try {
      const blob = await api.exportData(config);
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export.${config.format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  // ========================================
  // KEYBOARD SHORTCUTS
  // ========================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K - Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // ⌘N - New Interaction
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewInteraction();
      }

      // ⌘E - Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      }

      // Esc - Close modals
      if (e.key === 'Escape') {
        setClientDetailOpen(false);
        setInteractionModalOpen(false);
        setLitigeModalOpen(false);
        setExportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ========================================
  // RENDER
  // ========================================

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Actions */}
      <div className="p-4 border-b border-slate-800/50 flex items-center gap-2">
        <button 
          onClick={handleNewInteraction}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white"
        >
          Nouvelle interaction (⌘N)
        </button>
        <button 
          onClick={() => setExportModalOpen(true)}
          className="px-4 py-2 border border-slate-700/50 hover:bg-slate-800/50 rounded-lg text-slate-300"
        >
          Exporter (⌘E)
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Clients Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Clients ({clients.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientClick(client.id)}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
              >
                <h3 className="font-semibold text-slate-200 mb-2">{client.name}</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <div>Type: {client.type}</div>
                  <div>CA: {client.ca}</div>
                  <div>Satisfaction: {client.satisfaction}%</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prospects Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Prospects ({prospects.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prospects.map((prospect) => (
              <div
                key={prospect.id}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30"
              >
                <h3 className="font-semibold text-slate-200 mb-2">{prospect.name}</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <div>Contact: {prospect.contact}</div>
                  <div>Valeur: {prospect.value}</div>
                  <div>Status: {prospect.status}</div>
                  <div>Probabilité: {prospect.probability}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Litiges Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Litiges ({litiges.length})
          </h2>
          <div className="space-y-3">
            {litiges.map((litige) => (
              <button
                key={litige.id}
                onClick={() => handleLitigeClick(litige.id)}
                className="w-full p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-200 mb-1">{litige.subject}</h3>
                    <p className="text-sm text-slate-400">{litige.client}</p>
                  </div>
                  <span className="text-rose-400 font-bold">{litige.amount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================
          MODALS
          ======================================== */}

      {/* Client Detail Modal */}
      <ClientDetailModal
        open={clientDetailOpen}
        onClose={() => setClientDetailOpen(false)}
        client={selectedClient}
        contacts={selectedClient ? [] : []} // TODO: Load from API
        interactions={selectedClient ? [] : []}
        contracts={selectedClient ? [] : []}
        litiges={selectedClient ? [] : []}
      />

      {/* Interaction Modal */}
      <InteractionModal
        open={interactionModalOpen}
        onClose={() => setInteractionModalOpen(false)}
        clientName={selectedClient?.name}
        clientId={selectedClient?.id}
        onSave={handleSaveInteraction}
      />

      {/* Litige Detail Modal */}
      <LitigeDetailModal
        open={litigeModalOpen}
        onClose={() => setLitigeModalOpen(false)}
        litige={selectedLitige}
        onResolve={handleResolveLitige}
        onEscalate={async () => {
          if (selectedLitige) {
            await api.escalateLitige(selectedLitige.id);
          }
        }}
        onAddAction={async (action, comment) => {
          if (selectedLitige) {
            await api.addLitigeAction(selectedLitige.id, action, comment);
          }
        }}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}

/**
 * Exemple 2: Utilisation simple d'un modal
 */
export function SimpleModalExample() {
  const [open, setOpen] = useState(false);
  const api = useClientsApi();
  const [client, setClient] = useState<Client | null>(null);

  const loadClient = async () => {
    const data = await api.getClientById('CLT-001');
    setClient(data);
    setOpen(true);
  };

  return (
    <>
      <button onClick={loadClient}>Voir client</button>
      
      <ClientDetailModal
        open={open}
        onClose={() => setOpen(false)}
        client={client}
      />
    </>
  );
}

/**
 * Exemple 3: Formulaire interaction seul
 */
export function InteractionFormExample() {
  const [open, setOpen] = useState(false);

  const handleSave = (data: InteractionFormData) => {
    console.log('Interaction à sauvegarder:', data);
    // Envoyer à l'API...
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Nouvelle interaction
      </button>
      
      <InteractionModal
        open={open}
        onClose={() => setOpen(false)}
        clientName="Groupe Delta Technologies"
        clientId="CLT-001"
        onSave={handleSave}
      />
    </>
  );
}

/**
 * Exemple 4: Gestion litiges
 */
export function LitigeManagementExample() {
  const [open, setOpen] = useState(false);
  const [litige, setLitige] = useState<Litige | null>(null);
  const api = useClientsApi();

  const loadLitige = async (id: string) => {
    const data = await api.getLitigeById(id);
    setLitige(data);
    setOpen(true);
  };

  const handleResolve = async (resolution: string) => {
    if (!litige) return;
    await api.resolveLitige(litige.id, resolution);
    console.log('Litige résolu!');
  };

  return (
    <>
      <button onClick={() => loadLitige('LIT-001')}>
        Voir litige
      </button>
      
      <LitigeDetailModal
        open={open}
        onClose={() => setOpen(false)}
        litige={litige}
        onResolve={handleResolve}
        onEscalate={async () => {
          if (litige) {
            await api.escalateLitige(litige.id);
          }
        }}
        onAddAction={async (action, comment) => {
          if (litige) {
            await api.addLitigeAction(litige.id, action, comment);
          }
        }}
      />
    </>
  );
}

/**
 * Exemple 5: Export avec configuration
 */
export function ExportExample() {
  const [open, setOpen] = useState(false);

  const handleExport = (config: ExportConfig) => {
    console.log('Configuration export:', config);
    
    // Exemple de traitement
    if (config.format === 'csv') {
      // Générer CSV...
    } else if (config.format === 'excel') {
      // Générer Excel...
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Exporter données
      </button>
      
      <ExportModal
        open={open}
        onClose={() => setOpen(false)}
        onExport={handleExport}
      />
    </>
  );
}

/**
 * Exemple 6: Intégration avec react-query (optionnel)
 */
/*
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function ReactQueryExample() {
  const api = useClientsApi();
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  // Create interaction mutation
  const createInteraction = useMutation({
    mutationFn: (data: InteractionFormData) => api.createInteraction(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {clients?.data.map(client => (
            <div key={client.id}>{client.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
*/

