'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function NotificationsPanel() {
  const { darkMode } = useAppStore();
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    markNotificationAsRead,
    addToast,
  } = useBMOStore();

  if (!showNotifications) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowNotifications(false)}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-12 right-4 w-80 max-h-[500px] rounded-xl shadow-2xl z-50',
          'flex flex-col overflow-hidden border',
          darkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-gray-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="urgent">{unreadCount}</Badge>
            )}
          </div>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              notifications.forEach((n) => markNotificationAsRead(n.id));
              addToast('Toutes les notifications marquées comme lues', 'success');
            }}
          >
            Tout lire
          </Button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <span className="text-4xl">🔕</span>
              <p className="text-sm mt-2">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    addToast(`Notification: ${notif.title}`, 'info');
                  }}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer transition-colors',
                    notif.unread
                      ? darkMode
                        ? 'bg-orange-500/10'
                        : 'bg-orange-50'
                      : '',
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  )}
                >
                  <span className="text-xl">{notif.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'text-xs font-semibold truncate',
                          notif.unread && 'text-orange-400'
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {notif.desc}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-500 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700">
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => setShowNotifications(false)}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </div>
    </>
  );
}
