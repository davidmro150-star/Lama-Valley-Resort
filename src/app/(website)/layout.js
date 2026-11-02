
import Navbar from "@/components/website/Navbar";

export default function WebsiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
