import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Phone, Truck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useInscription } from '@/api/hooks/users';
import { useAuthStore } from '@/store/auth';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { VILLES_NOMS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { normaliserErreur } from '@/api/client';
import { schemaInscription, type DonneesInscription } from './schemas';

export function RegisterForm() {
  const { t, langue } = useI18n();
  const navigate = useNavigate();
  const inscription = useInscription();
  const setSession = useAuthStore((s) => s.setSession);
  const [afficherMdp, setAfficherMdp] = useState(false);

  const schema = useMemo(() => schemaInscription(t), [t]);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DonneesInscription>({
    resolver: zodResolver(schema),
    defaultValues: {
      prenom: '',
      nom: '',
      email: '',
      telephone: '+221 ',
      ville: 'Dakar',
      role: 'client',
      motDePasse: '',
    },
  });

  const role = watch('role');

  const envoyer = handleSubmit(async (donnees) => {
    try {
      const reponse = await inscription.mutateAsync({
        prenom: donnees.prenom.trim(),
        nom: donnees.nom.trim(),
        email: donnees.email.trim(),
        telephone: donnees.telephone.trim(),
        ville: donnees.ville,
        password: donnees.motDePasse,
        role: donnees.role,
      });
      setSession(reponse.token, reponse.utilisateur);
      toast.success(t('register.succes'), {
        description:
          langue === 'fr'
            ? 'Votre espace est prêt. Bienvenue chez SenTransport.'
            : 'Your workspace is ready. Welcome to SenTransport.',
      });
      navigate(donnees.role === 'livreur' ? '/livreur' : '/dashboard', {
        replace: true,
      });
    } catch (erreur) {
      setError('root', { message: normaliserErreur(erreur).message });
    }
  });

  return (
    <div className="w-full">
      <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink">
        {t('register.titre')}
      </h1>
      <p className="mt-1.5 text-[13px] text-ink-soft">{t('register.sous_titre')}</p>

      <form onSubmit={envoyer} className="mt-6 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('register.prenom')}
            autoComplete="given-name"
            placeholder="Awa"
            erreur={errors.prenom?.message}
            required
            {...register('prenom')}
          />
          <Input
            label={t('register.nom')}
            autoComplete="family-name"
            placeholder="Diop"
            erreur={errors.nom?.message}
            required
            {...register('nom')}
          />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('register.telephone')}
            type="tel"
            autoComplete="tel"
            placeholder="+221 77 123 45 67"
            icone={<Phone className="h-4 w-4" />}
            erreur={errors.telephone?.message}
            required
            {...register('telephone')}
          />
          <Select
            label={t('register.ville')}
            options={VILLES_NOMS.map((ville) => ({ value: ville, label: ville }))}
            erreur={errors.ville?.message}
            required
            {...register('ville')}
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium text-ink-soft">
            {t('register.role')}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { valeur: 'client', label: t('role.client'), Icone: UserRound },
                { valeur: 'livreur', label: t('role.livreur'), Icone: Truck },
              ] as const
            ).map(({ valeur, label, Icone }) => {
              const actif = role === valeur;
              return (
                <label
                  key={valeur}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-[14px] border p-3 transition-colors focus-within:ring-2 focus-within:ring-accent',
                    actif
                      ? 'border-accent/40 bg-accent-soft text-accent-deep'
                      : 'border-line/10 bg-shell text-ink-soft hover:bg-surface',
                  )}
                >
                  <input
                    type="radio"
                    value={valeur}
                    className="sr-only"
                    {...register('role')}
                  />
                  <span
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full',
                      actif ? 'bg-accent text-white' : 'bg-surface text-ink-soft',
                    )}
                  >
                    <Icone aria-hidden className="h-4 w-4" />
                  </span>
                  <span className="text-[12.5px] font-semibold">{label}</span>
                </label>
              );
            })}
          </div>
          {errors.role?.message ? (
            <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.role.message}
            </p>
          ) : null}
        </fieldset>

        <div>
          <Input
            label={t('login.mot_de_passe')}
            type={afficherMdp ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            icone={<Lock className="h-4 w-4" />}
            erreur={errors.motDePasse?.message}
            hint={t('valid.mdp')}
            required
            {...register('motDePasse')}
          />
          <button
            type="button"
            onClick={() => setAfficherMdp((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 rounded-pill text-[11px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-pressed={afficherMdp}
          >
            {afficherMdp ? (
              <EyeOff aria-hidden className="h-3 w-3" />
            ) : (
              <Eye aria-hidden className="h-3 w-3" />
            )}
            {afficherMdp ? 'Masquer' : 'Afficher'}
          </button>
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
          loading={isSubmitting || inscription.isPending}
          className="w-full"
        >
          {t('register.creer')}
        </Button>

        <p className="text-center text-[10px] leading-relaxed text-ink-mute">
          En créant un compte, vous acceptez les conditions d’utilisation et la
          politique de confidentialité de SenTransport.
        </p>

        <p className="pt-1 text-center text-[12px] text-ink-soft">
          {t('register.deja_compte')}{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            {t('login.connexion')}
          </Link>
        </p>
      </form>

      <div className="mt-6 rounded-[16px] border border-line/[0.07] bg-surface px-3.5 py-3">
        <p className="text-[11px] leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Astuce :</span> un compte livreur
          donne accès aux tournées du jour et aux actions de statut. Un compte client
          permet de créer et suivre vos colis.
        </p>
      </div>
    </div>
  );
}
