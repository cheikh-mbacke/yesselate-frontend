'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import { 
  FileText, Plus, Edit2, Trash2, Copy, CheckCircle2, 
  XCircle, AlertTriangle, Star, Search, Tag, RefreshCw, Loader2
} from 'lucide-react';
import { templatesAPI } from '@/lib/services/rhApiService';

// ============================================
// TYPES
// ============================================

type TemplateType = 'validation' | 'rejection' | 'info_request' | 'generic';

type Template = {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  tags: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
};

type Props = {
  onSelect?: (template: Template) => void;
  selectedType?: TemplateType;
};

// ============================================
// TEMPLATES PAR DÉFAUT
// ============================================

const DEFAULT_TEMPLATES: Template[] = [
  // Validations
  {
    id: 'TPL-001',
    name: 'Validation standard',
    type: 'validation',
    content: 'Votre demande a été validée. Merci de noter la date effective et de procéder aux formalités nécessaires.',
    tags: ['standard', 'congé', 'dépense'],
    usageCount: 45,
    isFavorite: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-002',
    name: 'Validation congé avec rappel',
    type: 'validation',
    content: 'Votre demande de congé est validée. Merci de :\n- Effectuer la passation des dossiers en cours\n- Informer vos collègues de votre absence\n- Désigner un remplaçant pour les urgences\n\nBon repos !',
    tags: ['congé', 'passation'],
    usageCount: 32,
    isFavorite: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-003',
    name: 'Validation dépense - Remboursement',
    type: 'validation',
    content: 'Votre demande de remboursement de frais est validée. Le montant sera crédité sur votre prochaine fiche de paie. Conservez les originaux des justificatifs.',
    tags: ['dépense', 'remboursement'],
    usageCount: 28,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-004',
    name: 'Validation mission',
    type: 'validation',
    content: 'Votre ordre de mission est validé. Veuillez :\n- Récupérer les documents de voyage au secrétariat\n- Préparer le rapport de mission au retour\n- Soumettre les frais dans les 7 jours suivant le retour',
    tags: ['mission', 'déplacement'],
    usageCount: 15,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
  
  // Rejets
  {
    id: 'TPL-010',
    name: 'Rejet - Solde insuffisant',
    type: 'rejection',
    content: 'Votre demande ne peut être acceptée en raison d\'un solde de congés insuffisant. Votre solde actuel est de {SOLDE} jours. Veuillez ajuster la durée ou contacter le service RH.',
    tags: ['congé', 'solde'],
    usageCount: 12,
    isFavorite: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-011',
    name: 'Rejet - Documents manquants',
    type: 'rejection',
    content: 'Votre demande est rejetée car les documents justificatifs sont incomplets. Merci de fournir :\n- {DOCUMENTS_MANQUANTS}\n\nUne nouvelle demande pourra être soumise une fois les documents complétés.',
    tags: ['documents', 'justificatifs'],
    usageCount: 18,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-012',
    name: 'Rejet - Conflit de planning',
    type: 'rejection',
    content: 'Votre demande ne peut être validée car elle génère un conflit de planning avec d\'autres absences dans le service. Merci de consulter le calendrier des absences et de proposer des dates alternatives.',
    tags: ['conflit', 'planning'],
    usageCount: 8,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-013',
    name: 'Rejet - Montant non conforme',
    type: 'rejection',
    content: 'La demande de remboursement est rejetée car le montant demandé ({MONTANT} FCFA) dépasse le plafond autorisé pour cette catégorie de dépense. Merci de justifier le dépassement ou de revoir le montant.',
    tags: ['dépense', 'montant'],
    usageCount: 5,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
  
  // Demandes d'information
  {
    id: 'TPL-020',
    name: 'Demande de précisions',
    type: 'info_request',
    content: 'Avant de traiter votre demande, merci de fournir les précisions suivantes :\n\n{QUESTIONS}\n\nVotre demande sera traitée dès réception de ces informations.',
    tags: ['précisions', 'complément'],
    usageCount: 22,
    isFavorite: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-021',
    name: 'Demande de justificatifs',
    type: 'info_request',
    content: 'Pour compléter l\'examen de votre demande, merci de fournir :\n- {DOCUMENTS_REQUIS}\n\nSans ces documents, la demande ne pourra pas être traitée dans les délais.',
    tags: ['justificatifs', 'documents'],
    usageCount: 14,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
  
  // Génériques
  {
    id: 'TPL-030',
    name: 'Accusé de réception',
    type: 'generic',
    content: 'Votre demande {ID_DEMANDE} a bien été reçue et sera traitée dans les meilleurs délais. Vous recevrez une notification dès qu\'une décision sera prise.',
    tags: ['accusé', 'réception'],
    usageCount: 50,
    isFavorite: true,
    createdAt: '01/01/2026',
  },
  {
    id: 'TPL-031',
    name: 'En cours de traitement',
    type: 'generic',
    content: 'Votre demande est actuellement en cours de traitement. Nous vous tiendrons informé(e) de l\'avancement. Délai estimé : {DELAI}.',
    tags: ['traitement', 'statut'],
    usageCount: 20,
    isFavorite: false,
    createdAt: '01/01/2026',
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function RHResponseTemplates({ onSelect, selectedType }: Props) {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<TemplateType | 'all'>(selectedType || 'all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  // Charger les templates depuis l'API
  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await templatesAPI.getAll();
      if (response.success && response.data) {
        // Mapper les données API vers notre format local
        const apiTemplates = response.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: t.category === 'rejection' ? 'rejection' : 
                t.category === 'request_info' ? 'info_request' : 
                t.category === 'validation' ? 'validation' : 'generic',
          content: t.content,
          tags: t.tags || [],
          usageCount: t.usageCount || 0,
          isFavorite: false, // Géré localement
          createdAt: new Date(t.createdAt).toLocaleDateString('fr-FR'),
        }));
        
        // Fusionner avec les templates par défaut
        const mergedTemplates = [...DEFAULT_TEMPLATES];
        apiTemplates.forEach((apiT: Template) => {
          const existingIndex = mergedTemplates.findIndex(t => t.id === apiT.id);
          if (existingIndex === -1) {
            mergedTemplates.push(apiT);
          }
        });
        
        setTemplates(mergedTemplates);
        setIsSynced(true);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Filtrer les templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (showFavoritesOnly && !t.isFavorite) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(query) ||
          t.content.toLowerCase().includes(query) ||
          t.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    }).sort((a, b) => {
      // Favoris en premier, puis par usage
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.usageCount - a.usageCount;
    });
  }, [templates, filterType, showFavoritesOnly, search]);

  // Actions
  const handleCopy = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
      
      // Incrémenter le compteur d'usage (local + API)
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
      ));
      
      // Notifier l'API
      templatesAPI.use(template.id).catch(console.error);
    } catch (e) {
      console.error('Erreur copie:', e);
    }
  };

  const handleSelect = (template: Template) => {
    onSelect?.(template);
    
    // Incrémenter le compteur d'usage (local + API)
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    
    // Notifier l'API
    templatesAPI.use(template.id).catch(console.error);
  };

  const handleToggleFavorite = (id: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce modèle ?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      // Supprimer via API (pour les templates non par défaut)
      if (!id.startsWith('TPL-0')) {
        try {
          await templatesAPI.delete(id);
        } catch (e) {
          console.error('Erreur suppression API:', e);
        }
      }
    }
  };

  const handleSaveTemplate = async (template: Template) => {
    if (isCreating) {
      const newId = `TPL-${Date.now()}`;
      const newTemplate = { ...template, id: newId };
      setTemplates(prev => [...prev, newTemplate]);
      
      // Créer via API
      try {
        const categoryMap: Record<TemplateType, string> = {
          validation: 'validation',
          rejection: 'rejection',
          info_request: 'request_info',
          generic: 'other',
        };
        
        await templatesAPI.create({
          name: template.name,
          description: template.content.substring(0, 100),
          category: categoryMap[template.type],
          content: template.content,
          tags: template.tags,
        });
      } catch (e) {
        console.error('Erreur création API:', e);
      }
    } else {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      
      // Mettre à jour via API
      try {
        await templatesAPI.update(template.id, {
          name: template.name,
          content: template.content,
          tags: template.tags,
        });
      } catch (e) {
        console.error('Erreur mise à jour API:', e);
      }
    }
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const getTypeConfig = (type: TemplateType) => {
    switch (type) {
      case 'validation':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Validation' };
      case 'rejection':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejet' };
      case 'info_request':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Demande info' };
      default:
        return { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Générique' };
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Modèles de réponse
          </h2>
          <p className="text-sm text-slate-500">
            {filteredTemplates.length} modèle{filteredTemplates.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadTemplates}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            onClick={() => {
              setIsCreating(true);
              setEditingTemplate({
                id: '',
                name: '',
                type: 'generic',
                content: '',
                tags: [],
                usageCount: 0,
                isFavorite: false,
                createdAt: new Date().toLocaleDateString('fr-FR'),
              });
            }}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau modèle
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un modèle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                     bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['all', 'validation', 'rejection', 'info_request', 'generic'] as const).map(type => {
            const config = type === 'all' 
              ? { label: 'Tous', color: 'text-slate-600', bg: '' }
              : getTypeConfig(type);
            
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  filterType === type
                    ? "bg-white dark:bg-slate-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={e => setShowFavoritesOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-orange-500"
          />
          <Star className={cn("w-4 h-4", showFavoritesOnly ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
          <span className="text-slate-500">Favoris</span>
        </label>
      </div>

      {/* Liste des templates */}
      <div className="grid gap-3">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun modèle trouvé</p>
          </div>
        ) : (
          filteredTemplates.map(template => {
            const config = getTypeConfig(template.type);
            const Icon = config.icon;
            const isCopied = copiedId === template.id;

            return (
              <Card 
                key={template.id}
                className={cn(
                  "overflow-hidden transition-all hover:shadow-md cursor-pointer",
                  template.isFavorite && "ring-1 ring-amber-500/30"
                )}
                onClick={() => handleSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-xl", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{template.name}</span>
                        {template.isFavorite && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <Badge variant="default" className={cn("text-[10px]", config.bg, config.color)}>
                          {config.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {template.content}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          {template.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          Utilisé {template.usageCount}x
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleFavorite(template.id)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          template.isFavorite 
                            ? "text-amber-500 hover:bg-amber-500/10" 
                            : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        title={template.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star className={cn("w-4 h-4", template.isFavorite && "fill-current")} />
                      </button>
                      
                      <button
                        onClick={() => handleCopy(template)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isCopied
                            ? "text-emerald-500 bg-emerald-500/10"
                            : "text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        title="Copier le contenu"
                      >
                        {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => { setEditingTemplate(template); setIsCreating(false); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal édition/création */}
      <TemplateEditModal
        template={editingTemplate}
        isCreating={isCreating}
        onSave={handleSaveTemplate}
        onClose={() => { setEditingTemplate(null); setIsCreating(false); }}
      />
    </div>
  );
}

// ============================================
// MODAL ÉDITION
// ============================================

function TemplateEditModal({
  template,
  isCreating,
  onSave,
  onClose,
}: {
  template: Template | null;
  isCreating: boolean;
  onSave: (template: Template) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Template | null>(template);
  const [newTag, setNewTag] = useState('');

  // Sync avec template prop
  useState(() => {
    if (template) setFormData(template);
  });

  if (!template || !formData) return null;

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.content.trim()) return;
    onSave(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => prev ? { ...prev, tags: [...prev.tags, newTag.trim()] } : null);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
  };

  return (
    <FluentModal
      open={true}
      title={isCreating ? 'Nouveau modèle' : 'Modifier le modèle'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom du modèle *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                     bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            placeholder="Ex: Validation congé standard"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => prev ? { ...prev, type: e.target.value as TemplateType } : null)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                     bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="validation">✅ Validation</option>
            <option value="rejection">❌ Rejet</option>
            <option value="info_request">⚠️ Demande d&apos;information</option>
            <option value="generic">📄 Générique</option>
          </select>
        </div>

        {/* Contenu */}
        <div>
          <label className="block text-sm font-medium mb-1">Contenu *</label>
          <textarea
            value={formData.content}
            onChange={e => setFormData(prev => prev ? { ...prev, content: e.target.value } : null)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 
                     bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30
                     resize-none"
            rows={6}
            placeholder="Écrivez le contenu du modèle... Utilisez {VARIABLE} pour les champs dynamiques."
          />
          <p className="text-xs text-slate-500 mt-1">
            Variables disponibles: {'{ID_DEMANDE}'}, {'{SOLDE}'}, {'{MONTANT}'}, {'{DELAI}'}, {'{DOCUMENTS_MANQUANTS}'}
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
              >
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                       bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="Ajouter un tag..."
            />
            <Button variant="secondary" size="sm" onClick={addTag}>
              <Tag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.content.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isCreating ? 'Créer' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

