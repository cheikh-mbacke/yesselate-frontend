'use client';

/**
 * Header de la page Governance
 * PHASE 2 : Composant partagé
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GovernanceHeaderProps {
  activeTab: 'raci' | 'alerts';
  raciStats?: { total: number };
  alertsStats?: { total: number };
  onExport?: () => void;
  onShowComparator?: () => void;
  showComparatorButton?: boolean;
}

export function GovernanceHeader({
  activeTab,
  raciStats,
  alertsStats,
  onExport,
  onShowComparator,
  showComparatorButton = false,
}: GovernanceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
          🏛️ Gouvernance & Pilotage
          <Badge variant="info" className="text-[10px]">
            {activeTab === 'raci' 
              ? `${raciStats?.total || 0} activités` 
              : `${alertsStats?.total || 0} alertes`}
          </Badge>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Matrice RACI + Alertes & Incidents — Responsabilités et surveillance opérationnelle
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {activeTab === 'raci' && showComparatorButton && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onShowComparator}
            className="text-xs sm:text-sm"
          >
            🔄 Comparer
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onExport}
          className="text-xs sm:text-sm flex-1 sm:flex-none"
        >
          📊 Exporter
        </Button>
      </div>
    </div>
  );
}

