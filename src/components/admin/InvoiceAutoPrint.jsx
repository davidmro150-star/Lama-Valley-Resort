
"use client";

import { useEffect } from "react";

export default function InvoiceAutoPrint() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Remove the print parameter so refreshing the invoice
      // does not automatically open the print dialog again.
      const url = new URL(window.location.href);
      url.searchParams.delete("print");

      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`
      );

      window.print();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
