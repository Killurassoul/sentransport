import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

/** Serveur MSW partagé par tous les tests (Node). */
export const server = setupServer(...handlers);
