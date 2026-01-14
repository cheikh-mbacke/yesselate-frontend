/**
 * Layout pour le module Centre de Commande – Gouvernance
 * Partage le sidebar entre toutes les pages du module
 */

'use client';

import React, { useState } from 'react';
import { GouvernanceSidebar } from '@/modules/gouvernance/navigation/GouvernanceSidebar';

export default function GouvernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <GouvernanceSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

