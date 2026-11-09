import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Route, Scale } from 'lucide-react';
import { useDashboardData } from '@/features/dashboard/useDashboardData';
import { useUtilisateurs } from '@/api/hooks/users';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { MiniArea, MiniBars } from '@/components/dashboard/MiniChart';
import { PackageDetails } from '@/components/dashboard/PackageDetails';
import { OrderInfo } from '@/components/dashboard/OrderInfo';
import { SpeedGauge } from '@/components/dashboard/SpeedGauge';
import { MapOverview } from '@/components/dashboard/MapOverview';
import { CourierCard } from '@/components/dashboard/CourierCard';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonVariants } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/store/auth';

function Apparition({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DashboardPage() {
  const { t, langue } = useI18n();
  const { donnees, isLoading, isError, error, refetch } = useDashboardData();
  const { data: livreurs } = useUtilisateurs('livreur');
  const role = useAuthStore((s) => s.utilisateur?.role);
  const [selectionId, setSelectionId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[164px] rounded-card" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <div className="grid gap-4 md:grid-cols-2 xl:col-span-7">
            <Skeleton className="h-[330px] rounded-card md:col-span-2" />
            <Skeleton className="h-[280px] rounded-card" />
            <Skeleton className="h-[280px] rounded-card" />
          </div>
          <div className="flex flex-col gap-4 xl:col-span-5">
            <Skeleton className="h-[340px] flex-1 rounded-card" />
            <Skeleton className="h-[260px] rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : t('commun.erreur_reseau')
        }
        onRetry={() => void refetch()}
        className="min-h-[320px] bg-shell"
      />
    );
  }

  if (!donnees || donnees.colis.length === 0) {
    return (
      <div className="surface-card">
        <EmptyState
          titre={t('colis.vide.titre')}
          texte={t('colis.vide.texte')}
          variante="colis"
          action={
            role !== 'livreur' ? (
              <Link to="/colis/nouveau" className={buttonVariants({ variant: 'accent' })}>
                <Plus className="h-4 w-4" aria-hidden />
                {t('colis.nouveau')}
              </Link>
            ) : undefined
          }
        />
      </div>
    );
  }

  const featured =
    donnees.colis.find((c) => c.id === selectionId) ?? donnees.featured;
  const livreur = livreurs?.find((l) => l.id === featured?.livreurId);
  const autresColis = donnees.colis.filter((c) => c.id !== featured?.id).slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          libelle={t('kpi.mois')}
          valeur={donnees.colisMois}
          icone={<Package className="h-4 w-4" />}
          variation={donnees.variations.colis}
          serie={donnees.series.colis}
          graphique={<MiniBars donnees={donnees.series.colis} />}
          delay={0}
        />
        <KpiCard
          libelle={t('kpi.poids')}
          valeur={donnees.poidsMoyen}
          decimales={1}
          unite={t('commun.kg')}
          icone={<Scale className="h-4 w-4" />}
          legende={t('kpi.unite_kg')}
          serie={donnees.series.poids}
          graphique={
            <MiniArea donnees={donnees.series.poids} identifiant="poids" />
          }
          delay={0.06}
        />
        <KpiCard
          libelle={t('kpi.distance')}
          valeur={donnees.distanceMoyenne}
          unite={t('commun.km')}
          icone={<Route className="h-4 w-4" />}
          legende={t('kpi.unite_km')}
          serie={donnees.series.distance}
          graphique={
            <MiniArea donnees={donnees.series.distance} identifiant="distance" />
          }
          delay={0.12}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-7">
          <Apparition delay={0.18} className="min-w-0 md:col-span-2">
            {featured ? (
              <OrderInfo
                colis={featured}
                autresColis={autresColis}
                livreur={
                  livreur ? { prenom: livreur.prenom, nom: livreur.nom } : undefined
                }
                onChangerColis={(id) => setSelectionId(id)}
              />
            ) : null}
          </Apparition>

          <Apparition delay={0.24} className="min-w-0">
            {featured ? <PackageDetails colis={featured} /> : null}
          </Apparition>

          <Apparition delay={0.3} className="min-w-0">
            <SpeedGauge
              pourcentage={donnees.ponctualite}
              aLheure={donnees.aLheure}
              enRetard={donnees.enRetard}
            />
          </Apparition>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-5">
          <Apparition delay={0.36} className="min-h-[330px] flex-1">
            <MapOverview colis={featured} className="min-h-[330px]" />
          </Apparition>
          <Apparition delay={0.42}>
            {livreur ? (
              <CourierCard livreur={livreur} />
            ) : (
              <section className="surface-card flex flex-col gap-2 p-5">
                <h2 className="text-[15px] font-semibold text-ink">
                  {t('dash.vehicule')}
                </h2>
                <p className="text-[12px] text-ink-soft">
                  Aucun livreur n’est encore affecté à ce colis. L’affectation se fait
                  depuis l’espace administration.
                </p>
              </section>
            )}
          </Apparition>
        </div>
      </div>

      <p className="px-1 pb-1 text-[10px] text-ink-mute">
        {t('dash.derniere_maj')} ·{' '}
        {new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date())}
      </p>
    </div>
  );
}
