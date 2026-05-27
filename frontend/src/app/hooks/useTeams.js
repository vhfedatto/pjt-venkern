import { useState, useEffect, useCallback } from "react";
import { useProject } from "../context/ProjectContext";
import { teamsApi } from "../services/api";
import { mapApiTeamToUi } from "../services/mappers";
function useTeams() {
  const { currentProject } = useProject();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const data = await teamsApi.list({ project_id: currentProject.id });
      setTeams(data.map(mapApiTeamToUi));
    } catch (e) {
      setError(e?.message ?? "Erro ao carregar equipes");
    } finally {
      setLoading(false);
    }
  }, [currentProject]);
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  const createTeam = useCallback(async (form) => {
    const data = await teamsApi.create({ ...form, project_id: currentProject?.id });
    const team = mapApiTeamToUi(data);
    setTeams((prev) => [...prev, team]);
    return team;
  }, [currentProject]);
  const updateTeam = useCallback(async (id, form) => {
    const data = await teamsApi.update(id, form);
    const team = mapApiTeamToUi(data);
    setTeams((prev) => prev.map((t) => t.id === id ? team : t));
    return team;
  }, []);
  const deleteTeam = useCallback(async (id) => {
    await teamsApi.remove(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addMember = useCallback(async (teamId, payload) => {
    const data = await teamsApi.addMember(teamId, payload);
    const team = mapApiTeamToUi(data);
    setTeams((prev) => prev.map((t) => t.id === teamId ? team : t));
    return team;
  }, []);
  const removeMember = useCallback(async (teamId, contactId) => {
    const data = await teamsApi.removeMember(teamId, contactId);
    const team = mapApiTeamToUi(data);
    setTeams((prev) => prev.map((t) => t.id === teamId ? team : t));
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
    removeMember
  };
}
export {
  useTeams
};
