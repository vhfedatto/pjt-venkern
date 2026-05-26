import { useState, useEffect, useCallback } from 'react';

import { useProject } from '../context/ProjectContext';
import { teamsApi } from '../services/api';
import { mapApiTeamToUi } from '../services/mappers';
import type { Team } from '../types';

export function useTeams() {
  const { currentProject } = useProject();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!currentProject) {
      setTeams([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await teamsApi.list({ project_id: currentProject.id }) as any[];
      setTeams(data.map(mapApiTeamToUi));
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const createTeam = useCallback(async (form: { name: string; description?: string; color?: string }) => {
    const data = await teamsApi.create({ ...form, project_id: currentProject?.id }) as any;
    const team = mapApiTeamToUi(data);
    setTeams(prev => [...prev, team]);
    return team;
  }, [currentProject]);

  const updateTeam = useCallback(async (id: string, form: { name?: string; description?: string; color?: string }) => {
    const data = await teamsApi.update(id, form) as any;
    const team = mapApiTeamToUi(data);
    setTeams(prev => prev.map(t => t.id === id ? team : t));
    return team;
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    await teamsApi.remove(id);
    setTeams(prev => prev.filter(t => t.id !== id));
  }, []);

  const addMember = useCallback(async (teamId: string, payload: { user_id?: number; contact_id?: number }) => {
    const data = await teamsApi.addMember(teamId, payload) as any;
    const team = mapApiTeamToUi(data);
    setTeams(prev => prev.map(t => t.id === teamId ? team : t));
    return team;
  }, []);

  const removeMember = useCallback(async (teamId: string, contactId: string) => {
    const data = await teamsApi.removeMember(teamId, contactId) as any;
    const team = mapApiTeamToUi(data);
    setTeams(prev => prev.map(t => t.id === teamId ? team : t));
    return team;
  }, []);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
  };
}
