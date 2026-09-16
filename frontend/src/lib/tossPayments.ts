import type { PaymentPreparation } from '../api/payment';

export type TossWidgets = {
  setAmount: (amount: { currency: 'KRW'; value: number }) => Promise<void> | void;
  renderPaymentMethods: (params: { selector: string; variantKey?: string }) => Promise<{ destroy?: () => void }>;
  renderAgreement: (params: { selector: string; variantKey?: string }) => Promise<{ destroy?: () => void }>;
  requestPayment: (request: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail?: string;
  }) => Promise<void>;
};

type TossPaymentsFactory = (clientKey: string) => {
  widgets: (options: { customerKey: string }) => TossWidgets;
};

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

const SDK_URL = 'https://js.tosspayments.com/v2/standard';

function loadSdk(): Promise<TossPaymentsFactory> {
  if (window.TossPayments) return Promise.resolve(window.TossPayments);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-toss-payments-sdk]');
    if (existing) {
      existing.addEventListener('load', () => window.TossPayments ? resolve(window.TossPayments) : reject(new Error('결제 모듈을 불러오지 못했어요.')));
      existing.addEventListener('error', () => reject(new Error('결제 모듈을 불러오지 못했어요.')));
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.dataset.tossPaymentsSdk = 'true';
    script.onload = () => window.TossPayments ? resolve(window.TossPayments) : reject(new Error('결제 모듈을 불러오지 못했어요.'));
    script.onerror = () => reject(new Error('결제 모듈을 불러오지 못했어요.'));
    document.head.appendChild(script);
  });
}

export async function createTossWidgets(preparation: PaymentPreparation): Promise<TossWidgets> {
  const TossPayments = await loadSdk();
  const widgets = TossPayments(preparation.clientKey).widgets({ customerKey: preparation.customerKey });
  await widgets.setAmount({ currency: 'KRW', value: preparation.amount });
  return widgets;
}
