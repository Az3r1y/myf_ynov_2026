import { FormEvent, useState } from "react";

type HttpMethod = "GET" | "POST";

function App() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:5173");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("secret123");
  const [token, setToken] = useState("");
  const [activeAuthView, setActiveAuthView] = useState<"signup" | "login">(
    "signup",
  );
  const [toastMessage, setToastMessage] = useState("");
  const [searchWord, setSearchWord] = useState("Paris");
  const [addressName, setAddressName] = useState("Maison");
  const [description, setDescription] = useState("Chez moi");
  const [radius, setRadius] = useState(10);
  const [lat, setLat] = useState(48.8566);
  const [lng, setLng] = useState(2.3522);
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>("");

  async function callApi(
    method: HttpMethod,
    path: string,
    body?: Record<string, unknown>,
    withAuth = false,
  ) {
    setLoading(true);
    setLastRequest(`${method} ${path}`);
    setStatusCode(null);
    setResponseBody("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (withAuth && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      setStatusCode(response.status);
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        setResponseBody(JSON.stringify(json, null, 2));
        return json as Record<string, unknown>;
      } catch {
        setResponseBody(text || "(empty response)");
        return null;
      }
    } catch (error) {
      setStatusCode(null);
      setResponseBody(
        error instanceof Error ? error.message : "Unknown network error",
      );
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const json = await callApi("POST", "/api/users", { email, password });
    if (json && json.item) {
      setToastMessage("Signup successful");
      setActiveAuthView("login");
    } else {
      setToastMessage("Signup failed");
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToastMessage("");
    const json = await callApi("POST", "/api/users/tokens", { email, password });
    const nextToken = json && typeof json.token === "string" ? json.token : "";
    if (nextToken) {
      setToken(nextToken);
      setToastMessage("Login successful");
    }
  }

  async function getMe() {
    await callApi("GET", "/api/users/me", undefined, true);
  }

  async function createAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await callApi(
      "POST",
      "/api/addresses",
      {
        searchWord,
        name: addressName,
        description,
      },
      true,
    );
  }

  async function listAddresses() {
    await callApi("GET", "/api/addresses", undefined, true);
  }

  async function searchInRadius(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await callApi(
      "POST",
      "/api/addresses/searches",
      {
        radius,
        from: { lat, lng },
      },
      true,
    );
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>My Favorite Addresses API Tester</h1>
        <p>Front React pour tester rapidement toutes les routes de l&apos;API.</p>
      </header>

      <section className="panel">
        <h2>Configuration</h2>
        <div className="grid">
          <label>
            Base URL
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="http://localhost:5173"
            />
          </label>
          <label>
            Token JWT
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Bearer token"
            />
          </label>
        </div>
        <small>
          En mode dev, laisse `http://localhost:5173` (proxy Vite vers l&apos;API).
        </small>
      </section>

      <section className="panel">
        <h2>Users</h2>
        <div className="inline-form">
          <button
            data-testid="signup-button"
            type="button"
            onClick={() => setActiveAuthView("signup")}
          >
            Signup
          </button>
          <button
            data-testid="switch-login-button"
            type="button"
            onClick={() => setActiveAuthView("login")}
          >
            Login
          </button>
        </div>

        {activeAuthView === "signup" ? (
          <form className="inline-form" onSubmit={createUser}>
            <input
              data-testid="signup-email-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email"
              type="email"
              required
            />
            <input
              data-testid="signup-password-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              type="password"
              required
            />
            <button data-testid="signup-submit-button" type="submit" disabled={loading}>
              Submit Signup
            </button>
          </form>
        ) : (
          <form className="inline-form" onSubmit={login}>
            <input
              data-testid="login-email-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email"
              type="email"
              required
            />
            <input
              data-testid="login-password-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              type="password"
              required
            />
            <button data-testid="login-submit-button" type="submit" disabled={loading}>
              Login
            </button>
          </form>
        )}

        {toastMessage ? (
          <p data-testid="auth-toast" role="status">
            {toastMessage}
          </p>
        ) : null}

        <button type="button" onClick={getMe} disabled={loading || !token}>
          GET /api/users/me
        </button>
      </section>

      {token ? (
        <section className="panel" data-testid="dashboard">
          <h2>Dashboard</h2>
          <p>Connected user token is ready.</p>
        </section>
      ) : null}

      <section className="panel">
        <h2>Addresses</h2>
        <form className="inline-form" onSubmit={createAddress}>
          <input
            value={searchWord}
            onChange={(event) => setSearchWord(event.target.value)}
            placeholder="searchWord"
            required
          />
          <input
            value={addressName}
            onChange={(event) => setAddressName(event.target.value)}
            placeholder="name"
            required
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="description"
          />
          <button type="submit" disabled={loading || !token}>
            Create Address
          </button>
        </form>

        <button type="button" onClick={listAddresses} disabled={loading || !token}>
          GET /api/addresses
        </button>

        <form className="inline-form" onSubmit={searchInRadius}>
          <input
            type="number"
            value={radius}
            min={0}
            step={1}
            onChange={(event) => setRadius(Number(event.target.value))}
            placeholder="radius"
            required
          />
          <input
            type="number"
            value={lat}
            step="any"
            onChange={(event) => setLat(Number(event.target.value))}
            placeholder="lat"
            required
          />
          <input
            type="number"
            value={lng}
            step="any"
            onChange={(event) => setLng(Number(event.target.value))}
            placeholder="lng"
            required
          />
          <button type="submit" disabled={loading || !token}>
            Search Radius
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Résultat</h2>
        <p className="meta">
          Dernière requête: <code>{lastRequest || "-"}</code> | status:{" "}
          <code>{statusCode ?? "-"}</code>
        </p>
        <pre className="response">{responseBody || "Aucune requête exécutée."}</pre>
      </section>
    </main>
  );
}

export default App;
