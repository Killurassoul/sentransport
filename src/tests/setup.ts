import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';

/* ------------------------------------------------------------------ */
/* Environnement navigateur (jsdom)                                    */
/* ------------------------------------------------------------------ */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  // Fonction simple : `vi.restoreAllMocks()` ne doit pas vider l’implémentation
  // entre deux tests d’un même fichier.
  value: (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverStub,
  });
}

if (!('IntersectionObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  });
}

Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

// jsdom n’implémente pas encore les URL de Blob.
if (typeof URL.createObjectURL !== 'function') {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(() => 'blob:sentransport'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
}

/* ------------------------------------------------------------------ */
/* Cycle de vie                                                        */
/* ------------------------------------------------------------------ */

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
  useAuthStore.setState({ token: null, utilisateur: null, motifExpiration: null });
  useUIStore.setState({
    theme: 'light',
    langue: 'fr',
    paletteOuverte: false,
    notificationsOuvertes: false,
    sidebarMobile: false,
  });
  document.documentElement.classList.remove('dark');
  window.history.replaceState({}, '', '/');
});

afterAll(() => server.close());
