
"use client";

import { useEffect, useState } from "react";

const categories = [
  "Nature",
  "Cottages",
  "Restaurant",
  "Activities",
  "Views",
];

const initialForm = {
  title: "",
  description: "",
  category: "Nature",
  order: 0,
  isActive: true,
};

export default function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchImages() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/gallery");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load gallery.");
      }

      setImages(data.images || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchImages();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setFile(null);
    setEditingId(null);

    const fileInput = document.getElementById("gallery-image");

    if (fileInput) {
      fileInput.value = "";
    }
  }

  function handleEdit(image) {
    setEditingId(image._id);
    setForm({
      title: image.title || "",
      description: image.description || "",
      category: image.category || "Nature",
      order: image.order || 0,
      isActive: image.isActive,
    });

    setFile(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      let imageUrl;
      let publicId;

      // Upload a new image only when a file is selected.
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.image) {
          throw new Error(
            uploadData.message || "Image upload failed."
          );
        }

        imageUrl = uploadData.image.url;
        publicId = uploadData.image.publicId;
      }

      const payload = {
        ...form,
        order: Number(form.order),
      };

      if (editingId) {
        const response = await fetch(
          `/api/admin/gallery/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update image.");
        }

        setMessage("Gallery image updated successfully.");
      } else {
        if (!imageUrl || !publicId) {
          throw new Error("Please select an image first.");
        }

        const response = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            imageUrl,
            publicId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save image.");
        }

        setMessage("Gallery image added successfully.");
      }

      resetForm();
      await fetchImages();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete image.");
      }

      setMessage("Gallery image deleted successfully.");
      await fetchImages();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleToggleStatus(image) {
    try {
      const response = await fetch(
        `/api/admin/gallery/${image._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !image.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      await fetchImages();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gallery Management
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload and manage photos displayed on your resort website.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      {/* Add / Edit Form */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          {editingId ? "Edit Gallery Image" : "Add New Gallery Image"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="gallery-image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Gallery Image {editingId ? "(Optional replacement)" : ""}
            </label>

            <input
              id="gallery-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
              required={!editingId}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP and AVIF.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Beautiful Hill View"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Write a short description..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                min="0"
                value={form.order}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              />
            </div>

            <label className="flex items-center gap-3 self-end pb-3 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-green-700"
              />
              Show this image on public website
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-900 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Image"
                  : "Upload Image"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Gallery List */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            All Gallery Images
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {images.length} Images
          </span>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Loading gallery images...
          </p>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center">
            <p className="font-medium text-gray-700">
              No gallery images found.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Upload your first resort photo using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <img
                  src={image.imageUrl}
                  alt={image.title || "Resort gallery"}
                  className="h-52 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {image.title || "Untitled Image"}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {image.category} · Order: {image.order}
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-600">
                    {image.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(image)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        image.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {image.isActive ? "Active" : "Hidden"}
                    </button>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(image)}
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(image._id)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
