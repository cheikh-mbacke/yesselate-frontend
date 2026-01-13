'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Clock } from 'lucide-react';
import { evaluationsApiService, type EvaluationsFilters } from '@/lib/services/evaluationsApiService';
import type { Evaluation } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface ScheduledViewProps {
  subCategory: string | null;
  onOpenEvaluation: (evaluation: Evaluation) => void;
}

const parseFRDateToMs = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const m = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const daysUntil = (dateStr?: string): number | null => {
  const ms = parseFRDateToMs(dateStr);
  if (!ms) return null;
  const now = Date.now();
  return Math.ceil((ms - now) / (1000 * 60 * 60 * 24));
};

export function ScheduledView({ subCategory, onOpenEvaluation }: ScheduledViewProps) {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: EvaluationsFilters = { status: 'scheduled' };
      
      if (subCategory === 'due-soon') {
        filters.dueSoon = true;
      } else if (subCategory === 'overdue') {
        filters.overdue = true;
      }

      const result = await evaluationsApiService.getAll(filters, { field: 'date', direction: 'asc' }, 1, 100);
      setData(result.data);
    } catch (error) {
      console.error('Error loading scheduled evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-400" />
          Évaluations planifiées
        </h2>
      </div>

      <div className="grid gap-4">
        {data.map((evalItem) => {
          const d = daysUntil(evalItem.date);
          const isOverdue = parseFRDateToMs(evalItem.date) < Date.now();

          return (
            <Card
              key={evalItem.id}
              className="cursor-pointer hover:border-purple-500/50 transition-all border-l-4"
              style={{ borderLeftColor: isOverdue ? 'rgb(239 68 68)' : typeof d === 'number' && d <= 14 ? 'rgb(245 158 11)' : undefined }}
              onClick={() => onOpenEvaluation(evalItem)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                      {(evalItem.employeeName || '?')
                        .split(' ')
                        .filter(Boolean)
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{evalItem.employeeName}</p>
                      <p className="text-sm text-slate-400">{evalItem.employeeRole}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <BureauTag bureau={evalItem.bureau} />
                        <Badge variant="info">{evalItem.period}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 font-medium">{evalItem.date}</p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      {typeof d === 'number' && d >= 0 && d <= 14 && !isOverdue && (
                        <Badge variant="warning">Dans {d}j</Badge>
                      )}
                      {isOverdue && <Badge variant="destructive">En retard</Badge>}
                      <Eye className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Aucune évaluation planifiée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

