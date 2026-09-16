import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmPayment } from '../api/payment';
import { getMe } from '../api/auth';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const { setUser } = useAuthStore();
  const [message, setMessage] = useState('결제를 확인하고 있어요. 잠시만 기다려주세요.');
  const [complete, setComplete] = useState(false);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    if (!paymentKey || !orderId || !Number.isSafeInteger(amount) || amount < 1) {
      setMessage('결제 정보가 올바르지 않아요. 다시 시도해주세요.');
      return;
    }

    confirmPayment(paymentKey, orderId, amount)
      .then(async ({ data }) => {
        const me = await getMe();
        setUser(me.data.data);
        setMessage(`${data.data.amount.toLocaleString()}포인트가 충전됐어요.`);
        setComplete(true);
      })
      .catch((error: unknown) => {
        const response = error as { response?: { data?: { error?: { message?: string } } } };
        setMessage(response.response?.data?.error?.message ?? '결제 승인에 실패했어요. 고객센터에 문의해주세요.');
      });
  }, [params, setUser]);

  return (
    <main className="max-w-lg mx-auto px-md py-xl text-center">
      {!complete && <div className="flex justify-center mb-md"><LoadingSpinner /></div>}
      <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">{complete ? '충전 완료' : '결제 확인'}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg">{message}</p>
      <Link to="/mypage" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-lg text-on-primary font-body-md">
        마이페이지로 돌아가기
      </Link>
    </main>
  );
}
