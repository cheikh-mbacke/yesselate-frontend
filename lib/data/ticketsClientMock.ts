/**
 * Données mockées pour les Tickets Clients
 * ========================================
 * 
 * Génération de données de démonstration réalistes
 */

import type { Ticket, TicketStats, TicketMessage, TicketCategory, TicketStatus, TicketPriority } from '@/lib/api/ticketsClientAPI';

// ============================================
// GÉNÉRATEURS
// ============================================

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString();
}

// ============================================
// DONNÉES DE BASE
// ============================================

const CLIENTS = [
  { id: 'C001', nom: 'SARL Construction Plus' },
  { id: 'C002', nom: 'Entreprise Bâtiment Moderne' },
  { id: 'C003', nom: 'Groupe Immobilier Dakar' },
  { id: 'C004', nom: 'Société Travaux Publics' },
  { id: 'C005', nom: 'Cabinet Architecture & Design' },
];

const CHANTIERS = [
  { id: 'CH001', nom: 'Résidence Les Jardins', clientId: 'C001' },
  { id: 'CH002', nom: 'Centre Commercial Nord', clientId: 'C002' },
  { id: 'CH003', nom: 'Immeuble Horizon', clientId: 'C003' },
  { id: 'CH004', nom: 'Lotissement Colline', clientId: 'C001' },
  { id: 'CH005', nom: 'Complexe Sportif Municipal', clientId: 'C004' },
  { id: 'CH006', nom: 'Rénovation Hôtel de Ville', clientId: 'C005' },
];

const CATEGORIES: Array<{ id: TicketCategory; label: string }> = [
  { id: 'reclamation_qualite', label: 'Réclamation qualité' },
  { id: 'retard_livraison', label: 'Retard de livraison' },
  { id: 'facturation', label: 'Problème de facturation' },
  { id: 'demande_modification', label: 'Demande de modification' },
  { id: 'incident_chantier', label: 'Incident sur chantier' },
  { id: 'securite', label: 'Problème de sécurité' },
  { id: 'garantie', label: 'Demande de garantie' },
  { id: 'information', label: 'Demande d\'information' },
];

const TITRES = [
  'Fissures apparentes sur la façade',
  'Retard de livraison du lot électricité',
  'Problème de facturation - facture en double',
  'Demande de modification des finitions',
  'Infiltration d\'eau au niveau du toit',
  'Non-conformité des matériaux livrés',
  'Demande d\'accès au chantier',
  'Problème de coordination entre corps de métier',
  'Défaut d\'étanchéité',
  'Réclamation sur la qualité des peintures',
];

const RESPONSABLES = [
  'Jean Dupont',
  'Marie Martin',
  'Pierre Diallo',
  'Sophie Ndiaye',
  'Ahmed Sow',
];

// ============================================
// GÉNÉRATEUR DE TICKETS
// ============================================

export function generateMockTickets(count: number): Ticket[] {
  const tickets: Ticket[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const numero = `TKT-${String(1000 + i).padStart(4, '0')}`;
    const client = randomFrom(CLIENTS);
    const chantier = randomFrom(CHANTIERS.filter((ch) => ch.clientId === client.id));
    const category = randomFrom(CATEGORIES);
    const priority: TicketPriority = randomFrom(['critique', 'haute', 'normale', 'basse']);
    const statusOptions: TicketStatus[] = [
      'nouveau',
      'en_cours',
      'en_attente_client',
      'en_attente_interne',
      'escalade',
      'resolu',
      'clos',
    ];
    const status = randomFrom(statusOptions);
    
    const dateCreation = randomDate(30);
    const dateCreationObj = new Date(dateCreation);
    
    // SLA selon priorité
    const slaDelaiMap: Record<TicketPriority, number> = {
      critique: 4,
      haute: 8,
      normale: 24,
      basse: 72,
    };
    const slaDelai = slaDelaiMap[priority];
    
    // Temps écoulé
    const heuresEcoulees = Math.floor((now.getTime() - dateCreationObj.getTime()) / (1000 * 60 * 60));
    const slaEcoule = Math.min(heuresEcoulees, slaDelai * 1.5);
    const slaDepassement = heuresEcoulees > slaDelai && !['resolu', 'clos', 'annule'].includes(status);

    tickets.push({
      id: `ticket-${i + 1}`,
      numero,
      titre: randomFrom(TITRES),
      description: `Description détaillée du problème signalé par le client ${client.nom} concernant le chantier ${chantier.nom}.`,
      status,
      priority,
      category: category.id,
      clientId: client.id,
      clientNom: client.nom,
      chantierId: chantier.id,
      chantierNom: chantier.nom,
      assigneA: Math.random() > 0.2 ? randomFrom(RESPONSABLES) : undefined,
      creePar: randomFrom(RESPONSABLES),
      dateCreation,
      dateModification: randomDate(10),
      dateResolution: ['resolu', 'clos'].includes(status) ? randomDate(5) : undefined,
      dateCloture: status === 'clos' ? randomDate(2) : undefined,
      slaDelai,
      slaEcoule,
      slaDepassement,
      tags: Math.random() > 0.5 ? [randomFrom(['urgent', 'important', 'suivre', 'client_vip'])] : [],
    });
  }

  return tickets;
}

