import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '@/store/auth';
import { rendre } from '@/tests/render';

function formulaire() {
  return rendre(
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<p>Espace client</p>} />
      <Route path="/livreur" element={<p>Espace livreur</p>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('LoginForm', () => {
  it('affiche les messages de validation pour les champs vides', async () => {
    const utilisateur = userEvent.setup();
    formulaire();

    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }));

    const erreurs = await screen.findAllByText('Ce champ est requis.');
    expect(erreurs).toHaveLength(2);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('valide le format de l’adresse e-mail', async () => {
    const utilisateur = userEvent.setup();
    formulaire();

    await utilisateur.type(screen.getByLabelText(/Adresse e-mail/), 'pas-un-email');
    await utilisateur.type(screen.getByLabelText(/Mot de passe/), 'Demo1234!');
    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Adresse e-mail invalide.')).toBeInTheDocument();
  });

  it('préremplit un compte de démonstration et ouvre la session', async () => {
    const utilisateur = userEvent.setup();
    formulaire();

    await utilisateur.click(screen.getByRole('button', { name: /Awa Diop/ }));
    expect(screen.getByLabelText(/Adresse e-mail/)).toHaveValue(
      'awa.diop@sentransport.sn',
    );

    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Espace client')).toBeInTheDocument();
    const session = useAuthStore.getState();
    expect(session.token).toMatch(/^mock\./);
    expect(session.utilisateur?.email).toBe('awa.diop@sentransport.sn');
  });

  it('affiche l’erreur renvoyée par l’API pour un mot de passe incorrect', async () => {
    const utilisateur = userEvent.setup();
    formulaire();

    await utilisateur.type(
      screen.getByLabelText(/Adresse e-mail/),
      'awa.diop@sentransport.sn',
    );
    await utilisateur.type(screen.getByLabelText(/Mot de passe/), 'Mauvais1234!');
    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(
      await screen.findByText('E-mail ou mot de passe incorrect.'),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
