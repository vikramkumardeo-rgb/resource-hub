import { useEffect, useState } from "react";
import {
  deleteResource,
  getMe,
  getResources,
  hasToken,
  logout,
} from "./api";
import AuthForm from "./AuthForm";
import ResourceForm from "./ResourceForm";
import ResourceList from "./ResourceList";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(hasToken());
  const [user, setUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loggedIn) return;
    Promise.all([getMe(), getResources()])
      .then(([me, list]) => {
        setUser(me);
        setResources(list);
      })
      .catch((err) => {
        const msg = err.message.toLowerCase();
        if (msg.includes("token") || msg.includes("not authenticated")) {
          logout();
          setLoggedIn(false);
          return;
        }
        setError(err.message);
      });
  }, [loggedIn]);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
    setResources([]);
  }

  function handleCreated(resource) {
    setResources((prev) => [resource, ...prev]);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <h1>Resource Hub</h1>

      {loggedIn ? (
        <>
          <div className="user">
            <span>Hi, {user ? user.username : "..."}</span>
            <button onClick={handleLogout}>Log out</button>
          </div>

          {error && <p className="error">{error}</p>}

          <ResourceForm onCreated={handleCreated} />

          <ResourceList resources={resources} onDelete={handleDelete} />
        </>
      ) : (
        <AuthForm onLoggedIn={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;