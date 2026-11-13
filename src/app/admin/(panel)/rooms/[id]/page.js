
import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";
import EditCottageForm from "@/components/admin/EditCottageForm";

export const dynamic = "force-dynamic";

export default async function EditCottagePage({ params }) {
  const { id } = await params;

  await connectDB();

  const cottage = await Cottage.findById(id).lean();

  if (!cottage) {
    notFound();
  }

  const cottageData = {
    id: cottage._id.toString(),
    name: cottage.name || "",
    slug: cottage.slug || "",
    price: cottage.price ?? 0,
    capacity: cottage.capacity ?? 2,
    description: cottage.description || "",
    images: cottage.images || [],
    isActive: cottage.isActive ?? true,
  };

  return <EditCottageForm cottage={cottageData} />;
}
