import { useState, useEffect, useCallback } from "react";
import { reportsApi } from "../services/api";
function useReports(projectId) {
  const [state, setState] = useState({
    summary: null,
    tasks: null,
    contacts: null,
    activity: [],
    loading: false,
    error: null
  });
  const load = useCallback(async () => {
    if (!projectId) {
      setState((s) => ({ ...s, loading: false, error: null }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [summary, tasks, contacts, activity] = await Promise.all([
        reportsApi.summary(projectId),
        reportsApi.tasks(projectId),
        reportsApi.contacts(projectId),
        reportsApi.activity(projectId)
      ]);
      setState({ summary, tasks, contacts, activity: activity ?? [], loading: false, error: null });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message ?? "Erro ao carregar relat\xF3rios"
      }));
    }
  }, [projectId]);
  useEffect(() => {
    load();
  }, [load]);
  return { ...state, refresh: load };
}
export {
  useReports
};
