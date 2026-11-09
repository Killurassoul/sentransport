import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { creerClientDeTest } from '@/tests/render';
import { useAuthStore } from '@/store/auth';
import { UTILISATEURS } from '@/mocks/data';
import type { Utilisateur } from '@/api/types';
import { App } from '@/App';
import { DashboardPage } from '@/pages/DashboardPage';
import { ColisNewPage } from '@/pages/ColisNewPage';
import { ColisListPage } from '@/pages/ColisListPage';
import { ColisDetailPage } from '@/pages/ColisDetailPage';
import { LivraisonsPage } from '@/pages/LivraisonsPage';
import { CartePage } from '@/pages/CartePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ParametresPage } from '@/pages/ParametresPage';
import { LivreurPage } from '@/pages/LivreurPage';
import { AdminPage } from '@/pages/AdminPage';
import { SuiviPage } from '@/pages/SuiviPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { GlobalErrorPage } from '@/pages/GlobalErrorPage';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="carte">{children}</div>
  ),
  TileLayer: () => null,
  Polyline: () => null,
  Marker: ({ children }: { children?: ReactNode }) => <>{children}</>,
  Popup: ({ children }: { children?: ReactNode }) => <>{children}</>,
  useMap: () => ({
    invalidateSize: vi.fn(),
    fitBounds: vi.fn(),
    setView: vi.fn(),
    getZoom: () => 7,
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
  }),
}));

const CLIENT = UTILISATEURS.find((u) => u.email === 'awa.diop@sentransport.sn') as Utilisateur;
const LIVREUR = UTILISATEURS.find((u) => u.email === 'modou.fall@sentransport.sn') as Utilisateur;
const ADMIN = UTILISATEURS.find((u) => u.email === 'admin@sentransport.sn') as Utilisateur;

function connecter(utilisateur?: Utilisateur) {
  if (!utilisateur) return;
  useAuthStore.setState({
    token: `mock.${utilisateur.id}.1700000000000`,
    utilisateur,
    motifExpiration: null,
  });
}

