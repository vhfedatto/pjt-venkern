import { useState, useEffect, useCallback, useRef } from 'react';
import { contactsApi, teamsApi } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { mapApiContactToUi, mapApiTeamToUi, mapUiContactToApi } from '../services/mappers';
import type { Contact, Team } from '../types';

interface UseContactsOptions {
  search?: string;
  teamId?: string;
  favorite?: boolean;
}

export function useContacts(options: UseContactsOptions = {}) {
  const { currentProject } = useProject();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search to avoid a request on every keystroke
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(options.search ?? '');

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(options.search ?? '');
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [options.search]);

  const fetchContacts = useCallback(async () => {
    if (!currentProject) {
      setContacts([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (options.teamId) params.set('team_id', options.teamId);
      if (options.favorite !== undefined) params.set('favorite', String(options.favorite));
      params.set('project_id', String(currentProject.id));
      const qs = params.toString();
      const res = await contactsApi.list(qs || undefined);
      setContacts(res.data.map(mapApiContactToUi));
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  }, [currentProject, debouncedSearch, options.teamId, options.favorite]);

  const fetchTeams = useCallback(async () => {
    if (!currentProject) {
      setTeams([]);
      return;
    }
    try {
      const data = await teamsApi.list({ project_id: currentProject.id }) as any[];
      setTeams(data.map(mapApiTeamToUi));
    } catch {
      // non-critical — teams list just stays empty
    }
  }, [currentProject]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createContact = useCallback(async (form: Partial<Contact>) => {
    const body = mapUiContactToApi({ ...form, projectId: currentProject?.id } as Partial<Contact>);
    const data = await contactsApi.create(body);
    const newContact = mapApiContactToUi(data);
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  }, [currentProject]);

  const updateContact = useCallback(async (id: string, form: Partial<Contact>) => {
    const body = mapUiContactToApi(form);
    const data = await contactsApi.update(id, body);
    const updated = mapApiContactToUi(data);
    setContacts(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    await contactsApi.remove(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleFavorite = useCallback(async (id: string, value?: boolean) => {
    const data = await contactsApi.favorite(id, value);
    const updated = mapApiContactToUi(data);
    setContacts(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  }, []);

  return {
    contacts,
    teams,
    loading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    toggleFavorite,
  };
}
