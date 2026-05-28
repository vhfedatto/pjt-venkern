import { useState, useEffect, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { eventsApi, teamsApi } from '../services/api';
import { mapApiEventToUi, mapUiEventToApi, mapApiTeamToUi } from '../services/mappers';
export function useEvents() {
  const {
    currentProject
  } = useProject();
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchData = useCallback(async () => {
    if (!currentProject) {
      setEvents([]);
      setTeams([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const [eventsRes, teamsRes] = await Promise.all([eventsApi.list({
        project_id: currentProject.id
      }), teamsApi.list({
        project_id: currentProject.id
      })]);
      const eventsData = eventsRes.data ?? (Array.isArray(eventsRes) ? eventsRes : []);
      const teamsData = Array.isArray(teamsRes) ? teamsRes : [];
      setEvents(eventsData.map(mapApiEventToUi));
      setTeams(teamsData.map(mapApiTeamToUi));
      setError(null);
    } catch (e) {
      setError(e?.message ?? 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const createEvent = async form => {
    const res = await eventsApi.create(mapUiEventToApi({
      ...form,
      projectId: currentProject?.id
    }));
    const event = mapApiEventToUi(res);
    setEvents(p => [event, ...p]);
    return event;
  };
  const updateEvent = async (id, form) => {
    const res = await eventsApi.update(id, mapUiEventToApi({
      ...form,
      projectId: currentProject?.id
    }));
    const event = mapApiEventToUi(res);
    setEvents(p => p.map(e => e.id === id ? event : e));
    return event;
  };
  const deleteEvent = async id => {
    await eventsApi.remove(id);
    setEvents(p => p.filter(e => e.id !== id));
  };
  const sendEvent = async id => {
    const res = await eventsApi.send(id);
    const event = mapApiEventToUi(res);
    setEvents(p => p.map(e => e.id === id ? event : e));
    return event;
  };
  return {
    events,
    teams,
    loading,
    error,
    refetch: fetchData,
    createEvent,
    updateEvent,
    deleteEvent,
    sendEvent
  };
}