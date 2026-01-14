/**
 * Layout pour le module Calendrier & Planification v3.0
 * Partage le sidebar entre toutes les pages du module
 */

'use client';

import React, { useState } from 'react';
import { CalendrierSidebar } from '@/modules/calendrier/navigation/CalendrierSidebar';

export default function CalendrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Sidebar */}
      <CalendrierSidebar
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

