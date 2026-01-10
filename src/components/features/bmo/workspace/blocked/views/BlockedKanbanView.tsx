/**
 * ====================================================================
 * VUE KANBAN : Dossiers Bloqués
 * Drag & Drop entre colonnes de statut
 * ====================================================================
 */

'use client';

import { useState, useMemo } from 'react';
import { useBlockedCommandCenterStore } from '@/lib/stores/blockedCommandCenterStore';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Filter,
  LayoutGrid,
  List,
  Download,
  RefreshCw,
  Users,
  Building2,
  AlertTriangle,
  Clock,
  DollarSign,
  Eye,
  Zap,
  Scale,
  ChevronDown,
} from 'lucide-react';
import type { BlockedDossier } from '@/lib/types/bmo.types';
import { blockedMockData } from '@/lib/mocks/blockedMockData';

type KanbanStatus = 'nouveau' | 'analyse' | 'en-cours' | 'escalade' | 'resolu' | 'ferme';

interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'nouveau', title: 'Nouveau', color: 'bg-slate-500', icon: AlertTriangle },
  { id: 'analyse', title: 'Analysé', color: 'bg-blue-500', icon: Eye },
  { id: 'en-cours', title: 'En cours', color: 'bg-yellow-500', icon: Zap },
  { id: 'escalade', title: 'Escaladé', color: 'bg-orange-500', icon: TrendingUp },
  { id: 'resolu', title: 'Résolu', color: 'bg-green-500', icon: CheckCircle },
  { id: 'ferme', title: 'Fermé', color: 'bg-emerald-500', icon: Lock },
];

interface BlockedKanbanViewProps {
  className?: string;
}

