
import Link from "next/link";

import connectDB from "@/lib/mongodb";

import MenuItem from "@/models/MenuItem";
import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";
import RestaurantOrder from "@/models/RestaurantOrder";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Date(date).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });
}

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}

function StatusBadge({ status }) {
  const styles = {
    open: "bg-amber-50 text-amber-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
    unpaid: "bg-red-50 text-red-700",
    partially_paid: "bg-amber-50 text-amber-700",
    paid: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status?.replaceAll("_", " ") || "Unknown"}
    </span>
  );
}

export default async function RestaurantOrdersPage() {
  await connectDB();

  const orders = await RestaurantOrder.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("booking", "bookingReference guestName")
    .populate("cottage", "name")
    .lean();

  // Register related models for Mongoose population.
  void MenuItem;
  void Booking;
  void Cottage;

  const totalOrders = orders.length;

  const totalSales = orders
    .filter((order) => order.orderStatus !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const unpaidOrders = orders.filter(
    (order) =>
      order.orderStatus !== "cancelled" &&
      order.paymentStatus !== "paid"
  ).length;

  const walkInOrders = orders.filter(
    (order) => order.orderType === "walk-in"
  ).length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Restaurant Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage restaurant sales, cottage food orders and payments.
          </p>
        </div>

        <Link
          href="/admin/restaurant/orders/new"
          className="inline-flex items-center justify-center rounded-xl bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729]"
        >
          + Create New Order
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Orders" value={totalOrders} />
        <SummaryCard title="Recorded Order Value" value={formatMoney(totalSales)} />
        <SummaryCard title="Unpaid Orders" value={unpaidOrders} />
        <SummaryCard title="Walk-in Orders" value={walkInOrders} />
      </div>

      {/* Orders */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <p className="mt-1 text-xs text-gray-500">
            Showing the latest {orders.length} orders.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="font-semibold text-gray-800">
              No restaurant orders yet
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Create your first order to start recording restaurant sales.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div
                key={String(order._id)}
                className="space-y-4 p-5 transition hover:bg-gray-50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.orderStatus} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {order.guestName || "Walk-in customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.orderType === "cottage"
                        ? `Cottage: ${order.cottage?.name || "N/A"}`
                        : "Walk-in"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Food Items</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {order.items?.length || 0} different items
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items?.reduce(
                        (sum, item) => sum + Number(item.quantity || 0),
                        0
                      ) || 0}{" "}
                      total quantity
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Order Total</p>
                    <p className="mt-1 text-lg font-bold text-[#234b3b]">
                      {formatMoney(order.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.paymentMode === "cottage_bill"
                        ? "Add to cottage bill"
                        : "Pay immediately"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/admin/restaurant/orders/${order._id}`}
                    className="text-sm font-semibold text-[#234b3b] hover:underline"
                  >
                    View Order Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
