import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../services/api';
import type { DashboardSummary } from '../types';

export function useDashboard(projectId: number | null | undefined) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!projectId) {
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.summary(projectId) as DashboardSummary;
      setSummary(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar resumo do dashboard');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}
