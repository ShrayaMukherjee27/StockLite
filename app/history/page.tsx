import DashboardShell from '@/components/DashboardShell'
import TransactionTable from '@/components/TransactionTable'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  // Fetch from the local API route
  const res = await fetch('http://localhost:3000/api/transactions', { cache: 'no-store' });
  const transactions = await res.json();

  return (
    <DashboardShell>
      <div className="page-header">
        <div>
          <h1>Transaction History</h1>
          <p>A record of every stock movement across warehouses.</p>
        </div>
      </div>
      <TransactionTable transactions={transactions} />
    </DashboardShell>
  )
}
