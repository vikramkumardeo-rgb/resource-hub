const API_URL = "http://127.0.0.1:8000";

async function request(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_URL}${path}`, { ...options, headers })
    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        let message = "Something went wrong";
        if (typeof data?.detail === "string") message = data.detail;
        else if (Array.isArray(data?.detail)) message = data.detail.map((d) => d.msg).join(", ");
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }
    return data;
}

export function hasToken() {
    return Boolean(localStorage.getItem("token"));
}

export function logout() {
    localStorage.removeItem("token");
}

export function register(username, email, password) {
    return request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });
}

export async function login(username, password) {
    const body = new URLSearchParams({username, password});
    const data = await request("/auth/login", {method: "POST", body});
    localStorage.setItem("token", data.access_token);
    return data;
}

export function getMe() {
    return request("/auth/me");
}   

export function getResources(tag) {
    const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
    return request(`/resources${query}`);
}   

export function getTags() {
    return request("/tags");
}

export function createResource(resource) {
    return request("/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
    });
}

export function deleteResource(id) {
    return request(`/resources/${id}`, { method: "DELETE" });
}