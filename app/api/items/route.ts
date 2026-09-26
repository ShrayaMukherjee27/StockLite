import { NextResponse } from 'next/server';
import { products, transactions, warehouses } from '@/lib/seed-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, productId, destWarehouseId, quantity } = body;

    // WAREHOUSE TRANSFER LOGIC
    if (action === 'transfer') {
      // 1. Locate the source product
      const sourceProduct = products.find(p => p.id === productId);
      if (!sourceProduct) {
        return NextResponse.json({ error: 'Source product not found' }, { status: 404 });
      }

      // 2. Locate or create the product in the destination warehouse
      let destProduct = products.find(
        p => p.name === sourceProduct.name && p.warehouseId === destWarehouseId
      );
      
      // If the product doesn't exist in the destination warehouse yet, create it
      if (!destProduct) {
        destProduct = { 
          ...sourceProduct, 
          id: `prod-${Date.now()}`, 
          warehouseId: destWarehouseId, 
          currentStock: 0 
        };
        products.push(destProduct);
      }

      // 3. Atomic Transfer (deduct from source, add to destination)
      sourceProduct.currentStock -= quantity;
      destProduct.currentStock += quantity;

      // 4. Log the Linked Transactions
      const timestamp = new Date().toISOString();
      const sourceWarehouseName = warehouses.find(w => w.id === sourceProduct.warehouseId)?.name || '';
      const destWarehouseName = warehouses.find(w => w.id === destWarehouseId)?.name || '';

      // Source OUT
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

      // Destination IN
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

      // 5. Return payload matching TransferForm.tsx expectations
      return NextResponse.json({ source: sourceProduct, destination: destProduct });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing transfer' }, { status: 500 });
  }
}
