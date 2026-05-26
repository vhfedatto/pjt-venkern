import { useState, useEffect, useCallback } from 'react';
import { moderationApi, contactsApi } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { mapApiModerationAlertToUi, mapApiContactToUi } from '../services/mappers';
import type { ModerationAlert, Contact } from '../types';

export function useModeration() {
  const { currentProject } = useProject();
  const [alerts, setAlerts] = useState<ModerationAlert[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentProject) {
      setAlerts([]);
      setContacts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const [alertsRes, contactsRes] = await Promise.all([
        moderationApi.list({ project_id: currentProject.id }),
        contactsApi.list({ per_page: 200, project_id: currentProject.id }),
      ]);
      setAlerts(Array.isArray(alertsRes) ? alertsRes.map(mapApiModerationAlertToUi) : []);
      setContacts((contactsRes.data ?? []).map(mapApiContactToUi));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resolveAlert = async (id: string) => {
    const res = await moderationApi.resolve(id);
    const updated = mapApiModerationAlertToUi(res);
    setAlerts(p => p.map(a => a.id === id ? updated : a));
    return updated;
  };

  const dismissAlert = async (id: string) => {
    const res = await moderationApi.dismiss(id);
    const updated = mapApiModerationAlertToUi(res);
    setAlerts(p => p.map(a => a.id === id ? updated : a));
    return updated;
  };

  const deleteAlert = async (id: string) => {
    await moderationApi.remove(id);
    setAlerts(p => p.filter(a => a.id !== id));
  };

  return { alerts, contacts, loading, error, refetch: fetchData, resolveAlert, dismissAlert, deleteAlert };
}
