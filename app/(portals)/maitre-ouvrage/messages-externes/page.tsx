'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { messagesExternes } from '@/lib/data';

export default function MessagesExternesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'requires_response' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const filteredMessages = messagesExternes.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unread') return m.status === 'unread';
    if (filter === 'requires_response') return m.requiresResponse && m.status !== 'replied';
    if (filter === 'archived') return m.status === 'archived';
    return true;
  });

  const stats = useMemo(() => {
    const unread = messagesExternes.filter(m => m.status === 'unread').length;
    const requiresResponse = messagesExternes.filter(m => m.requiresResponse && m.status !== 'replied').length;
    const replied = messagesExternes.filter(m => m.status === 'replied').length;
    const archived = messagesExternes.filter(m => m.status === 'archived').length;
    return { total: messagesExternes.length, unread, requiresResponse, replied, archived };
  }, []);

  const selectedM = selectedMessage ? messagesExternes.find(m => m.id === selectedMessage) : null;

  const handleRespond = (message: typeof selectedM) => {
    if (!message) return;
    addActionLog({
      module: 'messages-externes',
      action: 'respond',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Réponse message ${message.sender}`,
      status: 'success',
    });
    addToast('Réponse envoyée - Preuve archivée', 'success');
  };

  const handleAssign = (message: typeof selectedM) => {
    if (!message) return;
    addActionLog({
      module: 'messages-externes',
      action: 'assign',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message assigné pour traitement`,
      status: 'info',
    });
    addToast('Message assigné', 'info');
  };

  const handleLink = (message: typeof selectedM, linkType: string) => {
    if (!message) return;
    addActionLog({
      module: 'messages-externes',
      action: 'link',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message lié à ${linkType}`,
      status: 'info',
    });
    addToast(`Lié à ${linkType}`, 'success');
  };

  const handleArchive = (message: typeof selectedM) => {
    if (!message) return;
    addActionLog({
      module: 'messages-externes',
      action: 'archive',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message archivé`,
      status: 'success',
    });
    addToast('Message archivé', 'success');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { courrier: '📬', email: '📧', fax: '📠', recommande: '📮' };
    return icons[type] || '📩';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📨 Messages Externes
            <Badge variant="warning">{stats.unread} non lus</Badge>
          </h1>
          <p className="text-sm text-slate-400">Courriers entrants avec archivage et traçabilité des réponses</p>
        </div>
      </div>

      {stats.requiresResponse > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400">{stats.requiresResponse} message(s) nécessitant réponse</h3>
                <p className="text-sm text-slate-400">Courriers en attente de traitement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.unread}</p>
            <p className="text-[10px] text-slate-400">Non lus</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.requiresResponse}</p>
            <p className="text-[10px] text-slate-400">À répondre</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.replied}</p>
            <p className="text-[10px] text-slate-400">Répondus</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-400">{stats.archived}</p>
            <p className="text-[10px] text-slate-400">Archivés</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'unread', label: '🔴 Non lus' },
          { id: 'requires_response', label: '⚠️ À répondre' },
          { id: 'archived', label: '📁 Archivés' },
        ].map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filteredMessages.map((message) => {
            const isSelected = selectedMessage === message.id;
            
            return (
              <Card
                key={message.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  message.status === 'unread' && 'border-l-4 border-l-red-500',
                  message.requiresResponse && message.status !== 'replied' && 'border-l-4 border-l-amber-500',
                  message.status === 'replied' && 'border-l-4 border-l-emerald-500',
                  message.status === 'archived' && 'opacity-60',
                )}
                onClick={() => setSelectedMessage(message.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{getTypeIcon(message.type)}</span>
                        <span className="font-mono text-xs text-blue-400">{message.id}</span>
                        <Badge variant={message.status === 'unread' ? 'urgent' : message.status === 'replied' ? 'success' : 'default'}>{message.status}</Badge>
                        <Badge variant={message.priority === 'urgent' ? 'urgent' : message.priority === 'high' ? 'warning' : 'default'}>{message.priority}</Badge>
                      </div>
                      <h3 className="font-bold mt-1">{message.subject}</h3>
                      <p className="text-sm text-slate-400">{message.sender}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{message.date}</p>
                      {message.requiresResponse && message.status !== 'replied' && (
                        <Badge variant="warning" className="mt-1">Réponse requise</Badge>
                      )}
                    </div>
                  </div>

                  {message.status !== 'archived' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      {message.requiresResponse && message.status !== 'replied' && (
                        <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleRespond(message); }}>💬 Répondre</Button>
                      )}
                      <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleAssign(message); }}>👤 Assigner</Button>
                      <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleArchive(message); }}>📁 Archiver</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {selectedM ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(selectedM.type)}</span>
                    <Badge variant={selectedM.status === 'unread' ? 'urgent' : selectedM.status === 'replied' ? 'success' : 'default'}>{selectedM.status}</Badge>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedM.id}</span>
                  <h3 className="font-bold">{selectedM.subject}</h3>
                  <p className="text-slate-400">{selectedM.sender}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-slate-400">Type</p>
                        <p className="capitalize">{selectedM.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Date</p>
                        <p>{selectedM.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Priorité</p>
                        <Badge variant={selectedM.priority === 'urgent' ? 'urgent' : 'default'}>{selectedM.priority}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Réponse</p>
                        <p>{selectedM.requiresResponse ? 'Requise' : 'Non requise'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Liens */}
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-2">Lier à</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleLink(selectedM, 'Projet')}>📁 Projet</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleLink(selectedM, 'Litige')}>⚖️ Litige</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleLink(selectedM, 'Recouvrement')}>💰 Recouvrement</Button>
                    </div>
                  </div>
                </div>

                {selectedM.status !== 'archived' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    {selectedM.requiresResponse && selectedM.status !== 'replied' && (
                      <Button size="sm" variant="success" onClick={() => handleRespond(selectedM)}>💬 Répondre</Button>
                    )}
                    <Button size="sm" variant="info" onClick={() => handleAssign(selectedM)}>👤 Assigner</Button>
                    <Button size="sm" variant="default" onClick={() => handleArchive(selectedM)}>📁 Archiver</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">📨</span><p className="text-slate-400">Sélectionnez un message</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
