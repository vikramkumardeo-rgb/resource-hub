import {useEffect, useState} from 'react';
import {getMe, getResources, hasToken, logout} from './api';
import AuthForm from './AuthForm';
import ResourceList from './ResourceList';
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(hasToken());
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loggedIn) return;

    async function loadData() {
      try {
        const [me, list] = await Promise.all([getMe(), getResources()]);
        setUser(me);
        setResources(list);
        setError("");
      } catch (err) {
        if (err.status === 401) {
          logout();
          setLoggedIn(false);
        } else {
          setError(err.message);
        }       
      }
    }

    loadData();
  }, [loggedIn]);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
    setResources([]);
  }

  return (
    <div className="app">
      <header>
        <h1>Resource Hub</h1>
        {loggedIn && (
          <div className="user">
            {user && <span>Hi, {user.username}</span>}
            <button onClick={handleLogout}>Log out</button>
          </div>
        )}
      </header>

      {loggedIn ? (
        <>
          {error && <p className="error">{error}</p>}

          <ResourceList resources={resources} />
          </>
      ) : (
         <AuthForm onLoggedIn={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;