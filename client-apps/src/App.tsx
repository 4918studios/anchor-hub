import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';
import { Routes, Route, Link } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ConsentPage } from './pages/ConsentPage';

export default function App() {
  return (
    <>
      <SignedOut>
        <div style={splashStyle}>
          <h1>Anchor Log</h1>
          <p style={{ color: '#8b949e', marginBottom: '1.5rem' }}>
            Sign in to manage your apps and account
          </p>
          <SignInButton mode="modal">
            <button style={primaryBtnStyle}>Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div style={shellStyle}>
          <header style={headerStyle}>
            <Link to="/" style={{ color: '#e6edf3', textDecoration: 'none' }}>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Anchor Log</h1>
            </Link>
            <UserButton />
          </header>

          <main style={mainStyle}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/consent" element={<ConsentPage />} />
            </Routes>
          </main>
        </div>
      </SignedIn>
    </>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (scaffold — replace with proper CSS/Tailwind later)
// ---------------------------------------------------------------------------

const splashStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  textAlign: 'center',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '0 1rem',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem 0',
  borderBottom: '1px solid #30363d',
  marginBottom: '1.5rem',
};

const mainStyle: React.CSSProperties = {
  paddingBottom: '2rem',
};

const primaryBtnStyle: React.CSSProperties = {
  background: '#238636',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0.6rem 1.5rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
};
