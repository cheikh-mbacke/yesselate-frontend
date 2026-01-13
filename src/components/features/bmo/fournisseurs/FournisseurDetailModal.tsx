/**
 * Fournisseur Detail Modal
 * Pattern Modal Overlay pour module Fournisseurs
 */

'use client';

import React from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Star,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface Fournisseur {
  id: string;
  nom: string;
  reference: string;
  type: 'materiel' | 'service' | 'travaux' | 'autre';
  statut: 'actif' | 'inactif' | 'suspendu';
  notation: number; // 1-5
  email: string;
  telephone: string;
  adresse: string;
  totalContrats: number;
  montantTotal: number;
  dateDebut: string;
  description: string;
}

interface FournisseurDetailModalProps {
  fournisseurs: Fournisseur[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function FournisseurDetailModal({
  fournisseurs,
  selectedId,
  onClose,
  onPrevious,
  onNext,
}: FournisseurDetailModalProps) {
  const fournisseur = fournisseurs.find((f) => f.id === selectedId);

  if (!fournisseur) return null;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'inactif':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'suspendu':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <UniversalDetailModal
      isOpen={!!selectedId}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      title={fournisseur.nom}
      subtitle={`Réf: ${fournisseur.reference}`}
      headerColor="teal"
      width="xl"
      actions={
        <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
          <Building className="w-4 h-4 mr-1" />
          Contacter
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status & Rating Banner */}
        <div className="p-4 bg-gradient-to-r from-teal-500/10 to-transparent rounded-xl border border-teal-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-xl">
                <Building className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < fournisseur.notation ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-400">{fournisseur.totalContrats} contrats actifs</div>
              </div>
            </div>
            <Badge className={getStatutColor(fournisseur.statut)}>
              {fournisseur.statut.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<FileText className="w-5 h-5 text-purple-400" />}
            label="Type"
            value={fournisseur.type.toUpperCase()}
          />
          <InfoCard
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
            label="Montant total"
            value={`${fournisseur.montantTotal.toLocaleString('fr-FR')} €`}
          />
          <InfoCard
            icon={<Mail className="w-5 h-5 text-blue-400" />}
            label="Email"
            value={fournisseur.email}
          />
          <InfoCard
            icon={<Phone className="w-5 h-5 text-cyan-400" />}
            label="Téléphone"
            value={fournisseur.telephone}
          />
          <InfoCard
            icon={<MapPin className="w-5 h-5 text-pink-400" />}
            label="Adresse"
            value={fournisseur.adresse}
            fullWidth
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-amber-400" />}
            label="Partenaire depuis"
            value={new Date(fournisseur.dateDebut).toLocaleDateString('fr-FR')}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Description
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{fournisseur.description}</p>
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Performance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <PerformanceCard label="Qualité" value={fournisseur.notation} max={5} color="emerald" />
            <PerformanceCard label="Délais" value={4} max={5} color="blue" />
            <PerformanceCard label="Service" value={fournisseur.notation} max={5} color="purple" />
          </div>
        </div>
      </div>
    </UniversalDetailModal>
  );
}

// Helper Components
function InfoCard({
  icon,
  label,
  value,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors ${
        fullWidth ? 'col-span-2' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-200">{value}</div>
    </div>
  );
}

function PerformanceCard({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="text-xs font-medium text-slate-400 mb-2">{label}</div>
      <div className="text-lg font-bold text-slate-200 mb-2">
        {value}/{max}
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

