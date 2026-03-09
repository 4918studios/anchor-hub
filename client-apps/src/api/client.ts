/**
 * API client for user-admin — calls anchor-log API with Clerk session tokens.
 *
 * Uses Clerk's `useAuth().getToken()` to obtain JWTs. The user-admin app is
 * a first-party Clerk application, so it uses session tokens (not OAuth PKCE).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071';

export interface InstalledApp {
  clientId: string;
  installedAt: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  type: string;
}

export interface InstallManifest {
  name: string;
  description: string;
  permissions: string[];
  restrictions: string[];
  icon: string | null;
  type: string;
  status: string;
}

export class AdminApiClient {
  constructor(private getToken: () => Promise<string | null>) {}

  private async fetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    return res;
  }

  /** GET /api/clients/{clientId}/install-manifest */
  async getInstallManifest(clientId: string): Promise<InstallManifest> {
    const res = await this.fetch(`/api/clients/${clientId}/install-manifest`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to fetch manifest (${res.status})`);
    }
    return res.json();
  }

  /** POST /api/users/me/installed-apps */
  async installApp(clientId: string): Promise<{ clientId: string; installedAt: string }> {
    const res = await this.fetch('/api/users/me/installed-apps', {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Install failed (${res.status})`);
    }
    return res.json();
  }

  /** GET /api/users/me/installed-apps */
  async getInstalledApps(): Promise<{ installedApps: InstalledApp[] }> {
    const res = await this.fetch('/api/users/me/installed-apps');
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to list apps (${res.status})`);
    }
    return res.json();
  }

  /** DELETE /api/users/me/installed-apps/{clientId} */
  async uninstallApp(clientId: string): Promise<void> {
    const res = await this.fetch(`/api/users/me/installed-apps/${clientId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Uninstall failed (${res.status})`);
    }
  }
}
