import DashboardShell from '@/components/DashboardShell'
import InventoryTable from '@/components/InventoryTable'
import { warehouses } from '@/lib/seed-data' // Warehouses remain static config

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const res = await fetch('http://localhost:3000/api/items', { cache: 'no-store' })
  const products = await res.json()

  return (
    <DashboardShell>
      <div className="page-header">
        <div>
          <h1>Inventory Overview</h1>
          <p>Real-time stock levels across all warehouse locations.</p>
        </div>
      </div>
      {/* The table handles Task 1 filtering and Task 5 summary panel */}
      <InventoryTable products={products} warehouses={warehouses} />
    </DashboardShell>
  )
}
