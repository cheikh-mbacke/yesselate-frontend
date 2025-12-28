'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { raciMatrix, bureaux } from '@/lib/data';

export default function RACIPage() {
  const { darkMode } = useAppStore();

  const raciColors = {
    R: { bg: 'bg-emerald-500', text: 'text-white', label: 'Responsable' },
    A: { bg: 'bg-orange-500', text: 'text-white', label: 'Approbateur' },
    C: { bg: 'bg-blue-500', text: 'text-white', label: 'Consulté' },
    I: { bg: 'bg-slate-500', text: 'text-white', label: 'Informé' },
  };

  const bureauHeaders = ['BMO', 'BF', 'BM', 'BA', 'BCT', 'BQC', 'BJ'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          📐 Matrice RACI
        </h1>
        <p className="text-sm text-slate-400">
          Responsabilités des bureaux par activité
        </p>
      </div>

      {/* Légende */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(raciColors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded flex items-center justify-center font-bold', value.bg, value.text)}>
                  {key}
                </div>
                <span className="text-sm">{value.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Distribution des responsabilités</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-4 py-3 text-left font-bold text-amber-500">
                    Activité
                  </th>
                  {bureauHeaders.map((code) => {
                    const bureau = bureaux.find((b) => b.code === code);
                    return (
                      <th
                        key={code}
                        className="px-3 py-3 text-center font-bold"
                        style={{ color: bureau?.color }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{bureau?.icon}</span>
                          <span>{code}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {raciMatrix.map((row, i) => (
                  <tr
                    key={i}
                    className={cn(
                      'border-t',
                      darkMode
                        ? 'border-slate-700/50 hover:bg-orange-500/5'
                        : 'border-gray-100 hover:bg-gray-50'
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{row.activity}</td>
                    {bureauHeaders.map((code) => {
                      const value = row[code as keyof typeof row] as string;
                      const style = raciColors[value as keyof typeof raciColors];
                      return (
                        <td key={code} className="px-3 py-3 text-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-sm',
                              style?.bg,
                              style?.text
                            )}
                          >
                            {value}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats par bureau */}
      <div className="grid md:grid-cols-4 gap-4">
        {['R', 'A', 'C', 'I'].map((type) => {
          const style = raciColors[type as keyof typeof raciColors];
          // Compter le nombre de chaque type
          const count = raciMatrix.reduce((acc, row) => {
            return (
              acc +
              bureauHeaders.filter(
                (code) => row[code as keyof typeof row] === type
              ).length
            );
          }, 0);

          return (
            <Card key={type} className={cn('border-l-4', `border-l-${type === 'R' ? 'emerald' : type === 'A' ? 'orange' : type === 'C' ? 'blue' : 'slate'}-500`)}>
              <CardContent className="p-4 text-center">
                <div className={cn('w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-2', style.bg, style.text)}>
                  {type}
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-slate-400">{style.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">
                À propos de la matrice RACI
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                La matrice RACI définit clairement les responsabilités de chaque
                bureau pour les activités clés. <strong>R</strong> (Responsable)
                exécute la tâche, <strong>A</strong> (Approbateur) valide et
                approuve, <strong>C</strong> (Consulté) donne son avis avant
                décision, <strong>I</strong> (Informé) est tenu au courant après
                décision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
