// ============================================
// Provider pour synchroniser automatiquement toutes les données
// entre les pages et mettre à jour les badges de la sidebar
// ============================================

'use client';

import { useEffect } from 'react';
import { useNavigationStore } from '@/lib/stores';
import { 
  enrichedBCs, 
  enrichedFactures, 
  enrichedAvenants 
} from '@/lib/data/enriched-documents.mock';
import { demands, systemAlerts } from '@/lib/data';

/**
 * Provider qui synchronise automatiquement tous les comptages
 * pour mettre à jour les badges de la sidebar
 */
export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  const { updatePageCounts } = useNavigationStore();

  useEffect(() => {
    // Fonction de synchronisation globale
    const syncAllCounts = () => {
      const counts = {
        // Alertes
        alerts: systemAlerts.filter(a => a.type === 'critical' || a.type === 'warning').length,
        
        // Demandes
        demandes: demands.filter(d => d.status === 'pending').length,
        
        // Validation BC
        'validation-bc': enrichedBCs.filter(bc => bc.status === 'pending').length +
                        enrichedFactures.filter(f => f.status === 'pending').length +
                        enrichedAvenants.filter(a => a.status === 'pending').length,
        
        // Dossiers bloqués (simulation - à adapter selon vos données)
        blocked: 4, // À calculer depuis vos données
        
        // Substitution (simulation)
        substitution: 4, // À calculer selon vos données
        
        // Projets en cours (simulation)
        'projets-en-cours': 8, // À calculer selon vos données
        
        // Recouvrements (simulation)
        recouvrements: 4, // À calculer selon vos données
        
        // Litiges (simulation)
        litiges: 3, // À calculer selon vos données
        
        // Demandes RH (simulation)
        'demandes-rh': 10, // À calculer selon vos données
        
        // Tickets clients (simulation)
        'tickets-clients': 0, // À calculer selon vos données
      };

      updatePageCounts(counts);
    };

    // Synchronisation immédiate
    syncAllCounts();

    // Synchronisation périodique toutes les 30 secondes
    const interval = setInterval(syncAllCounts, 30000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // updatePageCounts est stable (fonction Zustand), pas besoin de la mettre dans les dépendances

  return <>{children}</>;
}

