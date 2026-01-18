/**
 * Composant ContratsHeader pour l'en-tête des pages
 */

'use client';

import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContratsFilters } from '../hooks/useContratsFilters';

interface ContratsHeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
}

export function ContratsHeader({
  title,
  subtitle,
  onSearch,
  onFilter,
  onExport,
}: ContratsHeaderProps) {
  const filters = useContratsFilters();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filters.setRecherche(query);
    onSearch?.(query);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-200">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9 w-64 bg-slate-800/50 border-slate-700 text-slate-200"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>
    </div>
  );
}

