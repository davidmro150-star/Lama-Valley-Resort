
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

const MAX_SLIDES = 8;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const iconOptions = [
  "Mountain",
  "Coffee",
  "Heart",
  "Leaf",
  "Utensils",
  "Trees",
  "Waves",
  "Camera",
  "BedDouble",
  "Sparkles",
  "MapPin",
  "Star",
  "Sun",
  "Flower2",
];

const initialForm = {
  heroLocation: "",
  heroTitle: "",
  heroDescription: "",
  primaryButtonText: "",
  primaryButtonLink: "",
  secondaryButtonText: "",
  secondaryButtonLink: "",
  heroSlides: [],

  aboutSection: {
    eyebrow: "Welcome to Lama Valley",
    title: "Experience the Beauty of the Hills",
    description: "",
    description2: "",
    image: "",
    imageAlt: "",
    buttonText: "Discover More",
    buttonLink: "/about",
  },

  staysSection: {
    eyebrow: "Our Accommodation",
    title: "Find Your Perfect Stay",
    description: "",
    buttonText: "View All Accommodation",
    buttonLink: "/stays",
  },

  diningSection: {
    eyebrow: "Food & Dining",
    title: "A Delicious Experience in the Hills",
    description: "",
    cards: [
      {
        name: "Local Cuisine",
        description: "",
        image: "",
        label: "Regional Flavours",
        alt: "Local cuisine",
      },
      {
        name: "Fresh & Delicious",
        description: "",
        image: "",
        label: "Fresh Ingredients",
        alt: "Freshly prepared food",
      },
      {
        name: "Dining Experience",
        description: "",
        image: "",
        label: "A Taste to Remember",
        alt: "Restaurant dining experience",
      },
    ],
    buttonText: "Explore Restaurant",
    buttonLink: "/restaurant",
  },

  featuresSection: {
    eyebrow: "The Lama Valley Experience",
    title: "A Place to Relax, Explore & Reconnect",
    description: "",
    features: [
      {
        icon: "Mountain",
        title: "Beautiful Nature",
        description: "",
      },
      {
        icon: "Coffee",
        title: "Food & Dining",
        description: "",
      },
      {
        icon: "Heart",
        title: "Relaxing Escape",
        description: "",
      },
      {
        icon: "Leaf",
        title: "Closer to Nature",
        description: "",
      },
    ],
  },

  gallerySection: {
    eyebrow: "Our Gallery",
    title: "Moments Worth Remembering",
    description: "",
    buttonText: "Explore Full Gallery",
    buttonLink: "/gallery",
  },
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#426b55]";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-700";

function mergeFormData(data) {
  return {
    ...initialForm,
    ...data,

    heroSlides: data?.heroSlides || [],

    aboutSection: {
      ...initialForm.aboutSection,
      ...data?.aboutSection,
    },

    staysSection: {
      ...initialForm.staysSection,
      ...data?.staysSection,
    },

    diningSection: {
      ...initialForm.diningSection,
      ...data?.diningSection,
      cards: Array.isArray(data?.diningSection?.cards)
        ? data.diningSection.cards
        : initialForm.diningSection.cards,
    },

    featuresSection: {
      ...initialForm.featuresSection,
      ...data?.featuresSection,
      features:
        data?.featuresSection?.features?.length > 0
          ? data.featuresSection.features
          : initialForm.featuresSection.features,
    },

    gallerySection: {
      ...initialForm.gallerySection,
      ...data?.gallerySection,
    },
  };
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

function ImageUploader({
  label,
  value,
  alt,
  onUpload,
  disabled,
  uploading,
}) {
  const inputRef = useRef(null);

  return (
    <div>
      <label className={labelClass}>{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#234b3b] px-4 py-3 text-sm font-semibold text-[#234b3b] hover:bg-[#234b3b]/5 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={17} />
            {value ? "Change Image" : "Upload Image"}
          </>
        )}
      </button>

      <p className="mt-2 text-xs text-gray-400">
        JPG, PNG, WebP or AVIF. Maximum 10 MB.
      </p>

      {value ? (
        <div className="mt-4">
          <Image
            src={value}
            alt={alt || "Image preview"}
            width={1200}
            height={600}
            unoptimized
            className="h-48 w-full rounded-lg object-cover"
          />
        </div>
      ) : (
        <div className="mt-4 flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400">
          <ImageIcon size={30} />
          <p className="mt-2 text-sm">No image uploaded</p>
        </div>
      )}
    </div>
  );
}

export default function HomePageEditor() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRefs = useRef({});

  const fetchHomePage = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/home-page", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load homepage.");
      }

      setForm(mergeFormData(data.homePage));
    } catch (err) {
      setError(err.message || "Failed to load homepage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadHomePage() {
      try {
        const response = await fetch("/api/admin/home-page", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load homepage.");
        }

        setForm(mergeFormData(data.homePage));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load homepage.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHomePage();

    return () => controller.abort();
  }, []);

  const updateField = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateSection = (sectionName, field, value) => {
    setForm((previous) => ({
      ...previous,
      [sectionName]: {
        ...previous[sectionName],
        [field]: value,
      },
    }));
  };

  const updateDiningCard = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      diningSection: {
        ...previous.diningSection,
        cards: previous.diningSection.cards.map((card, i) =>
          i === index ? { ...card, [field]: value } : card
        ),
      },
    }));
  };

  const updateFeature = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      featuresSection: {
        ...previous.featuresSection,
        features: previous.featuresSection.features.map((feature, i) =>
          i === index ? { ...feature, [field]: value } : feature
        ),
      },
    }));
  };

  const uploadImage = async (file, target) => {
    if (!file) return null;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, WebP and AVIF images are allowed.");
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      throw new Error("Image size must be between 1 byte and 10 MB.");
    }

    try {
      setUploadingTarget(target);
      setError("");
      setMessage("");

      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.image?.url) {
        throw new Error(result.message || "Image upload failed.");
      }

      setMessage("Image uploaded successfully.");
      return result.image.url;
    } finally {
      setUploadingTarget("");
    }
  };

  const handleHeroImageUpload = async (index, file) => {
    try {
      const url = await uploadImage(file, `hero-${index}`);

      if (!url) return;

      setForm((previous) => ({
        ...previous,
        heroSlides: previous.heroSlides.map((slide, i) =>
          i === index ? { ...slide, image: url } : slide
        ),
      }));
    } catch (err) {
      setError(err.message || "Image upload failed.");
    }
  };

  const handleAboutImageUpload = async (file) => {
    try {
      const url = await uploadImage(file, "about");

      if (url) {
        updateSection("aboutSection", "image", url);
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
    }
  };

  const handleDiningImageUpload = async (index, file) => {
    try {
      const url = await uploadImage(file, `dining-${index}`);

      if (url) {
        updateDiningCard(index, "image", url);
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
    }
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
  };

  const addDiningCard = () => {
    if (form.diningSection.cards.length >= 12) {
      setError("You can add a maximum of 12 restaurant cards.");
      return;
    }

    setError("");

    setForm((previous) => ({
      ...previous,
      diningSection: {
        ...previous.diningSection,
        cards: [
          ...previous.diningSection.cards,
          {
            name: "",
            description: "",
            image: "",
            label: "",
            alt: "",
          },
        ],
      },
    }));
  };

  const removeDiningCard = (index) => {
    setForm((previous) => ({
      ...previous,
      diningSection: {
        ...previous.diningSection,
        cards: previous.diningSection.cards.filter((_, i) => i !== index),
      },
    }));
  };

  const addFeature = () => {
    if (form.featuresSection.features.length >= 12) {
      setError("You can add a maximum of 12 features.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      featuresSection: {
        ...previous.featuresSection,
        features: [
          ...previous.featuresSection.features,
          {
            icon: "Mountain",
            title: "",
            description: "",
          },
        ],
      },
    }));
  };

  const removeFeature = (index) => {
    setForm((previous) => ({
      ...previous,
      featuresSection: {
        ...previous.featuresSection,
        features: previous.featuresSection.features.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

   const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/home-page", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to save homepage content."
      );
    }

    // Reload the actual saved content into the dashboard.
    const refreshedResponse = await fetch("/api/admin/home-page", {
      cache: "no-store",
    });

    const refreshedData = await refreshedResponse.json();

    if (!refreshedResponse.ok) {
      throw new Error("Saved, but failed to reload homepage content.");
    }

    setForm(mergeFormData(refreshedData.homePage));

    setMessage("Homepage content saved successfully!");
  } catch (error) {
    console.error("Homepage save error:", error);
    setMessage(error.message || "Something went wrong.");
  } finally {
    setSaving(false);
  }
};


  const busy = saving || uploadingTarget !== "";

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
            Manage your homepage sections, images and content from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHomePage}
          disabled={busy}
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
        <div className="border-l-4 border-[#234b3b] pl-3">
          <h2 className="text-2xl font-bold text-gray-900">
            1. Hero Section
          </h2>
          <p className="text-sm text-gray-500">
            Main homepage banner and background images.
          </p>
        </div>

        <SectionCard title="Hero Content">
          <TextField
            label="Location Text"
            value={form.heroLocation}
            onChange={(value) => updateField("heroLocation", value)}
          />

          <TextField
            label="Main Heading"
            value={form.heroTitle}
            onChange={(value) => updateField("heroTitle", value)}
            multiline
            rows={2}
          />

          <TextField
            label="Description"
            value={form.heroDescription}
            onChange={(value) => updateField("heroDescription", value)}
            multiline
            rows={4}
          />
        </SectionCard>

        <SectionCard title="Hero Buttons">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Primary Button</h3>

              <TextField
                label="Button Text"
                value={form.primaryButtonText}
                onChange={(value) => updateField("primaryButtonText", value)}
              />

              <TextField
                label="Button Link"
                value={form.primaryButtonLink}
                onChange={(value) => updateField("primaryButtonLink", value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Secondary Button</h3>

              <TextField
                label="Button Text"
                value={form.secondaryButtonText}
                onChange={(value) =>
                  updateField("secondaryButtonText", value)
                }
              />

              <TextField
                label="Button Link"
                value={form.secondaryButtonLink}
                onChange={(value) =>
                  updateField("secondaryButtonLink", value)
                }
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Background Slider Images"
          description="Upload up to 8 hero images. JPG, PNG, WebP or AVIF. Maximum 10 MB per image."
        >
          <button
            type="button"
            onClick={addSlide}
            disabled={form.heroSlides.length >= MAX_SLIDES || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173729] disabled:opacity-50"
          >
            <Plus size={17} />
            Add Image ({form.heroSlides.length}/{MAX_SLIDES})
          </button>

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
                  disabled={busy}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>

              <input
                ref={(element) => {
                  fileInputRefs.current[index] = element;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) =>
                  handleHeroImageUpload(index, e.target.files?.[0])
                }
              />

              <button
                type="button"
                onClick={() => fileInputRefs.current[index]?.click()}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-[#234b3b] px-4 py-3 text-sm font-semibold text-[#234b3b] disabled:opacity-50"
              >
                {uploadingTarget === `hero-${index}` ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Upload size={17} />
                )}
                {slide.image ? "Change Image" : "Upload Image"}
              </button>

              {slide.image && (
                <Image
                  src={slide.image}
                  alt={slide.alt || `Hero slide ${index + 1}`}
                  width={1200}
                  height={480}
                  unoptimized
                  className="mt-4 h-48 w-full rounded-lg object-cover"
                />
              )}

              <div className="mt-4">
                <TextField
                  label="Image Alt Text"
                  value={slide.alt}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      heroSlides: previous.heroSlides.map((item, i) =>
                        i === index ? { ...item, alt: value } : item
                      ),
                    }))
                  }
                  placeholder="Describe the image"
                />
              </div>
            </div>
          ))}

          {form.heroSlides.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              No slider images added yet.
            </p>
          )}
        </SectionCard>

        <div className="border-l-4 border-[#234b3b] pl-3">
          <h2 className="text-2xl font-bold text-gray-900">2. About Section</h2>
          <p className="text-sm text-gray-500">
            Homepage introduction to Lama Valley.
          </p>
        </div>

        <SectionCard title="About Content">
          <TextField
            label="Small Heading / Eyebrow"
            value={form.aboutSection.eyebrow}
            onChange={(value) =>
              updateSection("aboutSection", "eyebrow", value)
            }
          />

          <TextField
            label="Main Heading"
            value={form.aboutSection.title}
            onChange={(value) =>
              updateSection("aboutSection", "title", value)
            }
          />

          <TextField
            label="First Description"
            value={form.aboutSection.description}
            onChange={(value) =>
              updateSection("aboutSection", "description", value)
            }
            multiline
            rows={4}
          />

          <TextField
            label="Second Description"
            value={form.aboutSection.description2}
            onChange={(value) =>
              updateSection("aboutSection", "description2", value)
            }
            multiline
            rows={4}
          />

          <ImageUploader
            label="About Section Image"
            value={form.aboutSection.image}
            alt={form.aboutSection.imageAlt}
            onUpload={handleAboutImageUpload}
            disabled={busy}
            uploading={uploadingTarget === "about"}
          />

          <TextField
            label="Image Alt Text"
            value={form.aboutSection.imageAlt}
            onChange={(value) =>
              updateSection("aboutSection", "imageAlt", value)
            }
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Button Text"
              value={form.aboutSection.buttonText}
              onChange={(value) =>
                updateSection("aboutSection", "buttonText", value)
              }
            />

            <TextField
              label="Button Link"
              value={form.aboutSection.buttonLink}
              onChange={(value) =>
                updateSection("aboutSection", "buttonLink", value)
              }
            />
          </div>
        </SectionCard>

        <div className="border-l-4 border-[#234b3b] pl-3">
          <h2 className="text-2xl font-bold text-gray-900">3. Stays Section</h2>
          <p className="text-sm text-gray-500">
            Homepage accommodation introduction.
          </p>
        </div>

        <SectionCard title="Stays Content">
          <TextField
            label="Small Heading / Eyebrow"
            value={form.staysSection.eyebrow}
            onChange={(value) =>
              updateSection("staysSection", "eyebrow", value)
            }
          />

          <TextField
            label="Main Heading"
            value={form.staysSection.title}
            onChange={(value) =>
              updateSection("staysSection", "title", value)
            }
          />

          <TextField
            label="Description"
            value={form.staysSection.description}
            onChange={(value) =>
              updateSection("staysSection", "description", value)
            }
            multiline
            rows={4}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Button Text"
              value={form.staysSection.buttonText}
              onChange={(value) =>
                updateSection("staysSection", "buttonText", value)
              }
            />

            <TextField
              label="Button Link"
              value={form.staysSection.buttonLink}
              onChange={(value) =>
                updateSection("staysSection", "buttonLink", value)
              }
            />
          </div>
        </SectionCard>

        <div className="border-l-4 border-[#234b3b] pl-3">
          <h2 className="text-2xl font-bold text-gray-900">
            4. Restaurant Section
          </h2>
          <p className="text-sm text-gray-500">
            Homepage dining introduction and promotional cards.
          </p>
        </div>

        <SectionCard title="Restaurant Heading and Button">
          <TextField
            label="Small Heading / Eyebrow"
            value={form.diningSection.eyebrow}
            onChange={(value) =>
              updateSection("diningSection", "eyebrow", value)
            }
          />

          <TextField
            label="Main Heading"
            value={form.diningSection.title}
            onChange={(value) =>
              updateSection("diningSection", "title", value)
            }
          />

          <TextField
            label="Description"
            value={form.diningSection.description}
            onChange={(value) =>
              updateSection("diningSection", "description", value)
            }
            multiline
            rows={4}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Main Button Text"
              value={form.diningSection.buttonText}
              onChange={(value) =>
                updateSection("diningSection", "buttonText", value)
              }
            />

            <TextField
              label="Main Button Link"
              value={form.diningSection.buttonLink}
              onChange={(value) =>
                updateSection("diningSection", "buttonLink", value)
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Restaurant Promotional Cards"
          description="Manage the cards displayed in the homepage restaurant slider. Maximum 12 cards. Incomplete cards are saved but not displayed publicly."
        >
          <button
            type="button"
            onClick={addDiningCard}
            disabled={form.diningSection.cards.length >= 12 || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus size={17} />
            Add Restaurant Card
          </button>

          {form.diningSection.cards.map((card, index) => (
            <div
              key={card._id || index}
              className="space-y-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  Restaurant Card {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeDiningCard(index)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>

              <TextField
                label="Card Name"
                value={card.name}
                onChange={(value) => updateDiningCard(index, "name", value)}
              />

              <TextField
                label="Card Description"
                value={card.description}
                onChange={(value) =>
                  updateDiningCard(index, "description", value)
                }
                multiline
                rows={3}
              />

              <TextField
                label="Small Card Label"
                value={card.label}
                onChange={(value) => updateDiningCard(index, "label", value)}
              />

              <ImageUploader
                label="Card Image"
                value={card.image}
                alt={card.alt}
                onUpload={(file) => handleDiningImageUpload(index, file)}
                disabled={busy}
                uploading={uploadingTarget === `dining-${index}`}
              />

              <TextField
                label="Image Alt Text"
                value={card.alt}
                onChange={(value) => updateDiningCard(index, "alt", value)}
              />
            </div>
          ))}
        </SectionCard>

        <div className="border-l-4 border-[#234b3b] pl-3">
          <h2 className="text-2xl font-bold text-gray-900">
            5. Why Choose Us Section
          </h2>
          <p className="text-sm text-gray-500">
            Manage the homepage resort highlights and feature cards.
          </p>
        </div>

        <SectionCard title="Features Heading">
          <TextField
            label="Small Heading / Eyebrow"
            value={form.featuresSection.eyebrow}
            onChange={(value) =>
              updateSection("featuresSection", "eyebrow", value)
            }
          />

          <TextField
            label="Main Heading"
            value={form.featuresSection.title}
            onChange={(value) =>
              updateSection("featuresSection", "title", value)
            }
          />

          <TextField
            label="Description"
            value={form.featuresSection.description}
            onChange={(value) =>
              updateSection("featuresSection", "description", value)
            }
            multiline
            rows={4}
          />
        </SectionCard>

        <SectionCard
          title="Feature Cards"
          description="Choose an icon and manage each feature. Maximum 12 cards. Incomplete features are allowed to be saved."
        >
          <button
            type="button"
            onClick={addFeature}
            disabled={form.featuresSection.features.length >= 12 || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-[#234b3b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus size={17} />
            Add Feature
          </button>

          {form.featuresSection.features.map((feature, index) => (
            <div
              key={feature._id || index}
              className="space-y-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  Feature {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>

              <div>
                <label className={labelClass}>Feature Icon</label>

                <select
                  value={feature.icon || "Mountain"}
                  onChange={(e) =>
                    updateFeature(index, "icon", e.target.value)
                  }
                  className={inputClass}
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <TextField
                label="Feature Title"
                value={feature.title}
                onChange={(value) => updateFeature(index, "title", value)}
              />

              <TextField
                label="Feature Description"
                value={feature.description}
                onChange={(value) =>
                  updateFeature(index, "description", value)
                }
                multiline
                rows={3}
              />
            </div>
          ))}
        </SectionCard>

        <div className="border-l-4 border-[#234b3b] pl-3">
          <h2 className="text-2xl font-bold text-gray-900">
            6. Gallery Section
          </h2>
          <p className="text-sm text-gray-500">
            Manage the homepage gallery introduction.
          </p>
        </div>

        <SectionCard title="Gallery Content">
          <TextField
            label="Small Heading / Eyebrow"
            value={form.gallerySection.eyebrow}
            onChange={(value) =>
              updateSection("gallerySection", "eyebrow", value)
            }
          />

          <TextField
            label="Main Heading"
            value={form.gallerySection.title}
            onChange={(value) =>
              updateSection("gallerySection", "title", value)
            }
          />

          <TextField
            label="Description"
            value={form.gallerySection.description}
            onChange={(value) =>
              updateSection("gallerySection", "description", value)
            }
            multiline
            rows={4}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Button Text"
              value={form.gallerySection.buttonText}
              onChange={(value) =>
                updateSection("gallerySection", "buttonText", value)
              }
            />

            <TextField
              label="Button Link"
              value={form.gallerySection.buttonLink}
              onChange={(value) =>
                updateSection("gallerySection", "buttonLink", value)
              }
            />
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#234b3b] px-7 py-3 font-semibold text-white transition hover:bg-[#173729] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {saving ? "Saving..." : "Save Homepage Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
