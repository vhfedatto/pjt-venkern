import { render, screen, waitFor } from '@testing-library/react';
import Kanban from './Kanban';

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    currentUser: { id: '1', contactId: '101', name: 'Admin', email: 'admin@test.com', role: 'admin', teamId: '1', position: '', status: 'online' },
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'admin@test.com' },
  }),
}));

vi.mock('../context/ProjectContext', () => ({
  useProject: () => ({
    currentProject: { id: 55, name: 'Projeto' },
  }),
}));

vi.mock('../hooks/useTasks', () => ({
  useTasks: () => ({
    kanban: {
      todo: [{ id: '1', title: 'Task Persistida', description: 'Desc', column: 'todo', teamId: '1', assigneeId: '101', assigneeName: 'Admin', priority: 'high', dueDate: '2099-01-01', createdAt: '2026-05-26', tags: [] }],
      in_progress: [],
      review: [],
      done: [],
      late: [],
    },
    contacts: [{ id: '101', name: 'Admin', email: 'admin@test.com' }],
    loading: false,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    acceptTask: vi.fn(),
    completeTask: vi.fn(),
  }),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api');
  return {
    ...actual,
    teamsApi: {
      list: vi.fn().mockResolvedValue([{ id: 1, name: 'Comercial', color: '#6366f1' }]),
    },
  };
});

describe('Kanban page', () => {
  it('renders persisted tasks and general board totals', async () => {
    render(<Kanban />);

    expect(screen.getByText('Task Persistida')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('1 tarefa')).toBeInTheDocument());
    expect(screen.getByText('Kanban Geral')).toBeInTheDocument();
  });
});

