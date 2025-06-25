// import nodemailer from "nodemailer";
// import axios from "axios";
// import decrypt from "../../Helper";

// // For TS: export handler
// export async function handler(event, context) {
//   try {
//     const response = await axios.post(
//       "https://zadmicrofin.brightoncloudtech.com/api/v1/adminRoutes/admin",
//       {
//         login: "admin",
//         password: "12345678",
//       }
//     );

//     const encryptionKey = process.env.ENCRYPTION_KEY;
//     if (!encryptionKey) {
//       throw new Error("ENCRYPTION_KEY is not set in environment variables.");
//     }

//     const data = decrypt(response.data[1], response.data[0], encryptionKey);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ success: true, data }),
//     };
//   } catch (error) {
//     const now = new Date().toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: false,
//     });

//     try {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.MAIL_USER,
//           pass: process.env.MAIL_PASS,
//         },
//       });

//       await transporter.sendMail({
//         from: process.env.MAIL_USER,
//         to: [
//           "vijay.loganathan@zadroit.com",
//           "gokul.m@zadroit.com",
//           "thirukumara.d@zadroit.com",
//         ],
//         subject: "🚨 API DOWN ALERT",
//         html: `
//     <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff; max-width: 600px;">
//       <h2 style="color: #d32f2f;">🚨 Server/API Down Alert</h2>
//       <p><strong>Time (IST):</strong> ${now}</p>
//       <p><strong>Issue:</strong> Failed to reach the target API endpoint.</p>
//       <p style="background-color: #fce4ec; padding: 10px; border-left: 4px solid #d32f2f;">
//         <strong>Error Message:</strong><br />
//         ${error.message}
//       </p>
//       <p style="margin-top: 20px;">Please investigate the issue immediately.</p>
//       <hr style="margin: 30px 0;" />
//       <p style="font-size: 12px; color: #888;">This is an automated alert from your monitoring script.</p>
//     </div>
//   `,
//       });
//     } catch (mailError) {
//       console.error("Failed to send email:", mailError.message);
//     }

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         success: false,
//         error: error.message,
//       }),
//     };
//   }
// }

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import axios from "axios";
import decrypt from "../../Helper"; // Adjust path as needed

// ✅ Log File Path
const logPath = path.resolve(__dirname, "../../log.json");

// ✅ Log Writer
function writeLog(status: "success" | "failed", errorMessage?: string) {
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

  const newLog = {
    date: now,
    status,
    ...(errorMessage ? { error: errorMessage } : {}),
  };

  let logs: any[] = [];

  // Read existing logs
  if (fs.existsSync(logPath)) {
    try {
      const content = fs.readFileSync(logPath, "utf-8");
      logs = JSON.parse(content);
    } catch {
      logs = [];
    }
  }

  // Append and write
  logs.push(newLog);
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
}

// ✅ Main API Check Function
export async function handler(event: any, context: any) {
  try {
    const response = await axios.post(
      "https://zadmicrofin.brightoncloudtech.com/api/v1/adminRoutes/admin",
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

    writeLog("success");

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error: any) {
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

    writeLog("failed", error.message);

    // Send alert mail
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
          "yourbackup@example.com",
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
    } catch (mailError: any) {
      console.error("❌ Failed to send alert email:", mailError.message);
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
