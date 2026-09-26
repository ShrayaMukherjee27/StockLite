import DashboardShell from '@/components/DashboardShell'
import StockForm from '@/components/StockForm'

export const dynamic = 'force-dynamic'

export default async function StockPage() {
  const res = await fetch('http://localhost:3000/api/items', { cache: 'no-store' })
  const products = await res.json()

  return (
    <DashboardShell>
      <div className="page-header">
        <div>
          <h1>Stock In / Out</h1>
          <p>Record incoming shipments or outgoing orders.</p>
        </div>
      </div>
      <StockForm products={products} />
    </DashboardShell>
  )
}
