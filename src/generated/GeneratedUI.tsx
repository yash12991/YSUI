'use client';

import React, { useState } from 'react';

export default function GeneratedUI() {
  const [projectName, setProjectName] = useState('');

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 15% 10%, rgba(16,185,129,0.09) 0%, transparent 45%), radial-gradient(ellipse at 85% 80%, rgba(59,130,246,0.07) 0%, transparent 40%), #09090b',
        color: '#f8fafc',
        padding: 24,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <section style={{ maxWidth: 920, margin: '0 auto', display: 'grid', gap: 20 }}>
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <strong>SimplyUI Preview</strong>
          <span style={{ color: '#34d399', fontSize: 13 }}>Ready</span>
        </nav>

        <article style={cardStyle}>
          <h1 style={headingStyle}>Create Something</h1>
          <p style={mutedStyle}>Generate a project, save it to your workspace, then keep modifying it with AI.</p>
          <label style={{ display: 'grid', gap: 8, marginTop: 22 }}>
            <span style={{ color: '#d4d4d8', fontSize: 13, fontWeight: 700 }}>Project name</span>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="My Awesome Project"
              style={inputStyle}
            />
          </label>
          <button style={buttonStyle} type="button">
            Get Started
          </button>
        </article>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: 24,
  backdropFilter: 'blur(12px)',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(40px, 7vw, 72px)',
  lineHeight: 0.95,
  margin: 0,
};

const mutedStyle: React.CSSProperties = {
  color: '#a1a1aa',
  fontSize: 17,
  lineHeight: 1.7,
};

const inputStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f8fafc',
  padding: '0 14px',
};

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  minHeight: 44,
  border: 0,
  borderRadius: 12,
  background: 'linear-gradient(135deg, #10b981, #059669)',
  color: 'white',
  fontWeight: 800,
  padding: '0 18px',
};
