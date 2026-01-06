"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";
import { navSections } from "@/lib/data";
import type { BadgeType } from "@/lib/types/bmo.types";

// Mapping des IDs vers les routes
const routeMapping: Record<string, string> = {
  // PILOTAGE
  dashboard: "/maitre-ouvrage",
  alerts: "/maitre-ouvrage/alerts",
  calendrier: "/maitre-ouvrage/calendrier",
  analytics: "/maitre-ouvrage/analytics",
  
  // EXÉCUTION
  demandes: "/maitre-ouvrage/demandes",
  "validation-bc": "/maitre-ouvrage/validation-bc",
  "validation-contrats": "/maitre-ouvrage/validation-contrats",
  "validation-paiements": "/maitre-ouvrage/validation-paiements",
  blocked: "/maitre-ouvrage/blocked",
  substitution: "/maitre-ouvrage/substitution",
  
  // PROJETS & CLIENTS
  "projets-en-cours": "/maitre-ouvrage/projets-en-cours",
  clients: "/maitre-ouvrage/clients",
  "tickets-clients": "/maitre-ouvrage/tickets-clients",
  
  // FINANCE & CONTENTIEUX
  finances: "/maitre-ouvrage/finances",
  recouvrements: "/maitre-ouvrage/recouvrements",
  litiges: "/maitre-ouvrage/litiges",
  
  // RH & RESSOURCES
  employes: "/maitre-ouvrage/employes",
  missions: "/maitre-ouvrage/missions",
  evaluations: "/maitre-ouvrage/evaluations",
  "demandes-rh": "/maitre-ouvrage/demandes-rh",
  depenses: "/maitre-ouvrage/depenses",
  deplacements: "/maitre-ouvrage/deplacements",
  "paie-avances": "/maitre-ouvrage/paie-avances",
  delegations: "/maitre-ouvrage/delegations",
  organigramme: "/maitre-ouvrage/organigramme",
  
  // COMMUNICATION
  "echanges-bureaux": "/maitre-ouvrage/echanges-bureaux",
  "echanges-structures": "/maitre-ouvrage/echanges-structures",
  "arbitrages-vivants": "/maitre-ouvrage/arbitrages-vivants",
  conferences: "/maitre-ouvrage/conferences",
  "messages-externes": "/maitre-ouvrage/messages-externes",
  
  // GOUVERNANCE
  decisions: "/maitre-ouvrage/decisions",
  raci: "/maitre-ouvrage/raci",
  audit: "/maitre-ouvrage/audit",
  logs: "/maitre-ouvrage/logs",
  "system-logs": "/maitre-ouvrage/system-logs",
  ia: "/maitre-ouvrage/ia",
  api: "/maitre-ouvrage/api",
  parametres: "/maitre-ouvrage/parametres",
};

export function BMOSidebar() {
  const pathname = usePathname();
  const { darkMode, sidebarOpen, toggleSidebar } = useAppStore();

  // Déterminer l'item actif basé sur le pathname
  const getActiveId = () => {
    for (const [id, route] of Object.entries(routeMapping)) {
      if (pathname === route) return id;
    }
    return "dashboard";
  };

  const activeId = getActiveId();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-52" : "w-14",
        darkMode
          ? "bg-slate-800 border-r border-amber-500/20"
          : "bg-white border-r border-gray-200"
      )}
    >
      {/* Logo */}
      <div className="p-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-lg relative border border-orange-500">
            <Image
              src="/images/log_yessalate.png"
              alt="Yessalate Logo"
              fill
              className="object-cover"
              priority
            />
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
          "m-1.5 p-2 rounded-lg",
          darkMode ? "bg-orange-500/10" : "bg-orange-50"
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
      <nav className="flex-1 overflow-y-auto px-1.5 py-1 scrollbar-thin">
        {navSections.map((section, si) => (
          <div key={si} className="mb-1">
            {sidebarOpen && (
              <p className="text-[9px] uppercase text-amber-500/70 font-bold px-2 py-1">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const route = routeMapping[item.id] || "/maitre-ouvrage";
              const isActive = activeId === item.id;

              return (
                <Link
                  key={item.id}
                  href={route}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-all text-[11px]",
                    isActive
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : darkMode
                      ? "text-slate-400 hover:bg-slate-700/50"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span className="text-sm">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badgeType as BadgeType || "default"}
                          className="text-[9px] px-1 py-0"
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

      {/* Toggle button */}
      <div className="p-2 border-t border-amber-500/20">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full p-2 rounded-lg text-xs transition-all flex items-center justify-center gap-2",
            darkMode
              ? "bg-slate-700/50 hover:bg-slate-700 text-slate-400"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          )}
        >
          {sidebarOpen ? (
            <>
              <span>◀</span>
              <span>Réduire</span>
            </>
          ) : (
            <span>▶</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default BMOSidebar;
