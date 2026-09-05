// Plug in a real email/SMS provider here (e.g. Resend, SendGrid for email;
// MSG91, Twilio for SMS). For now this just logs — replace the bodies of
// these two functions with real API calls once you have provider keys.

export async function sendOrderConfirmation(order) {
  console.log(
    `[notify] Order confirmed: ${order.order_number} — would email ${order.email || "(none)"} and SMS ${order.phone}`
  );

  // Example (Resend) — uncomment and add RESEND_API_KEY to .env.local:
  // if (order.email && process.env.RESEND_API_KEY) {
  //   await fetch("https://api.resend.com/emails", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       from: "orders@seiszn.in",
  //       to: order.email,
  //       subject: `Your Seiszn order ${order.order_number} is confirmed`,
  //       html: `<p>Thanks for your order! Track it at seiszn.in/track-order with order ID ${order.order_number}.</p>`,
  //     }),
  //   });
  // }

  // Example (MSG91) — uncomment and add MSG91_AUTH_KEY to .env.local:
  // if (process.env.MSG91_AUTH_KEY) {
  //   await fetch(`https://api.msg91.com/api/v5/flow/`, {
  //     method: "POST",
  //     headers: { authkey: process.env.MSG91_AUTH_KEY, "Content-Type": "application/json" },
  //     body: JSON.stringify({ /* template + mobile + order_number */ }),
  //   });
  // }
}

export async function sendShippingUpdate(order) {
  console.log(
    `[notify] Order shipped: ${order.order_number} — tracking ${order.shiprocket_tracking_id}`
  );
  // Same pattern as above, triggered from the admin route when a tracking ID is added.
}
