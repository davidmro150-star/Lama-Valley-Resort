
import Link from "next/link";
import Image from "next/image";

import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";

export const dynamic = "force-dynamic";

function formatPrice(price) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price || 0);
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default async function RoomsPage() {
  await connectDB();

  const cottages = await Cottage.find({})
    .sort({ createdAt: -1 })
    .lean();

  const totalCottages = cottages.length;
  const activeCottages = cottages.filter(
    (cottage) => cottage.isActive
  ).length;
  const inactiveCottages = totalCottages - activeCottages;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#426b55]">
            Accommodation Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#173729]">
            Cottages
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your resort cottages, pricing and availability.
          </p>
        </div>

        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#234b3b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#173729]"
        >
          + Add New Cottage
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Total Cottages</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#173729]">
            {totalCottages}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Active Cottages</p>
          <h2 className="mt-3 text-3xl font-semibold text-green-700">
            {activeCottages}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Inactive Cottages</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-600">
            {inactiveCottages}
          </h2>
        </div>
      </div>

      {/* Cottage Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-[#173729]">
            All Cottages
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A complete list of your resort accommodations.
          </p>
        </div>

        {cottages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              No cottages found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add your first cottage to start managing accommodations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-[#f7f5ef]">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Image
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Cottage
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price / Night
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                    </th>
                    
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                   </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {cottages.map((cottage) => (
                  <tr key={cottage._id.toString()}>
                    <td className="px-6 py-4">
                      {cottage.images?.length > 0 ? (
                        <Image
                          src={cottage.images[0]}
                          alt={cottage.name}
                          width={80}
                          height={64}
                          unoptimized
                          className="h-16 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-medium text-[#173729]">
                        {cottage.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        /{cottage.slug}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {cottage.images?.length || 0} images
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700">
                      {formatPrice(cottage.price)}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700">
                      {cottage.capacity} guests
                    </td>

                  <td className="px-6 py-5">
     <StatusBadge isActive={cottage.isActive} />
     </td>

     <td className="px-6 py-5">
      <Link
    href={`/admin/rooms/${cottage._id}`}
    className="inline-flex items-center rounded-lg border border-[#234b3b] px-4 py-2 text-sm font-medium text-[#234b3b] transition hover:bg-[#234b3b] hover:text-white"
    >
    Edit
    </Link>
     </td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
