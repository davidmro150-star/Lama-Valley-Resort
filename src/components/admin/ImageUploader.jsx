
"use client";

import { useRef, useState } from "react";
import { ImagePlus, Upload, X, RefreshCw } from "lucide-react";

export default function ImageUploader({
  label,
  value,
  onChange,
  alt = "",
}) {
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, WebP or AVIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Image upload failed.");
      }

      onChange(data.image.url);
    } catch (err) {
      setError(err.message || "Unable to upload image.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeImage() {
    onChange("");
    setError("");
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt={alt || label}
            className="h-56 w-full object-cover"
          />

          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Replace
            </button>

            <button
              type="button"
              onClick={removeImage}
              disabled={uploading}
              className="rounded-lg bg-white p-2 text-red-600 shadow hover:bg-red-50"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>

          <div className="border-t border-gray-200 bg-white px-3 py-2">
            <p className="truncate text-xs text-gray-500">
              Image uploaded successfully
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-[#426b55] hover:bg-[#f5f8f5] disabled:opacity-50"
        >
          {uploading ? (
            <RefreshCw
              size={28}
              className="animate-spin text-[#426b55]"
            />
          ) : (
            <ImagePlus size={30} className="text-[#426b55]" />
          )}

          <span className="mt-3 text-sm font-semibold text-gray-700">
            {uploading ? "Uploading image..." : "Choose an image"}
          </span>

          <span className="mt-1 text-xs text-gray-500">
            JPG, PNG, WebP or AVIF · Maximum 10 MB
          </span>
        </button>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-[#426b55]">
          <Upload size={15} />
          Uploading to Cloudinary...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
