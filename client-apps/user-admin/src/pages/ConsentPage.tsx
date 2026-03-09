/**
 * Consent Page — /consent?client_id=X&return_url=Y
 *
 * Hosted on the platform's own domain, this page shows the permissions
 * requested by a third-party app and lets the user accept or decline.
 *
 * Flow:
 *   1. Third-party app gets 403 app_not_installed with consent_url
 *   2. App redirects browser here
 *   3. User reviews permissions → Allow / Decline
 *   4. Allow → POST install → redirect back to return_url
 *   5. Decline → show message (optionally revoke OAuth consent)
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AdminApiClient, type InstallManifest } from '../api/client';

type ConsentState =
  | { phase: 'loading' }
  | { phase: 'consent'; manifest: InstallManifest }
  | { phase: 'already-installed'; returnUrl: string | null }
  | { phase: 'installing' }
  | { phase: 'declined' }
  | { phase: 'error'; message: string };

export function ConsentPage() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client_id');
  const returnUrl = searchParams.get('return_url');
  const { getToken } = useAuth();
  const [state, setState] = useState<ConsentState>({ phase: 'loading' });

  useEffect(() => {
    if (!clientId) {
      setState({ phase: 'error', message: 'Missing client_id parameter' });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const api = new AdminApiClient(() => getToken({ template: 'anchor-log' }));

        // Check if already installed
        const { installedApps } = await api.getInstalledApps();
        const alreadyInstalled = installedApps.some((a) => a.clientId === clientId);

        if (cancelled) return;

        if (alreadyInstalled) {
          setState({ phase: 'already-installed', returnUrl });
          return;
        }

        // Fetch manifest
        const manifest = await api.getInstallManifest(clientId!);
        if (cancelled) return;
        setState({ phase: 'consent', manifest });
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load consent info';
          setState({ phase: 'error', message });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [clientId, getToken, returnUrl]);

  const handleAllow = async () => {
    if (!clientId) return;
    setState({ phase: 'installing' });

    try {
      const api = new AdminApiClient(() => getToken({ template: 'anchor-log' }));
      await api.installApp(clientId);

      // Redirect back to the third-party app
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        // No return URL — show success and link to dashboard
        window.location.href = '/';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Install failed';
      setState({ phase: 'error', message });
    }
  };

  const handleDecline = () => {
    setState({ phase: 'declined' });
    // Future: optionally call Clerk API to revoke OAuth consent for this app
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  if (state.phase === 'loading') {
    return (
      <Card>
        <p style={{ color: '#8b949e' }}>Loading…</p>
      </Card>
    );
  }

  if (state.phase === 'error') {
    return (
      <Card>
        <h2 style={headingStyle}>Something went wrong</h2>
        <p style={{ color: '#f85149', margin: '0.5rem 0' }}>⚠ {state.message}</p>
        <button onClick={() => window.location.reload()} style={secondaryBtnStyle}>
          Retry
        </button>
      </Card>
    );
  }

  if (state.phase === 'already-installed') {
    // Auto-redirect if we have a return URL
    if (state.returnUrl) {
      window.location.href = state.returnUrl;
      return (
        <Card>
          <p style={{ color: '#8b949e' }}>App already installed. Redirecting…</p>
        </Card>
      );
    }
    return (
      <Card>
        <h2 style={headingStyle}>Already Installed</h2>
        <p style={{ color: '#8b949e', margin: '0.5rem 0' }}>
          This app is already installed. You can manage it from your{' '}
          <a href="/">dashboard</a>.
        </p>
      </Card>
    );
  }

  if (state.phase === 'installing') {
    return (
      <Card>
        <p style={{ color: '#8b949e' }}>Installing…</p>
      </Card>
    );
  }

  if (state.phase === 'declined') {
    return (
      <Card>
        <h2 style={headingStyle}>Access Declined</h2>
        <p style={{ color: '#8b949e', margin: '0.5rem 0 1rem' }}>
          You did not grant this app access to your data.
        </p>
        {returnUrl && (
          <a href={returnUrl} style={secondaryBtnStyle}>
            Return to app
          </a>
        )}
      </Card>
    );
  }

  // phase === 'consent'
  const { manifest } = state;

  return (
    <Card>
      {manifest.icon && (
        <img
          src={manifest.icon}
          alt={manifest.name}
          style={{ width: 56, height: 56, borderRadius: 12, marginBottom: '0.75rem' }}
        />
      )}

      <h2 style={headingStyle}>{manifest.name}</h2>
      <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '0.25rem 0 1rem' }}>
        {manifest.description}
      </p>

      <p style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: '1rem' }}>
        <strong>{manifest.name}</strong> is requesting access to your Anchor Log data:
      </p>

      {manifest.permissions.length > 0 && (
        <div style={{ textAlign: 'left', width: '100%', marginBottom: '0.75rem' }}>
          <p style={sectionLabel}>This app will be able to:</p>
          <ul style={listStyle}>
            {manifest.permissions.map((p, i) => (
              <li key={i} style={listItem}>✓ {p}</li>
            ))}
          </ul>
        </div>
      )}

      {manifest.restrictions.length > 0 && (
        <div style={{ textAlign: 'left', width: '100%', marginBottom: '0.75rem' }}>
          <p style={sectionLabel}>This app will <strong>not</strong> be able to:</p>
          <ul style={listStyle}>
            {manifest.restrictions.map((r, i) => (
              <li key={i} style={{ ...listItem, color: '#656d76' }}>✗ {r}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button onClick={handleAllow} style={primaryBtnStyle}>
          Allow &amp; Continue
        </button>
        <button onClick={handleDecline} style={secondaryBtnStyle}>
          Decline
        </button>
      </div>

      <p style={{ fontSize: '0.7rem', color: '#484f58', marginTop: '1rem' }}>
        Client ID: {clientId}
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Shared UI helpers
// ---------------------------------------------------------------------------

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: 440,
      margin: '3rem auto',
      padding: '2rem',
      background: '#161b22',
      borderRadius: 12,
      border: '1px solid #30363d',
    }}>
      {children}
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#e6edf3',
  margin: 0,
};

const sectionLabel: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#8b949e',
  marginBottom: '0.25rem',
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const listItem: React.CSSProperties = {
  fontSize: '0.85rem',
  padding: '0.2rem 0',
  color: '#e6edf3',
};

const primaryBtnStyle: React.CSSProperties = {
  background: '#238636',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0.6rem 1.5rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#8b949e',
  border: '1px solid #30363d',
  borderRadius: 6,
  padding: '0.6rem 1.5rem',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
};
