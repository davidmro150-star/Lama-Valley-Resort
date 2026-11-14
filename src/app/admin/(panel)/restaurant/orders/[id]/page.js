
import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import RestaurantOrder from "@/models/RestaurantOrder";
import Booking from "@/models/booking";
import Cottage from "@/models/Cottage";
import MenuItem from "@/models/MenuItem";
import User from "@/models/User";

import RestaurantOrderDetails from "@/components/admin/RestaurantOrderDetails";

export const dynamic = "force-dynamic";

export default async function RestaurantOrderDetailsPage({ params }) {
  const { id } = await params;

  await connectDB();

  const order = await RestaurantOrder.findById(id)
    .populate("booking", "bookingReference guestName guestPhone checkIn checkOut totalPrice paymentAmount paymentStatus payments")
    .populate("cottage", "name")
    .populate("createdBy", "name")
    .populate("payments.recordedBy", "name")
    .lean();

  if (!order) {
    notFound();
  }

  const safeOrder = JSON.parse(JSON.stringify(order));

  return <RestaurantOrderDetails order={safeOrder} />;
}
