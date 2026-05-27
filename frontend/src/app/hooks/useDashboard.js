import { useState, useEffect, useCallback } from "react";
import { dashboardApi } from "../services/api";
function useDashboard(projectId) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchSummary = useCallback(async () => {
    if (!projectId) {
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.summary(projectId);
      setSummary(data);
    } catch (e) {
      setError(e?.message ?? "Erro ao carregar resumo do dashboard");
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  return { summary, loading, error, refetch: fetchSummary };
}
export {
  useDashboard
};
