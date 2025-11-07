/**
 * Home Page - Desktop App
 * 
 * Main page for the Electron desktop application
 */

import { AuthDemo } from '@/components/AuthDemo';
import { Button } from '@cycling-network/ui';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '48px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '800',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Cycling Network Platform
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: '#64748b',
            marginBottom: '32px',
          }}
        >
          Desktop Application (Electron-ready)
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Button variant="primary">Get Started</Button>
          <Button variant="secondary">Learn More</Button>
        </div>
      </header>

      <section
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '48px',
        }}
      >
        <AuthDemo />
      </section>

      <section style={{ textAlign: 'center', color: '#64748b' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
          Desktop Features
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginTop: '32px',
          }}
        >
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              🖥️ Native Desktop
            </h3>
            <p>Run as a native desktop application</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              🔐 Secure Auth
            </h3>
            <p>Same authentication as web platform</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              🎨 Shared UI
            </h3>
            <p>Consistent design across platforms</p>
          </div>
        </div>
      </section>
    </main>
  );
}
