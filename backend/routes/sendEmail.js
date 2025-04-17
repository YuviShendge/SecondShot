const express = require("express");
const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

module.exports = function (bucket) {
  const router = express.Router();

  router.post("/send-email", async (req, res) => {
    const {
      mentorEmail,
      message,
      selfEvaluation,
      rating,
      fileIds = [],
    } = req.body;

    try {
      // Create video links from fileIds
      const videoLinks = fileIds.map(
        (id) => `http://localhost:5000/video/${id}`
      ).join('\n');

      // Configure the email
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: mentorEmail,
        subject: "Interview Evaluation",
        text: `
Hello,

Here is my self-evaluation:

"${selfEvaluation}"

Rating: ${rating} Stars

Message:
${message}

Video Links:
${videoLinks}

Best regards,
Interview App
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sent with video links!" });
    } catch (err) {
      console.error("❌ Email error:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
