import { useEffect, useRef, useState } from 'react';

let scriptLoadingPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Renders the official "Continue with Google" button using Google Identity
 * Services. Calls `onCredential(idToken)` with the raw Google ID token once the
 * person picks an account — verification happens server-side in /api/auth/google.
 *
 * Requires VITE_GOOGLE_CLIENT_ID to be set in frontend/.env. Until a real client
 * ID is configured, this renders a disabled placeholder instead of a broken button.
 */
export default function GoogleAuthButton({ onCredential, text = 'continue_with' }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: containerRef.current.offsetWidth || 320,
        });
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, text]);

  if (!clientId) {
    return (
      <div
        className="w-full flex items-center justify-center gap-2 border border-dashed border-border text-ink-soft text-sm font-medium px-4 py-2.5 rounded-lg cursor-not-allowed"
        title="Set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable Google Sign-In"
      >
        Continue with Google (not configured)
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-danger text-center">{error}</p>;
  }

  return <div ref={containerRef} className="w-full flex justify-center [&>div]:w-full" />;
}
