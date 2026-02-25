import payfastClient from "../config/payfast.js";
import pool from "../config/database.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const renderSuccessPage = () => `
<!DOCTYPE html>
<html>
<head>
  <title>Payment Successful</title>
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
    .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
    .success { color: #4CAF50; font-size: 48px; margin-bottom: 20px; }
    h1 { color: #333; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success">OK</div>
    <h1>Payment Successful!</h1>
    <p>Thank you for your payment. Your order has been placed.</p>
    <p>You will be redirected shortly.</p>
  </div>
  <script>
    setTimeout(() => {
      window.location.href = 'http://localhost:5173/customer/home';
    }, 3000);
  </script>
</body>
</html>
`;

const sendNotifications = async ({ order, customerEmail }) => {
  const adminEmail = process.env.ADMIN_EMAIL || "chefernandez448@gmail.com";

  if (customerEmail) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: "Payment Confirmation - Kasi Eats",
        html: `
          <h2>Payment Successful</h2>
          <p>Thank you for your order.</p>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Amount:</strong> R${Number(order.total_amount).toFixed(2)}</p>
          <p>Your order is now being prepared.</p>
        `,
      });
      console.log(`Customer confirmation sent to ${customerEmail}`);
    } catch (error) {
      console.error("Customer email failed:", error);
    }
  } else {
    console.log(`No customer email found for order ${order.id}`);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Order - ${order.order_number}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order:</strong> ${order.order_number}</p>
        <p><strong>Customer:</strong> ${order.username} (${customerEmail || "unknown email"})</p>
        <p><strong>Amount:</strong> R${Number(order.total_amount).toFixed(2)}</p>
      `,
    });
    console.log(`Admin notification sent to ${adminEmail}`);
  } catch (error) {
    console.error("Admin email failed:", error);
  }
};

const finalizeSuccessfulPayment = async ({ orderId, pfPaymentId = null, emailHint = null, source = "unknown" }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.execute(
      `SELECT o.*, u.email AS user_email, u.username
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?
       FOR UPDATE`,
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      console.log(`[${source}] Order ${orderId} not found`);
      return { success: false, reason: "order_not_found" };
    }

    const order = orders[0];
    const alreadyPaid = String(order.payment_status).toLowerCase() === "paid";

    if (!alreadyPaid) {
      await connection.execute(
        `UPDATE orders
         SET payment_status = 'paid',
             payfast_payment_id = COALESCE(?, payfast_payment_id)
         WHERE id = ?`,
        [pfPaymentId, orderId]
      );
      await connection.execute("DELETE FROM cart WHERE user_id = ?", [order.user_id]);
    }

    await connection.commit();

    if (alreadyPaid) {
      console.log(`[${source}] Order ${orderId} already marked paid, skipping duplicate notifications`);
      return { success: true, alreadyPaid: true, order };
    }

    const customerEmail = order.user_email || emailHint || null;
    await sendNotifications({ order, customerEmail });
    return { success: true, alreadyPaid: false, order };
  } catch (error) {
    await connection.rollback();
    console.error(`[${source}] finalize payment error:`, error);
    return { success: false, reason: "db_error", error };
  } finally {
    connection.release();
  }
};

export const createPayment = async (req, res) => {
  try {
    const { first_name, last_name, email, amount, item_name, item_description, order_id } = req.body;

    console.log("Payment request received:", { first_name, email, amount, item_name, order_id });

    if (!first_name || !email || !amount || !item_name || !order_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const configuredReturnUrl = String(process.env.PAYFAST_RETURN_URL || "http://localhost:5401/api/payfast/success");
    const configuredCancelUrl = String(process.env.PAYFAST_CANCEL_URL || "http://localhost:5401/api/payfast/cancel");
    const configuredNotifyUrl = String(process.env.PAYFAST_NOTIFY_URL || "http://localhost:5401/api/payfast/notify");
    const returnUrl = configuredReturnUrl.includes("?")
      ? `${configuredReturnUrl}&order_id=${encodeURIComponent(order_id)}`
      : `${configuredReturnUrl}?order_id=${encodeURIComponent(order_id)}`;

    const paymentData = {
      return_url: returnUrl,
      cancel_url: configuredCancelUrl,
      notify_url: configuredNotifyUrl,
      name_first: String(first_name),
      name_last: String(last_name || ""),
      email_address: String(email),
      m_payment_id: String(order_id),
      amount: String(Number(amount).toFixed(2)),
      item_name: String(item_name).substring(0, 100),
      item_description: String(item_description || item_name),
    };

    Object.keys(paymentData).forEach((key) => {
      if (!paymentData[key] || paymentData[key] === "") delete paymentData[key];
    });

    const urlString = payfastClient.createStringfromObject(paymentData);
    const signature = payfastClient.createSignature(urlString);
    const paymentObject = payfastClient.createPaymentObject(paymentData, signature);

    return res.json({
      success: true,
      url: payfastClient.getPayfastUrl(),
      data: paymentObject,
    });
  } catch (error) {
    console.error("PAYFAST ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Payment initiation failed",
    });
  }
};

export const handleITN = async (req, res) => {
  console.log("========== ITN RECEIVED ==========");
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Headers:", JSON.stringify(req.headers, null, 2));

  // Acknowledge immediately so PayFast does not retry due to timeout.
  res.status(200).send("ITN received");

  try {
    const paymentStatus = String(req.body?.payment_status || "").toUpperCase();
    const orderId = req.body?.m_payment_id;
    const pfPaymentId = req.body?.pf_payment_id || null;
    const emailHint = req.body?.email_address || null;

    if (paymentStatus !== "COMPLETE") {
      console.log(`Ignoring ITN with payment_status=${paymentStatus || "unknown"}`);
      return;
    }

    if (!orderId) {
      console.log("COMPLETE ITN received without m_payment_id");
      return;
    }

    await finalizeSuccessfulPayment({
      orderId,
      pfPaymentId,
      emailHint,
      source: "itn",
    });
  } catch (error) {
    console.error("ITN processing error:", error);
  }
};

export const handleSuccessReturn = async (req, res) => {
  try {
    const orderId = req.query?.m_payment_id || req.query?.order_id || req.query?.id;
    const pfPaymentId = req.query?.pf_payment_id || null;
    const emailHint = req.query?.email_address || null;

    if (orderId) {
      await finalizeSuccessfulPayment({
        orderId,
        pfPaymentId,
        emailHint,
        source: "return_url",
      });
    } else {
      console.log("Success return called without order identifier");
    }
  } catch (error) {
    console.error("Success return processing error:", error);
  }

  res.send(renderSuccessPage());
};

