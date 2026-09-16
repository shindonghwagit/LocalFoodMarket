import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentFailPage() {
  const [params] = useSearchParams();
  const message = params.get('message') ?? '결제가 취소되었어요. 다시 시도해주세요.';

  return (
    <main className="max-w-lg mx-auto px-md py-xl text-center">
      <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">결제가 완료되지 않았어요</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg">{message}</p>
      <Link to="/mypage" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-lg text-on-primary font-body-md">
        충전 다시 하기
      </Link>
    </main>
  );
}
