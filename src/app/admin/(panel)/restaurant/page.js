
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  UtensilsCrossed,
  ImagePlus,
} from "lucide-react";

const initialForm = {
  name: "",
  description: "",
  category: "Main Course",
  price: "",
  imageUrl: "",
  publicId: "",
  isAvailable: true,
  isFeatured: false,
  order: 0,
};

const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Snacks",
  "Beverages",
  "Other",
  "Main Course",
];

export default function AdminRestaurantPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/menu");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load menu.");
      }

      setItems(data.items || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setImageFile(null);
    setPreview("");
    setShowForm(false);
  }

  function handleEdit(item) {
    setEditingId(item._id);

    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "Main Course",
      price: item.price ?? "",
      imageUrl: item.imageUrl || "",
      publicId: item.publicId || "",
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      order: item.order || 0,
    });

    setImageFile(null);
    setPreview(item.imageUrl || "");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage() {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);

    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      return {
        imageUrl: data.image.url,
        publicId: data.image.publicId,
      };
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);

      let imageData = {
        imageUrl: form.imageUrl,
        publicId: form.publicId,
      };

      if (imageFile) {
        const uploaded = await uploadImage();
        imageData = uploaded;
      }

      if (!editingId && !imageData.imageUrl) {
        throw new Error("Please upload a food image.");
      }

      const payload = {
        ...form,
        price: Number(form.price),
        order: Number(form.order) || 0,
        ...imageData,
      };

      const url = editingId
        ? `/api/admin/menu/${editingId}`
        : "/api/admin/menu";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save menu item.");
      }

      alert(data.message);
      resetForm();
      await fetchItems();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailability(item) {
    try {
      const response = await fetch(`/api/admin/menu/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !item.isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed.");
      }

      await fetchItems();
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? Its Cloudinary image will also be deleted.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/menu/${item._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      alert(data.message);
      await fetchItems();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a9804d]">
            Restaurant Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#173729]">
            Restaurant Menu
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage food items, prices, photos, and availability.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173729]"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#173729]">
              {editingId ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Food Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Chicken Biryani"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#234b3b]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category *
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#234b3b]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (৳) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="350"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#234b3b]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Display Order
                </label>

                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#234b3b]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe this food item..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#234b3b]"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Food Image {!editingId && "*"}
              </label>

              <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#234b3b]">
                {preview ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={preview}
                      alt="Food preview"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <ImagePlus size={32} className="text-gray-400" />
                    <span className="mt-3 text-sm text-gray-500">
                      Click to upload food image
                    </span>
                    <span className="mt-1 text-xs text-gray-400">
                      JPG, PNG, WebP or AVIF
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#234b3b]"
                />
                Available
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#234b3b]"
                />
                Featured Item
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#234b3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving || uploading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}

                {uploading
                  ? "Uploading Image..."
                  : saving
                    ? "Saving..."
                    : editingId
                      ? "Update Menu Item"
                      : "Save Menu Item"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#173729]">
            All Menu Items ({items.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#234b3b]" size={30} />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <UtensilsCrossed
              size={38}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-4 text-lg font-semibold text-[#173729]">
              No menu items yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your first restaurant menu item.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="relative h-52 bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <UtensilsCrossed size={38} />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>

                  {item.isFeatured && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#c49a62] px-3 py-1 text-xs font-semibold text-white">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#a9804d]">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-[#173729]">
                    {item.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
                    {item.description || "No description provided."}
                  </p>

                  <p className="mt-4 text-2xl font-bold text-[#234b3b]">
                    ৳{Number(item.price).toLocaleString("en-BD")}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      title="Delete menu item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
