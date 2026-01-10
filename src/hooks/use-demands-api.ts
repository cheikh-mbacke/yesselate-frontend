/**
 * Hook personnalisé pour l'API Demandes
 * Gère le loading, les erreurs, et le cache local
 */

import { useState, useCallback } from 'react';
import * as api from '@/lib/api';

export function useDemandsAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await api.fetchAllDemands();
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result.data;
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const result = await api.fetchDemandById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result.data;
  }, []);

  const validate = useCallback(async (demandId: string, comment?: string) => {
    setLoading(true);
    setError(null);
    
    const result = await api.validateDemand(demandId, comment);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result.success;
  }, []);

  const reject = useCallback(async (demandId: string, reason: string) => {
    setLoading(true);
    setError(null);
    
    const result = await api.rejectDemand(demandId, reason);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result.success;
  }, []);

  const exportToPDF = useCallback(async (filters?: {
    bureau?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    const result = await api.exportDemandsToPDF(filters);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result.url;
  }, []);

  const fetchSLAStats = useCallback(async (bureau?: string) => {
    setLoading(true);
    setError(null);
    
    const result = await api.fetchSLAStats(bureau);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result.data;
  }, []);

  return {
    loading,
    error,
    fetchAll,
    fetchById,
    validate,
    reject,
    exportToPDF,
    fetchSLAStats,
  };
}

