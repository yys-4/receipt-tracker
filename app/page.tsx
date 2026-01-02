import { TransactionProvider } from '@/lib/store';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <TransactionProvider>
      <main>
        <Dashboard />
      </main>
    </TransactionProvider>
  );
}
