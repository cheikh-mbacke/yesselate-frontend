'use client';

/**
 * Centre de Commandement Évaluations - Version 2.0
 * Plateforme de gestion des évaluations RH
 * Architecture cohérente avec Analytics/Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardCheck,
  Search,
  Bell,
  ChevronLeft,
  MoreVertical,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  EvaluationsCommandSidebar,
  EvaluationsSubNavigation,
  EvaluationsKPIBar,
  evaluationsCategories,
} from '@/components/features/bmo/evaluations/command-center';
import { EvaluationDetailModal } from '@/components/features/bmo/evaluations/modals';
import { useBMOStore } from '@/lib/stores';
import { evaluations } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import type { Evaluation, EvaluationStatus } from '@/lib/types/bmo.types';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';

// ================================
// Types
// ================================
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
}

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'upcoming', label: 'À venir', badge: 0, badgeType: 'warning' },
  ],
  scheduled: [
    { id: 'all', label: 'Toutes' },
    { id: 'due-soon', label: '≤ 14 jours', badge: 0, badgeType: 'warning' },
    { id: 'overdue', label: 'En retard', badge: 0, badgeType: 'critical' },
  ],
  in_progress: [
    { id: 'all', label: 'Toutes' },
    { id: 'recent', label: 'Récentes' },
    { id: 'delayed', label: 'Retardées', badge: 0, badgeType: 'warning' },
  ],
  completed: [
    { id: 'all', label: 'Toutes' },
    { id: 'recent', label: 'Récentes' },
    { id: 'excellent', label: 'Excellent (≥90)', badge: 0, badgeType: 'success' },
    { id: 'good', label: 'Bon (75-89)', badge: 0 },
    { id: 'needs-improvement', label: 'À améliorer (<75)', badge: 0, badgeType: 'warning' },
  ],
  recommendations: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'pending', label: 'En attente', badge: 0, badgeType: 'warning' },
    { id: 'approved', label: 'Approuvées', badge: 0, badgeType: 'success' },
    { id: 'implemented', label: 'Implémentées', badge: 0, badgeType: 'success' },
  ],
  scores: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'distribution', label: 'Distribution' },
    { id: 'trends', label: 'Tendances' },
  ],
  bureaux: [
    { id: 'all', label: 'Tous' },
    { id: 'btp', label: 'BTP' },
    { id: 'bj', label: 'BJ' },
    { id: 'bs', label: 'BS' },
  ],
  analytics: [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'reports', label: 'Rapports' },
    { id: 'comparison', label: 'Comparaison' },
  ],
  archive: [
    { id: 'all', label: 'Tout' },
    { id: 'by-year', label: 'Par année' },
    { id: 'by-period', label: 'Par période' },
  ],
};

// Filtres niveau 3 par sous-catégorie
const filtersMap: Record<string, SubCategory[]> = {
  'scheduled:due-soon': [
    { id: 'all', label: 'Tous' },
    { id: 'today', label: "Aujourd'hui", badge: 0 },
    { id: 'this-week', label: 'Cette semaine', badge: 0 },
    { id: 'next-week', label: 'Semaine prochaine', badge: 0 },
  ],
  'scheduled:overdue': [
    { id: 'all', label: 'Tous' },
    { id: '1-7days', label: '1-7 jours', badge: 0, badgeType: 'warning' },
    { id: '8-30days', label: '8-30 jours', badge: 0, badgeType: 'critical' },
    { id: '30+days', label: '30+ jours', badge: 0, badgeType: 'critical' },
  ],
  'completed:excellent': [
    { id: 'all', label: 'Tous' },
    { id: '95+', label: '95+', badge: 0, badgeType: 'success' },
    { id: '90-94', label: '90-94', badge: 0, badgeType: 'success' },
  ],
  'completed:good': [
    { id: 'all', label: 'Tous' },
    { id: '80-89', label: '80-89', badge: 0 },
    { id: '75-79', label: '75-79', badge: 0 },
  ],
  'completed:needs-improvement': [
    { id: 'all', label: 'Tous' },
    { id: '60-74', label: '60-74', badge: 0, badgeType: 'warning' },
    { id: 'below-60', label: '<60', badge: 0, badgeType: 'critical' },
  ],
  'recommendations:pending': [
    { id: 'all', label: 'Toutes' },
    { id: 'formation', label: 'Formation', badge: 0 },
    { id: 'promotion', label: 'Promotion', badge: 0 },
    { id: 'augmentation', label: 'Augmentation', badge: 0 },
    { id: 'recadrage', label: 'Recadrage', badge: 0, badgeType: 'critical' },
  ],
};

// ================================
// Main Component
// ================================
export default function EvaluationsPage() {
  return <EvaluationsPageContent />;
}

function EvaluationsPageContent() {
  const { addToast, addActionLog } = useBMOStore();

  // Navigation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('all');
  const [navigationHistory, setNavigationHistory] = useState<Array<{ category: string; subCategory: string | null }>>([]);

  // UI State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isConnected] = useState(true);

  // Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { updateFilters, getFilters } = usePageNavigation('evaluations');

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return evaluationsCategories.find((c) => c.id === activeCategory)?.label || 'Évaluations';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const currentFilters = useMemo(() => {
    if (!activeSubCategory) return [];
    const key = `${activeCategory}:${activeSubCategory}`;
    return filtersMap[key] || [];
  }, [activeCategory, activeSubCategory]);

  // Stats computation (réutilisé de l'ancien code)
  const stats = useMemo(() => {
    const completed = evaluations.filter((e: any) => e.status === 'completed');
    const scheduled = evaluations.filter((e: any) => e.status === 'scheduled');
    const inProgress = evaluations.filter((e: any) => e.status === 'in_progress');
    const cancelled = evaluations.filter((e: any) => e.status === 'cancelled');

    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((acc: number, e: any) => acc + (e.scoreGlobal || 0), 0) / completed.length)
        : 0;

    const excellent = completed.filter((e: any) => (e.scoreGlobal || 0) >= 90).length;
    const bon = completed.filter((e: any) => (e.scoreGlobal || 0) >= 75 && (e.scoreGlobal || 0) < 90).length;
    const ameliorer = completed.filter((e: any) => (e.scoreGlobal || 0) < 75).length;

    const pendingRecsTotal = completed.reduce((acc: number, e: any) => {
      const pending = (e.recommendations || []).filter((r: any) => r.status === 'pending').length;
      return acc + pending;
    }, 0);

    const now = Date.now();
    const parseFRDateToMs = (dateStr?: string): number => {
      if (!dateStr) return 0;
      const m = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!m) return 0;
      const dd = Number(m[1]);
      const mm = Number(m[2]);
      const yyyy = Number(m[3]);
      const d = new Date(yyyy, mm - 1, dd);
      return Number.isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const overdueScheduled = scheduled.filter((e: any) => {
      const ms = parseFRDateToMs(e.date);
      return ms > 0 && ms < now;
    }).length;

    const daysUntil = (dateStr?: string) => {
      const ms = parseFRDateToMs(dateStr);
      if (!ms) return null;
      return Math.ceil((ms - now) / (1000 * 60 * 60 * 24));
    };

    const dueSoon = scheduled.filter((e: any) => {
      const d = daysUntil(e.date);
      return typeof d === 'number' && d >= 0 && d <= 14;
    }).length;

    return {
      total: evaluations.length,
      completed: completed.length,
      scheduled: scheduled.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      avgScore,
      excellent,
      bon,
      ameliorer,
      pendingRecsTotal,
      overdueScheduled,
      dueSoon,
    };
  }, []);

  // Auto-sync counts
  useAutoSyncCounts(
    'evaluations',
    () => stats.pendingRecsTotal + stats.overdueScheduled + stats.dueSoon,
    { interval: 12000, immediate: true }
  );

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Callbacks
  // ================================
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      addToast('Données actualisées', 'success');
    }, 1500);
  }, [addToast]);

  const handleCategoryChange = useCallback((category: string) => {
    setNavigationHistory((prev) => [...prev, { category: activeCategory, subCategory: activeSubCategory }]);
    setActiveCategory(category);
    setActiveSubCategory('all');
  }, [activeCategory, activeSubCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, []);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setActiveCategory(previous.category);
      setActiveSubCategory(previous.subCategory);
    }
  }, [navigationHistory]);

  const handleExport = useCallback(() => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'evaluations',
      action: 'export',
      targetId: 'ALL',
      targetType: 'Evaluation',
      details: `Export évaluations (${evaluations.length})`,
    });
    addToast('Export évaluations généré', 'success');
  }, [addActionLog, addToast]);

  // Filtered evaluations based on category and subcategory
  const filteredEvaluations = useMemo(() => {
    let filtered = evaluations;

    // Filter by category
    if (activeCategory === 'scheduled') {
      filtered = filtered.filter((e: any) => e.status === 'scheduled');
    } else if (activeCategory === 'in_progress') {
      filtered = filtered.filter((e: any) => e.status === 'in_progress');
    } else if (activeCategory === 'completed') {
      filtered = filtered.filter((e: any) => e.status === 'completed');
    } else if (activeCategory === 'recommendations') {
      filtered = filtered.filter((e: any) => (e.recommendations || []).length > 0);
    }

    // Filter by subcategory
    if (activeSubCategory === 'due-soon') {
      filtered = filtered.filter((e: any) => {
        const d = daysUntil(e.date);
        return typeof d === 'number' && d >= 0 && d <= 14;
      });
    } else if (activeSubCategory === 'overdue') {
      const now = Date.now();
      filtered = filtered.filter((e: any) => {
        const ms = parseFRDateToMs(e.date);
        return ms > 0 && ms < now;
      });
    } else if (activeSubCategory === 'excellent') {
      filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 90);
    } else if (activeSubCategory === 'good') {
      filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 75 && (e.scoreGlobal || 0) < 90);
    } else if (activeSubCategory === 'needs-improvement') {
      filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) < 75);
    } else if (activeSubCategory === 'pending') {
      filtered = filtered.filter((e: any) => (e.recommendations || []).some((r: any) => r.status === 'pending'));
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e: any) => 
        (e.employeeName || '').toLowerCase().includes(q) ||
        (e.employeeRole || '').toLowerCase().includes(q) ||
        (e.evaluatorName || '').toLowerCase().includes(q) ||
        (e.period || '').toLowerCase().includes(q) ||
        (e.bureau || '').toLowerCase().includes(q) ||
        (e.id || '').toLowerCase().includes(q)
      );
    }

    // Filter by level 3 filter
    if (activeFilter && activeFilter !== 'all') {
      const filterKey = `${activeCategory}:${activeSubCategory}`;
      if (filterKey === 'scheduled:due-soon') {
        if (activeFilter === 'today') {
          filtered = filtered.filter((e: any) => {
            const d = daysUntil(e.date);
            return d === 0;
          });
        } else if (activeFilter === 'this-week') {
          filtered = filtered.filter((e: any) => {
            const d = daysUntil(e.date);
            return typeof d === 'number' && d >= 0 && d <= 7;
          });
        } else if (activeFilter === 'next-week') {
          filtered = filtered.filter((e: any) => {
            const d = daysUntil(e.date);
            return typeof d === 'number' && d >= 8 && d <= 14;
          });
        }
      } else if (filterKey === 'scheduled:overdue') {
        const now = Date.now();
        if (activeFilter === '1-7days') {
          filtered = filtered.filter((e: any) => {
            const ms = parseFRDateToMs(e.date);
            const days = Math.ceil((now - ms) / (1000 * 60 * 60 * 24));
            return days >= 1 && days <= 7;
          });
        } else if (activeFilter === '8-30days') {
          filtered = filtered.filter((e: any) => {
            const ms = parseFRDateToMs(e.date);
            const days = Math.ceil((now - ms) / (1000 * 60 * 60 * 24));
            return days >= 8 && days <= 30;
          });
        } else if (activeFilter === '30+days') {
          filtered = filtered.filter((e: any) => {
            const ms = parseFRDateToMs(e.date);
            const days = Math.ceil((now - ms) / (1000 * 60 * 60 * 24));
            return days > 30;
          });
        }
      } else if (filterKey === 'completed:excellent') {
        if (activeFilter === '95+') {
          filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 95);
        } else if (activeFilter === '90-94') {
          filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 90 && (e.scoreGlobal || 0) < 95);
        }
      } else if (filterKey === 'completed:good') {
        if (activeFilter === '80-89') {
          filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 80 && (e.scoreGlobal || 0) < 90);
        } else if (activeFilter === '75-79') {
          filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 75 && (e.scoreGlobal || 0) < 80);
        }
      } else if (filterKey === 'completed:needs-improvement') {
        if (activeFilter === '60-74') {
          filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) >= 60 && (e.scoreGlobal || 0) < 75);
        } else if (activeFilter === 'below-60') {
          filtered = filtered.filter((e: any) => (e.scoreGlobal || 0) < 60);
        }
      } else if (filterKey === 'recommendations:pending') {
        filtered = filtered.filter((e: any) => {
          const recs = (e.recommendations || []).filter((r: any) => r.status === 'pending');
          return recs.some((r: any) => r.type === activeFilter);
        });
      }
    }

    return filtered;
  }, [activeCategory, activeSubCategory, searchQuery, activeFilter, parseFRDateToMs, daysUntil]);

  // Handlers for modal
  const handleSelect = useCallback((evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setDetailModalOpen(true);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'evaluations',
      action: 'view',
      targetId: evaluation.id,
      targetType: 'Evaluation',
      details: `Consultation évaluation ${evaluation.id} (${evaluation.employeeName})`,
    });
  }, [addActionLog]);

  // Navigation prev/next in modal
  const currentEvaluationIndex = useMemo(() => {
    if (!selectedEvaluation) return -1;
    return filteredEvaluations.findIndex((e: any) => e.id === selectedEvaluation.id);
  }, [selectedEvaluation, filteredEvaluations]);

  const hasPreviousEvaluation = currentEvaluationIndex > 0;
  const hasNextEvaluation = currentEvaluationIndex >= 0 && currentEvaluationIndex < filteredEvaluations.length - 1;

  const handlePreviousEvaluation = useCallback(() => {
    if (hasPreviousEvaluation && currentEvaluationIndex > 0) {
      const prevEvaluation = filteredEvaluations[currentEvaluationIndex - 1];
      handleSelect(prevEvaluation as Evaluation);
    }
  }, [hasPreviousEvaluation, currentEvaluationIndex, filteredEvaluations, handleSelect]);

  const handleNextEvaluation = useCallback(() => {
    if (hasNextEvaluation && currentEvaluationIndex < filteredEvaluations.length - 1) {
      const nextEvaluation = filteredEvaluations[currentEvaluationIndex + 1];
      handleSelect(nextEvaluation as Evaluation);
    }
  }, [hasNextEvaluation, currentEvaluationIndex, filteredEvaluations, handleSelect]);

  const handleValidateRecommendation = useCallback((evalId: string, recId: string) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'evaluations',
      action: 'validate_recommendation',
      targetId: evalId,
      targetType: 'Evaluation',
      details: `Recommandation ${recId} validée`,
    });
    addToast('Recommandation validée', 'success');
    // Refresh the evaluation if it's currently open
    if (selectedEvaluation && selectedEvaluation.id === evalId) {
      const updated = evaluations.find((e: any) => e.id === evalId);
      if (updated) setSelectedEvaluation(updated as Evaluation);
    }
  }, [addActionLog, addToast, selectedEvaluation]);

  const handleDownloadCR = useCallback((evalId: string) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'evaluations',
      action: 'download_cr',
      targetId: evalId,
      targetType: 'Evaluation',
      details: 'Téléchargement CR',
    });
    addToast('CR généré (à connecter)', 'info');
  }, [addActionLog, addToast]);

  const handleEdit = useCallback((evaluation: Evaluation) => {
    addToast('Édition (à connecter)', 'info');
  }, [addToast]);

  // ================================
  // Keyboard shortcuts
  // ================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl+K : Command Palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
        return;
      }

      // F11 : Fullscreen (placeholder)
      if (e.key === 'F11') {
        e.preventDefault();
        addToast('Mode plein écran (à implémenter)', 'info');
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, addToast]);

  // ================================
  // Render
  // ================================
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <EvaluationsCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        stats={{
          scheduled: stats.scheduled,
          inProgress: stats.inProgress,
          completed: stats.completed,
          recommendations: stats.pendingRecsTotal,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {navigationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Évaluations</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen((prev) => !prev)}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {(stats.pendingRecsTotal + stats.overdueScheduled) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.pendingRecsTotal + stats.overdueScheduled > 9 ? '9+' : stats.pendingRecsTotal + stats.overdueScheduled}
                </span>
              )}
            </Button>

            {/* Export */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Exporter"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Actualiser"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* More actions */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              title="Plus d'actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Sub Navigation */}
        <EvaluationsSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
          filters={currentFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* KPI Bar */}
        <EvaluationsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
          onRefresh={handleRefresh}
          data={{
            total: stats.total,
            completed: stats.completed,
            scheduled: stats.scheduled,
            inProgress: stats.inProgress,
            avgScore: stats.avgScore,
            excellent: stats.excellent,
            bon: stats.bon,
            ameliorer: stats.ameliorer,
            pendingRecsTotal: stats.pendingRecsTotal,
            overdueScheduled: stats.overdueScheduled,
            dueSoon: stats.dueSoon,
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <div className="max-w-7xl mx-auto">
              {/* Search bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Rechercher (agent, évaluateur, période, bureau, ID)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg text-sm',
                    'bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50'
                  )}
                />
              </div>

              {/* Evaluations list */}
              <div className="space-y-3">
                {filteredEvaluations.map((evaluation: any) => {
                  const pendingRecs = (evaluation.recommendations || []).filter((r: any) => r.status === 'pending').length;
                  const statusConfig: Record<EvaluationStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
                    completed: { label: 'Complétée', variant: 'success' },
                    in_progress: { label: 'En cours', variant: 'warning' },
                    scheduled: { label: 'Planifiée', variant: 'info' },
                    cancelled: { label: 'Annulée', variant: 'default' },
                  };
                  const getScoreColor = (score: number) => {
                    if (score >= 90) return 'text-emerald-400';
                    if (score >= 75) return 'text-blue-400';
                    if (score >= 60) return 'text-amber-400';
                    return 'text-red-400';
                  };

                  return (
                    <Card
                      key={evaluation.id}
                      className="cursor-pointer transition-all hover:border-blue-500/50 hover:bg-slate-800/30"
                      onClick={() => handleSelect(evaluation as Evaluation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                                {(evaluation.employeeName || '?')
                                  .split(' ')
                                  .filter(Boolean)
                                  .map((n: string) => n[0])
                                  .join('')}
                              </div>
                              {evaluation.status === 'completed' && (
                                <div className={cn('absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white', getScoreColor(evaluation.scoreGlobal || 0))}>
                                  {evaluation.scoreGlobal}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant={statusConfig[evaluation.status as EvaluationStatus]?.variant || 'default'}>
                                  {statusConfig[evaluation.status as EvaluationStatus]?.label || evaluation.status}
                                </Badge>
                                <Badge variant="outline">{evaluation.period}</Badge>
                                <BureauTag bureau={evaluation.bureau} />
                                {pendingRecs > 0 && <Badge variant="warning">⏳ {pendingRecs} reco</Badge>}
                              </div>
                              <h3 className="font-bold text-slate-200 mb-1">{evaluation.employeeName}</h3>
                              <p className="text-xs text-slate-400 mb-2">{evaluation.employeeRole}</p>
                              {evaluation.status === 'completed' && (
                                <div className="flex items-center gap-2">
                                  <span className={cn('text-sm font-bold', getScoreColor(evaluation.scoreGlobal || 0))}>
                                    {evaluation.scoreGlobal}/100
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date & Evaluator */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-slate-400">{evaluation.date}</p>
                            <p className="text-xs text-slate-500">Par {evaluation.evaluatorName}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredEvaluations.length === 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700/50">
                    <ClipboardCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Aucune évaluation trouvée</p>
                    <p className="text-xs text-slate-600">
                      Catégorie: {activeCategory} • Sous-catégorie: {activeSubCategory || 'all'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats.total} évaluations • {stats.completed} complétées • {stats.pendingRecsTotal} recommandations
            </span>
            {isConnected && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-slate-600">
                  🔴 Connecté
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette - Placeholder */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[12vh]">
          <div className="w-full max-w-2xl mx-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-5 w-5 text-blue-400" />
              <input
                type="text"
                placeholder="Rechercher une évaluation..."
                className="flex-1 bg-transparent text-slate-200 outline-none"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <p className="text-sm text-slate-500 text-center py-8">
              Command Palette - À implémenter
            </p>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setNotificationsPanelOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
                {(stats.pendingRecsTotal + stats.overdueScheduled) > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    {stats.pendingRecsTotal + stats.overdueScheduled} nouvelles
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsPanelOpen(false)}
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
              >
                ×
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {stats.overdueScheduled > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-medium text-red-400 mb-1">
                    {stats.overdueScheduled} évaluation(s) en retard
                  </p>
                  <p className="text-xs text-slate-400">Action requise</p>
                </div>
              )}
              {stats.pendingRecsTotal > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm font-medium text-amber-400 mb-1">
                    {stats.pendingRecsTotal} recommandation(s) en attente
                  </p>
                  <p className="text-xs text-slate-400">À valider</p>
                </div>
              )}
              {stats.dueSoon > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-400 mb-1">
                    {stats.dueSoon} évaluation(s) à venir (≤14j)
                  </p>
                  <p className="text-xs text-slate-400">À planifier</p>
                </div>
              )}
              {(stats.overdueScheduled === 0 && stats.pendingRecsTotal === 0 && stats.dueSoon === 0) && (
                <p className="text-sm text-slate-500 text-center py-8">Aucune notification</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Evaluation Detail Modal */}
      <EvaluationDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedEvaluation(null);
        }}
        evaluation={selectedEvaluation}
        onValidateRecommendation={handleValidateRecommendation}
        onDownloadCR={handleDownloadCR}
        onEdit={handleEdit}
        onPrevious={handlePreviousEvaluation}
        onNext={handleNextEvaluation}
        hasNext={hasNextEvaluation}
        hasPrevious={hasPreviousEvaluation}
        darkMode={true}
      />
    </div>
  );
}
