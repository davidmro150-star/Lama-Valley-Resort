
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import Link from "next/link";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 20;

export default function NewCottagePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    capacity: "2",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "name" && {
        slug: generateSlug(value),
      }),
    }));
  }

  function handleSlugChange(event) {
    setForm((previous) => ({
      ...previous,
      slug: generateSlug(event.target.value),
    }));
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);

    setError("");
    setSuccess("");

    if (files.length + selectedFiles.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type
        ) || file.size > MAX_FILE_SIZE || file.size === 0
    );

    if (invalidFile) {
      setError(
        "Only JPG, PNG, WebP and AVIF images up to 10 MB are allowed."
      );
      event.target.value = "";
      return;
    }

    const newFiles = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((previous) => [...previous, ...newFiles]);

    event.target.value = "";
  }

  function removeFile(id) {
    setFiles((previous) => {
      const selected = previous.find((item) => item.id === id);

      if (selected) {
        URL.revokeObjectURL(selected.preview);
      }

      return previous.filter((item) => item.id !== id);
    });
  }

  async function uploadImages() {
    const uploadedImages = [];

    for (const item of files) {
      const formData = new FormData();
      formData.append("file", item.file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
      }

      uploadedImages.push(result.image.url);
    }

    return uploadedImages;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Please enter a cottage name and slug.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0 || !Number.isFinite(Number(form.price))) {
      setError("Please enter a valid cottage price.");
      return;
    }

    if (
      !Number.isInteger(Number(form.capacity)) ||
      Number(form.capacity) < 1 ||
      Number(form.capacity) > 100
    ) {
      setError("Guest capacity must be between 1 and 100.");
      return;
    }

    if (files.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setLoading(true);

    try {
      let imageUrls = [];

      if (files.length > 0) {
        setUploading(true);
        imageUrls = await uploadImages();
        setUploading(false);
      }

      const response = await fetch("/api/admin/cottages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          price: Number(form.price),
          capacity: Number(form.capacity),
          description: form.description.trim(),
          images: imageUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create cottage.");
      }

      setSuccess("Cottage created successfully!");

      files.forEach((item) => URL.revokeObjectURL(item.preview));

      setTimeout(() => {
        router.push("/admin/rooms");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/rooms"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#234b3b]"
        >
          <ArrowLeft size={16} />
          Back to Cottages
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-[#426b55]">
            Accommodation Management
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#173729]">
            Add New Cottage
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add accommodation details and upload cottage photographs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Basic Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#173729]">
            Basic Information
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cottage Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Hill View Cottage"
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                URL Slug *
              </label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="hill-view-cottage"
                maxLength={120}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />

              <p className="mt-2 text-xs text-gray-400">
                Automatically generated from the cottage name. You can edit it.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price Per Night (BDT) *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                step="1"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Guest Capacity *
              </label>

              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                max="100"
                step="1"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cottage Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the cottage, facilities, views and amenities..."
                rows={5}
                maxLength={3000}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#234b3b] focus:ring-2 focus:ring-[#234b3b]/10"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {form.description.length}/3000 characters
              </p>
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-[#173729]">
              Cottage Images
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload up to 20 images. JPG, PNG, WebP and AVIF, maximum 10 MB each.
            </p>
          </div>

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#f7f5ef]/50 px-5 py-10 text-center transition hover:border-[#426b55] hover:bg-[#f7f5ef]">
            <ImagePlus size={32} className="text-[#426b55]" />

            <span className="mt-3 text-sm font-semibold text-[#173729]">
              Click to upload images
            </span>

            <span className="mt-1 text-xs text-gray-500">
              Select multiple images at once
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={files.length >= MAX_IMAGES}
            />
          </label>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Selected images</span>
            <span>
              {files.length}/{MAX_IMAGES}
            </span>
          </div>

          {files.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="h-36 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X size={15} />
                  </button>

                  <div className="truncate px-2 py-2 text-xs text-gray-500">
                    {item.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link
            href="/admin/rooms"
            className="rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                {uploading ? "Uploading Images..." : "Saving Cottage..."}
              </>
            ) : (
              "Save Cottage"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
