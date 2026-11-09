import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Globe2,
  KeyRound,
  LogOut,
  Palette,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMajMotDePasse, useMajProfil } from '@/api/hooks/users';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useI18n } from '@/hooks/useI18n';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ThemeSwitch } from '@/components/ui/Switch';
import { VILLES_NOMS, ROLES } from '@/lib/constants';
import { normaliserErreur } from '@/api/client';
import { cn } from '@/lib/cn';
import type { Traducteur } from '@/features/auth/schemas';

type Onglet = 'profil' | 'securite' | 'preferences';

function schemaProfil(t: Traducteur) {
  return z.object({
    prenom: z.string().trim().min(2, t('valid.nom')),
    nom: z.string().trim().min(2, t('valid.nom')),
    email: z.string().min(1, t('valid.requis')).email(t('valid.email')),
    telephone: z.string().trim().min(6, t('valid.requis')),
    ville: z.string().min(1, t('valid.ville')),
  });
}

function schemaMotDePasse(t: Traducteur) {
  return z
    .object({
      actuel: z.string().min(1, t('valid.requis')),
      nouveau: z
        .string()
        .min(8, t('valid.mdp'))
        .regex(/[A-Za-z]/, t('valid.mdp'))
        .regex(/\d/, t('valid.mdp')),
      confirmation: z.string().min(1, t('valid.requis')),
    })
    .refine((valeurs) => valeurs.nouveau === valeurs.confirmation, {
      path: ['confirmation'],
      message: t('valid.confirmation'),
    });
}

