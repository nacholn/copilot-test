'use client';

import { useState } from 'react';

const testLanguages = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
];

export default function TestFlags() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Flag Emoji Test Page</h1>

      <h2>Direct Emoji Test:</h2>
      <div style={{ fontSize: '24px', margin: '1rem 0' }}>
        <div>🇬🇧 UK Flag</div>
        <div>🇪🇸 Spain Flag</div>
        <div>🇫🇷 France Flag</div>
      </div>

      <h2>Styled Flag Test:</h2>
      <div
        style={{
          fontSize: '20px',
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Emoji", sans-serif',
          margin: '1rem 0',
        }}
      >
        {testLanguages.map((lang) => (
          <div
            key={lang.code}
            style={{
              margin: '0.5rem 0',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>{lang.flag}</span>
            <span>{lang.name}</span>
          </div>
        ))}
      </div>

      <h2>Simple Dropdown Test:</h2>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '8px 12px',
            border: '2px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily:
              '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Emoji", sans-serif',
          }}
        >
          {testLanguages.find((l) => l.code === selectedLang)?.flag}{' '}
          {testLanguages.find((l) => l.code === selectedLang)?.name} ▼
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '2px solid #ccc',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              zIndex: 10,
            }}
          >
            {testLanguages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontFamily:
                    '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Emoji", sans-serif',
                  backgroundColor: lang.code === selectedLang ? '#f0f0f0' : 'white',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    lang.code === selectedLang ? '#f0f0f0' : 'white')
                }
              >
                <span style={{ marginRight: '8px' }}>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}
      >
        <h3>What you should see:</h3>
        <ul>
          <li>✅ Colorful flag emojis next to language names</li>
          <li>✅ A working dropdown that shows flags in both selected state and options</li>
          <li>
            ❌ If you see black & white symbols or squares, your system has limited emoji support
          </li>
          <li>❌ If you see nothing or question marks, emoji fonts are not available</li>
        </ul>
        <p>
          <strong>Current selection:</strong>{' '}
          {testLanguages.find((l) => l.code === selectedLang)?.flag}{' '}
          {testLanguages.find((l) => l.code === selectedLang)?.name}
        </p>
      </div>
    </div>
  );
}
