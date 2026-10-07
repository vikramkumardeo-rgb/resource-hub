import { useState } from "react";
import { login, register } from "./api";

function AuthForm({ onLoggedIn }) {
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (mode === "register") {
                await register(username, email, password);
            } 
            await login(username, password);
            onLoggedIn();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }   
    }

    const isRegister = mode === "register";

    return (
      <form className="card auth" onSubmit={handleSubmit}>
        <h2>{isRegister ? "Create account" : "Log in"}</h2>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        {isRegister && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        )}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isRegister ? 8 : undefined}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Log in"}
        </button>
        
        <p className="switch">
          {isRegister ? "Already have an account?" : "New here?"}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError("");
            }}
          >
            {isRegister ? "Log in" : "Create account"}
          </button>
        </p>
      </form>
    );
}

export default AuthForm;