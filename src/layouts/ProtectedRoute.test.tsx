import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { UTILISATEURS } from '@/mocks/data';
import { rendre } from '@/tests/render';

function EmplacementConnexion() {
  const location = useLocation();
  return <p>Connexion {location.search}</p>;
}

function routesProtegees(roles?: ('client' | 'livreur' | 'administrateur')[]) {
  return (
    <Routes>
      <Route element={<ProtectedRoute roles={roles} />}>
        <Route path="/colis" element={<p>Zone protégée</p>} />
      </Route>
      <Route path="/login" element={<EmplacementConnexion />} />
      <Route path="/403" element={<p>Accès refusé</p>} />
    </Routes>
  );
}

const client = UTILISATEURS.find((u) => u.role === 'client')!;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, utilisateur: null, motifExpiration: null });
  });

  it('redirige vers /login en conservant la destination', async () => {
    rendre(routesProtegees(), { route: '/colis?statut=en_transit' });

    expect(await screen.findByText(/Connexion/)).toHaveTextContent(
      'redirect=%2Fcolis%3Fstatut%3Den_transit',
    );
    expect(screen.queryByText('Zone protégée')).not.toBeInTheDocument();
  });

  it('laisse passer un utilisateur authentifié sans restriction de rôle', () => {
    useAuthStore.setState({ token: 'mock.u1.test', utilisateur: client });

    rendre(routesProtegees(), { route: '/colis' });

    expect(screen.getByText('Zone protégée')).toBeInTheDocument();
  });

  it('renvoie vers /403 quand le rôle ne correspond pas', () => {
    useAuthStore.setState({ token: 'mock.u1.test', utilisateur: client });

    rendre(routesProtegees(['administrateur']), { route: '/colis' });

    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    expect(screen.queryByText('Zone protégée')).not.toBeInTheDocument();
  });
});
