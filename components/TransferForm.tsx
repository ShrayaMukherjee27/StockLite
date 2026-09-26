"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransferForm() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [sourceWarehouse, setSourceWarehouse] = useState('Warehouse A');
  const [destinationWarehouse, setDestinationWarehouse] = useState('Warehouse B');
  const [quantity, setQuantity] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch inventory items to populate the product dropdown
  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        if (data.length > 0) {
          setProductId(data[0].id); // Select the first product by default
        }
      });
  }, []);

  // Get unique products (since items might be duplicated across warehouses)
  const uniqueProducts = Array.from(new Set(items.map(item => item.id)))
    .map(id => items.find(item => item.id === id));

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation: Prevent transferring to the same warehouse
    if (sourceWarehouse === destinationWarehouse) {
      return setError('Source and destination warehouses cannot be the same.');
    }

    if (Number(quantity) <= 0) {
      return setError('Quantity must be greater than zero.');
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TRANSFER',
          productId,
          sourceWarehouseId: sourceWarehouse,
          destinationWarehouseId: destinationWarehouse,
          quantity: quantity
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to complete transfer.');
      } else {
        setSuccess(`Successfully transferred ${quantity} units!`);
        setQuantity(''); // Reset the quantity field
        router.refresh(); // Refresh the page state
      }
    } catch (err) {
      setError('A server error occurred while transferring stock.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleTransfer} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select 
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {uniqueProducts.map(product => (
              <option key={product?.id} value={product?.id}>
                {product?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Warehouse</label>
            <select 
              value={sourceWarehouse}
              onChange={(e) => setSourceWarehouse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Warehouse A">Warehouse A</option>
              <option value="Warehouse B">Warehouse B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Warehouse</label>
            <select 
              value={destinationWarehouse}
              onChange={(e) => setDestinationWarehouse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Warehouse A">Warehouse A</option>
              <option value="Warehouse B">Warehouse B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter quantity"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium mt-2"
        >
          Execute Transfer
        </button>
      </form>
    </div>
  );
}
