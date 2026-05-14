'use client';

import React from 'react';

export default function PreviewPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#09090b', color: '#6b7280', fontFamily: 'system-ui', fontSize: '0.85rem', flexDirection: 'column', gap: 12 }}>
      <div>Preview is shown in the workspace. Open the workspace to see your generated UI.</div>
    </div>
  );
}
