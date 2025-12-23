const apiInstance = require("../utils/mailer.js");
const otpContent = require("./otpFormat.js");
const jwt = require("jsonwebtoken");
const Brevo = require('@getbrevo/brevo');

const sendOTPEmail = async (name, to, otp, res) => {
  try {
    const htmlContent = otpContent(name, otp);

    let sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "तुमचा पडताळणी कोड (Your Verification Code)";
    sendSmtpEmail.htmlContent = htmlContent;
    
    sendSmtpEmail.sender = { "name": "Sugarcane Manager", "email": process.env.SENDER_MAIL };
    sendSmtpEmail.to = [{ "email": to }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

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
    console.error("Error in Brevo API:", error.response?.body || error.message);
    
    return res.status(500).json({
      success: false,
      message: "ईमेल पाठवण्यात अडचण आली. कृपया नंतर प्रयत्न करा.",
    });
  }
};

module.exports = { sendOTPEmail };