/**
 * Serveur WebSocket Simple pour Blocked
 * Usage: node scripts/websocket-server.js
 * 
 * Ce serveur simule des événements temps réel pour le module Blocked
 */

const WebSocket = require('ws');

// Configuration
const PORT = 3001;
const PING_INTERVAL = 30000; // 30 secondes
const EVENT_INTERVAL = 10000; // Envoyer un événement toutes les 10 secondes

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 Serveur WebSocket Blocked démarré sur ws://localhost:${PORT}`);
console.log('📡 En attente de connexions...\n');

// Compteur de clients
let clientCount = 0;

// Liste des événements à simuler
const SAMPLE_EVENTS = [
  {
    type: 'blocked:created',
    payload: {
      id: 'BLK-' + Date.now(),
      subject: 'Nouveau blocage - Validation facture en attente',
      impact: 'high',
      bureau: 'DAKAR',
      status: 'pending'
    }
  },
  {
    type: 'blocked:resolved',
    payload: {
      id: 'BLK-12345',
      subject: 'Blocage résolu - Signature obtenue',
      status: 'resolved'
    }
  },
  {
    type: 'blocked:escalated',
    payload: {
      id: 'BLK-67890',
      subject: 'Blocage escaladé - Retard de 5 jours',
      escalatedTo: 'DIRECTION',
      impact: 'critical'
    }
  },
  {
    type: 'stats:updated',
    payload: {
      total: Math.floor(Math.random() * 50) + 30,
      critical: Math.floor(Math.random() * 10) + 5,
      resolved: Math.floor(Math.random() * 15) + 10,
      timestamp: new Date().toISOString()
    }
  },
  {
    type: 'blocked:commented',
    payload: {
      dossierId: 'BLK-12345',
      authorName: 'Jean Dupont',
      content: 'Dossier transféré au service comptabilité'
    }
  }
];

// Gérer les connexions
wss.on('connection', (ws, req) => {
  const clientId = ++clientCount;
  const clientIp = req.socket.remoteAddress;
  
  console.log(`✅ [Client ${clientId}] Connecté depuis ${clientIp}`);
  console.log(`📊 Clients actifs: ${wss.clients.size}\n`);

  // Envoyer un message de bienvenue
  const welcomeMessage = {
    type: 'connection',
    payload: {
      status: 'connected',
      message: 'Bienvenue sur le serveur WebSocket Blocked',
      clientId,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  try {
    ws.send(JSON.stringify(welcomeMessage));
    console.log(`📤 [Client ${clientId}] Message de bienvenue envoyé`);
  } catch (error) {
    console.error(`❌ [Client ${clientId}] Erreur envoi bienvenue:`, error.message);
  }

  // Gérer les messages reçus
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📥 [Client ${clientId}] Message reçu:`, data.type);

      // Répondre aux pings
      if (data.type === 'ping') {
        const pong = {
          type: 'pong',
          payload: {
            timestamp: Date.now(),
            latency: Date.now() - (data.payload?.timestamp || Date.now())
          },
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(pong));
        console.log(`🏓 [Client ${clientId}] Pong envoyé (latency: ${pong.payload.latency}ms)`);
      }
    } catch (error) {
      console.error(`❌ [Client ${clientId}] Erreur parsing message:`, error.message);
    }
  });

  // Gérer la déconnexion
  ws.on('close', (code, reason) => {
    console.log(`❌ [Client ${clientId}] Déconnecté (code: ${code}, reason: ${reason || 'N/A'})`);
    console.log(`📊 Clients actifs: ${wss.clients.size}\n`);
  });

  // Gérer les erreurs
  ws.on('error', (error) => {
    console.error(`⚠️ [Client ${clientId}] Erreur WebSocket:`, error.message);
  });

  // Heartbeat - vérifier si le client est toujours là
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Heartbeat - vérifier les connexions mortes
const heartbeat = setInterval(() => {
  let deadClients = 0;
  
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      deadClients++;
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });

  if (deadClients > 0) {
    console.log(`🧹 ${deadClients} connexion(s) morte(s) nettoyée(s)`);
  }
}, PING_INTERVAL);

// Diffuser des événements périodiquement
const broadcastEvents = setInterval(() => {
  if (wss.clients.size === 0) {
    return; // Pas de clients, pas d'événements
  }

  // Choisir un événement aléatoire
  const event = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
  const message = {
    ...event,
    timestamp: new Date().toISOString()
  };

  let successCount = 0;
  let errorCount = 0;

  // Diffuser à tous les clients
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        successCount++;
      } catch (error) {
        console.error('❌ Erreur diffusion:', error.message);
        errorCount++;
      }
    }
  });

  console.log(`📡 Événement diffusé: ${event.type} → ${successCount} client(s) ✅ ${errorCount > 0 ? `| ${errorCount} erreur(s) ❌` : ''}`);
}, EVENT_INTERVAL);

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur WebSocket...');
  
  clearInterval(heartbeat);
  clearInterval(broadcastEvents);
  
  wss.clients.forEach((ws) => {
    ws.close(1000, 'Server shutdown');
  });
  
  wss.close(() => {
    console.log('✅ Serveur WebSocket arrêté proprement');
    process.exit(0);
  });
});

// Gérer les erreurs du serveur
wss.on('error', (error) => {
  console.error('❌ Erreur serveur WebSocket:', error.message);
});

// Afficher des stats toutes les 30 secondes
setInterval(() => {
  console.log(`\n📊 === STATISTIQUES ===`);
  console.log(`   Clients connectés: ${wss.clients.size}`);
  console.log(`   Total connexions: ${clientCount}`);
  console.log(`   Uptime: ${Math.floor(process.uptime())}s`);
  console.log(`   Mémoire: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`========================\n`);
}, 30000);

