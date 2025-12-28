'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { organigramme, bureaux } from '@/lib/data';

export default function OrganigrammePage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  const getBureauColor = (code: string) => {
    const bureau = bureaux.find((b) => b.code === code);
    return bureau?.color || '#F97316';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          📐 Organigramme
        </h1>
        <p className="text-sm text-slate-400">
          Structure organisationnelle de YESSALATE BTP
        </p>
      </div>

      {/* DG */}
      <div className="flex justify-center">
        <Card className="w-64 border-2 border-orange-500">
          <CardContent className="p-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-xl mb-2">
              {organigramme.dg.initials}
            </div>
            <h3 className="font-bold">{organigramme.dg.name}</h3>
            <p className="text-sm text-orange-400">{organigramme.dg.role}</p>
            <Badge variant="gold" className="mt-2">
              👑 Décisionnaire
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Ligne de connexion */}
      <div className="flex justify-center">
        <div className="w-0.5 h-8 bg-orange-500/50" />
      </div>

      {/* Bureaux */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {organigramme.bureaux.map((bureau, i) => (
          <Card
            key={i}
            className="hover:border-orange-500/50 transition-all cursor-pointer"
            style={{ borderTopColor: getBureauColor(bureau.code), borderTopWidth: '3px' }}
            onClick={() => addToast(`Détails bureau ${bureau.code}`, 'info')}
          >
            <CardContent className="p-4">
              {/* Chef de bureau */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: getBureauColor(bureau.code) }}
                >
                  {bureau.head.initials}
                </div>
                <div>
                  <Badge
                    style={{ backgroundColor: getBureauColor(bureau.code) + '30', color: getBureauColor(bureau.code) }}
                  >
                    {bureau.code}
                  </Badge>
                  <h3 className="font-bold text-sm">{bureau.head.name}</h3>
                  <p className="text-[10px] text-slate-400">{bureau.head.role}</p>
                </div>
              </div>

              {/* Membres */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold">
                  Équipe ({bureau.members.length})
                </p>
                {bureau.members.map((member, mi) => (
                  <div
                    key={mi}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: getBureauColor(bureau.code) + '80' }}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{member.name}</p>
                      <p className="text-[10px] text-slate-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Légende */}
      <Card className="border-slate-700">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-3">Légende des bureaux</h3>
          <div className="flex flex-wrap gap-3">
            {bureaux.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: b.color }}
                />
                <span className="text-xs">
                  <strong>{b.code}</strong> - {b.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
