import { useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../services/api';

export interface ReportsSummary {
  totalContacts: number;
  totalTeams: number;
  totalTasks: number;
  totalEvents: number;
  totalGroups: number;
  totalMessages: number;
  totalModerationAlerts: number;
}

export interface TasksReport {
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byAssignee: { name: string; count: number }[];
  overdue: number;
  completed: number;
}

export interface ContactsReport {
  byTeam: { team: string; color: string; count: number }[];
  favorites: number;
  byOrigin: { origin: string; count: number }[];
  byMonth: { month: string; count: number }[];
  withoutTeam: number;
}

export interface ActivityPoint {
  month: string;
  contactsCreated: number;
  tasksCreated: number;
  tasksCompleted: number;
  eventsSent: number;
  messagesSent: number;
}

interface ReportsState {
  summary: ReportsSummary | null;
  tasks: TasksReport | null;
  contacts: ContactsReport | null;
  activity: ActivityPoint[];
  loading: boolean;
  error: string | null;
}

export function useReports(projectId: number | null | undefined) {
  const [state, setState] = useState<ReportsState>({
    summary: null,
    tasks: null,
    contacts: null,
    activity: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!projectId) {
      setState(s => ({ ...s, loading: false, error: null }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [summary, tasks, contacts, activity] = await Promise.all([
        reportsApi.summary(projectId),
        reportsApi.tasks(projectId),
        reportsApi.contacts(projectId),
        reportsApi.activity(projectId),
      ]);
      setState({ summary, tasks, contacts, activity: activity ?? [], loading: false, error: null });
    } catch (e: any) {
      setState(s => ({
        ...s,
        loading: false,
        error: e?.message ?? 'Erro ao carregar relatórios',
      }));
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
}
