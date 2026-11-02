
import "./globals.css";

export const metadata = {
  title: {
    default: "Lama Valley Resort & Restaurant | Lama, Bandarban",
    template: "%s | Lama Valley Resort",
  },
  description:
    "Discover Lama Valley Resort & Restaurant in Lama, Bandarban. Explore accommodation, dining, and the natural beauty of the surrounding area.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
