import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COLIS } from '@/mocks/data';
import { ColisTable } from './ColisTable';
import { rendre } from '@/tests/render';

const echantillon = COLIS.slice(0, 3);

function tableau(selection = new Set<string>()) {
  const onBasculer = vi.fn();
  const onBasculerTout = vi.fn();
  const onTri = vi.fn();
  rendre(
    <ColisTable
      colis={echantillon}
      selection={selection}
      onBasculer={onBasculer}
      onBasculerTout={onBasculerTout}
      tri="recent"
      onTri={onTri}
    />,
  );
  return { onBasculer, onBasculerTout, onTri };
}

describe('ColisTable', () => {
  it('affiche une ligne par colis avec les informations clés', () => {
    tableau();
    expect(screen.getAllByRole('row')).toHaveLength(echantillon.length + 1);

    for (const colis of echantillon) {
      expect(screen.getByText(colis.numeroSuivi)).toBeInTheDocument();
      expect(screen.getAllByText(colis.destinataire.nom).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(echantillon[0].description)).toBeInTheDocument();
  });

  it('déclenche le tri par poids depuis l’en-tête', async () => {
    const utilisateur = userEvent.setup();
    const { onTri } = tableau();

    await utilisateur.click(screen.getByRole('button', { name: /poids/i }));
    expect(onTri).toHaveBeenCalledWith('poids');
  });

  it('sélectionne un colis et toute la page', async () => {
    const utilisateur = userEvent.setup();
    const { onBasculer, onBasculerTout } = tableau();

    await utilisateur.click(
      screen.getByRole('checkbox', {
        name: `Sélectionner ${echantillon[1].numeroSuivi}`,
      }),
    );
    expect(onBasculer).toHaveBeenCalledWith(echantillon[1].id);

    await utilisateur.click(
      screen.getByRole('checkbox', {
        name: 'Sélectionner tous les colis de la page',
      }),
    );
    expect(onBasculerTout).toHaveBeenCalledTimes(1);
  });

  it('coche la ligne déjà sélectionnée et marque l’en-tête partiel', () => {
    tableau(new Set([echantillon[0].id]));

    expect(
      screen.getByRole('checkbox', {
        name: `Sélectionner ${echantillon[0].numeroSuivi}`,
      }),
    ).toBeChecked();
    const tout = screen.getByRole('checkbox', {
      name: 'Sélectionner tous les colis de la page',
    }) as HTMLInputElement;
    expect(tout.indeterminate).toBe(true);
    expect(tout).not.toBeChecked();
  });
});
