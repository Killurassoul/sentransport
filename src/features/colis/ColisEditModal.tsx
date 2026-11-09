import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { Colis } from '@/api/types';
import { useModifierColis } from '@/api/hooks/colis';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useI18n } from '@/hooks/useI18n';
import { toDateTimeLocal } from '@/lib/format';
import { normaliserErreur } from '@/api/client';

export function ColisEditModal({
  open,
  onClose,
  colis,
}: {
  open: boolean;
  onClose: () => void;
  colis: Colis;
}) {
  const { t } = useI18n();
  const mutation = useModifierColis(colis.id);

  const schema = useMemo(
    () =>
      z.object({
        description: z.string().trim().min(10, t('valid.description')),
        poidsKg: z.coerce.number().positive(t('valid.poids')).max(1000, t('valid.poids')),
        dateLivraisonPrevue: z
          .string()
          .min(1, t('valid.requis'))
          .refine((valeur) => +new Date(valeur) > Date.now(), t('valid.date')),
        destinataireNom: z.string().trim().min(2, t('valid.nom')),
        destinataireTelephone: z.string().trim().min(6, t('valid.requis')),
        destinataireAdresse: z.string().trim().min(5, t('valid.requis')),
      }),
    [t],
  );

  type Valeurs = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: colis.description,
      poidsKg: colis.poidsKg,
      dateLivraisonPrevue: toDateTimeLocal(colis.dateLivraisonPrevue),
      destinataireNom: colis.destinataire.nom,
      destinataireTelephone: colis.destinataire.telephone,
      destinataireAdresse: colis.destinataire.adresse,
    },
  });

  const envoyer = handleSubmit(async (valeurs) => {
    try {
      await mutation.mutateAsync({
        description: valeurs.description,
        poidsKg: Number(valeurs.poidsKg),
        dateLivraisonPrevue: new Date(valeurs.dateLivraisonPrevue).toISOString(),
        destinataire: {
          ...colis.destinataire,
          nom: valeurs.destinataireNom,
          telephone: valeurs.destinataireTelephone,
          adresse: valeurs.destinataireAdresse,
        },
      });
      toast.success(t('colis.detail.modifie'));
      onClose();
    } catch (erreur) {
      setError('root', { message: normaliserErreur(erreur).message });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      titre={`Modifier ${colis.numeroSuivi}`}
      description="Les modifications sont immédiatement visibles dans le suivi."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('commun.annuler')}
          </Button>
          <Button
            variant="accent"
            onClick={() => void envoyer()}
            loading={isSubmitting || mutation.isPending}
          >
            {t('commun.enregistrer')}
          </Button>
        </>
      }
    >
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Textarea
          label="Description"
          erreur={errors.description?.message}
          required
          {...register('description')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Poids (kg)"
            type="number"
            step={0.1}
            min={0.1}
            erreur={errors.poidsKg?.message}
            required
            {...register('poidsKg')}
          />
          <Input
            label="Livraison estimée"
            type="datetime-local"
            erreur={errors.dateLivraisonPrevue?.message}
            required
            {...register('dateLivraisonPrevue')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Destinataire"
            erreur={errors.destinataireNom?.message}
            required
            {...register('destinataireNom')}
          />
          <Input
            label="Téléphone"
            type="tel"
            erreur={errors.destinataireTelephone?.message}
            required
            {...register('destinataireTelephone')}
          />
        </div>
        <Input
          label="Adresse"
          erreur={errors.destinataireAdresse?.message}
          required
          {...register('destinataireAdresse')}
        />
        {errors.root?.message ? (
          <p role="alert" className="text-xs font-medium text-danger">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
