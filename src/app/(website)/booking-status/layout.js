
const siteUrl = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const metadata = {
  title: "Check Booking Status | Lama Valley Resort",
  description:
    "Check your Lama Valley Resort reservation status using your booking reference and email address.",

  keywords: [
    "Lama Valley Resort booking status",
    "Check Bandarban resort reservation",
    "Lama cottage booking status",
  ],

  alternates: {
    canonical: `${siteUrl}/booking-status`,
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function BookingStatusLayout({ children }) {
  return children;
}
