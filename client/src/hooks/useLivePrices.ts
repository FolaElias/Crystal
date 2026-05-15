import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PriceMap } from '@crystal/shared';

const SERVER_URL = 'http://localhost:5000';

export function useLivePrices(): { prices: PriceMap; connected: boolean } {
  const [prices, setPrices] = useState<PriceMap>({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('price:update', (data: PriceMap) => setPrices(data));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { prices, connected };
}
