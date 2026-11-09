import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  api,
  reinitialiserGestionnaires401,
  surExpirationSession,
} from './client';
import { server } from '@/tests/server';
import { useAuthStore } from '@/store/auth';
import { UTILISATEURS } from '@/mocks/data';

const utilisateur = UTILISATEURS[0];

function ouvrirSession() {
  useAuthStore.setState({ token: 'mock.u1.session', utilisateur });
}

afterEach(() => reinitialiserGestionnaires401());

describe('intercepteur 401', () => {
  it('déconnecte la session et redirige vers la page courante', async () => {
    ouvrirSession();
    window.history.replaceState({}, '', '/colis');
    const redirections: string[] = [];
    const desabonner = surExpirationSession((chemin) => redirections.push(chemin));

    server.use(
      http.get('/api/colis/inaccessible', () =>
        HttpResponse.json({ message: 'Session expirée.' }, { status: 401 }),
      ),
    );

    await expect(api.get('/colis/inaccessible')).rejects.toMatchObject({
      status: 401,
    });

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().utilisateur).toBeNull();
    expect(useAuthStore.getState().motifExpiration).toContain('session a expiré');
    expect(redirections).toEqual(['/colis']);
    desabonner();
  });

  it('ne déconnecte pas sur une route publique (échec de connexion)', async () => {
    ouvrirSession();
    const gestionnaire = vi.fn();
    const desabonner = surExpirationSession(gestionnaire);

    server.use(
      http.post('/api/users/login', () =>
        HttpResponse.json({ message: 'Identifiants invalides.' }, { status: 401 }),
      ),
    );

    await expect(
      api.post('/users/login', { email: 'x@y.sn', password: 'erreur' }),
    ).rejects.toMatchObject({ status: 401 });

    expect(useAuthStore.getState().token).toBe('mock.u1.session');
    expect(gestionnaire).not.toHaveBeenCalled();
    desabonner();
  });
});
