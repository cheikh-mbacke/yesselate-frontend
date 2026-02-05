/**
 * Hook pour WebSocket notifications temps réel
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface WebSocketMessage {
  type: 'new_document' | 'document_validated' | 'document_rejected' | 'urgent_alert' | 'stats_update';
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * Hook pour gérer une connexion WebSocket avec reconnexion automatique
 */
export function useWebSocket({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/validation-bc/ws',
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnect = true,
  reconnectInterval = 5000,
}: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (event) => {
        // WebSocket error events don't provide detailed error info
        // Log the event type and WebSocket state for debugging
        const readyState = ws?.readyState ?? 'unknown';
        const readyStateLabels: Record<number, string> = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED',
        };
        
        const errorInfo = {
          type: event?.type || 'error',
          readyState: typeof readyState === 'number' ? readyStateLabels[readyState] || readyState : readyState,
          url: ws?.url || url || 'unknown',
          timestamp: new Date().toISOString(),
        };
        
        // Vérifier que l'objet n'est pas vide avant de logger
        if (Object.keys(errorInfo).length > 0) {
          console.error('WebSocket error:', errorInfo);
        } else {
          console.error('WebSocket error occurred (no details available)');
        }
        
        setIsConnected(false);
        onError?.(event);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();

        // Reconnexion automatique
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    disconnect,
    reconnect: connect,
  };
}

/**
 * Hook spécialisé pour les notifications Validation-BC
 */
export function useValidationBCNotifications(onNotification: (message: WebSocketMessage) => void) {
  return useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/validation-bc/ws',
    onMessage: (message) => {
      console.log('Received notification:', message);
      onNotification(message);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    reconnect: true,
    reconnectInterval: 5000,
  });
}

