import DashboardShell from '@/components/DashboardShell'
import TransferForm from '@/components/TransferForm'
import { warehouses } from '@/lib/seed-data'

export const dynamic = 'force-dynamic'

export default async function TransferPage() {
  const res = await fetch('http://localhost:3000/api/items', { cache: 'no-store' })
  const products = await res.json()

  return (
    <DashboardShell>
      <div className="page-header">
        <div>
          <h1>Warehouse Transfer</h1>
          <p>Move stock between warehouses. Transfers are atomic and linked.</p>
        </div>
      </div>
      <TransferForm products={products} warehouses={warehouses} />
    </DashboardShell>
  )
}
