import { useState, useEffect, useCallback } from "react";
import { tasksApi, contactsApi } from "../services/api";
import { useProject } from "../context/ProjectContext";
import { mapApiTaskToUi, mapApiContactToUi, mapUiTaskToApi } from "../services/mappers";
const TASK_COLUMNS = ["todo", "in_progress", "review", "done", "late"];
const emptyBoard = () => ({
  todo: [],
  in_progress: [],
  review: [],
  done: [],
  late: []
});
function useTasks() {
  const { currentProject } = useProject();
  const [kanban, setKanban] = useState(emptyBoard());
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const data = await tasksApi.kanban({ project_id: currentProject.id });
      const board = emptyBoard();
      for (const col of TASK_COLUMNS) {
        board[col] = (data[col] ?? []).map(mapApiTaskToUi);
      }
      setKanban(board);
    } catch (e) {
      setError(e?.message ?? "Erro ao carregar tarefas");
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
    }
  }, [currentProject]);
  useEffect(() => {
    fetchTasks();
    fetchContacts();
  }, [fetchTasks, fetchContacts]);
  const tasks = TASK_COLUMNS.flatMap((col) => kanban[col]);
  const createTask = useCallback(async (form) => {
    const body = mapUiTaskToApi({ ...form, projectId: currentProject?.id });
    const data = await tasksApi.create(body);
    const task = mapApiTaskToUi(data);
    setKanban((prev) => ({
      ...prev,
      [task.column]: [task, ...prev[task.column]]
    }));
    return task;
  }, [currentProject]);
  const updateTask = useCallback(async (id, form) => {
    const body = mapUiTaskToApi({ ...form, projectId: currentProject?.id });
    const data = await tasksApi.update(id, body);
    const task = mapApiTaskToUi(data);
    setKanban((prev) => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter((t) => t.id !== id);
      }
      next[task.column] = [task, ...next[task.column]];
      return next;
    });
    return task;
  }, [currentProject]);
  const deleteTask = useCallback(async (id) => {
    await tasksApi.remove(id);
    setKanban((prev) => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter((t) => t.id !== id);
      }
      return next;
    });
  }, []);
  const moveTask = useCallback(async (id, column) => {
    setKanban((prev) => {
      const next = { ...prev };
      let movedTask;
      for (const col of TASK_COLUMNS) {
        const idx = prev[col].findIndex((t) => t.id === id);
        if (idx !== -1) {
          movedTask = { ...prev[col][idx], column };
          next[col] = prev[col].filter((t) => t.id !== id);
        }
      }
      if (movedTask) next[column] = [movedTask, ...next[column]];
      return next;
    });
    try {
      await tasksApi.moveStatus(id, column);
    } catch (e) {
      fetchTasks();
      throw e;
    }
  }, [fetchTasks]);
  const acceptTask = useCallback(async (id) => {
    const data = await tasksApi.accept(id);
    const task = mapApiTaskToUi(data);
    setKanban((prev) => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter((t) => t.id !== id);
      }
      next[task.column] = [task, ...next[task.column]];
      return next;
    });
    return task;
  }, []);
  const completeTask = useCallback(async (id, formData) => {
    const data = await tasksApi.complete(id, formData);
    const task = mapApiTaskToUi(data);
    setKanban((prev) => {
      const next = { ...prev };
      for (const col of TASK_COLUMNS) {
        next[col] = prev[col].filter((t) => t.id !== id);
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
    completeTask
  };
}
export {
  useTasks
};