export function BlockedKanbanView({ className }: BlockedKanbanViewProps) {
  // Zustand store
  const { openModal } = useBlockedCommandCenterStore();
  
  // État
  const [dossiers, setDossiers] = useState<BlockedDossier[]>(blockedMockData.dossiers);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filters, setFilters] = useState({
    impact: [] as string[],
    bureau: [] as string[],
    type: [] as string[],
  });
  const [groupBy, setGroupBy] = useState<'status' | 'bureau' | 'impact'>('status');

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Map dossier status to kanban status
  const mapStatusToKanban = (status: string): KanbanStatus => {
    switch (status) {
      case 'pending': return 'nouveau';
      case 'escalated': return 'escalade';
      case 'resolved': return 'resolu';
      case 'substituted': return 'resolu';
      default: return 'nouveau';
    }
  };

  // Filtrer dossiers
  const filteredDossiers = useMemo(() => {
    return dossiers.filter(d => {
      if (filters.impact.length > 0 && !filters.impact.includes(d.impactLevel)) return false;
      if (filters.bureau.length > 0 && !filters.bureau.includes(d.bureau)) return false;
      if (filters.type.length > 0 && !filters.type.includes(d.type)) return false;
      return true;
    });
  }, [dossiers, filters]);

  // Grouper dossiers par colonne
  const dossiersByColumn = useMemo(() => {
    const grouped: Record<KanbanStatus, BlockedDossier[]> = {
      'nouveau': [],
      'analyse': [],
      'en-cours': [],
      'escalade': [],
      'resolu': [],
      'ferme': [],
    };

    filteredDossiers.forEach(d => {
      const kanbanStatus = mapStatusToKanban(d.status);
      grouped[kanbanStatus].push(d);
    });

    return grouped;
  }, [filteredDossiers]);

  // Stats par colonne
  const columnStats = useMemo(() => {
    const stats: Record<KanbanStatus, { count: number; totalAmount: number }> = {} as any;
    
    KANBAN_COLUMNS.forEach(col => {
      const colDossiers = dossiersByColumn[col.id];
      stats[col.id] = {
        count: colDossiers.length,
        totalAmount: colDossiers.reduce((sum, d) => sum + (d.relatedDocument?.amount || 0), 0),
      };
    });

    return stats;
  }, [dossiersByColumn]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const dossierId = active.id as string;
    const newColumnId = over.id as KanbanStatus;

    // Mettre à jour statut dossier
    setDossiers(prev => prev.map(d => {
      if (d.id === dossierId) {
        // Map kanban status back to dossier status
        let newStatus: BlockedDossier['status'];
        switch (newColumnId) {
          case 'nouveau': newStatus = 'pending'; break;
          case 'escalade': newStatus = 'escalated'; break;
          case 'resolu': newStatus = 'resolved'; break;
          default: newStatus = 'pending';
        }
        
        return { ...d, status: newStatus };
      }
      return d;
    }));

    // TODO: API call pour mettre à jour en DB
    // await blockedApi.updateStatus(dossierId, newStatus);

    setActiveId(null);
  };

  const activeDossier = activeId ? dossiers.find(d => d.id === activeId) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">Vue Kanban</h2>
          <Badge variant="outline" className="text-slate-400">
            {filteredDossiers.length} dossiers
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-7 px-3"
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 px-3"
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              Liste
            </Button>
          </div>

          {/* Group by */}
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Grouper: {groupBy}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Filters */}
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>

          {/* Export */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Refresh */}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-6 gap-4">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              dossiers={dossiersByColumn[column.id]}
              stats={columnStats[column.id]}
              onOpenDetails={(dossierId) => openModal('dossier-detail-enriched', { dossierId })}
              onOpenResolution={(dossier) => openModal('resolution-advanced', { dossier })}
            />
          ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDossier && (
              <DossierCard dossier={activeDossier} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-800">
            {filteredDossiers.map(dossier => (
              <DossierListItem key={dossier.id} dossier={dossier} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
// Colonne Kanban
// ================================
function KanbanColumn({ 
  column, 
  dossiers, 
  stats,
  onOpenDetails,
  onOpenResolution,
}: { 
  column: KanbanColumn; 
  dossiers: BlockedDossier[];
  stats: { count: number; totalAmount: number };
  onOpenDetails: (dossierId: string) => void;
  onOpenResolution: (dossier: BlockedDossier) => void;
}) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-[calc(100vh-280px)]"
    >
      {/* Header */}
      <div className={cn(
        'p-3 rounded-t-lg border-t-4 bg-slate-900/50',
        `border-${column.color.split('-')[1]}-500`
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <h3 className="font-medium text-white">{column.title}</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats.count}
          </Badge>
        </div>
        {stats.totalAmount > 0 && (
          <div className="text-xs text-slate-500">
            {(stats.totalAmount / 1000000).toFixed(1)}M FCFA
          </div>
        )}
      </div>

      {/* Dossiers */}
      <div className="flex-1 overflow-y-auto bg-slate-900/30 border border-t-0 border-slate-800 rounded-b-lg p-2 space-y-2">
        <SortableContext
          items={dossiers.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {dossiers.map(dossier => (
            <SortableDossierCard 
              key={dossier.id} 
              dossier={dossier}
              onOpenDetails={() => onOpenDetails(dossier.id)}
              onOpenResolution={() => onOpenResolution(dossier)}
            />
          ))}
        </SortableContext>

        {dossiers.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Aucun dossier
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// Carte Dossier Sortable
// ================================
function SortableDossierCard({ 
  dossier,
  onOpenDetails,
  onOpenResolution,
}: { 
  dossier: BlockedDossier;
  onOpenDetails: () => void;
  onOpenResolution: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dossier.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <DossierCard dossier={dossier} />
    </div>
  );
}

// ================================
// Carte Dossier
// ================================
function DossierCard({ 
  dossier, 
  isDragging = false 
}: { 
  dossier: BlockedDossier;
  isDragging?: boolean;
}) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      className={cn(
        'bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-move hover:bg-slate-700/50 transition-colors',
        isDragging && 'shadow-xl shadow-blue-500/20 rotate-2'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-slate-400">{dossier.reference}</span>
        <Badge className={getImpactColor(dossier.impactLevel)} size="sm">
          {dossier.impactLevel}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-white mb-3 line-clamp-2">
        {dossier.description}
      </p>

      {/* Meta */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Building2 className="h-3 w-3" />
          <span>{dossier.bureau}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{dossier.delayDays}j de retard</span>
        </div>

        {dossier.relatedDocument?.amount && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <DollarSign className="h-3 w-3" />
            <span>{(dossier.relatedDocument.amount / 1000000).toFixed(1)}M FCFA</span>
          </div>
        )}
      </div>

      {/* Actions rapides (au hover) */}
      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Voir
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
          <Zap className="h-3 w-3 mr-1" />
          Résoudre
        </Button>
      </div>
    </div>
  );
}

// ================================
// Item Liste
// ================================
function DossierListItem({ dossier }: { dossier: BlockedDossier }) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white">{dossier.reference}</span>
          <Badge className={getImpactColor(dossier.impactLevel)} size="sm">
            {dossier.impactLevel}
          </Badge>
        </div>
        <p className="text-sm text-slate-400 truncate">{dossier.description}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" />
          {dossier.bureau}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {dossier.delayDays}j
        </div>
        {dossier.relatedDocument?.amount && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            {(dossier.relatedDocument.amount / 1000000).toFixed(1)}M
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline">
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          Voir
        </Button>
        <Button size="sm" variant="outline">
          <Zap className="h-3.5 w-3.5 mr-1.5" />
          Résoudre
        </Button>
      </div>
    </div>
  );
}

// Missing imports for icons
import { TrendingUp, CheckCircle, Lock } from 'lucide-react';
