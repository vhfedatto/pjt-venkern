import { useState, useEffect, useCallback, useRef } from "react";
import { contactsApi, teamsApi } from "../services/api";
import { useProject } from "../context/ProjectContext";
import { mapApiContactToUi, mapApiTeamToUi, mapUiContactToApi } from "../services/mappers";
function useContacts(options = {}) {
  const { currentProject } = useProject();
  const [contacts, setContacts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState(options.search ?? "");
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(options.search ?? "");
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
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (options.teamId) params.set("team_id", options.teamId);
      if (options.favorite !== void 0) params.set("favorite", String(options.favorite));
      params.set("project_id", String(currentProject.id));
      const qs = params.toString();
      const res = await contactsApi.list(qs || void 0);
      setContacts(res.data.map(mapApiContactToUi));
    } catch (e) {
      setError(e?.message ?? "Erro ao carregar contatos");
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
      const data = await teamsApi.list({ project_id: currentProject.id });
      setTeams(data.map(mapApiTeamToUi));
    } catch {
    }
  }, [currentProject]);
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  const createContact = useCallback(async (form) => {
    const body = mapUiContactToApi({ ...form, projectId: currentProject?.id });
    const data = await contactsApi.create(body);
    const newContact = mapApiContactToUi(data);
    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  }, [currentProject]);
  const updateContact = useCallback(async (id, form) => {
    const body = mapUiContactToApi(form);
    const data = await contactsApi.update(id, body);
    const updated = mapApiContactToUi(data);
    setContacts((prev) => prev.map((c) => c.id === id ? updated : c));
    return updated;
  }, []);
  const deleteContact = useCallback(async (id) => {
    await contactsApi.remove(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);
  const toggleFavorite = useCallback(async (id, value) => {
    const data = await contactsApi.favorite(id, value);
    const updated = mapApiContactToUi(data);
    setContacts((prev) => prev.map((c) => c.id === id ? updated : c));
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
    toggleFavorite
  };
}
export {
  useContacts
};
