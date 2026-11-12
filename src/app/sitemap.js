
import connectDB from "@/lib/mongodb";
import Cottage from "@/models/Cottage";

export const dynamic = "force-dynamic";

const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const staticPages = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/stays", priority: 0.9, changeFrequency: "weekly" },
  { path: "/restaurant", priority: 0.8, changeFrequency: "weekly" },
  { path: "/packages", priority: 0.9, changeFrequency: "weekly" },
  { path: "/gallery", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.9, changeFrequency: "monthly" },
];

const restaurantCategories = [
  "breakfast",
  "lunch",
  "dinner",
  "desserts",
];

export default async function sitemap() {
  const lastModified = new Date();

  const urls = staticPages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Restaurant category pages
  for (const category of restaurantCategories) {
    urls.push({
      url: `${siteUrl}/restaurant/${category}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Dynamic cottage detail pages
  try {
    await connectDB();

    const cottages = await Cottage.find({ isActive: true })
      .select("slug updatedAt createdAt")
      .lean();

    for (const cottage of cottages) {
      if (!cottage.slug) continue;

      urls.push({
        url: `${siteUrl}/stays/${cottage.slug}`,
        lastModified:
          cottage.updatedAt || cottage.createdAt || lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (error) {
    console.error("Sitemap cottage loading error:", error);
  }

  return urls;
}
