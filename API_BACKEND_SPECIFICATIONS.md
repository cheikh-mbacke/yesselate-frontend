# 🔌 API Backend - Spécifications Tickets-Clients BTP

## 📋 RÉSUMÉ

Ce document spécifie toutes les routes API nécessaires pour le module **Tickets-Clients BTP**.

**Base URL:** `/api/tickets-client`

---

## 🎯 ENDPOINTS PRINCIPAUX

### 1. Liste des tickets

```http
GET /api/tickets-client
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Numéro de page (défaut: 1) |
| `limit` | number | Résultats par page (défaut: 20) |
| `status` | string | Filtrer par statut |
| `priority` | string | Filtrer par priorité |
| `categorie` | string | Filtrer par catégorie |
| `clientId` | string | Filtrer par client |
| `chantierId` | string | Filtrer par chantier |
| `responsable` | string | Filtrer par responsable |
| `search` | string | Recherche texte libre |
| `dateFrom` | string | Date de début (ISO 8601) |
| `dateTo` | string | Date de fin (ISO 8601) |
| `slaStatus` | string | Filtrer par SLA (ok/warning/breach) |

**Response:**

```json
{
  "tickets": [
    {
      "id": "uuid",
      "numero": "TC-2025-001",
      "titre": "Problème de sécurité sur échafaudages",
      "description": "Description complète...",
      "status": "nouveau",
      "priority": "critique",
      "categorie": "securite",
      "clientId": "uuid",
      "clientNom": "SARL Construction Plus",
      "chantierId": "uuid",
      "chantierNom": "Résidence Les Jardins",
      "responsable": "Jean Dupont",
      "dateCreation": "2025-01-10T10:00:00Z",
      "dateModification": "2025-01-10T14:30:00Z",
      "dateLimite": "2025-01-12T18:00:00Z",
      "slaStatus": "warning",
      "tags": ["urgent", "chantier_a"],
      "nbMessages": 5,
      "nbPieceJointes": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Status Codes:**
- `200 OK` - Succès
- `400 Bad Request` - Paramètres invalides
- `401 Unauthorized` - Non authentifié
- `500 Internal Server Error` - Erreur serveur

---

### 2. Détail d'un ticket

```http
GET /api/tickets-client/:id
```

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | ID du ticket (UUID ou numéro TC-XXX) |

**Response:**

```json
{
  "id": "uuid",
  "numero": "TC-2025-001",
  "titre": "Problème de sécurité",
  "description": "Description détaillée...",
  "status": "en_cours",
  "priority": "critique",
  "categorie": "securite",
  "client": {
    "id": "uuid",
    "nom": "SARL Construction Plus",
    "type": "entreprise",
    "email": "contact@construction-plus.sn",
    "telephone": "+221 33 824 56 78"
  },
  "chantier": {
    "id": "uuid",
    "nom": "Résidence Les Jardins",
    "type": "construction",
    "adresse": "Avenue Bourguiba",
    "ville": "Dakar"
  },
  "responsable": "Jean Dupont",
  "dateCreation": "2025-01-10T10:00:00Z",
  "dateModification": "2025-01-10T14:30:00Z",
  "dateLimite": "2025-01-12T18:00:00Z",
  "slaStatus": "warning",
  "slaDetails": {
    "tempsEcoule": "2 jours 4h",
    "tempsRestant": "10h",
    "pourcentage": 83
  },
  "tags": ["urgent", "chantier_a"],
  "messages": [
    {
      "id": "uuid",
      "auteur": "Jean Dupont",
      "contenu": "Nous avons envoyé une équipe",
      "date": "2025-01-10T14:30:00Z",
      "pieceJointes": []
    }
  ],
  "pieceJointes": [
    {
      "id": "uuid",
      "nom": "photo_echafaudage.jpg",
      "type": "image/jpeg",
      "taille": 2048576,
      "url": "https://cdn.example.com/files/...",
      "dateUpload": "2025-01-10T10:15:00Z"
    }
  ],
  "historique": [
    {
      "id": "uuid",
      "action": "status_change",
      "description": "Statut changé de 'nouveau' à 'en_cours'",
      "auteur": "Jean Dupont",
      "date": "2025-01-10T11:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Succès
- `404 Not Found` - Ticket introuvable
- `401 Unauthorized` - Non authentifié

---

### 3. Créer un ticket

```http
POST /api/tickets-client
```

**Request Body:**

```json
{
  "titre": "Problème de sécurité",
  "description": "Description détaillée du problème...",
  "priority": "critique",
  "categorie": "securite",
  "clientId": "uuid",
  "chantierId": "uuid",
  "tags": ["urgent"]
}
```

**Response:**

```json
{
  "id": "uuid",
  "numero": "TC-2025-151",
  "message": "Ticket créé avec succès"
}
```

**Status Codes:**
- `201 Created` - Ticket créé
- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Non authentifié

---

### 4. Mettre à jour un ticket

```http
PATCH /api/tickets-client/:id
```

**Request Body:**

```json
{
  "titre": "Nouveau titre",
  "description": "Nouvelle description",
  "status": "en_cours",
  "priority": "haute",
  "responsable": "Marie Martin",
  "tags": ["urgent", "suivi"]
}
```

**Response:**

```json
{
  "id": "uuid",
  "message": "Ticket mis à jour avec succès"
}
```

**Status Codes:**
- `200 OK` - Mis à jour
- `404 Not Found` - Ticket introuvable
- `400 Bad Request` - Données invalides

---

### 5. Exécuter une action sur un ticket

```http
POST /api/tickets-client/:id/action
```

**Request Body:**

```json
{
  "action": "affecter",
  "data": {
    "responsable": "Jean Dupont"
  }
}
```

**Actions disponibles:**

| Action | Data |
|--------|------|
| `affecter` | `{ responsable: string }` |
| `escalader` | `{ niveau: number }` |
| `cloturer` | `{ motif: string }` |
| `reopen` | `{ motif: string }` |
| `changer_priorite` | `{ priority: string }` |
| `ajouter_tags` | `{ tags: string[] }` |

**Response:**

```json
{
  "success": true,
  "message": "Action exécutée avec succès"
}
```

---

### 6. Ajouter un message

```http
POST /api/tickets-client/:id/messages
```

**Request Body:**

```json
{
  "contenu": "Nous avons envoyé une équipe sur place",
  "auteur": "Jean Dupont",
  "pieceJointes": ["file-uuid-1", "file-uuid-2"]
}
```

**Response:**

```json
{
  "id": "message-uuid",
  "message": "Message ajouté avec succès"
}
```

---

### 7. Récupérer les messages

```http
GET /api/tickets-client/:id/messages
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Numéro de page |
| `limit` | number | Messages par page |

**Response:**

```json
{
  "messages": [
    {
      "id": "uuid",
      "auteur": "Jean Dupont",
      "contenu": "Message...",
      "date": "2025-01-10T14:30:00Z",
      "pieceJointes": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

---

### 8. Upload de fichier

```http
POST /api/tickets-client/:id/attachments
```

**Request:** `multipart/form-data`

```
file: File (max 10MB)
description: string (optionnel)
```

**Response:**

```json
{
  "id": "file-uuid",
  "nom": "photo.jpg",
  "type": "image/jpeg",
  "taille": 2048576,
  "url": "https://cdn.example.com/files/...",
  "message": "Fichier uploadé avec succès"
}
```

**Status Codes:**
- `201 Created` - Fichier uploadé
- `400 Bad Request` - Fichier invalide ou trop gros
- `413 Payload Too Large` - Fichier > 10MB

---

### 9. Statistiques

```http
GET /api/tickets-client/stats
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `dateFrom` | string | Date début |
| `dateTo` | string | Date fin |
| `clientId` | string | Filtrer par client |
| `chantierId` | string | Filtrer par chantier |

**Response:**

```json
{
  "totaux": {
    "total": 150,
    "nouveau": 12,
    "en_cours": 34,
    "en_attente": 8,
    "resolu": 96
  },
  "priorites": {
    "critique": 3,
    "haute": 9,
    "normale": 118,
    "basse": 20
  },
  "sla": {
    "ok": 120,
    "warning": 25,
    "breach": 5
  },
  "categories": {
    "securite": 15,
    "qualite": 28,
    "delais": 45,
    "travaux": 62
  },
  "tendances": [
    {
      "date": "2025-01-10",
      "nouveaux": 5,
      "resolus": 12
    }
  ]
}
```

---

### 10. Export

```http
POST /api/tickets-client/export
```

**Request Body:**

```json
{
  "format": "csv",
  "filters": {
    "status": "en_cours",
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-31"
  },
  "fields": ["numero", "titre", "status", "priority", "clientNom"]
}
```

**Formats supportés:** `csv`, `excel`, `json`, `pdf`

**Response:**

```json
{
  "url": "https://cdn.example.com/exports/tickets-2025-01-10.csv",
  "expiresAt": "2025-01-11T00:00:00Z"
}
```

---

### 11. Recherche

```http
GET /api/tickets-client/search
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Recherche texte (titre, description, numéro) |
| `limit` | number | Résultats max (défaut: 10) |

**Response:**

```json
{
  "results": [
    {
      "id": "uuid",
      "numero": "TC-2025-001",
      "titre": "Problème de sécurité",
      "status": "en_cours",
      "priority": "critique",
      "score": 0.95
    }
  ],
  "total": 5
}
```

---

### 12. Mise à jour en masse

```http
POST /api/tickets-client/bulk
```

**Request Body:**

```json
{
  "ticketIds": ["uuid-1", "uuid-2", "uuid-3"],
  "action": "affecter",
  "data": {
    "responsable": "Jean Dupont"
  }
}
```

**Response:**

```json
{
  "success": true,
  "updated": 3,
  "failed": 0,
  "message": "3 tickets mis à jour avec succès"
}
```

---

## 👥 GESTION CLIENTS

### Liste des clients

```http
GET /api/clients
```

**Response:**

```json
{
  "clients": [
    {
      "id": "uuid",
      "nom": "SARL Construction Plus",
      "type": "entreprise",
      "email": "contact@construction-plus.sn",
      "telephone": "+221 33 824 56 78",
      "adresse": "Avenue Bourguiba",
      "ville": "Dakar",
      "nbTickets": 24,
      "nbTicketsOuverts": 3,
      "nbChantiers": 2,
      "chiffreAffaires": 850000000,
      "noteSatisfaction": 4.5
    }
  ]
}
```

### Créer un client

```http
POST /api/clients
```

**Request Body:**

```json
{
  "nom": "Entreprise XYZ",
  "type": "entreprise",
  "email": "contact@xyz.com",
  "telephone": "+221 XX XXX XX XX",
  "adresse": "Adresse complète",
  "ville": "Dakar"
}
```

---

## 🏗️ GESTION CHANTIERS

### Liste des chantiers

```http
GET /api/chantiers
```

**Response:**

```json
{
  "chantiers": [
    {
      "id": "uuid",
      "nom": "Résidence Les Jardins",
      "type": "construction",
      "clientId": "uuid",
      "clientNom": "SARL Construction Plus",
      "adresse": "Avenue Bourguiba",
      "ville": "Dakar",
      "coordonnees": {
        "lat": 14.6937,
        "lng": -17.4441
      },
      "statut": "en_cours",
      "dateDebut": "2025-06-15",
      "dateFin": "2026-12-31",
      "budget": 450000000,
      "avancement": 65,
      "responsable": "Ing. Mamadou Diop",
      "nbTickets": 12,
      "nbTicketsOuverts": 3
    }
  ]
}
```

### Créer un chantier

```http
POST /api/chantiers
```

**Request Body:**

```json
{
  "nom": "Nouveau chantier",
  "type": "construction",
  "clientId": "uuid",
  "adresse": "Adresse",
  "ville": "Dakar",
  "dateDebut": "2025-03-01",
  "dateFin": "2026-12-31",
  "budget": 500000000,
  "responsable": "Ing. Jean Dupont"
}
```

---

## 🔐 AUTHENTIFICATION

Toutes les routes nécessitent un token JWT dans le header:

```http
Authorization: Bearer <token>
```

### Login

```http
POST /api/auth/login
```

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nom": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "role": "admin"
  }
}
```

---

## 📡 WEBSOCKET

### Connexion

```
ws://localhost:3000/ws/tickets-client
```

### Événements envoyés par le serveur

```json
{
  "type": "ticket_created",
  "data": {
    "id": "uuid",
    "numero": "TC-2025-151",
    "titre": "Nouveau ticket"
  }
}
```

```json
{
  "type": "ticket_updated",
  "data": {
    "id": "uuid",
    "changes": {
      "status": "en_cours"
    }
  }
}
```

```json
{
  "type": "message_added",
  "data": {
    "ticketId": "uuid",
    "message": {
      "auteur": "Jean Dupont",
      "contenu": "Nouveau message"
    }
  }
}
```

---

## 🗄️ SCHEMA BASE DE DONNÉES

### Table: tickets

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  categorie VARCHAR(50) NOT NULL,
  client_id UUID REFERENCES clients(id),
  chantier_id UUID REFERENCES chantiers(id),
  responsable VARCHAR(255),
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW(),
  date_limite TIMESTAMP,
  sla_status VARCHAR(20),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: clients

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse TEXT,
  ville VARCHAR(100),
  note_satisfaction DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: chantiers

```sql
CREATE TABLE chantiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  client_id UUID REFERENCES clients(id),
  adresse TEXT,
  ville VARCHAR(100),
  coordonnees JSONB,
  statut VARCHAR(50) NOT NULL,
  date_debut DATE,
  date_fin DATE,
  budget BIGINT,
  avancement INTEGER,
  responsable VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  auteur VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: piece_jointes

```sql
CREATE TABLE piece_jointes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  taille INTEGER,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: historique

```sql
CREATE TABLE historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  auteur VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 TECHNOLOGIES RECOMMANDÉES

### Backend
- **Node.js** avec Express ou NestJS
- **PostgreSQL** pour la base de données
- **Prisma** comme ORM
- **Socket.io** pour WebSocket
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **AWS S3** ou **Cloudinary** pour le stockage

### Déploiement
- **Docker** pour containerisation
- **Nginx** comme reverse proxy
- **PM2** pour le process management
- **Redis** pour le cache

---

## 📝 EXEMPLE IMPLEMENTATION (NestJS)

### Controller

```typescript
@Controller('api/tickets-client')
@UseGuards(JwtAuthGuard)
export class TicketsClientController {
  constructor(private readonly ticketsService: TicketsClientService) {}

  @Get()
  async getTickets(@Query() filters: TicketFilters) {
    return this.ticketsService.getTickets(filters);
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  @Post()
  async createTicket(@Body() data: CreateTicketDto) {
    return this.ticketsService.createTicket(data);
  }

  @Patch(':id')
  async updateTicket(@Param('id') id: string, @Body() data: UpdateTicketDto) {
    return this.ticketsService.updateTicket(id, data);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.ticketsService.uploadAttachment(id, file);
  }
}
```

### Service

```typescript
@Injectable()
export class TicketsClientService {
  constructor(private prisma: PrismaService) {}

  async getTickets(filters: TicketFilters) {
    const where: Prisma.TicketWhereInput = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.clientId) where.clientId = filters.clientId;

    const tickets = await this.prisma.ticket.findMany({
      where,
      include: {
        client: true,
        chantier: true,
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    const total = await this.prisma.ticket.count({ where });

    return {
      tickets,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }
}
```

---

## ✅ CHECKLIST IMPLÉMENTATION

- [ ] Setup projet NestJS/Express
- [ ] Configuration PostgreSQL + Prisma
- [ ] Migrations base de données
- [ ] Authentication JWT
- [ ] Routes CRUD tickets
- [ ] Routes clients et chantiers
- [ ] Upload fichiers S3/Cloudinary
- [ ] WebSocket avec Socket.io
- [ ] Système de notifications
- [ ] Envoi d'emails
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Documentation Swagger
- [ ] Déploiement

---

**Version:** 1.0.0  
**Date:** 10 janvier 2026

