import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface WebSocketHookOptions {
  startTime: string;
  endTime: string;
  tokens: string[];
  onMessage?: (data: any) => void;
}

interface WSState {
  socket: WebSocket | null;
  connected: boolean;
  error: Error | null;
  lastMessage: any | null;
}

export const useWebSocket = ({ startTime, endTime, tokens, onMessage }: WebSocketHookOptions) => {
  console.log('[useWebSocket] Hook params:', { startTime, endTime, tokens });
  const [state, setState] = useState<WSState>({
    socket: null,
    connected: false,
    error: null,
    lastMessage: null,
  });

  // Generate WebSocket URL with params
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const baseUrl = `wss://crypto-pulse-1-546660857332.us-central1.run.app/ws`;
    return baseUrl;
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    console.log('[useWebSocket] connect() called');
    if (state.socket) {
      state.socket.close();
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log('[useWebSocket] connecting to:', wsUrl);
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('[useWebSocket] WebSocket OPEN');
        setState(prev => ({ ...prev, socket, connected: true, error: null }));
      };
      
      socket.onmessage = (event) => {
        console.log('[useWebSocket] Received message:', event.data);
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onerror = (event) => {
        console.log('[useWebSocket] WebSocket ERROR event:', event);
        const error = new Error('WebSocket error');
        setState(prev => ({ ...prev, error, connected: false }));
        toast.error('WebSocket connection error');
        console.error('WebSocket error:', event);
      };
      
      socket.onclose = (event) => {
        console.log('[useWebSocket] WebSocket CLOSED', event.code, event.reason);
        setState(prev => ({ ...prev, socket: null, connected: false }));
      };
      
      setState(prev => ({ ...prev, socket }));
    } catch (error) {
      if (error instanceof Error) {
        setState(prev => ({ ...prev, error, connected: false }));
        toast.error('WebSocket connection failed');
        console.error('WebSocket connection error:', error);
      }
    }
  }, [getWebSocketUrl, onMessage, state.socket]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (state.socket) {
      state.socket.close();
      setState(prev => ({ ...prev, socket: null, connected: false }));
    }
  }, [state.socket]);

  // Send message to WebSocket
  const send = useCallback((data: any) => {
    if (state.socket && state.connected) {
      state.socket.send(JSON.stringify(data));
    } else {
      toast.error('WebSocket not connected');
    }
  }, [state.socket, state.connected]);

  // Connect on mount, reconnect when parameters change
  useEffect(() => {
    console.log('[useWebSocket] useEffect mount params changed');
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, startTime, endTime, tokens.join(',')]);

  // Set up automatic refresh every 2 minutes
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    if (state.connected) {
      refreshInterval = setInterval(() => {
        // Either send a control message or reconnect
        disconnect();
        connect();
      }, 2 * 60 * 1000); // 2 minutes
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [state.connected, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    send,
  };
};