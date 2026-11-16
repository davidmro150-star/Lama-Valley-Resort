import "@/models/booking";
import "@/models/Cottage";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import RestaurantOrder from "@/models/RestaurantOrder";
import SiteSettings from "@/models/SiteSettings";

import RestaurantReceiptPrint from "@/components/admin/RestaurantReceiptPrint";

export const dynamic = "force-dynamic";

export default async function RestaurantOrderReceiptPage({ params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  const order = await RestaurantOrder.findById(id)
    .populate("booking", "bookingReference guestName")
    .populate("cottage", "name")
    .lean();

  if (!order) {
    notFound();
  }

  const settings = await SiteSettings.findOne().lean();

  const safeSettings = {
    resortName:
      settings?.resortName ||
      settings?.general?.resortName ||
      "Lama Valley Resort & Restaurant",

    address:
      settings?.address ||
      settings?.general?.address ||
      "Lama, Bandarban, Bangladesh",

    phone:
      settings?.phone ||
      settings?.general?.phone ||
      "",

    email:
      settings?.email ||
      settings?.general?.email ||
      "",

    logoUrl: settings?.logoUrl || "",
  };

  return (
    <RestaurantReceiptPrint
      order={JSON.parse(JSON.stringify(order))}
      settings={safeSettings}
    />
  );
}