export function ParametresPage() {
  const { t, langue } = useI18n();
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const setUtilisateur = useAuthStore((s) => s.setUtilisateur);
  const logout = useAuthStore((s) => s.logout);
  const setLangue = useUIStore((s) => s.setLangue);
  const theme = useUIStore((s) => s.theme);
  const profilMutation = useMajProfil();
  const motDePasseMutation = useMajMotDePasse();
  const [onglet, setOnglet] = useState<Onglet>('profil');

  const schemaP = useMemo(() => schemaProfil(t), [t]);
  const profilForm = useForm({
    resolver: zodResolver(schemaP),
    defaultValues: {
      prenom: utilisateur?.prenom ?? '',
      nom: utilisateur?.nom ?? '',
      email: utilisateur?.email ?? '',
      telephone: utilisateur?.telephone ?? '',
      ville: utilisateur?.ville ?? 'Dakar',
    },
  });

  const schemaM = useMemo(() => schemaMotDePasse(t), [t]);
  const mdpForm = useForm({
    resolver: zodResolver(schemaM),
    defaultValues: { actuel: '', nouveau: '', confirmation: '' },
  });

  const enregistrerProfil = profilForm.handleSubmit(async (valeurs) => {
    try {
      const misAJour = await profilMutation.mutateAsync(valeurs);
      setUtilisateur(misAJour);
      toast.success(t('parametres.sauve'));
    } catch (erreur) {
      profilForm.setError('root', { message: normaliserErreur(erreur).message });
    }
  });

  const changerMotDePasse = mdpForm.handleSubmit(async (valeurs) => {
    try {
      await motDePasseMutation.mutateAsync({
        actuel: valeurs.actuel,
        nouveau: valeurs.nouveau,
      });
      toast.success(t('parametres.mdp_succes'));
      mdpForm.reset();
    } catch (erreur) {
      mdpForm.setError('root', { message: normaliserErreur(erreur).message });
    }
  });

  if (!utilisateur) return null;

  const onglets: { valeur: Onglet; label: string; Icone: typeof UserRound }[] = [
    { valeur: 'profil', label: t('parametres.profil'), Icone: UserRound },
    { valeur: 'securite', label: t('parametres.mdp'), Icone: KeyRound },
    { valeur: 'preferences', label: t('parametres.preferences'), Icone: Palette },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <aside className="xl:col-span-3">
        <div className="surface-card p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar prenom={utilisateur.prenom} nom={utilisateur.nom} taille="lg" enLigne />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">
                {utilisateur.prenom} {utilisateur.nom}
              </p>
              <p className="truncate text-[10.5px] text-ink-mute">{utilisateur.email}</p>
              <Badge ton={ROLES[utilisateur.role].ton} taille="sm" className="mt-1">
                {t(`role.${utilisateur.role}`)}
              </Badge>
            </div>
          </div>

          <nav aria-label="Sections des paramètres" className="mt-2 flex gap-1 xl:flex-col">
            {onglets.map(({ valeur, label, Icone }) => (
              <button
                key={valeur}
                type="button"
                onClick={() => setOnglet(valeur)}
                aria-current={onglet === valeur ? 'page' : undefined}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-pill px-3 py-2 text-[11.5px] font-medium transition-colors xl:justify-start xl:text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  onglet === valeur
                    ? 'bg-[#111018] text-white dark:bg-[#F4F2FF] dark:text-[#14121F]'
                    : 'text-ink-soft hover:bg-surface-sunken',
                )}
              >
                <Icone aria-hidden className="h-3.5 w-3.5" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4 surface-card p-4">
          <p className="label-caps flex items-center gap-1.5">
            <ShieldCheck aria-hidden className="h-3 w-3" />
            Sécurité
          </p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-ink-mute">
            Votre session expire automatiquement en cas d’inactivité ou de réponse 401.
            Vous serez redirigé vers la connexion sans perdre votre page.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full text-danger hover:text-danger"
            onClick={() => {
              logout();
              window.location.assign('/login');
            }}
            iconLeft={<LogOut className="h-3.5 w-3.5" />}
          >
            {t('parametres.deconnexion')}
          </Button>
        </div>
      </aside>

      <div className="xl:col-span-9">
        {onglet === 'profil' ? (
          <section className="surface-card p-5">
            <h2 className="text-[15px] font-semibold text-ink">{t('parametres.profil')}</h2>
            <p className="mt-0.5 text-[10.5px] text-ink-mute">
              Ces informations apparaissent sur vos bordereaux et vos échanges.
            </p>

            <form onSubmit={enregistrerProfil} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
              <Input
                label={t('register.prenom')}
                erreur={profilForm.formState.errors.prenom?.message}
                required
                {...profilForm.register('prenom')}
              />
              <Input
                label={t('register.nom')}
                erreur={profilForm.formState.errors.nom?.message}
                required
                {...profilForm.register('nom')}
              />
              <Input
                label={t('parametres.email')}
                type="email"
                erreur={profilForm.formState.errors.email?.message}
                required
                {...profilForm.register('email')}
              />
              <Input
                label={t('parametres.telephone')}
                type="tel"
                erreur={profilForm.formState.errors.telephone?.message}
                required
                {...profilForm.register('telephone')}
              />
              <Select
                label={t('parametres.ville')}
                options={VILLES_NOMS.map((ville) => ({ value: ville, label: ville }))}
                erreur={profilForm.formState.errors.ville?.message}
                {...profilForm.register('ville')}
              />
              <div className="flex items-end">
                <Input
                  label="Rôle"
                  value={t(`role.${utilisateur.role}`)}
                  readOnly
                  disabled
                  className="cursor-not-allowed opacity-70"
                />
              </div>

              {profilForm.formState.errors.root?.message ? (
                <p role="alert" className="text-xs font-medium text-danger sm:col-span-2">
                  {profilForm.formState.errors.root.message}
                </p>
              ) : null}

              <div className="flex justify-end sm:col-span-2">
                <Button
                  type="submit"
                  variant="accent"
                  loading={profilForm.formState.isSubmitting || profilMutation.isPending}
                >
                  {t('commun.enregistrer')}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {onglet === 'securite' ? (
          <section className="surface-card p-5">
            <h2 className="text-[15px] font-semibold text-ink">{t('parametres.mdp')}</h2>
            <p className="mt-0.5 text-[10.5px] text-ink-mute">
              Utilisez au moins 8 caractères avec une lettre et un chiffre.
            </p>

            <form onSubmit={changerMotDePasse} className="mt-5 max-w-md space-y-4" noValidate>
              <Input
                label={t('parametres.mdp_actuel')}
                type="password"
                autoComplete="current-password"
                erreur={mdpForm.formState.errors.actuel?.message}
                required
                {...mdpForm.register('actuel')}
              />
              <Input
                label={t('parametres.mdp_nouveau')}
                type="password"
                autoComplete="new-password"
                erreur={mdpForm.formState.errors.nouveau?.message}
                hint={
                  (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'
                    ? 'Démo : le mot de passe actuel est Demo1234!'
                    : undefined
                }
                required
                {...mdpForm.register('nouveau')}
              />
              <Input
                label={t('parametres.mdp_confirmer')}
                type="password"
                autoComplete="new-password"
                erreur={mdpForm.formState.errors.confirmation?.message}
                required
                {...mdpForm.register('confirmation')}
              />

              {mdpForm.formState.errors.root?.message ? (
                <p role="alert" className="text-xs font-medium text-danger">
                  {mdpForm.formState.errors.root.message}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="accent"
                loading={mdpForm.formState.isSubmitting || motDePasseMutation.isPending}
              >
                Mettre à jour le mot de passe
              </Button>
            </form>
          </section>
        ) : null}

        {onglet === 'preferences' ? (
          <div className="flex flex-col gap-4">
            <section className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Palette className="h-4 w-4 text-ink-mute" />
                {t('parametres.apparence')}
              </h2>
              <p className="mt-0.5 text-[10.5px] text-ink-mute">
                {t('parametres.theme_desc')}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-shell/60 p-3.5 dark:bg-white/[0.03]">
                <div>
                  <p className="text-[12px] font-medium text-ink">{t('commun.theme')}</p>
                  <p className="text-[10.5px] text-ink-mute">
                    {theme === 'dark' ? 'Mode sombre actif' : 'Mode clair actif'}
                  </p>
                </div>
                <div className="w-[190px]">
                  <ThemeSwitch />
                </div>
              </div>
            </section>

            <section className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Globe2 className="h-4 w-4 text-ink-mute" />
                {t('commun.langue')}
              </h2>
              <p className="mt-0.5 text-[10.5px] text-ink-mute">
                {t('parametres.langue_desc')}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-shell/60 p-3.5 dark:bg-white/[0.03]">
                <p className="text-[12px] font-medium text-ink">
                  {langue === 'fr' ? 'Français (par défaut)' : 'English'}
                </p>
                <SegmentedControl
                  ariaLabel={t('commun.langue')}
                  value={langue}
                  onChange={(valeur) => {
                    setLangue(valeur);
                    toast.success(
                      valeur === 'fr' ? 'Langue : français' : 'Language: English',
                    );
                  }}
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                  ]}
                />
              </div>
            </section>

            <section className="surface-card p-5">
              <h2 className="text-[15px] font-semibold text-ink">Session</h2>
              <p className="mt-0.5 text-[10.5px] text-ink-mute">
                Vous êtes connecté en tant que {utilisateur.email}.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3"
                onClick={() => {
                  logout();
                  window.location.assign('/login');
                }}
                iconLeft={<LogOut className="h-3.5 w-3.5" />}
              >
                {t('parametres.deconnexion')}
              </Button>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
