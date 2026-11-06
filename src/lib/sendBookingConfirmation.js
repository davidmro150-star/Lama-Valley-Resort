
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
  // Validate booking reference
  if (!booking?.bookingReference) {
    throw new Error(
      "Booking reference is missing. Cannot send confirmation email."
    );
  }

  const guestName = escapeHtml(booking.guestName);

  const cottageName = escapeHtml(
    booking.cottage?.name || "Reserved Cottage"
  );

  // Use the actual reference stored in MongoDB
  const bookingReference = escapeHtml(booking.bookingReference);

  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);
  const totalPrice = formatPrice(booking.totalPrice);

  const paymentStatus =
    booking.paymentStatus === "paid" ? "Paid" : "Pending";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f4f6f4;font-family:Arial,sans-serif;color:#333;">
        <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;">

          <div style="background:#234b3b;padding:30px 20px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:25px;">
              Lama Valley Resort
            </h1>
            <p style="margin:8px 0 0;color:#e2eee7;font-size:14px;">
              Resort & Restaurant · Lama, Bandarban
            </p>
          </div>

          <div style="padding:30px 25px;">
            <h2 style="color:#234b3b;margin-top:0;">
              Your Booking Is Confirmed!
            </h2>

            <p>Dear ${guestName},</p>

            <p>
              Great news! Your reservation at Lama Valley Resort
              & Restaurant has been confirmed.
              We look forward to welcoming you.
            </p>

            <div style="background:#edf5ef;padding:18px;border-radius:8px;margin:25px 0;">
              <p style="margin:0;color:#234b3b;font-size:13px;">
                BOOKING REFERENCE
              </p>
              <h2 style="margin:7px 0 0;color:#234b3b;letter-spacing:2px;">
                ${bookingReference}
              </h2>
              <p style="margin:8px 0 0;color:#555;font-size:12px;">
                Keep this reference to check your booking status.
              </p>
            </div>

            <h3 style="color:#234b3b;">Booking Details</h3>

            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Guest Name</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${guestName}</td>
              </tr>

              <tr>
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Cottage</td>
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
                <td style="padding:11px 0;border-bottom:1px solid #eee;color:#777;">Guests</td>
                <td style="padding:11px 0;border-bottom:1px solid #eee;text-align:right;">${booking.guests}</td>
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

            <p style="margin-top:25px;font-size:14px;line-height:1.7;">
              Please keep this email for your reference.
              If you have any questions, contact the resort team.
            </p>

            <p style="margin-top:25px;">
              Warm regards,<br />
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

Your booking at Lama Valley Resort & Restaurant has been confirmed.

Booking Reference: ${booking.bookingReference}
Cottage: ${booking.cottage?.name || "Reserved Cottage"}
Check-in: ${checkIn}
Check-out: ${checkOut}
Guests: ${booking.guests}
Total Amount: ${totalPrice}
Payment Status: ${paymentStatus}

Keep your booking reference to check your booking status.

We look forward to welcoming you!

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
