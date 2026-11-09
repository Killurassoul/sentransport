import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Package } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { rendre } from '@/tests/render';

describe('KpiCard', () => {
  it('affiche la valeur, l’unité et la variation positive', () => {
    rendre(
      <KpiCard
        libelle="Colis ce mois-ci"
        valeur={42}
        unite="colis"
        icone={<Package />}
        variation={12.34}
        graphique={<span data-testid="graphique" />}
        serie={[
          { label: 'lun', valeur: 4 },
          { label: 'mar', valeur: 6 },
        ]}
      />,
    );

    expect(screen.getByText('Colis ce mois-ci')).toBeInTheDocument();
    expect(screen.getAllByText('42').length).toBeGreaterThan(0);
    expect(screen.getByText('colis')).toBeInTheDocument();
    expect(screen.getByText('+12,3 %')).toBeInTheDocument();
    expect(screen.getByText('vs mois dernier')).toBeInTheDocument();
    expect(screen.getByTestId('graphique')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Colis ce mois-ci — lun : 4, mar : 6/ }),
    ).toBeInTheDocument();
  });

  it('affiche une variation négative et une légende sans variation', () => {
    const { rerender } = rendre(
      <KpiCard
        libelle="Poids moyen"
        valeur={6.7}
        decimales={1}
        unite="kg"
        icone={<Package />}
        variation={-4.2}
        graphique={<span />}
      />,
    );

    expect(screen.getByText('−4,2 %')).toBeInTheDocument();
    expect(screen.getByText('vs mois dernier')).toBeInTheDocument();

    rerender(
      <KpiCard
        libelle="Distance moyenne"
        valeur={171}
        unite="km"
        icone={<Package />}
        legende="km / trajet"
        graphique={<span />}
      />,
    );

    expect(screen.getByText('km / trajet')).toBeInTheDocument();
    expect(screen.queryByText('vs mois dernier')).not.toBeInTheDocument();
  });
});
