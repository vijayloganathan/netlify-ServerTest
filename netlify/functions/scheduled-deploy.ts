import fetch from "node-fetch";
import { schedule } from "@netlify/functions";
import nodemailer from "nodemailer";
import axios from "axios";
import decrypt from "../../Helper";

// Scheduled every 10 minutes
const handler = schedule("*/5 * * * *", async () => {
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
        to: [
          "vijay.loganathan@zadroit.com",
          "gokul.m@zadroit.com",
          "thirukumara.d@zadroit.com",
        ],
        subject: "🚨 API DOWN ALERT",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff; max-width: 600px;">
            <h2 style="color: #d32f2f;">🚨 Server/API Down Alert</h2>
            <p><strong>Time (IST):</strong> ${now}</p>
            <p><strong>Issue:</strong> Failed to reach the target API endpoint.</p>
            <p style="background-color: #fce4ec; padding: 10px; border-left: 4px solid #d32f2f;">
              <strong>Error Message:</strong><br />
              ${error.message}
            </p>
            <p style="margin-top: 20px;">Please investigate the issue immediately.</p>
            <hr style="margin: 30px 0;" />
            <p style="font-size: 12px; color: #888;">This is an automated alert from your monitoring script.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Failed to send email:", mailError.message);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
});

export { handler };
