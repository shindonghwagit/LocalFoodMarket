import { useEffect, useState, useCallback } from 'react';

const SSE_BASE = 'http://localhost:8080/api/v1';

export interface FarmOrderToast {
  id: number;
  orderId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
}

export function useFarmSSE() {
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<FarmOrderToast[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const es = new EventSource(`${SSE_BASE}/sse/farm?token=${encodeURIComponent(token)}`);

    es.onopen = () => setConnected(true);

    es.addEventListener('new-order', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const toast: FarmOrderToast = { id: Date.now(), ...data };
        setToasts((prev) => [toast, ...prev.slice(0, 4)]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 6000);
      } catch {}
    });

    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      setConnected(false);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { connected, toasts, dismiss };
}
