
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

const initialForm = {
  heroLocation: "",
  heroTitle: "",
  heroDescription: "",
  primaryButtonText: "",
  primaryButtonLink: "",
  secondaryButtonText: "",
  secondaryButtonLink: "",
  heroSlides: [],
};

const MAX_SLIDES = 8;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function HomePageEditor() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRefs = useRef({});

  const fetchHomePage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/home-page", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load homepage.");
      }

      setForm({
        ...initialForm,
        ...data.homePage,
        heroSlides: data.homePage.heroSlides || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomePage();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSlideChange = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      heroSlides: previous.heroSlides.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide
      ),
    }));
  };

  const addSlide = () => {
    if (form.heroSlides.length >= MAX_SLIDES) {
      setError("You can add a maximum of 8 hero images.");
      return;
    }

    setError("");
    setForm((previous) => ({
      ...previous,
      heroSlides: [...previous.heroSlides, { image: "", alt: "" }],
    }));
  };

  const removeSlide = (index) => {
    setForm((previous) => ({
      ...previous,
      heroSlides: previous.heroSlides.filter((_, i) => i !== index),
    }));

    setError("");
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WebP and AVIF images are allowed.");
      return;
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("Image size must be between 1 byte and 10 MB.");
      return;
    }

    try {
      setUploadingIndex(index);

      const uploadData = new FormData();
      uploadData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(
          uploadResult.message || "Image upload failed."
        );
      }

      handleSlideChange(index, "image", uploadResult.image.url);

      setMessage(`Slide ${index + 1} image uploaded successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingIndex(null);

      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (form.heroSlides.length > MAX_SLIDES) {
        throw new Error("You can add a maximum of 8 hero images.");
      }

      const incompleteSlide = form.heroSlides.find(
        (slide) => !slide.image?.trim()
      );

      if (incompleteSlide) {
        throw new Error(
          "Please upload an image or remove every empty slide before saving."
        );
      }

      const response = await fetch("/api/admin/home-page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save homepage.");
      }

      setMessage(data.message || "Homepage saved successfully.");

      setForm({
        ...initialForm,
        ...data.homePage,
        heroSlides: data.homePage.heroSlides || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading homepage editor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#426b55]">
            Website Content
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Home Page Editor
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage homepage content and upload up to 8 hero images.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHomePage}
          disabled={saving || uploadingIndex !== null}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Reload
        </button>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Content */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Hero Content
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location Text
              </label>

              <input
                name="heroLocation"
                value={form.heroLocation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Main Heading
              </label>

              <textarea
                name="heroTitle"
                value={form.heroTitle}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                name="heroDescription"
                value={form.heroDescription}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
              />
            </div>
          </div>
        </section>

        {/* Hero Buttons */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Hero Buttons
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">
                Primary Button
              </h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Button Text
                </label>

                <input
                  name="primaryButtonText"
                  value={form.primaryButtonText}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Button Link
                </label>

                <input
                  name="primaryButtonLink"
                  value={form.primaryButtonLink}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">
                Secondary Button
              </h3>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Button Text
                </label>

                <input
                  name="secondaryButtonText"
                  value={form.secondaryButtonText}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Button Link
                </label>

                <input
                  name="secondaryButtonLink"
                  value={form.secondaryButtonLink}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Hero Slider */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Background Slider Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Upload images directly from your computer. Maximum 8 images.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WebP or AVIF. Maximum 10 MB per image.
              </p>
            </div>

            <button
              type="button"
              onClick={addSlide}
              disabled={
                form.heroSlides.length >= MAX_SLIDES ||
                uploadingIndex !== null ||
                saving
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              Add Image ({form.heroSlides.length}/{MAX_SLIDES})
            </button>
          </div>

          <div className="space-y-6">
            {form.heroSlides.map((slide, index) => (
              <div
                key={slide._id || index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    Slide {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    disabled={uploadingIndex !== null || saving}
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      ref={(element) => {
                        fileInputRefs.current[index] = element;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(index, e.target.files?.[0])
                      }
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() =>
                          fileInputRefs.current[index]?.click()
                        }
                        disabled={uploadingIndex !== null || saving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#234b3b] px-4 py-3 text-sm font-semibold text-[#234b3b] hover:bg-[#234b3b]/5 disabled:opacity-50"
                      >
                        {uploadingIndex === index ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={17} />
                            {slide.image ? "Change Image" : "Upload Image"}
                          </>
                        )}
                      </button>

                      {slide.image && (
                        <span className="text-xs font-medium text-green-700">
                          Image uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  {slide.image ? (
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-500">
                        Image Preview
                      </p>

                      <img
                        src={slide.image}
                        alt={slide.alt || `Hero slide ${index + 1}`}
                        className="h-48 w-full rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
                      <ImageIcon size={32} />
                      <p className="mt-2 text-sm">
                        No image uploaded yet
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Image Alt Text
                    </label>

                    <input
                      value={slide.alt || ""}
                      onChange={(e) =>
                        handleSlideChange(index, "alt", e.target.value)
                      }
                      placeholder="Describe the image"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]"
                    />
                  </div>
                </div>
              </div>
            ))}

            {form.heroSlides.length === 0 && (
              <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                No slider images added yet. Click Add Image to get started.
              </p>
            )}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingIndex !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-7 py-3 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Homepage Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
