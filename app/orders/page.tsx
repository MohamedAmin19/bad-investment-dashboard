"use client";

import { useState, useEffect, Fragment } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { BackButton } from "@/components/BackButton";

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  id: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  paymentMethod?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        setError(data.error || "Failed to load orders");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "processing":
        return "text-blue-400";
      case "shipped":
        return "text-purple-400";
      case "delivered":
        return "text-green-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(orderId);
    setMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message || "Status updated successfully!" });
        fetchOrders();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update status." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <HeaderNav />
        
        <main className="mt-16">
          <h1 className="mb-8 text-4xl font-bold text-center">Orders</h1>
          <div className="mb-8">
            <BackButton />
          </div>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-700"
                  : "bg-red-900/30 text-red-400 border border-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center text-white">Loading orders...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 text-white">
                Total Orders: {orders.length}
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white">
                    <th className="px-4 py-3 text-left text-white font-normal">Order ID</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Customer</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Items</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Total</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Status</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Date</th>
                    <th className="px-4 py-3 text-left text-white font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-white border-b border-white">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <Fragment key={order.id}>
                        <tr className="border-b border-white">
                          <td className="px-4 py-3 text-white text-sm">
                            {order.id.substring(0, 8)}...
                          </td>
                          <td className="px-4 py-3 text-white">
                            {order.customerInfo.name}
                          </td>
                          <td className="px-4 py-3 text-white">
                            {order.items.length} item(s)
                          </td>
                          <td className="px-4 py-3 text-white">
                            {order.total.toFixed(2)} EGP
                          </td>
                          <td className="px-4 py-3 text-white">
                            <span className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric'
                                })
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-white">
                            <button
                              onClick={() => toggleOrderDetails(order.id)}
                              className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              {expandedOrder === order.id ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr className="border-b border-white">
                            <td colSpan={7} className="px-4 py-6 bg-gray-900">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-400">Name:</span> {order.customerInfo.name}
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Email:</span> {order.customerInfo.email}
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Phone:</span> {order.customerInfo.phone}
                                    </div>
                                    <div>
                                      <span className="text-gray-400">City:</span> {order.customerInfo.city}
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-gray-400">Address:</span> {order.customerInfo.address}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                                  <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                                        {item.image && (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <div className="font-medium">{item.name}</div>
                                          <div className="text-sm text-gray-400">
                                            Quantity: {item.quantity} × {item.price.toFixed(2)} EGP = {(item.quantity * item.price).toFixed(2)} EGP
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Payment & Pricing</h3>
                                  <div className="space-y-2 text-sm">
                                    {order.paymentMethod !== null && order.paymentMethod !== undefined && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Payment Method:</span>
                                        <span className="text-white capitalize">{order.paymentMethod}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Subtotal:</span>
                                      <span className="text-white">{order.subtotal.toFixed(2)} EGP</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Shipping Fee:</span>
                                      <span className="text-white">{order.shippingFee.toFixed(2)} EGP</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-700 text-lg font-semibold">
                                      <span>Total:</span>
                                      <span>{order.total.toFixed(2)} EGP</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                  <div className="text-sm text-gray-400">
                                    Status: <span className={getStatusColor(order.status)}>{order.status}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                      disabled={isUpdatingStatus === order.id}
                                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                    {isUpdatingStatus === order.id && (
                                      <span className="text-xs text-gray-400">Updating...</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

