import { NextResponse } from 'next/server';
import { products, transactions, warehouses } from '@/lib/seed-data';

// Ensure Next.js doesn't cache the in-memory data
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, productId, destWarehouseId, quantity, direction } = body;

    // TASK 2: STOCK IN / STOCK OUT LOGIC
    if (action === 'stock') {
      const product = products.find(p => p.id === productId);
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

      // Update stock
      product.currentStock += (direction === 'IN' ? quantity : -quantity);

      // Log the transaction
      transactions.push({
        id: `txn-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        warehouseId: product.warehouseId,
        warehouseName: warehouses.find(w => w.id === product.warehouseId)?.name || '',
        type: direction,
        quantity,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ product });
    }

    // TASK 3: WAREHOUSE TRANSFER LOGIC
    if (action === 'transfer') {
      const sourceProduct = products.find(p => p.id === productId);
      if (!sourceProduct) return NextResponse.json({ error: 'Source product not found' }, { status: 404 });

      let destProduct = products.find(p => p.name === sourceProduct.name && p.warehouseId === destWarehouseId);
      
      // Create product in destination warehouse if it doesn't exist
      if (!destProduct) {
        destProduct = { 
          ...sourceProduct, 
          id: `prod-${Date.now()}`, 
          warehouseId: destWarehouseId, 
          currentStock: 0 
        };
        products.push(destProduct);
      }

      // Atomic Transfer (deduct from source, add to dest)
      sourceProduct.currentStock -= quantity;
      destProduct.currentStock += quantity;

      const timestamp = new Date().toISOString();
      const sourceWarehouseName = warehouses.find(w => w.id === sourceProduct.warehouseId)?.name || '';
      const destWarehouseName = warehouses.find(w => w.id === destWarehouseId)?.name || '';

      // Log Linked Transactions
      transactions.push({
        id: `txn-${Date.now()}-out`,
        productId: sourceProduct.id,
        productName: sourceProduct.name,
        warehouseId: sourceProduct.warehouseId,
        warehouseName: sourceWarehouseName,
        type: 'TRANSFER_OUT',
        quantity,
        timestamp
      });

      transactions.push({
        id: `txn-${Date.now()}-in`,
        productId: destProduct.id,
        productName: destProduct.name,
        warehouseId: destWarehouseId,
        warehouseName: destWarehouseName,
        type: 'TRANSFER_IN',
        quantity,
        timestamp
      });

      return NextResponse.json({ source: sourceProduct, destination: destProduct });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
