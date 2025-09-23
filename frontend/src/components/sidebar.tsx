import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const goToHome = () => {
    if (user.rooli === 'esihenkilo') {
      navigate('/manager');
    } else {
      navigate('/home');
    }
  };

  const goToCalendar = () => {
    navigate('/calendar');
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-purple-700 to-indigo-700 text-white p-6 shadow-lg fixed top-0 left-0 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-6">Poissaolosovellus</h2>

      <button onClick={goToHome} className="text-left px-4 py-2 rounded hover:bg-purple-600 transition-colors">
        Etusivulle
      </button>

      <button onClick={goToCalendar} className="text-left px-4 py-2 rounded hover:bg-purple-600 transition-colors">
        Kalenteriin
      </button>

      <div className="mt-auto">
        <button onClick={handleLogout} className="w-full text-left px-4 py-2 bg-gray-500 rounded hover:bg-gray-600 transition-colors">
          Kirjaudu ulos
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