function afficherPage(
  chemin: string,
  element: ReactNode,
  options: { utilisateur?: Utilisateur; route?: string } = {},
) {
  connecter(options.utilisateur);
  return render(
    <QueryClientProvider client={creerClientDeTest()}>
      <MemoryRouter
        initialEntries={[chemin]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route element={<AppShell />}>
            <Route path={options.route ?? chemin} element={element} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function afficherPublique(chemin: string, element: ReactNode, route: string) {
  return render(
    <QueryClientProvider client={creerClientDeTest()}>
      <MemoryRouter
        initialEntries={[chemin]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path={route} element={element} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Parcours client', () => {
  it('affiche le dashboard, la carte, les notifications et la palette', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/dashboard', <DashboardPage />, { utilisateur: CLIENT });

    expect(await screen.findByText('Informations de livraison')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bon retour, Awa/ })).toBeInTheDocument();
    expect(screen.getByTestId('carte')).toBeInTheDocument();

    await utilisateur.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement).toHaveClass('dark');
    await utilisateur.click(screen.getByRole('button', { name: 'Light' }));

    await utilisateur.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(await screen.findByRole('dialog', { name: /Notifications/i })).toBeInTheDocument();
    await utilisateur.keyboard('{Escape}');

    await utilisateur.keyboard('{Control>}k{/Control}');
    expect(
      await screen.findByRole('dialog', { name: 'Palette de commandes' }),
    ).toBeInTheDocument();
    await utilisateur.keyboard('{Escape}');
  });

  it('liste les colis, bascule en cartes, filtre et trie', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/colis', <ColisListPage />, { utilisateur: CLIENT });

    expect(await screen.findByRole('heading', { name: 'Colis' })).toBeInTheDocument();
    expect((await screen.findAllByText(/ST-2026-004/)).length).toBeGreaterThan(0);

    await utilisateur.click(screen.getByRole('tab', { name: /Cartes/i }));
    expect(document.body).toHaveTextContent('ST-2026-004');
    await utilisateur.click(screen.getByRole('tab', { name: /Tableau/i }));

    await utilisateur.type(
      screen.getByPlaceholderText(/Rechercher par numéro/),
      'Thiès',
    );
    await utilisateur.selectOptions(screen.getByLabelText('Trier'), 'poids');
    await utilisateur.click(screen.getByRole('tab', { name: 'Livré' }));

    expect(await screen.findByRole('tab', { name: 'Livré' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await utilisateur.click(screen.getByRole('button', { name: /Exporter CSV/ }));
  });

  it('parcourt les quatre étapes de création d’un colis', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/colis/nouveau', <ColisNewPage />, { utilisateur: CLIENT });

    expect(
      await screen.findByRole('heading', { name: 'Expéditeur' }),
    ).toBeInTheDocument();
    await utilisateur.clear(screen.getByLabelText(/^Nom complet/));
    await utilisateur.type(screen.getByLabelText(/^Nom complet/), 'Awa Diop');
    await utilisateur.clear(screen.getByLabelText(/^Téléphone/));
    await utilisateur.type(screen.getByLabelText(/^Téléphone/), '+221 77 512 40 18');
    await utilisateur.type(screen.getByLabelText(/^Adresse/), 'Sacré-Cœur 3, villa 145');
    await utilisateur.selectOptions(screen.getByLabelText(/^Ville/), 'Dakar');
    await utilisateur.click(screen.getByRole('button', { name: /Suivant/ }));

    expect(await screen.findByRole('heading', { name: 'Destinataire' })).toBeInTheDocument();
    await utilisateur.type(screen.getByLabelText(/^Nom complet/), 'Mariama Diallo');
    await utilisateur.type(screen.getByLabelText(/^Téléphone/), '+221 77 842 19 06');
    await utilisateur.type(screen.getByLabelText(/^Adresse/), 'Cité Lamy, rue 12');
    await utilisateur.selectOptions(screen.getByLabelText(/^Ville/), 'Thiès');
    await utilisateur.click(screen.getByRole('button', { name: /Suivant/ }));

    expect(await screen.findByRole('heading', { name: /Description/ })).toBeInTheDocument();
    await utilisateur.type(
      screen.getByLabelText(/^Description du contenu/),
      'Documents notariés sous enveloppe renforcée',
    );
    await utilisateur.clear(screen.getByLabelText(/^Poids \(kg\)/));
    await utilisateur.type(screen.getByLabelText(/^Poids \(kg\)/), '2.4');
    await utilisateur.clear(screen.getByLabelText(/^Livraison estimée/));
    await utilisateur.type(
      screen.getByLabelText(/^Livraison estimée/),
      '2026-11-12T10:30',
    );
    await utilisateur.selectOptions(screen.getByLabelText(/^Ville de départ/), 'Dakar');
    await utilisateur.selectOptions(screen.getByLabelText(/^Ville d’arrivée/), 'Thiès');
    await utilisateur.click(screen.getByRole('button', { name: /Suivant/ }));

    expect(await screen.findByRole('heading', { name: 'Récapitulatif' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer le colis/ })).toBeInTheDocument();
    await utilisateur.click(screen.getByRole('button', { name: /Précédent/ }));
    expect(await screen.findByRole('heading', { name: /Description/ })).toBeInTheDocument();
  });

  it('affiche le détail et ouvre les modales de bordereau, édition et suppression', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/colis/ST-2026-00417', <ColisDetailPage />, {
      utilisateur: CLIENT,
      route: '/colis/:numero',
    });

    expect(await screen.findByText('Historique de suivi')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Colis ST-2026-00417/ })).toBeInTheDocument();

    await utilisateur.click(screen.getByRole('button', { name: 'Bordereau' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await utilisateur.keyboard('{Escape}');

    await utilisateur.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await utilisateur.keyboard('{Escape}');

    await utilisateur.click(screen.getByRole('button', { name: 'Supprimer' }));
    const confirmation = await screen.findByRole('dialog');
    await utilisateur.click(within(confirmation).getByRole('button', { name: 'Annuler' }));
  });

  it('affiche les livraisons en liste puis en kanban', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/livraisons', <LivraisonsPage />, { utilisateur: CLIENT });

    expect(await screen.findByRole('heading', { name: 'Livraisons' })).toBeInTheDocument();
    expect((await screen.findAllByText(/ST-2026-004/)).length).toBeGreaterThan(0);

    await utilisateur.click(screen.getByRole('tab', { name: /Kanban/i }));
    expect((await screen.findAllByText('En attente')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('En transit')).length).toBeGreaterThan(0);
  });

  it('affiche la carte réseau et filtre par statut', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/carte', <CartePage />, { utilisateur: CLIENT });

    expect(await screen.findByRole('heading', { name: 'Carte du réseau' })).toBeInTheDocument();
    expect(await screen.findByTestId('carte')).toBeInTheDocument();

    await utilisateur.click(screen.getByRole('tab', { name: 'En transit' }));
    expect((await screen.findAllByText(/colis actif/i)).length).toBeGreaterThan(0);
  });

  it('affiche et filtre les messages', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/messages', <MessagesPage />, { utilisateur: CLIENT });

    expect(await screen.findByText(/Colis ST-2026-00417 en transit/)).toBeInTheDocument();
    await utilisateur.click(screen.getByRole('tab', { name: /non lus/i }));
    expect(document.body).toHaveTextContent('Messages');
    await utilisateur.click(screen.getByRole('button', { name: 'Tout marquer comme lu' }));
  });

  it('parcourt les onglets des paramètres', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/parametres', <ParametresPage />, { utilisateur: CLIENT });

    expect(await screen.findByRole('heading', { name: 'Paramètres' })).toBeInTheDocument();
    await utilisateur.click(screen.getByRole('button', { name: 'Mot de passe' }));
    expect(screen.getByRole('heading', { name: 'Mot de passe' })).toBeInTheDocument();
    await utilisateur.click(screen.getByRole('button', { name: 'Préférences' }));
    expect(screen.getByText('Apparence')).toBeInTheDocument();

    await utilisateur.click(screen.getByRole('button', { name: 'Profil' }));
    const enregistrer = screen.getByRole('button', { name: 'Enregistrer' });
    await utilisateur.click(enregistrer);
    await waitFor(() => expect(enregistrer).not.toBeDisabled(), { timeout: 2000 });
  });
});

