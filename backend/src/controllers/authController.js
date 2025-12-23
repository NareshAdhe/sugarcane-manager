const prisma = require('../utils/prismaClient.js');
const { sendOTPEmail } = require("../utils/sendOtp.js");
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { email, name } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'नाव आणि ईमेल आवश्यक आहे.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60000);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'हे खाते आधीच अस्तित्वात आहे. कृपया लॉगिन करा.' });

    await prisma.user.create({
      data: { email, name, otp, otpExpires: expires }
    });

    return await sendOTPEmail(name, email, otp, res);

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: 'साइनअप करताना त्रुटी आली.' });
  }
};

exports.login = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'ईमेल आवश्यक आहे.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60000);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ success: false, message: 'या ईमेलवर कोणतेही खाते नाही. कृपया साइनअप करा.' });
    }

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpires: expires },
    });

    return await sendOTPEmail(user.name, email, otp, res);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { otp, otpToken } = req.body;

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    if (decoded.purpose !== "otp_verification") throw new Error();

    const user = await prisma.user.findUnique({ where: { email: decoded.email } });

    if (!user || !user.otp || String(user.otp) !== String(otp)) {
      return res.status(401).json({ error: 'दिलेला ओटीपी चुकीचा आहे.' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(401).json({ error: 'ओटीपीची वेळ संपली आहे.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpires: null },
    });

    const authToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token: authToken,
      name: user.name,
      userId: user.id
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(401).json({ error: 'ओटीपी पडताळणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.' });
  }
};