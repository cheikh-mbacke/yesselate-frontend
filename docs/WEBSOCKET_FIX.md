/**
 * ====================================================================
 * FIX: Désactiver WebSocket en développement
 * Le WebSocket des alertes essaie de se connecter mais le serveur
 * n'est pas encore implémenté. On le désactive en dev.
 * ====================================================================
 */

// Dans src/lib/api/websocket/useAlertsWebSocket.ts
// Ligne 169-174, modifier le connect() :

const connect = useCallback(() => {
  // 🔧 FIX: Désactiver WebSocket en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ WebSocket désactivé en développement');
    return;
  }

  // En production, utiliser le vrai WebSocket
  const wsUrl = `wss://${window.location.host}/api/alerts/stream`;
  
  console.log('🔌 Connecting to WebSocket:', wsUrl);

  try {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    // ... reste du code
  } catch (error) {
    console.error('❌ WebSocket error:', error);
  }
}, [handleMessage]);

/**
 * ====================================================================
 * Alternative : Mock WebSocket pour le développement
 * ====================================================================
 */

const connect = useCallback(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Using Mock WebSocket in development');
    
    // Simuler une connexion réussie
    setIsConnected(true);
    
    // Optionnel : Simuler des notifications toutes les 30 secondes
    const mockInterval = setInterval(() => {
      const mockNotification: AlertNotification = {
        type: 'alert.created',
        alert: {
          id: `MOCK-${Date.now()}`,
          title: 'Mock Alert - WebSocket simulé',
          severity: 'info',
          type: 'test',
          bureau: 'DEV',
        },
        timestamp: new Date().toISOString(),
      };
      
      handleMessage({ data: JSON.stringify(mockNotification) } as MessageEvent);
    }, 30000);
    
    return () => clearInterval(mockInterval);
  }

  // Production code...
}, [handleMessage]);

