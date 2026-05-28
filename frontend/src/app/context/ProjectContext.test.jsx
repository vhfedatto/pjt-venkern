import { render, screen } from '@testing-library/react';
import { ProjectProvider, useProject } from './ProjectContext';
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    isLoading: false,
    projects: [{
      id: 1,
      name: 'Projeto A',
      slug: 'a',
      owner_id: 1,
      status: 'ACTIVE',
      role: 'ADMIN'
    }, {
      id: 2,
      name: 'Projeto B',
      slug: 'b',
      owner_id: 1,
      status: 'ACTIVE',
      role: 'PROFESSIONAL'
    }]
  })
}));
function Consumer() {
  const {
    currentProject
  } = useProject();
  return <div>{currentProject?.name ?? 'sem projeto'}</div>;
}
describe('ProjectContext', () => {
  it('restores the selected project from localStorage', () => {
    localStorage.setItem('venkern_project_id', '2');
    render(<ProjectProvider>
        <Consumer />
      </ProjectProvider>);
    expect(screen.getByText('Projeto B')).toBeInTheDocument();
  });
});