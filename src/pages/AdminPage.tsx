import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import {
  CheckCircle2,
  Package,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Role, StatutColis } from '@/api/types';
import { useColisList } from '@/api/hooks/colis';
import { useAffecterColis } from '@/api/hooks/livraisons';
import { useBasculerUtilisateur, useUtilisateurs } from '@/api/hooks/users';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { useUIStore as useThemeStore } from '@/store/ui';
import { Counter } from '@/components/ui/Counter';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { calculerDashboard } from '@/features/dashboard/useDashboardData';
import { ROLES, STATUTS_LISTE, codeVille } from '@/lib/constants';
import { dateCourte, nombre } from '@/lib/format';
import { normaliserErreur } from '@/api/client';
import { cn } from '@/lib/cn';

const COULEURS: Record<StatutColis, string> = {
  en_attente: '#F59E0B',
  pris_en_charge: '#3B82F6',
  en_transit: '#7C5CFC',
  livre: '#22C55E',
  echec: '#EF4444',
};

export function AdminPage() {
  const { t, langue } = useI18n();
  const theme = useThemeStore((s) => s.theme);
  const ajouterNotification = useUIStore((s) => s.ajouterNotification);
  const moi = useAuthStore((s) => s.utilisateur);
  const {
    data: colisPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useColisList({ limit: 200 });
  const { data: utilisateurs, isLoading: chargementUsers } = useUtilisateurs();
  const affectation = useAffecterColis();
  const basculer = useBasculerUtilisateur();

  const [colisChoisi, setColisChoisi] = useState('');
  const [livreurChoisi, setLivreurChoisi] = useState('');

  const colis = useMemo(() => colisPage?.items ?? [], [colisPage]);
  const livreurs = (utilisateurs ?? []).filter((u) => u.role === 'livreur');
  const livreursActifs = livreurs.filter((l) => l.actif);

  const dashboard = useMemo(
    () => (colisPage ? calculerDashboard(colisPage.items, langue) : null),
    [colisPage, langue],
  );

  const repartition = useMemo(
    () =>
      STATUTS_LISTE.map((statut) => ({
        statut,
        nom: t(`statut.${statut}`),
        valeur: colis.filter((c) => c.statut === statut).length,
      })).filter((entree) => entree.valeur > 0),
    [colis, t],
  );

  const aAffecter = colis.filter(
    (c) => !c.livreurId && c.statut !== 'livre' && c.statut !== 'echec',
  );

  const stats = [
    {
      libelle: t('admin.stats.colis'),
      valeur: colis.length,
      Icone: Package,
      ton: 'text-accent',
    },
    {
      libelle: t('admin.stats.livres'),
      valeur: colis.filter((c) => c.statut === 'livre').length,
      Icone: CheckCircle2,
      ton: 'text-[#15803D] dark:text-[#86EFAC]',
    },
    {
      libelle: t('admin.stats.actifs'),
      valeur: dashboard?.colisActifs ?? 0,
      Icone: Truck,
      ton: 'text-[#1E4FA8] dark:text-[#93C5FD]',
    },
    {
      libelle: t('admin.stats.livreurs'),
      valeur: livreursActifs.length,
      Icone: UserCheck,
      ton: 'text-[#8A5A08] dark:text-[#FBBF24]',
    },
  ];

  const affecter = async () => {
    if (!colisChoisi || !livreurChoisi) {
      toast.error('Choisissez un colis et un livreur.');
      return;
    }
    try {
      await affectation.mutateAsync({ colisId: colisChoisi, livreurId: livreurChoisi });
      const colisCible = colis.find((c) => c.id === colisChoisi);
      const livreur = livreurs.find((l) => l.id === livreurChoisi);
      toast.success(t('admin.affecte'), {
        description: `${colisCible?.numeroSuivi} → ${livreur?.prenom} ${livreur?.nom}`,
      });
      ajouterNotification({
        titre: 'Nouvelle affectation',
        texte: `${colisCible?.numeroSuivi} confié à ${livreur?.prenom} ${livreur?.nom}.`,
        ton: 'accent',
        href: '/livraisons',
      });
      setColisChoisi('');
      setLivreurChoisi('');
    } catch (erreur) {
      toast.error(normaliserErreur(erreur).message);
    }
  };

  const basculerUtilisateur = async (id: string, actif: boolean) => {
    try {
      await basculer.mutateAsync({ id, actif });
      toast.success(actif ? 'Compte activé' : 'Compte désactivé');
    } catch (erreur) {
      toast.error(normaliserErreur(erreur).message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[84px] rounded-card" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-[280px] rounded-card xl:col-span-8" />
          <Skeleton className="h-[280px] rounded-card xl:col-span-4" />
        </div>
        <Skeleton className="h-[360px] rounded-card" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : t('commun.erreur_reseau')}
        onRetry={() => void refetch()}
        className="min-h-[320px] bg-shell"
      />
    );
  }

  const couleurTexte = theme === 'dark' ? '#F0EEFA' : '#14121F';
  const fondTooltip = theme === 'dark' ? '#1A1730' : '#FFFFFF';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ libelle, valeur, Icone, ton }) => (
          <div key={libelle} className="white-card flex items-center gap-3 p-4">
            <span className={cn('grid h-9 w-9 place-items-center rounded-full bg-surface', ton)}>
              <Icone aria-hidden className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[22px] font-semibold leading-none text-ink">
                <Counter valeur={valeur} langue={langue} />
              </p>
              <p className="mt-1 text-[10.5px] text-ink-mute">{libelle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="surface-card p-5 xl:col-span-8" aria-labelledby="volume-jour">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 id="volume-jour" className="text-[15px] font-semibold text-ink">
                {t('admin.ondule')}
              </h2>
              <p className="mt-0.5 text-[10.5px] text-ink-mute">
                Colis enregistrés sur les 7 derniers jours
              </p>
            </div>
            <Badge ton="accent" taille="sm">
              <span className="num">{dashboard?.colisMois ?? 0}</span> ce mois-ci
            </Badge>
          </div>
          <div className="mt-4 h-[190px] w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.series.colis ?? []} barCategoryGap="30%">
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: theme === 'dark' ? '#A6A1C0' : '#A29FB5' }}
                />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#F4F3F8' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 12px 30px rgba(20,18,31,0.14)',
                    background: fondTooltip,
                    color: couleurTexte,
                    fontSize: 11,
                  }}
                  formatter={(valeur: number) => [`${valeur} colis`, '']}
                  labelFormatter={(label) => `Jour : ${label}`}
                />
                <Bar dataKey="valeur" radius={[6, 6, 6, 6]} fill="#7C5CFC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card p-5 xl:col-span-4" aria-labelledby="repartition-statut">
          <h2 id="repartition-statut" className="text-[15px] font-semibold text-ink">
            {t('admin.repartition')}
          </h2>
          <div className="relative mt-2 h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={repartition}
                  dataKey="valeur"
                  nameKey="nom"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  stroke="none"
                >
                  {repartition.map((entree) => (
                    <Cell key={entree.statut} fill={COULEURS[entree.statut]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 12px 30px rgba(20,18,31,0.14)',
                    background: fondTooltip,
                    color: couleurTexte,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="num text-[22px] font-semibold leading-none text-ink">
                {colis.length}
              </p>
              <p className="text-[9px] text-ink-mute">colis</p>
            </div>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {repartition.map((entree) => (
              <li key={entree.statut} className="flex items-center gap-1.5 text-[10px] text-ink-soft">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: COULEURS[entree.statut] }}
                />
                <span className="truncate">{entree.nom}</span>
                <span className="num ml-auto font-semibold text-ink">{entree.valeur}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <section className="surface-card overflow-hidden xl:col-span-8" aria-labelledby="utilisateurs">
          <header className="flex items-center justify-between gap-2 border-b border-line/[0.06] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.06] text-ink-soft">
                <Users className="h-3.5 w-3.5" />
              </span>
              <h2 id="utilisateurs" className="text-[15px] font-semibold text-ink">
                {t('admin.utilisateurs')}
              </h2>
            </div>
            <span className="num rounded-pill bg-surface px-2.5 py-1 text-[10px] font-medium text-ink-mute">
              {utilisateurs?.length ?? 0}
            </span>
          </header>

          {chargementUsers ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <caption className="sr-only">Utilisateurs de la plateforme</caption>
                <thead>
                  <tr className="border-b border-line/[0.06] text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-mute">
                    <th scope="col" className="px-5 py-2.5">Utilisateur</th>
                    <th scope="col" className="px-3 py-2.5">Rôle</th>
                    <th scope="col" className="px-3 py-2.5">Ville</th>
                    <th scope="col" className="px-3 py-2.5">Créé le</th>
                    <th scope="col" className="px-3 py-2.5">Statut</th>
                    <th scope="col" className="px-5 py-2.5 text-right">
                      <span className="sr-only">{t('commun.actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(utilisateurs ?? []).map((utilisateur) => (
                    <tr
                      key={utilisateur.id}
                      className="border-b border-line/[0.05] last:border-0 hover:bg-surface/60"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            prenom={utilisateur.prenom}
                            nom={utilisateur.nom}
                            taille="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-ink">
                              {utilisateur.prenom} {utilisateur.nom}
                              {utilisateur.id === moi?.id ? (
                                <span className="ml-1 text-[9px] font-medium text-accent">(vous)</span>
                              ) : null}
                            </p>
                            <p className="truncate text-[10px] text-ink-mute">
                              {utilisateur.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge ton={ROLES[utilisateur.role as Role].ton} taille="sm">
                          {t(ROLES[utilisateur.role as Role].cle as 'role.client')}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-ink-soft">{utilisateur.ville}</td>
                      <td className="px-3 py-3 text-[10.5px] text-ink-mute">
                        {dateCourte(utilisateur.createdAt, langue)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[10px] font-medium',
                            utilisateur.actif
                              ? 'bg-[#E7F7ED] text-[#15803D] dark:bg-success/15 dark:text-[#86EFAC]'
                              : 'bg-surface-sunken text-ink-mute',
                          )}
                        >
                          <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
                          {utilisateur.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {utilisateur.id !== moi?.id && utilisateur.role !== 'administrateur' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10.5px]"
                            loading={basculer.isPending}
                            onClick={() =>
                              void basculerUtilisateur(utilisateur.id, !utilisateur.actif)
                            }
                          >
                            {utilisateur.actif ? t('admin.desactiver') : t('admin.activer')}
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-ink-mute">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="surface-card p-5 xl:col-span-4" aria-labelledby="affectation">
          <h2 id="affectation" className="text-[15px] font-semibold text-ink">
            {t('admin.affectations')}
          </h2>
          <p className="mt-0.5 text-[10.5px] text-ink-mute">
            Confiez un colis en attente à un livreur disponible.
          </p>

          <div className="mt-4 space-y-3">
            <Select
              label={t('admin.choisir_colis')}
              value={colisChoisi}
              onChange={(evenement) => setColisChoisi(evenement.target.value)}
              placeholder={aAffecter.length === 0 ? t('admin.aucun_colis') : 'Sélectionner…'}
              options={aAffecter.map((c) => ({
                value: c.id,
                label: `${c.numeroSuivi} · ${c.destinataire.nom} (${codeVille(c.villeArrivee)})`,
              }))}
              disabled={aAffecter.length === 0}
            />
            <Select
              label={t('admin.choisir_livreur')}
              value={livreurChoisi}
              onChange={(evenement) => setLivreurChoisi(evenement.target.value)}
              placeholder="Sélectionner…"
              options={livreursActifs.map((l) => ({
                value: l.id,
                label: `${l.prenom} ${l.nom} · ${l.ville} (${nombre(l.capaciteKg ?? 0, langue)} kg)`,
              }))}
            />
            <Button
              variant="accent"
              className="w-full"
              onClick={() => void affecter()}
              loading={affectation.isPending}
              disabled={aAffecter.length === 0}
              iconLeft={<Truck className="h-3.5 w-3.5" />}
            >
              {t('admin.affecter')}
            </Button>
          </div>

          <div className="mt-4 space-y-2 border-t border-line/[0.06] pt-3">
            <p className="label-caps">Livreurs disponibles</p>
            {livreurs.map((livreur) => (
              <div
                key={livreur.id}
                className="flex items-center gap-2.5 rounded-[12px] bg-shell/60 px-2.5 py-2 dark:bg-white/[0.03]"
              >
                <Avatar prenom={livreur.prenom} nom={livreur.nom} taille="xs" enLigne={livreur.actif} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-ink">
                    {livreur.prenom} {livreur.nom}
                  </p>
                  <p className="truncate text-[9.5px] text-ink-mute">
                    {livreur.immatriculation ?? '—'} · {nombre(livreur.capaciteKg ?? 0, langue)} kg
                  </p>
                </div>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    livreur.actif ? 'bg-success' : 'bg-ink-mute',
                  )}
                  aria-label={livreur.actif ? 'Disponible' : 'Inactif'}
                />
              </div>
            ))}
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-ink-mute">
            {aAffecter.length} colis en attente d’affectation ·{' '}
            <Link to="/livraisons" className="font-medium text-accent hover:underline">
              voir les livraisons
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
