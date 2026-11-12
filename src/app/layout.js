
import "./globals.css";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function generateMetadata() {
  const defaultMetadata = {
    resortName: "Lama Valley Resort & Restaurant",
    faviconUrl: "/favicon.ico",
    seo: {},
    shortDescription: "",
  };

  try {
    await connectDB();

    const settings = await SiteSettings.findOne()
      .select("resortName faviconUrl seo shortDescription")
      .lean();

    if (settings) {
      defaultMetadata.resortName =
        settings.resortName || defaultMetadata.resortName;

      defaultMetadata.faviconUrl =
        settings.faviconUrl || defaultMetadata.faviconUrl;

      defaultMetadata.seo = settings.seo || {};

      defaultMetadata.shortDescription =
        settings.shortDescription || "";
    }
  } catch (error) {
    console.error("SEO metadata error:", error);
  }

  const seo = defaultMetadata.seo;

  const title =
    seo.metaTitle ||
    "Lama Valley Resort & Restaurant | Lama, Bandarban";

  const description =
    seo.metaDescription ||
    defaultMetadata.shortDescription ||
    "Discover Lama Valley Resort & Restaurant in Lama, Bandarban. Enjoy comfortable accommodation, delicious dining, and beautiful hill scenery.";

  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = seo.ogImage || "";

  return {
    metadataBase: new URL(
      (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")
    ),

    title: {
      default: title,
      template: "%s | Lama Valley Resort",
    },

    description,

    keywords: Array.isArray(seo.keywords)
      ? seo.keywords
      : [],

    robots: {
      index: seo.robotsIndex !== false,
      follow: seo.robotsFollow !== false,
      googleBot: {
        index: seo.robotsIndex !== false,
        follow: seo.robotsFollow !== false,
      },
    },

    icons: {
      icon: defaultMetadata.faviconUrl,
    },

    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: defaultMetadata.resortName,
      type: seo.ogType || "website",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: ogTitle,
              },
            ],
          }
        : {}),
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
