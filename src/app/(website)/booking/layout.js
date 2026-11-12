export const metadata = {
  title: "Book Your Stay | Lama Valley Resort, Bandarban",
  description:
    "Book your cottage stay at Lama Valley Resort in Lama, Bandarban. Choose your check-in and check-out dates, select your guests and submit a reservation request.",

  keywords: [
    "Book Lama Valley Resort",
    "Lama Bandarban cottage booking",
    "Bandarban resort reservation",
    "Book cottage in Lama",
    "Lama Valley accommodation booking",
    "Resort booking in Bandarban",
  ],

  alternates: {
    canonical: `${
      (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")
    }/booking`,
  },

  openGraph: {
    title: "Book Your Stay | Lama Valley Resort",
    description:
      "Plan your stay at Lama Valley Resort in Lama, Bandarban. Submit your cottage reservation request online.",
    url: `${
      (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "")
    }/booking`,
    siteName: "Lama Valley Resort & Restaurant",
    type: "website",
  },

  robots: {
    index: false,
    follow: true,
  },
};

export default function BookingLayout({ children }) {
  return children;
}