'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { BMOSidebar } from '@/components/features/bmo/Sidebar';
import { BMOHeader } from '@/components/features/bmo/Header';
import { AIAssistant } from '@/components/features/bmo/AIAssistant';
import { NotificationsPanel } from '@/components/features/bmo/NotificationsPanel';
import { ToastContainer } from '@/components/features/bmo/ToastContainer';
import { AutoSyncProvider } from '@/components/shared/AutoSyncProvider';

interface BMOLayoutProps {
  children: React.ReactNode;
}

export function BMOLayout({ children }: BMOLayoutProps) {
  const { darkMode, sidebarOpen } = useAppStore();

  return (
    <AutoSyncProvider>
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

          {/* Page content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
        </main>

        {/* Overlays & Modals */}
        <NotificationsPanel />
        <AIAssistant />
        <ToastContainer />
      </div>
    </AutoSyncProvider>
  );
}
