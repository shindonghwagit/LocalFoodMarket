import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PaymentPreparation } from '../api/payment';
import { createTossWidgets, type TossWidgets } from '../lib/tossPayments';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PAYMENT_STORAGE_KEY = 'pendingPointPayment';

export default function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [preparation, setPreparation] = useState<PaymentPreparation | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const widgets = useRef<TossWidgets | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // React Strict Mode 개발 환경에서는 effect가 두 번 실행된다.
    // 토스 위젯을 중복 생성하면 화면의 선택 상태와 결제 요청 인스턴스가 달라진다.
    if (initialized.current) return;
    initialized.current = true;

    const saved = sessionStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!saved) {
      navigate('/mypage', { replace: true });
      return;
    }

    try {
      const payment = JSON.parse(saved) as PaymentPreparation;
      setPreparation(payment);
      createTossWidgets(payment)
        .then((instance) => {
          widgets.current = instance;
          return Promise.all([
            instance.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
            instance.renderAgreement({ selector: '#payment-agreement', variantKey: 'AGREEMENT' }),
          ]);
        })
        .then(() => {
          setReady(true);
        })
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '결제 화면을 불러오지 못했어요.'));
    } catch {
      sessionStorage.removeItem(PAYMENT_STORAGE_KEY);
      navigate('/mypage', { replace: true });
    }
  }, [navigate]);

  const requestPayment = async () => {
    if (!preparation || !widgets.current) return;
    setError('');
    try {
      const origin = window.location.origin;
      await widgets.current.requestPayment({
        orderId: preparation.orderId,
        orderName: '로컬푸드마켓 포인트 충전',
        successUrl: `${origin}/payments/success`,
        failUrl: `${origin}/payments/fail`,
        customerEmail: user?.email,
      });
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : '결제 요청에 실패했어요.');
    }
  };

  if (!preparation) return null;

  return (
    <main className="max-w-2xl mx-auto px-md py-xl">
      <Link to="/mypage" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← 포인트 페이지로 돌아가기</Link>
      <h1 className="font-headline-md text-headline-md text-on-surface mt-lg mb-sm">포인트 충전 결제</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg">{preparation.amount.toLocaleString()}원을 결제하면 같은 금액의 포인트가 충전돼요.</p>
      {!ready && !error && <div className="flex justify-center py-xl"><LoadingSpinner /></div>}
      <div id="payment-method" />
      <div id="payment-agreement" />
      {error && <p className="mt-md font-label-sm text-label-sm text-error">{error}</p>}
      <button onClick={requestPayment} disabled={!ready} className="mt-lg w-full min-h-12 rounded-xl bg-primary text-on-primary font-body-lg disabled:opacity-50">
        {preparation.amount.toLocaleString()}원 결제하기
      </button>
    </main>
  );
}
