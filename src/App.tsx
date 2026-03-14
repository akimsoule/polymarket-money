import { useState } from "react";
import {
  ApiError,
  clearStoredToken,
  getScan,
  login,
  readStoredToken,
  runScan,
} from "./data/api";
import type { ScanApiResponse, ScannerConfig } from "./data/types";
import { ConfigPanel } from "./components/ConfigPanel";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { MetricsCards } from "./components/MetricsCards";
import { OpportunitiesTable } from "./components/OpportunitiesTable";

const DEFAULT_CONFIG: ScannerConfig = {
  minVolume: 5000,
  minLiquidity: 2000,
  minExpectedROI: 0.08,
  maxSpread: 0.15,
  arbMinSpread: 0.03,
  mispricingMin: 0.02,
  weatherMinPrice: 0.05,
  weatherMaxPrice: 0.15,
  weatherMinEdge: 0.2,
};

type Tab = "opportunities" | "diagnostics";

export default function App() {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [topN, setTopN] = useState(25);
  const [marketLimit, setMarketLimit] = useState(100);
  const [config, setConfig] = useState<ScannerConfig>(DEFAULT_CONFIG);
  const [data, setData] = useState<ScanApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("opportunities");

  const isAuthenticated = token !== null;

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setData(null);
    setError(null);
    setLoginError(null);
    setPassword("");
  }

  function updateConfig(key: keyof ScannerConfig, value: number) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleScan() {
    setLoading(true);
    setError(null);
    try {
      const result = await runScan({ topN, marketLimit, config });
      setData(result);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleLogout();
        setLoginError("Session expired. Please login again.");
        return;
      }
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadStoredScan() {
    setLoading(true);
    setError(null);
    try {
      const result = await getScan();
      setData(result);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        handleLogout();
        setLoginError("Session expired. Please login again.");
        return;
      }
      setError(e instanceof Error ? e.message : "Stored scan not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setLoginError(null);

    try {
      const newToken = await login(email, password);
      setToken(newToken);
      setPassword("");
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="card w-full max-w-md border border-base-300 bg-base-200 shadow-xl">
          <div className="card-body gap-5">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="Polymarket Scanner"
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-xl font-bold">Dashboard Login</h1>
                <p className="text-xs text-base-content/50">
                  JWT secured access
                </p>
              </div>
            </div>

            {loginError && (
              <div className="alert alert-error py-2 text-sm">{loginError}</div>
            )}

            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin();
              }}
            >
              <label className="flex w-full flex-col gap-1">
                <span className="text-xs text-base-content/70">Email</span>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="flex w-full flex-col gap-1">
                <span className="text-xs text-base-content/70">Password</span>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <button
                className="btn btn-primary mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Navbar */}
      <nav className="navbar bg-base-200 border-b border-base-300 px-4 gap-4 sticky top-0 z-10">
        <div className="flex-1 flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Polymarket Scanner"
            className="h-7 w-7"
          />
          <span className="text-lg font-bold">Scanner</span>
        </div>

        {data && (
          <div className="hidden sm:flex gap-2 items-center">
            <span className="badge badge-ghost badge-sm text-xs">
              {data.marketsCount} markets
            </span>
            <span
              className={`badge badge-sm text-xs ${
                data.totalOpportunities > 0 ? "badge-success" : "badge-ghost"
              }`}
            >
              {data.totalOpportunities} opp
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => void handleLoadStoredScan()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load stored"}
          </button>
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={() => void handleScan()}
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner loading-xs" />}
            {loading ? "Scanning..." : "Run scan"}
          </button>
        </div>
      </nav>

      {/* Config panel */}
      <details className="border-b border-base-300 bg-base-200/40">
        <summary className="px-4 py-2.5 text-xs text-base-content/40 cursor-pointer select-none hover:text-base-content/70 transition-colors list-none flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          Scan configuration
        </summary>
        <div className="px-4 pb-4 pt-2">
          <ConfigPanel
            topN={topN}
            marketLimit={marketLimit}
            config={config}
            onTopNChange={setTopN}
            onMarketLimitChange={setMarketLimit}
            onConfigChange={updateConfig}
          />
        </div>
      </details>

      {/* Error banner */}
      {error && (
        <div className="alert alert-error rounded-none py-2 px-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Main content */}
      {data ? (
        <div className="flex flex-col flex-1">
          <MetricsCards data={data} />

          <div className="flex-1 p-4 flex flex-col gap-4">
            <div className="flex border-b border-base-300">
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                  tab === "opportunities"
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/50 hover:text-base-content"
                }`}
                onClick={() => setTab("opportunities")}
              >
                Opportunities
                {data.opportunities.length > 0 && (
                  <span className="badge badge-primary badge-sm">
                    {data.opportunities.length}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === "diagnostics"
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/50 hover:text-base-content"
                }`}
                onClick={() => setTab("diagnostics")}
              >
                Diagnostics
              </button>
            </div>

            {tab === "opportunities" && (
              <div className="card bg-base-200 border border-base-300 overflow-hidden">
                <div className="card-body p-0">
                  <OpportunitiesTable opportunities={data.opportunities} />
                </div>
              </div>
            )}

            {tab === "diagnostics" && (
              <DiagnosticsPanel diagnostics={data.diagnostics} />
            )}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 text-center">
            <div className="text-6xl opacity-10 select-none">&#9670;</div>
            <div>
              <p className="text-xl font-semibold">Ready to scan</p>
              <p className="mt-1 text-sm text-base-content/50 max-w-xs">
                Configure thresholds above and press{" "}
                <strong className="text-base-content/70">Run scan</strong> to
                fetch live Polymarket data.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => void handleScan()}
            >
              Run first scan
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => void handleLoadStoredScan()}
            >
              Load stored scan
            </button>
          </div>
        )
      )}
    </div>
  );
}
