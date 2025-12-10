import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  id?: string;
  isStreaming?: boolean;
}

interface UseWebSocketChatOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (message: Message) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Custom hook for WebSocket-based real-time chat
 * Handles streaming messages, reconnection, and message state
 */
export function useWebSocketChat(options: UseWebSocketChatOptions) {
  const {
    url,
    enabled = true,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle streaming chunk
          if (data.type === 'stream_start') {
            setIsStreaming(true);
            setStreamingMessage('');
          } else if (data.type === 'stream_chunk') {
            setStreamingMessage((prev) => prev + data.content);
          } else if (data.type === 'stream_end') {
            setIsStreaming(false);
            const finalMessage: Message = {
              role: 'assistant',
              content: streamingMessage + (data.content || ''),
              timestamp: data.timestamp,
              id: data.id,
            };
            onMessage?.(finalMessage);
            setStreamingMessage('');
          } else if (data.type === 'message') {
            // Complete message received
            const message: Message = {
              role: data.role,
              content: data.content,
              timestamp: data.timestamp,
              id: data.id,
            };
            onMessage?.(message);
          } else if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, enabled, onConnect, onMessage, onError, onDisconnect, streamingMessage]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((message: string, metadata?: Record<string, any>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_message',
        content: message,
        timestamp: new Date().toISOString(),
        ...metadata,
      }));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  /**
   * Connect on mount, disconnect on unmount
   */
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]);

  return {
    isConnected,
    isStreaming,
    streamingMessage,
    sendMessage,
    connect,
    disconnect,
  };
}
