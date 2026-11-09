import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useConnexion } from '@/api/hooks/users';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { schemaConnexion, type DonneesConnexion } from './schemas';
import { normaliserErreur } from '@/api/client';

const COMPTES_DEMO = [
  {
    role: 'Client',
    email: 'awa.diop@sentransport.sn',
    prenom: 'Awa Diop',
  },
  {
    role: 'Livreur',
    email: 'modou.fall@sentransport.sn',
    prenom: 'Modou Fall',
  },
  {
    role: 'Admin',
    email: 'admin@sentransport.sn',
    prenom: 'Abdoulaye Mbaye',
  },
] as const;

const MOT_DE_PASSE_DEMO = 'Demo1234!';

export function LoginForm() {
  const { t, langue } = useI18n();
  const navigate = useNavigate();
  const [parametres] = useSearchParams();
  const connexion = useConnexion();
  const setSession = useAuthStore((s) => s.setSession);
  const motifExpiration = useAuthStore((s) => s.motifExpiration);
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [compteSelectionne, setCompteSelectionne] = useState<string | null>(null);

  const schema = useMemo(() => schemaConnexion(t), [t]);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DonneesConnexion>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', motDePasse: '' },
  });

  const redirectionBrute = parametres.get('redirect') ?? '';
  const redirection =
    redirectionBrute.startsWith('/') && !redirectionBrute.startsWith('//')
      ? redirectionBrute
      : '/dashboard';

  const mocksActifs = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false';

  useEffect(() => {
    if (motifExpiration) toast.warning(motifExpiration);
  }, [motifExpiration]);

  const remplirDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('motDePasse', MOT_DE_PASSE_DEMO, { shouldValidate: true });
    setCompteSelectionne(email);
  };

  const envoyer = handleSubmit(async (donnees) => {
    try {
      const reponse = await connexion.mutateAsync({
        email: donnees.email.trim(),
        password: donnees.motDePasse,
      });
      setSession(reponse.token, reponse.utilisateur);
      toast.success(t('login.succes'), {
        description:
          langue === 'fr'
            ? `Connecté en tant que ${reponse.utilisateur.prenom} ${reponse.utilisateur.nom}.`
            : `Signed in as ${reponse.utilisateur.prenom} ${reponse.utilisateur.nom}.`,
      });
      navigate(
        redirection === '/dashboard'
          ? reponse.utilisateur.role === 'livreur'
            ? '/livreur'
            : redirection
          : redirection,
        { replace: true },
      );
    } catch (erreur) {
      setError('root', { message: normaliserErreur(erreur).message });
    }
  });

  return (
    <div className="w-full">
      <span className="inline-flex items-center gap-1.5 rounded-pill border border-line/[0.08] bg-surface px-2.5 py-1 text-[10px] font-medium text-ink-soft">
        <ShieldCheck aria-hidden className="h-3 w-3 text-accent" />
        Espace sécurisé
      </span>

      <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink">
        {t('login.titre')}
      </h1>
      <p className="mt-1.5 text-[13px] text-ink-soft">{t('login.sous_titre')}</p>

      {motifExpiration ? (
        <div
          role="alert"
          className="mt-4 rounded-[14px] border border-warning/25 bg-warning/10 px-3.5 py-2.5 text-[12px] font-medium text-[#8A5A08] dark:text-[#FBBF24]"
        >
          {motifExpiration}
        </div>
      ) : null}

      <form onSubmit={envoyer} className="mt-6 space-y-4" noValidate>
        <Input
          label={t('login.email')}
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.sn"
          icone={<Mail className="h-4 w-4" />}
          erreur={errors.email?.message}
          required
          {...register('email')}
        />

        <div>
          <Input
            label={t('login.mot_de_passe')}
            type={afficherMdp ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            icone={<Lock className="h-4 w-4" />}
            erreur={errors.motDePasse?.message}
            required
            {...register('motDePasse')}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAfficherMdp((v) => !v)}
              className="inline-flex items-center gap-1 rounded-pill text-[11px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-pressed={afficherMdp}
            >
              {afficherMdp ? (
                <EyeOff aria-hidden className="h-3 w-3" />
              ) : (
                <Eye aria-hidden className="h-3 w-3" />
              )}
              {afficherMdp
                ? langue === 'fr'
                  ? 'Masquer'
                  : 'Hide'
                : langue === 'fr'
                  ? 'Afficher'
                  : 'Show'}
            </button>
            <button
              type="button"
              onClick={() =>
                toast.info(
                  langue === 'fr'
                    ? 'Réinitialisation par e-mail'
                    : 'Reset by email',
                  {
                    description:
                      langue === 'fr'
                        ? 'Contactez votre administrateur SenTransport pour réinitialiser votre mot de passe.'
                        : 'Contact your SenTransport administrator to reset your password.',
                  },
                )
              }
              className="text-[11px] font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t('login.mot_de_passe_oublie')}
            </button>
          </div>
        </div>

        {errors.root?.message ? (
          <div
            role="alert"
            className="rounded-[14px] border border-danger/25 bg-danger/[0.06] px-3.5 py-2.5 text-[12px] font-medium text-danger"
          >
            {errors.root.message}
          </div>
        ) : null}

        <Button
          type="submit"
          variant="accent"
          size="lg"
          loading={isSubmitting || connexion.isPending}
          className="w-full"
        >
          {t('login.connexion')}
        </Button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line/[0.08]" />
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-mute">
          {langue === 'fr' ? 'ou' : 'or'}
        </span>
        <span className="h-px flex-1 bg-line/[0.08]" />
      </div>

      <p className="mt-5 text-center text-[12px] text-ink-soft">
        {t('login.pas_compte')}{' '}
        <Link
          to={`/register${redirection !== '/dashboard' ? `?redirect=${encodeURIComponent(redirection)}` : ''}`}
          className="font-semibold text-accent hover:underline"
        >
          {t('login.creer')}
        </Link>
      </p>

      {mocksActifs ? (
        <div className="mt-7 rounded-[18px] border border-line/[0.07] bg-surface p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-mute">
              {t('login.comptes_demo')}
            </p>
            <span className="num rounded-pill bg-shell px-2 py-0.5 text-[9px] font-medium text-ink-soft">
              Demo1234!
            </span>
          </div>
          <div className="mt-2.5 space-y-1">
            {COMPTES_DEMO.map((compte) => (
              <button
                key={compte.email}
                type="button"
                onClick={() => remplirDemo(compte.email)}
                aria-pressed={compteSelectionne === compte.email}
                className={`flex w-full items-center justify-between gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  compteSelectionne === compte.email
                    ? 'bg-accent-soft'
                    : 'hover:bg-shell'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-semibold text-ink">
                    {compte.prenom}
                  </span>
                  <span className="block truncate text-[10px] text-ink-mute">
                    {compte.email}
                  </span>
                </span>
                <span className="shrink-0 rounded-pill bg-shell px-2 py-0.5 text-[9px] font-semibold text-ink-soft">
                  {compte.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
