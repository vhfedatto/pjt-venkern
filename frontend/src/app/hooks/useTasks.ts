import { useState, useEffect, useCallback } from 'react';
import { tasksApi, contactsApi } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { mapApiTaskToUi, mapApiContactToUi, mapUiTaskToApi } from '../services/mappers';
import type { Contact, Task, TaskColumn } from '../types';

type KanbanBoard = Record<TaskColumn, Task[]>;

const TASK_COLUMNS: TaskColumn[] = ['todo', 'in_progress', 'review', 'done', 'late'];

const emptyBoard = (): KanbanBoard => ({
  todo: [],
  in_progress: [],
  review: [],
  done: [],
  late: [],
});

export function useTasks() {
  const { currentProject } = useProject();
  const [kanban, setKanban] = useState<KanbanBoard>(emptyBoard());
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!currentProject) {
      setKanban(emptyBoard());
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.kanban({ project_id: currentProject.id }) as Record<string, any[]>;
      const board = emptyBoard();
      for (const col of TASK_COLUMNS) {
        board[col] = (data[col] ?? []).map(mapApiTaskToUi);
      }
      setKanban(board);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const fetchContacts = useCallback(async () => {
    if (!currentProject) {
      setContacts([]);
      return;
    }
    try {
      const res = await contactsApi.list({ per_page: 100, project_id: currentProject.id });
      setContacts(res.data.map(mapApiContactToUi));
    } catch {
      // non-critical — assignee dropdown will be empty
    }
  }, [currentProject]);

  useEffect(() => {
    fetchTasks();
    fetchContacts();
  }, [fetchTasks, fetchContacts]);

  // Flat list derived from kanban board
  const tasks = TASK_COLUMNS.flatMap(col => kanban[col]);

  const createTask = useCallback(async (form: Omit<Task, 'id' | 'createdAt'>) => {
    const body = mapUiTaskToApi({ ...form, projectId: currentProject?.id });
    const data = await tasksApi.create(body);
    const task = mapApiTaskToUi(data);
    setKanban(prev => ({
      ...prev,
      [task.column]: [task, ...prev[task.column as TaskColumn]],
    }));
    return task;
  }, [currentProject]);

  const updateTask = useCallback(async (id: string, form: Partial<Task>) => {
    const body = mapUiTaskToApi({ ...form, projectId: currentProject?.id });
    const data = await tasksApi.update(id, body);
    const task = mapApiTaskToUi(data);
    setKanban(prev => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter(t => t.id !== id);
      }
      next[task.column as TaskColumn] = [task, ...next[task.column as TaskColumn]];
      return next;
    });
    return task;
  }, [currentProject]);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.remove(id);
    setKanban(prev => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter(t => t.id !== id);
      }
      return next;
    });
  }, []);

  const moveTask = useCallback(async (id: string, column: TaskColumn) => {
    // Optimistic update
    setKanban(prev => {
      const next = { ...prev };
      let movedTask: Task | undefined;
      for (const col of TASK_COLUMNS) {
        const idx = prev[col].findIndex(t => t.id === id);
        if (idx !== -1) {
          movedTask = { ...prev[col][idx], column };
          next[col] = prev[col].filter(t => t.id !== id);
        }
      }
      if (movedTask) next[column] = [movedTask, ...next[column]];
      return next;
    });
    try {
      await tasksApi.moveStatus(id, column);
    } catch (e) {
      // Rollback on failure
      fetchTasks();
      throw e;
    }
  }, [fetchTasks]);

  const acceptTask = useCallback(async (id: string) => {
    const data = await tasksApi.accept(id);
    const task = mapApiTaskToUi(data);
    setKanban(prev => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter(t => t.id !== id);
      }
      next[task.column] = [task, ...next[task.column]];
      return next;
    });
    return task;
  }, []);

  const completeTask = useCallback(async (id: string, formData: FormData) => {
    const data = await tasksApi.complete(id, formData);
    const task = mapApiTaskToUi(data);
    setKanban(prev => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter(t => t.id !== id);
      }
      next[task.column] = [task, ...next[task.column]];
      return next;
    });
    return task;
  }, []);

  return {
    kanban,
    tasks,
    contacts,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    acceptTask,
    completeTask,
  };
}
