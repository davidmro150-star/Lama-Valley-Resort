
"use client";

import { Printer } from "lucide-react";

export default function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center justify-center gap-2 rounded-xl bg-[#234b3b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173729] focus:outline-none focus:ring-2 focus:ring-[#234b3b] focus:ring-offset-2"
    >
      <Printer size={17} />
      Print / Save as PDF
    </button>
  );
}
