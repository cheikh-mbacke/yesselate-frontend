'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { BMOSidebar } from '@/components/features/bmo/Sidebar';
import { BMOHeader, BMOToolbar } from '@/components/features/bmo/Header';
import { SearchModal } from '@/components/features/bmo/SearchModal';
import { AIAssistant } from '@/components/features/bmo/AIAssistant';
import { NotificationsPanel } from '@/components/features/bmo/NotificationsPanel';
import { ToastContainer } from '@/components/features/bmo/ToastContainer';
import { QuickPanel } from '@/components/features/bmo/QuickPanel';

interface BMOLayoutProps {
  children: React.ReactNode;
}

export function BMOLayout({ children }: BMOLayoutProps) {
  const { darkMode, sidebarOpen } = useAppStore();

  return (
    <div
      className={cn(
        'min-h-screen flex',
        darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'
      )}
    >
      {/* Sidebar */}
      <BMOSidebar />

      {/* Main content */}
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarOpen ? 'ml-52' : 'ml-14'
        )}
      >
        {/* Header */}
        <BMOHeader />

        {/* Toolbar */}
        <BMOToolbar />

        {/* Page content */}
        <div className="flex-1 p-4 overflow-auto">{children}</div>
      </main>

      {/* Overlays & Modals */}
      <SearchModal />
      <NotificationsPanel />
      <QuickPanel />
      <AIAssistant />
      <ToastContainer />
    </div>
  );
}
