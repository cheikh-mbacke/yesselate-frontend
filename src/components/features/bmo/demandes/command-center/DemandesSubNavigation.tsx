/**
 * Demandes Command Center - Sub Navigation
 * Navigation secondaire par type/service
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  useDemandesCommandCenterStore,
  type DemandesSubCategory,
} from '@/lib/stores/demandesCommandCenterStore';
import { FileText, Receipt, FileEdit, ShoppingCart, Building2, Scale } from 'lucide-react';

interface SubNavItem {
  id: DemandesSubCategory;
  label: string;
  icon: typeof FileText;
}

const subNavByMain: Record<string, SubNavItem[]> = {
  overview: [],
  pending: [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'bc', label: 'BC', icon: FileText },
    { id: 'factures', label: 'Factures', icon: Receipt },
    { id: 'avenants', label: 'Avenants', icon: FileEdit },
  ],
  urgent: [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'achats', label: 'Achats', icon: ShoppingCart },
    { id: 'finance', label: 'Finance', icon: Building2 },
    { id: 'juridique', label: 'Juridique', icon: Scale },
  ],
  validated: [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'bc', label: 'BC', icon: FileText },
    { id: 'factures', label: 'Factures', icon: Receipt },
  ],
  rejected: [
    { id: 'all', label: 'Tous', icon: FileText },
  ],
  overdue: [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'achats', label: 'Achats', icon: ShoppingCart },
    { id: 'finance', label: 'Finance', icon: Building2 },
  ],
};

export function DemandesSubNavigation() {
  const { navigation, navigate } = useDemandesCommandCenterStore();

  const items = subNavByMain[navigation.mainCategory] || [];

  if (items.length === 0) return null;

  return (
    <div className="border-b border-slate-800/50 bg-slate-900/30">
      <div className="flex items-center gap-1 px-4 py-1 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = navigation.subCategory === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(navigation.mainCategory, item.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-slate-800/60 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

