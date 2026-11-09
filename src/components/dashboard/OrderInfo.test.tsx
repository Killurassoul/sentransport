import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COLIS } from '@/mocks/data';
import { OrderInfo } from './OrderInfo';
import { rendre } from '@/tests/render';

const colis = COLIS[0];
const autre = COLIS[1];

function panneau(onChangerColis = vi.fn()) {
  rendre(
    <OrderInfo
      colis={colis}
      autresColis={[autre]}
      livreur={{ prenom: 'Modou', nom: 'Fall' }}
      onChangerColis={onChangerColis}
    />,
  );
  return onChangerColis;
}

describe('OrderInfo', () => {
  it('affiche le trajet, le suivi et le livreur affecté', () => {
    panneau();

    expect(screen.getByText('Informations de livraison')).toBeInTheDocument();
    expect(screen.getByText('DKR')).toBeInTheDocument();
    expect(screen.getByText('THS')).toBeInTheDocument();
    expect(screen.getAllByText(colis.numeroSuivi).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Modou Fall').length).toBeGreaterThan(0);
    expect(screen.getByText(colis.destinataire.ville)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Suivre' })).toHaveAttribute(
      'href',
      `/colis/${colis.numeroSuivi}`,
    );
  });

  it('permet de changer de colis depuis le sélecteur', async () => {
    const utilisateur = userEvent.setup();
    const onChangerColis = panneau();

    await utilisateur.selectOptions(
      screen.getByRole('combobox', { name: 'Autre colis' }),
      autre.id,
    );

    expect(onChangerColis).toHaveBeenCalledWith(autre.id);
  });

  it('copie le numéro de suivi dans le presse-papiers', async () => {
    const utilisateur = userEvent.setup();
    const ecrire = vi.spyOn(navigator.clipboard, 'writeText');
    panneau();

    await utilisateur.click(screen.getByRole('button', { name: 'Copier' }));

    expect(await screen.findByText('Copié !')).toBeInTheDocument();
    expect(ecrire).toHaveBeenCalledWith(colis.numeroSuivi);
  });
});
