import nodemailer from "nodemailer";
import axios from "axios";
import decrypt from "../../Helper";

// For TS: export handler
export async function handler(event, context) {
  try {
    const response = await axios.post(
      "https://zadmicrofin.brightoncloudtech.com/api/v1/adminRoutes/adminLogin",
      {
        login: "admin",
        password: "12345678",
      }
    );

    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("ENCRYPTION_KEY is not set in environment variables.");
    }

    const data = decrypt(response.data[1], response.data[0], encryptionKey);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: "vijayloganathan2002@gmail.com",
        subject: "🚨 API DOWN ALERT",
        text: `API check failed at ${now} IST\n\nError: ${error.message}`,
      });
    } catch (mailError) {
      console.error("Failed to send email:", mailError.message);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
}
