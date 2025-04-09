const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendIncidentEmail = async (
  parentEmail,
  childName,
  incidentType,
  description,
  parentName
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parentEmail,
    subject: `Incident Report for ${childName}`,
    html: `
      <h2>Incident Report</h2>
      <p>Dear ${parentName},</p>
      <p>We are writing to inform you about an incident involving your child:</p>
      <p><strong>Child:</strong> ${childName}</p>
      <p><strong>Type:</strong> ${incidentType}</p>
      <p><strong>Description:</strong> ${description}</p>
      <br>
      <p>If you have any concerns or questions, please contact the daycare center directly.</p>
      <p>This is an automated message from the Daycare Management System, please do not reply to this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendIncidentEmail,
};
