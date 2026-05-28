import { useEffect, useState } from 'react';

const SSE_BASE = import.meta.env.VITE_API_BASE_URL;

export function useStockSSE(productId: number, initialStock: number) {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  useEffect(() => {
    if (!productId) return;

    const es = new EventSource(`${SSE_BASE}/sse/products/${productId}/stock`);

    es.addEventListener('stock-update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.stock === 'number') setStock(data.stock);
      } catch {}
    });

    es.onerror = () => es.close();

    return () => es.close();
  }, [productId]);

  return stock;
}
