import { useEffect, useState } from "react";
import {
  deleteResource,
  getMe,
  getResources,
  getTags,
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
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loggedIn) return;
    Promise.all([getMe(), getTags(), getResources(selectedTag)])
      .then(([me, tagList, list]) => {
        setUser(me);
        setTags(tagList);
        setResources(list);
        setError("");
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
  }, [loggedIn, selectedTag, reload]);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
    setResources([]);
    setTags([]);
    setSelectedTag("");
  }

  function handleCreated() {
    setSelectedTag("");
    setReload((n) => n + 1);
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

          <div className="filter">
            <label>
              Filter by tag
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ResourceList resources={resources} onDelete={handleDelete} />
        </>
      ) : (
        <AuthForm onLoggedIn={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;