import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}
