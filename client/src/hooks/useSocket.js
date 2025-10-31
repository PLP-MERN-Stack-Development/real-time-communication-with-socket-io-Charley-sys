import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (serverUrl = 'http://localhost:5000') => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to hospital server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from hospital server');
    });

    setSocket(socketRef.current);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  return { socket, isConnected };
};