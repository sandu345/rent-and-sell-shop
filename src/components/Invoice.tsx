
import React from 'react';
import { Customer, Order } from '@/types/types';

interface InvoiceProps {
  customer: Customer;
  orders: Order[];
  month: string;
  year: string;
}

export const Invoice: React.FC<InvoiceProps> = ({ customer, orders, month, year }) => {
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalPaid = orders.reduce((sum, order) => sum + order.paidAmount, 0);
  const balance = totalAmount - totalPaid;

  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:shadow-none shadow-lg">
      {/* Company Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white text-xl font-bold">SK</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Siri Kirula Pvt(Ltd).</h1>
            <p className="text-gray-600">Makola Road, Kiribathgoda</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">INVOICE</h2>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
          <div className="text-gray-600">
            <p className="font-medium">{customer.name}</p>
            <p>{customer.address}</p>
            <p>{customer.contactNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-600">
            <p><span className="font-medium">Invoice Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-medium">Period:</span> {monthName}</p>
            <p><span className="font-medium">Customer ID:</span> {customer._id.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Items</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="border border-gray-300 px-4 py-2">#{order._id.slice(-8)}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 capitalize">{order.type}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.items.map(item => item.name).join(', ')}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">Rs. {order.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between py-2">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold">Rs. {totalAmount}</span>
            </div>
            <div className="flex justify-between py-2 text-green-600">
              <span className="font-medium">Total Paid:</span>
              <span className="font-bold">Rs. {totalPaid}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-300 text-red-600">
              <span className="font-medium">Balance Due:</span>
              <span className="font-bold">Rs. {balance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
        <p>For any queries, please contact us at the above address.</p>
      </div>
    </div>
  );
};
