import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './PublicLayout';
import Header from '../components/Header';
import { users } from '../../../backend/data/users';
import '../../styles/login.css';
import AppLayout from './AppLayout';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const user = users.find(
      (u) => u.kayttajatunnus === username && u.salasana === password
    );

    if (!user) {
      alert('Virheellinen tunnus tai salasana');
      return;
    }

    localStorage.setItem('user', JSON.stringify(user));

    if (user.rooli === 'esihenkilo') {
      navigate('/manager');
    } else {
      navigate('/home');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="absolute top-0 left-0 w-full">
          <Header />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="login-title">Kirjaudu sisään</h2>

          <input
            type="text"
            placeholder="Käyttäjätunnus"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="password"
            placeholder="Salasana"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />

          <button type="submit" className="login-button">
            Kirjaudu
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
