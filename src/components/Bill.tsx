
import React from 'react';
import { Customer, Order } from '@/types/types';

interface BillProps {
  customer: Customer;
  order: Order;
}

export const Bill: React.FC<BillProps> = ({ customer, order }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto print:shadow-none shadow-lg">
      {/* Company Header */}
      <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
        <div className="flex items-center justify-center mb-3">
          <img src="src/Images/7e060565-2ecf-4f32-b077-daf6f71b9556.jpg" alt="Logo" className="h-12 w-12 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">සිරි කිරුළ</h1>
            <p className="text-sm text-gray-600">Makola Road, Kiribathgoda</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-700">BILL</h2>
      </div>

      {/* Bill Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Bill To:</h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{customer.name}</p>
            <p>{customer.address}</p>
            <p>{customer.contactNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Bill Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-medium">Order ID:</span> #{order.id.slice(-8)}</p>
            <p><span className="font-medium">Order Type:</span> {order.type === 'rent' ? 'Rental' : 'Sale'}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Item</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-sm">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-3 py-2 text-sm">{item.name}</td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-right">Rs. {item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details */}
      <div className="mb-6 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Wedding Date:</span> {new Date(order.weddingDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Courier Date:</span> {new Date(order.courierDate).toLocaleDateString()}</p>
            {order.returnDate && (
              <p><span className="font-medium">Return Date:</span> {new Date(order.returnDate).toLocaleDateString()}</p>
            )}
          </div>
          <div>
            <p><span className="font-medium">Courier Method:</span> {order.courierMethod.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-48">
          <div className="bg-gray-50 p-4 rounded text-sm">
            <div className="flex justify-between py-1">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold">Rs. {order.totalPrice}</span>
            </div>
            <div className="flex justify-between py-1 text-green-600">
              <span className="font-medium">Paid Amount:</span>
              <span className="font-bold">Rs. {order.paidAmount}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-300 text-red-600">
              <span className="font-medium">Remaining:</span>
              <span className="font-bold">Rs. {order.totalPrice - order.paidAmount}</span>
            </div>
            {order.depositAmount && order.depositAmount > 0 && (
              <div className="flex justify-between py-1 text-blue-600">
                <span className="font-medium">Deposit:</span>
                <span className="font-bold">Rs. {order.depositAmount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
        >
          Print Bill
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-gray-500 text-xs">
        <p>Thank you for your business!</p>
        <p>For any queries, please contact us at the above address.</p>
      </div>
    </div>
  );
};
