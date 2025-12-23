const transporter = require("../utils/mailer.js");
const otpContent = require("./otpFormat.js");
const jwt = require("jsonwebtoken");

const sendOTPEmail = async (name, to, otp, res) => {
  try {
    const htmlContent = otpContent(name, otp);

    const mailOptions = {
      from: process.env.SENDER_MAIL,
      to,
      subject: `${otp} is your verification code`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    const token = jwt.sign(
      { email: to, purpose: "otp_verification" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "5m" }
    );

    return res.json({
      success: true,
      message: "ओटीपी तुमच्या ईमेलवर पाठवला आहे",
      otpToken: token,
    });

  } catch (error) {
    console.error("Error in sendOTPEmail utility:", error);
    
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        message: "Email configuration error. Please contact support.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "सर्व्हरमध्ये तांत्रिक अडचण आली आहे.",
    });
  }
};

module.exports = { sendOTPEmail };