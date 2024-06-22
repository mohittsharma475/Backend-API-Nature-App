const nodemailer = require("nodemailer");

/*
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT, 
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  variables
  }
 
});
*/

const sendPasswordResetEmail = async ({ to, resetLink }) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.BUSINESS_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.BUSINESS_EMAIL,
    to: to,
    subject: "Your password reset token (valid for 10 min)",
    text: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetLink}.\nIf you didn't forget your password, please ignore this email.`,
    html: `<p>You requested a password reset. Click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = sendPasswordResetEmail;
