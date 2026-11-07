
"use client";

import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  priceUnit: "per person",
  features: "",
  order: 0,
  isActive: true,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchPackages() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/packages");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load packages.");
      }

      setPackages(data.packages || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function resetForm() {
    setForm(initialForm);
    setFile(null);
    setEditingId(null);

    const fileInput = document.getElementById("package-image");

    if (fileInput) {
      fileInput.value = "";
    }
  }

  function handleEdit(packageItem) {
    setEditingId(packageItem._id);

    setForm({
      name: packageItem.name || "",
      slug: packageItem.slug || "",
      shortDescription: packageItem.shortDescription || "",
      description: packageItem.description || "",
      price: String(packageItem.price ?? ""),
      priceUnit: packageItem.priceUnit || "per person",
      features: (packageItem.features || []).join("\n"),
      order: packageItem.order || 0,
      isActive: packageItem.isActive,
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
        name: form.name.trim(),
        slug: generateSlug(form.slug || form.name),
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        priceUnit: form.priceUnit,
        features: form.features
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
        order: Number(form.order),
        isActive: form.isActive,
      };

      if (!editingId && (!imageUrl || !publicId)) {
        throw new Error("Please select a package image.");
      }

      if (imageUrl && publicId) {
        payload.imageUrl = imageUrl;
        payload.publicId = publicId;
      }

      const url = editingId
        ? `/api/admin/packages/${editingId}`
        : "/api/admin/packages";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save package.");
      }

      setMessage(
        editingId
          ? "Package updated successfully."
          : "Package created successfully."
      );

      resetForm();
      await fetchPackages();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this package? Its Cloudinary image will also be deleted."
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete package.");
      }

      setMessage("Package deleted successfully.");
      await fetchPackages();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleToggleStatus(packageItem) {
    try {
      const response = await fetch(
        `/api/admin/packages/${packageItem._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !packageItem.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      await fetchPackages();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Package Management
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Create and manage resort packages, prices and offers.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      {/* Package Form */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          {editingId ? "Edit Package" : "Add New Package"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Package Image
            </label>

            <input
              id="package-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
              required={!editingId}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, WebP or AVIF.
              {editingId && " Select a new image only if you want to replace the current one."}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Package Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={(event) => {
                  const value = event.target.value;

                  setForm((previous) => ({
                    ...previous,
                    name: value,
                    slug: editingId
                      ? previous.slug
                      : generateSlug(value),
                  }));
                }}
                required
                placeholder="Hill Retreat"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Package Slug *
              </label>

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                placeholder="hill-retreat"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Short Description
            </label>

            <input
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="A relaxing getaway in the hills."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Full Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what this package includes..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price (BDT) *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                required
                placeholder="5500"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price Unit
              </label>

              <select
                name="priceUnit"
                value={form.priceUnit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
              >
                <option value="per person">Per Person</option>
                <option value="per couple">Per Couple</option>
                <option value="per family">Per Family</option>
                <option value="per group">Per Group</option>
                <option value="per night">Per Night</option>
                <option value="per package">Per Package</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Package Features
            </label>

            <textarea
              name="features"
              value={form.features}
              onChange={handleChange}
              rows={5}
              placeholder={"Accommodation\nBreakfast included\nHill view"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700"
            />

            <p className="mt-1 text-xs text-gray-500">
              Write one feature per line.
            </p>
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
              Show package on public website
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
                  ? "Update Package"
                  : "Create Package"}
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

      {/* Existing Packages */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            All Packages
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {packages.length} Packages
          </span>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Loading packages...
          </p>
        ) : packages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center">
            <p className="font-medium text-gray-700">
              No packages found.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Create your first package using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((packageItem) => (
              <div
                key={packageItem._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {packageItem.imageUrl ? (
                  <img
                    src={packageItem.imageUrl}
                    alt={packageItem.name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gray-100 text-sm text-gray-400">
                    No image
                  </div>
                )}

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {packageItem.name}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-green-800">
                      ৳{Number(packageItem.price).toLocaleString("en-BD")}
                      <span className="font-normal text-gray-500">
                        {" "}/ {packageItem.priceUnit}
                      </span>
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-600">
                    {packageItem.shortDescription ||
                      packageItem.description ||
                      "No description"}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(packageItem)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        packageItem.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {packageItem.isActive ? "Active" : "Hidden"}
                    </button>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(packageItem)}
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(packageItem._id)}
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
