import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

export function creerClientDeTest() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function rendre(
  ui: ReactNode,
  options: { route?: string; client?: QueryClient } = {},
) {
  const client = options.client ?? creerClientDeTest();
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <MemoryRouter
          initialEntries={[options.route ?? '/']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          {ui}
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}
