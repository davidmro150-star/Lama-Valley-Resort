
import Footer from "@/components/website/Footer";
import Navbar from "@/components/website/Navbar";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export default async function WebsiteLayout({ children }) {
  const branding = {
    resortName: "Lama Valley Resort & Restaurant",
    logoUrl: "",
    logoAlt: "Lama Valley Resort & Restaurant",
    primaryColor: "#234b3b",
    accentColor: "#c49a62",
    phone: "",
    email: "",
    address: "",
    description: "",
  };

  try {
    await connectDB();

    const settings = await SiteSettings.findOne()
      .select(
        "resortName logoUrl logoAlt primaryColor accentColor phone email address shortDescription"
      )
      .lean();

    if (settings) {
      branding.resortName =
        settings.resortName || branding.resortName;

      branding.logoUrl = settings.logoUrl || "";
      branding.logoAlt =
        settings.logoAlt || branding.logoAlt;

      branding.primaryColor =
        settings.primaryColor || branding.primaryColor;

      branding.accentColor =
        settings.accentColor || branding.accentColor;

      branding.phone = settings.phone || "";
      branding.email = settings.email || "";
      branding.address = settings.address || "";
      branding.description = settings.shortDescription || "";
    }
  } catch (error) {
    console.error("Website settings error:", error);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: branding.resortName,
    description: branding.description,
    ...(branding.phone
      ? { telephone: branding.phone }
      : {}),
    ...(branding.email
      ? { email: branding.email }
      : {}),
    ...(branding.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: branding.address,
            addressCountry: "BD",
          },
        }
      : {}),
  };

  const structuredDataJSON = JSON.stringify(structuredData).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredDataJSON,
        }}
      />

      <style>
        {`
          :root {
            --brand-primary: ${branding.primaryColor};
            --brand-accent: ${branding.accentColor};
          }
        `}
      </style>

      <Navbar
        logoUrl={branding.logoUrl}
        logoAlt={branding.logoAlt}
      />

      {children}

      <Footer />
    </>
  );
}
