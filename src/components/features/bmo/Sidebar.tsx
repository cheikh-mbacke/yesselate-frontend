'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { navSections } from '@/lib/data';
import type { BadgeType } from '@/lib/types/bmo.types';

// Mapping des IDs vers les routes
const routeMapping: Record<string, string> = {
  dashboard: '/maitre-ouvrage',
  demandes: '/maitre-ouvrage/demandes',
  projets: '/maitre-ouvrage/projets',
  calendrier: '/maitre-ouvrage/calendrier',
  employes: '/maitre-ouvrage/employes',
  missions: '/maitre-ouvrage/missions',
  evaluations: '/maitre-ouvrage/evaluations',
  bureaux: '/maitre-ouvrage/bureaux',
  delegations: '/maitre-ouvrage/delegations',
  organigramme: '/maitre-ouvrage/organigramme',
  'demandes-rh': '/maitre-ouvrage/demandes-rh',
  conges: '/maitre-ouvrage/conges',
  depenses: '/maitre-ouvrage/depenses',
  deplacements: '/maitre-ouvrage/deplacements',
  'paie-avances': '/maitre-ouvrage/paie-avances',
  echanges: '/maitre-ouvrage/echanges',
  arbitrages: '/maitre-ouvrage/arbitrages',
  'messages-externes': '/maitre-ouvrage/messages-externes',
  'validation-bc': '/maitre-ouvrage/validation-bc',
  'validation-contrats': '/maitre-ouvrage/validation-contrats',
  'validation-paiements': '/maitre-ouvrage/validation-paiements',
  blocked: '/maitre-ouvrage/blocked',
  substitution: '/maitre-ouvrage/substitution',
  alerts: '/maitre-ouvrage/alerts',
  recouvrements: '/maitre-ouvrage/recouvrements',
  litiges: '/maitre-ouvrage/litiges',
  finances: '/maitre-ouvrage/finances',
  decisions: '/maitre-ouvrage/decisions',
  raci: '/maitre-ouvrage/raci',
  audit: '/maitre-ouvrage/audit',
  analytics: '/maitre-ouvrage/analytics',
  api: '/maitre-ouvrage/api',
  ia: '/maitre-ouvrage/ia',
};

export function BMOSidebar() {
  const pathname = usePathname();
  const { darkMode, sidebarOpen, toggleSidebar } = useAppStore();

  // Déterminer l'item actif basé sur le pathname
  const getActiveId = () => {
    for (const [id, route] of Object.entries(routeMapping)) {
      if (pathname === route) return id;
    }
    return 'dashboard';
  };

  const activeId = getActiveId();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-52' : 'w-14',
        darkMode
          ? 'bg-slate-800 border-r border-amber-500/20'
          : 'bg-white border-r border-gray-200'
      )}
    >
      {/* Logo */}
      <div className="p-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm shadow-lg">
            🏛️
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 text-xs">
                YESSALATE BMO
              </h1>
              <p className="text-[9px] text-amber-500/70 uppercase">
                V1.0 Beta
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User info */}
      <div
        className={cn(
          'm-1.5 p-2 rounded-lg',
          darkMode ? 'bg-orange-500/10' : 'bg-orange-50'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-[10px]">
              AD
            </div>
            <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] truncate">A. DIALLO</p>
              <p className="text-[9px] text-amber-500">Directeur Général</p>
            </div>
          )}
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-1">
        {navSections.map((section, si) => (
          <div key={si} className="mb-1">
            {sidebarOpen && (
              <p className="text-[9px] uppercase text-amber-500/70 font-bold px-2 py-1">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const route = routeMapping[item.id] || '/maitre-ouvrage';
              const isActive = activeId === item.id;

              return (
                <Link
                  key={item.id}
                  href={route}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-all text-[11px]',
                    isActive
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : darkMode
                      ? 'text-slate-400 hover:bg-slate-700/50'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <span className="text-sm">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge
                          variant={item.badgeType as BadgeType}
                          pulse={item.badgeType === 'urgent'}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Action button */}
      <div className="p-1.5 border-t border-amber-500/20">
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-[10px] flex items-center justify-center gap-1">
          ⚖️{sidebarOpen && ' DÉCISION'}
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'hidden sm:flex absolute -right-2.5 top-14 w-5 h-5 rounded-full items-center justify-center text-white text-[10px] bg-orange-500 border-2',
          darkMode ? 'border-slate-900' : 'border-gray-100'
        )}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>
    </aside>
  );
}
