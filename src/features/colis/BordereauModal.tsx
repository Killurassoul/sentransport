import { Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Colis } from '@/api/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatutBadge } from '@/components/ui/Badge';
import { codeVille } from '@/lib/constants';
import { dateCourte, nombre } from '@/lib/format';
import { useI18n } from '@/hooks/useI18n';

export function BordereauModal({
  open,
  onClose,
  colis,
}: {
  open: boolean;
  onClose: () => void;
  colis: Colis;
}) {
  const { t, langue } = useI18n();
  const urlSuivi =
    typeof window !== 'undefined'
      ? `${window.location.origin}/suivi/${colis.numeroSuivi}`
      : `/suivi/${colis.numeroSuivi}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      titre={t('colis.detail.bordereau')}
      description="Aperçu avant impression — format A5."
      taille="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('commun.fermer')}
          </Button>
          <Button
            variant="primary"
            onClick={() => window.print()}
            iconLeft={<Printer className="h-4 w-4" />}
          >
            {t('commun.imprimer')}
          </Button>
        </>
      }
    >
      <div
        id="bordereau"
        className="rounded-[18px] border border-[#E4E0F2] bg-white p-5 text-[#14121F]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#7C5CFC] text-[13px] font-bold text-white">
              ST
            </span>
            <div>
              <p className="text-[13px] font-semibold">SenTransport</p>
              <p className="text-[9px] text-[#6B6880]">Dakar · Sénégal · +221 33 800 00 00</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A29FB5]">
              Bordereau d’expédition
            </p>
            <p className="num mt-1 text-[15px] font-bold">{colis.numeroSuivi}</p>
            <div className="mt-1 flex justify-end">
              <StatutBadge statut={colis.statut} taille="sm" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 rounded-[14px] bg-[#F4F3F8] p-3.5">
          <QRCodeSVG value={urlSuivi} size={86} level="M" bgColor="#ffffff" fgColor="#14121F" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#A29FB5]">Départ</p>
                <p className="num text-[22px] font-semibold leading-none">{codeVille(colis.villeDepart)}</p>
                <p className="text-[9.5px] text-[#6B6880]">{colis.villeDepart}</p>
              </div>
              <svg viewBox="0 0 80 10" className="h-2.5 flex-1 text-[#A29FB5]" aria-hidden>
                <path d="M2 5h76" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 5" strokeLinecap="round" />
              </svg>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#A29FB5]">Arrivée</p>
                <p className="num text-[22px] font-semibold leading-none text-[#4B34B8]">
                  {codeVille(colis.villeArrivee)}
                </p>
                <p className="text-[9.5px] text-[#6B6880]">{colis.villeArrivee}</p>
              </div>
            </div>
            <p className="mt-2 text-[9.5px] text-[#6B6880]">
              Livraison prévue le {dateCourte(colis.dateLivraisonPrevue, langue)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            { titre: 'Expéditeur', data: colis.expediteur },
            { titre: 'Destinataire', data: colis.destinataire },
          ].map((bloc) => (
            <div key={bloc.titre}>
              <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[#A29FB5]">
                {bloc.titre}
              </p>
              <p className="mt-1 text-[11.5px] font-semibold">{bloc.data.nom}</p>
              <p className="num text-[10px] text-[#6B6880]">{bloc.data.telephone}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#6B6880]">
                {bloc.data.adresse}, {bloc.data.ville}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-dashed border-[#E4E0F2] pt-3 text-[10px]">
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.12em] text-[#A29FB5]">Contenu</p>
            <p className="mt-0.5 font-medium">{colis.description}</p>
          </div>
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.12em] text-[#A29FB5]">Poids</p>
            <p className="num mt-0.5 font-medium">{nombre(colis.poidsKg, langue, 1)} kg</p>
          </div>
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.12em] text-[#A29FB5]">Montant</p>
            <p className="num mt-0.5 font-semibold">{nombre(colis.prixFcfa, langue)} FCFA</p>
          </div>
        </div>

        <p className="mt-4 text-center text-[8.5px] leading-relaxed text-[#A29FB5]">
          Conservez ce bordereau jusqu’à la livraison. Suivi en ligne :
          sentransport.sn/suivi · support@sentransport.sn
        </p>
      </div>
    </Modal>
  );
}
