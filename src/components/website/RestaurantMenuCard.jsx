import Image from "next/image";

export default function RestaurantMenuCard({ item, category }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e9e3d8] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Food Image */}
      <div className="relative h-64 overflow-hidden bg-[#eee9df]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Food image coming soon
          </div>
        )}

        {item.isFeatured && (
          <span className="absolute left-4 top-4 rounded-full bg-[#c49a62] px-4 py-2 text-xs font-semibold text-white">
            Chef's Special
          </span>
        )}
      </div>

      {/* Food Details */}
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-[#234b3b]">
            {item.name}
          </h3>

          <span className="shrink-0 text-lg font-bold text-[#c49a62]">
            ৳{Number(item.price).toLocaleString("en-BD")}
          </span>
        </div>

        <p className="mt-3 min-h-12 text-sm leading-7 text-gray-600">
          {item.description || "Freshly prepared for our guests."}
        </p>

        <div className="mt-5 border-t border-[#eee9df] pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#426b55]">
            {category}
          </span>
        </div>
      </div>
    </article>
  );
}