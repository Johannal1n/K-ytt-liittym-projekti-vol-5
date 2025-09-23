import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import AbsenceForm from './components/AbsenceForm';
import ManagerView from './components/ManagerView';
import TeamCalendar from './components/TeamCalendar';
import EmployeeHome from './components/EmployeeHome';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  { 
    path: '/login', 
    element: <Login /> 
  },
  {
    path: '/form',
    element: <AbsenceForm />
  },
  {
    path: '/manager',
    element: <ManagerView />
  },
  {
    path: '/home',
    element: <EmployeeHome />
  },
  {
    path: '/calendar',
    element: <TeamCalendar />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
