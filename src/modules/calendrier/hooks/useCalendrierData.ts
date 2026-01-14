/**
 * Hook pour récupérer les données du calendrier via l'API
 * Gère le loading, les erreurs et le cache
 */

import { useState, useEffect } from 'react';
import {
  getCalendrierOverview,
  getJalons,
  getEvenements,
  getAbsences,
} from '../api/calendrierApi';
import type {
  CalendrierOverviewResponse,
  JalonsResponse,
  EvenementCalendrier,
  Absence,
  CalendrierFilters,
} from '../types/calendrierTypes';

interface UseCalendrierDataResult {
  data: CalendrierOverviewResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCalendrierData(
  filters?: Partial<CalendrierFilters>
): UseCalendrierDataResult {
  const [data, setData] = useState<CalendrierOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCalendrierOverview(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseJalonsResult {
  jalons: JalonsResponse | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useJalons(params?: {
  type?: 'SLA' | 'CONTRAT' | 'INTERNE';
  chantier_id?: number;
  est_retard?: boolean;
  est_sla_risque?: boolean;
}): UseJalonsResult {
  const [jalons, setJalons] = useState<JalonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getJalons(params);
      setJalons(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    jalons,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseEvenementsResult {
  evenements: EvenementCalendrier[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEvenements(params?: {
  type?: 'EVENEMENT' | 'REUNION_PROJET' | 'REUNION_DECISIONNELLE';
  chantier_id?: number;
  date_debut?: string;
  date_fin?: string;
}): UseEvenementsResult {
  const [evenements, setEvenements] = useState<EvenementCalendrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getEvenements(params);
      setEvenements(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    evenements,
    loading,
    error,
    refetch: fetchData,
  };
}

interface UseAbsencesResult {
  absences: Absence[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAbsences(params?: {
  user_id?: number;
  equipe_id?: number;
  chantier_id?: number;
  date_debut?: string;
  date_fin?: string;
}): UseAbsencesResult {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAbsences(params);
      setAbsences(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    absences,
    loading,
    error,
    refetch: fetchData,
  };
}

