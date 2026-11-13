
import Link from "next/link";

import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";

import RestaurantOrderForm from "@/components/admin/RestaurantOrderForm";

export const dynamic = "force-dynamic";

export default async function NewRestaurantOrderPage() {
  await connectDB();

  const now = new Date();

  const [menuItems, bookings] = await Promise.all([
    MenuItem.find({ isAvailable: true })
      .sort({ category: 1, order: 1, name: 1 })
      .select("name category price")
      .lean(),

Booking.find({
  status: "confirmed",
  checkOut: { $gt: now },
})
      .populate("cottage", "name")
      .select(
        "bookingReference guestName guestPhone cottage checkIn checkOut"
      )
      .sort({ checkIn: -1 })
      .lean(),
  ]);

  const safeMenuItems = menuItems.map((item) => ({
    id: String(item._id),
    name: item.name,
    category: item.category,
    price: Number(item.price),
  }));

  const safeBookings = bookings
    .filter((booking) => booking.cottage)
    .map((booking) => ({
      id: String(booking._id),
      bookingReference: booking.bookingReference,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone || "",
      cottageName: booking.cottage.name,
    }));

  // Register Cottage model for population.
  void Cottage;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/admin/restaurant/orders"
          className="text-sm font-medium text-[#234b3b] hover:underline"
        >
          ← Back to Restaurant Orders
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Create Restaurant Order
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Select food items and create a new restaurant order.
        </p>
      </div>

      <RestaurantOrderForm
        menuItems={safeMenuItems}
        bookings={safeBookings}
      />
    </div>
  );
}
