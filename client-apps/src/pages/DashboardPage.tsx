/**
 * Dashboard Page — /
 *
 * Shows installed third-party apps with uninstall buttons.
 * Future: also show Clerk account settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { AdminApiClient, type InstalledApp } from '../api/client';

type DashState =
  | { phase: 'loading' }
  | { phase: 'loaded'; apps: InstalledApp[] }
  | { phase: 'error'; message: string };

export function DashboardPage() {
  const { getToken } = useAuth();
  const [state, setState] = useState<DashState>({ phase: 'loading' });
  const [uninstalling, setUninstalling] = useState<string | null>(null);

  const loadApps = useCallback(async () => {
    try {
      setState({ phase: 'loading' });
      const api = new AdminApiClient(() => getToken({ template: 'anchor-log' }));
      const { installedApps } = await api.getInstalledApps();
      setState({ phase: 'loaded', apps: installedApps });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load apps';
      setState({ phase: 'error', message });
    }
  }, [getToken]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleUninstall = async (clientId: string) => {
    if (!confirm('Uninstall this app? It will lose access to your data.')) return;

    setUninstalling(clientId);
    try {
      const api = new AdminApiClient(() => getToken({ template: 'anchor-log' }));
      await api.uninstallApp(clientId);
      await loadApps();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Uninstall failed';
      alert(message);
    } finally {
      setUninstalling(null);
    }
  };

  if (state.phase === 'loading') {
    return <p style={{ color: '#8b949e' }}>Loading installed apps…</p>;
  }

  if (state.phase === 'error') {
    return (
      <div>
        <p style={{ color: '#f85149' }}>⚠ {state.message}</p>
        <button onClick={loadApps} style={retryBtnStyle}>
          Retry
        </button>
      </div>
    );
  }

  const { apps } = state;

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
        Installed Apps
      </h2>

      {apps.length === 0 ? (
        <p style={{ color: '#8b949e' }}>No apps installed yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {apps.map((app) => (
            <li key={app.clientId} style={appCardStyle}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {app.iconUrl && (
                    <img
                      src={app.iconUrl}
                      alt=""
                      style={{ width: 28, height: 28, borderRadius: 6 }}
                    />
                  )}
                  <strong style={{ fontSize: '0.95rem' }}>{app.name}</strong>
                  <span style={typeBadgeStyle}>{app.type}</span>
                </div>
                <p style={{ color: '#8b949e', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                  {app.description}
                </p>
                <p style={{ color: '#484f58', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  Installed {new Date(app.installedAt).toLocaleDateString()}
                  {' · '}
                  {app.clientId}
                </p>
              </div>
              <button
                onClick={() => handleUninstall(app.clientId)}
                disabled={uninstalling === app.clientId}
                style={uninstallBtnStyle}
              >
                {uninstalling === app.clientId ? 'Removing…' : 'Uninstall'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles
// ---------------------------------------------------------------------------

const appCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.75rem 1rem',
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: 8,
  marginBottom: '0.5rem',
};

const typeBadgeStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  padding: '0.1rem 0.4rem',
  borderRadius: 4,
  background: '#30363d',
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const uninstallBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#f85149',
  border: '1px solid #f8514933',
  borderRadius: 6,
  padding: '0.35rem 0.75rem',
  fontSize: '0.8rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const retryBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#8b949e',
  border: '1px solid #30363d',
  borderRadius: 6,
  padding: '0.4rem 1rem',
  fontSize: '0.85rem',
  cursor: 'pointer',
  marginTop: '0.5rem',
};