// ============================================
// STATISTIQUES MOCKÉES
// ============================================

export function calculateMockStats(tickets: Ticket[]): TicketStats {
  const parCategorie = CATEGORIES.map((cat) => ({
    category: cat.id,
    count: tickets.filter((t) => t.category === cat.id).length,
  }));

  const parChantier = CHANTIERS.map((ch) => ({
    chantierId: ch.id,
    chantierNom: ch.nom,
    count: tickets.filter((t) => t.chantierId === ch.id).length,
  })).filter((x) => x.count > 0);

  const parClient = CLIENTS.map((cl) => ({
    clientId: cl.id,
    clientNom: cl.nom,
    count: tickets.filter((t) => t.clientId === cl.id).length,
  })).filter((x) => x.count > 0);

  const ticketsResolus = tickets.filter((t) => t.dateResolution);
  const tempsResolutionMoyen =
    ticketsResolus.length > 0
      ? ticketsResolus.reduce((sum, t) => {
          const creation = new Date(t.dateCreation);
          const resolution = new Date(t.dateResolution!);
          return sum + (resolution.getTime() - creation.getTime()) / (1000 * 60 * 60);
        }, 0) / ticketsResolus.length
      : 0;

  const ticketsAvecSLA = tickets.filter((t) => !['resolu', 'clos', 'annule'].includes(t.status));
  const ticketsConformesSLA = ticketsAvecSLA.filter((t) => !t.slaDepassement);
  const tauxConformiteSLA =
    ticketsAvecSLA.length > 0 ? (ticketsConformesSLA.length / ticketsAvecSLA.length) * 100 : 100;

  return {
    total: tickets.length,
    nouveau: tickets.filter((t) => t.status === 'nouveau').length,
    enCours: tickets.filter((t) => t.status === 'en_cours').length,
    enAttenteClient: tickets.filter((t) => t.status === 'en_attente_client').length,
    enAttenteInterne: tickets.filter((t) => t.status === 'en_attente_interne').length,
    escalade: tickets.filter((t) => t.status === 'escalade').length,
    resolu: tickets.filter((t) => t.status === 'resolu').length,
    clos: tickets.filter((t) => t.status === 'clos').length,
    annule: tickets.filter((t) => t.status === 'annule').length,
    horsDelaiSLA: tickets.filter((t) => t.slaDepassement).length,
    critique: tickets.filter((t) => t.priority === 'critique').length,
    haute: tickets.filter((t) => t.priority === 'haute').length,
    parCategorie,
    parChantier,
    parClient,
    tempsResolutionMoyen,
    tauxConformiteSLA,
    ts: new Date().toISOString(),
  };
}

// ============================================
// MESSAGES MOCKÉS
// ============================================

export function generateMockMessages(ticketId: string, count: number): TicketMessage[] {
  const messages: TicketMessage[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.5 ? 'interne' : 'client';
    messages.push({
      id: `msg-${i + 1}`,
      ticketId,
      auteur: type === 'interne' ? randomFrom(RESPONSABLES) : 'Client',
      message: `Message ${i + 1} concernant le ticket. Lorem ipsum dolor sit amet...`,
      type,
      dateCreation: randomDate(10),
    });
  }

  return messages.sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
}

// ============================================
// EXPORT
// ============================================

// Instance globale des tickets mockés (pour démo)
let MOCK_TICKETS: Ticket[] = [];

export function getMockTickets(): Ticket[] {
  if (MOCK_TICKETS.length === 0) {
    MOCK_TICKETS = generateMockTickets(150);
  }
  return MOCK_TICKETS;
}

export function getMockStats(): TicketStats {
  return calculateMockStats(getMockTickets());
}

export function getMockTicket(ticketId: string): Ticket | undefined {
  return getMockTickets().find((t) => t.id === ticketId || t.numero === ticketId);
}

export function getMockMessages(ticketId: string): TicketMessage[] {
  return generateMockMessages(ticketId, randomInt(3, 10));
}

