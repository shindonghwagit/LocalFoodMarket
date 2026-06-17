import { useEffect, type ReactNode } from 'react';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthHydratorProps {
  children: ReactNode;
}

export default function AuthHydrator({ children }: AuthHydratorProps) {
  const { isHydrating, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
