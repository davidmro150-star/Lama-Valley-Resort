
import transporter from "@/lib/mailer";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date(date));
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default async function sendBookingConfirmation(booking) {
  if (!booking?.bookingReference) {
    throw new Error("Booking reference is missing.");
  }

  if (!booking?.guestEmail) {
    throw new Error("Guest email is missing.");
  }

  const guestName = escapeHtml(booking.guestName);
  const cottageName = escapeHtml(
    booking.cottage?.name || "Reserved Cottage"
  );
  const bookingReference = escapeHtml(booking.bookingReference);

  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);
  const totalPrice = formatPrice(booking.totalPrice);
  const guests = Number(booking.guests) || 1;

  const paymentStatus = {
    paid: "Paid",
    unpaid: "Unpaid",
    refunded: "Refunded",
  }[booking.paymentStatus] || "Unpaid";

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");

  const bookingStatusUrl = `${siteUrl}/booking-status`;
  const safeBookingStatusUrl = escapeHtml(bookingStatusUrl);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f4f6f4;font-family:Arial,sans-serif;color:#333;">
        <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;">

          <div style="background:#234b3b;padding:30px 20px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:25px;">Lama Valley Resort</h1>
            <p style="margin:8px 0 0;color:#e2eee7;font-size:14px;">
              Resort & Restaurant · Lama, Bandarban
            </p>
          </div>

          <div style="padding:30px 25px;">
            <h2 style="color:#234b3b;margin-top:0;">
              Your Booking Is Confirmed!
            </h2>

            <p>Dear ${guestName},</p>

            <p style="line-height:1.7;">
              Great news! Your reservation at Lama Valley Resort & Restaurant
              has been confirmed. We look forward to welcoming you.
            </p>

            <div style="background:#edf6ef;padding:18px;border-radius:8px;margin:25px 0;">
              <p style="margin:0;color:#234b3b;font-size:13px;">
                BOOKING REFERENCE
              </p>
              <h2 style="margin:7px 0 0;color:#234b3b;letter-spacing:2px;">
                ${bookingReference}
              </h2>
            </div>

            <h3 style="color:#234b3b;">Reservation Details</h3>

            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Guest Name</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${guestName}</td>
              </tr>
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Accommodation</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${cottageName}</td>
              </tr>
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Check-in</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;">${checkIn}</td>
              </tr>
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Check-out</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;">${checkOut}</td>
              </tr>
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Number of Guests</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;">${guests}</td>
              </tr>
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Total Amount</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${totalPrice}</td>
              </tr>
              <tr>
                <td style="padding:11px 0;color:#777;">Payment Status</td>
                <td style="padding:11px 0;text-align:right;font-weight:bold;">${paymentStatus}</td>
              </tr>
            </table>

            <div style="margin:25px 0;padding:20px;background:#f7f5ef;border-radius:8px;">
              <p style="margin:0;color:#555;font-size:14px;line-height:1.7;">
                Please keep your booking reference safe. You can use it to
                check your reservation status at any time.
              </p>
            </div>

            <div style="margin:25px 0;text-align:center;">
              <a href="${safeBookingStatusUrl}" target="_blank"
                style="display:inline-block;background:#234b3b;color:#fff;text-decoration:none;padding:14px 25px;border-radius:6px;font-size:14px;font-weight:bold;">
                Check Booking Status
              </a>
            </div>

            <p style="font-size:14px;line-height:1.7;">
              If you have any questions, please contact the resort team.
            </p>

            <p style="margin-top:25px;line-height:1.7;">
              Regards,<br />
              <strong>Lama Valley Resort & Restaurant</strong><br />
              Lama, Bandarban, Bangladesh
            </p>
          </div>

          <div style="background:#f4f6f4;padding:18px;text-align:center;color:#777;font-size:12px;">
            Thank you for choosing Lama Valley Resort.
          </div>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Dear ${booking.guestName},

Great news! Your reservation at Lama Valley Resort & Restaurant has been confirmed.

BOOKING REFERENCE
${booking.bookingReference}

RESERVATION DETAILS
Guest Name: ${booking.guestName}
Accommodation: ${booking.cottage?.name || "Reserved Cottage"}
Check-in: ${checkIn}
Check-out: ${checkOut}
Guests: ${guests}
Total Amount: ${totalPrice}
Payment Status: ${paymentStatus}

Check your booking status:
${bookingStatusUrl}

We look forward to welcoming you.

Regards,
Lama Valley Resort & Restaurant
Lama, Bandarban, Bangladesh
  `;

  return transporter.sendMail({
    from: `"Lama Valley Resort & Restaurant" <${process.env.EMAIL_USER}>`,
    to: booking.guestEmail,
    subject: `Booking Confirmed – ${booking.bookingReference} | Lama Valley Resort`,
    text: emailText,
    html: emailHtml,
  });
}