describe('Parcours livreur et administrateur', () => {
  it('affiche les tournées du livreur et le motif d’échec', async () => {
    const utilisateur = userEvent.setup();
    afficherPage('/livreur', <LivreurPage />, { utilisateur: LIVREUR });

    expect(await screen.findByRole('heading', { name: 'Mes tournées' })).toBeInTheDocument();
    expect(await screen.findByText('Tournée Dakar & banlieue')).toBeInTheDocument();

    await utilisateur.click(screen.getAllByRole('button', { name: 'Échec' })[0] as HTMLElement);
    const modale = await screen.findByRole('dialog');
    await utilisateur.click(within(modale).getByRole('button', { name: 'Confirmer' }));
    expect(within(modale).getByText(/Précisez un motif/)).toBeInTheDocument();
    await utilisateur.click(within(modale).getByRole('button', { name: 'Annuler' }));
  });

  it('affiche les statistiques et les utilisateurs côté administration', async () => {
    afficherPage('/admin', <AdminPage />, { utilisateur: ADMIN });

    expect(await screen.findByRole('heading', { name: 'Administration' })).toBeInTheDocument();
    expect(await screen.findByText('Utilisateurs')).toBeInTheDocument();
    expect((await screen.findAllByText('Aminata Ba')).length).toBeGreaterThan(0);
    expect(screen.getByText('Colis totaux')).toBeInTheDocument();
  });
});

describe('Application complète', () => {
  it('monte l’application avec le routeur, le shell et le dashboard', async () => {
    connecter(CLIENT);
    window.history.pushState({}, '', '/dashboard');
    render(<App />);

    expect(await screen.findByText('Informations de livraison')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeInTheDocument();
  });
});

describe('Parcours publics et erreurs', () => {
  it('suit un colis sans être connecté', async () => {
    afficherPublique('/suivi/ST-2026-00417', <SuiviPage />, '/suivi/:numero');

    expect(await screen.findByText('Historique de suivi')).toBeInTheDocument();
    expect(screen.getAllByText(/ST-2026-00417/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Votre colis').length).toBeGreaterThan(0);
  });

  it('valide le formulaire d’inscription', async () => {
    const utilisateur = userEvent.setup();
    render(
      <QueryClientProvider client={creerClientDeTest()}>
        <MemoryRouter
          initialEntries={['/register']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Rejoignez SenTransport' })).toBeInTheDocument();
    await utilisateur.click(screen.getByRole('button', { name: 'Créer mon compte' }));
    expect(await screen.findByText(/requis/i)).toBeInTheDocument();
  });

  it('affiche les pages 404, 403 et l’erreur globale', () => {
    const { unmount } = render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    unmount();

    const { unmount: unmount403 } = render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    unmount403();

    render(<GlobalErrorPage onRetry={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /mal passé/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recharger la page/i })).toBeInTheDocument();
  });
});
