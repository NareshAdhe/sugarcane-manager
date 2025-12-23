const prisma = require('../utils/prismaClient.js');

exports.getSettings = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        name: true,
        email: true,
        defaultDieselRate: true,
        defaultVahatukRateShort: true,
        defaultVahatukRateLong: true,
        defaultTodniRate: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "सेटिंग्ज मिळवता आल्या नाहीत." });
  }
};

exports.updateSettings = async (req, res) => {
  const { dieselRate, vahatukRateShort, vahatukRateLong, todniRate } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        defaultDieselRate: parseFloat(dieselRate),
        defaultVahatukRateShort: parseFloat(vahatukRateShort),
        defaultVahatukRateLong: parseFloat(vahatukRateLong),
        defaultTodniRate: parseFloat(todniRate),
      },
    });

    res.status(200).json({
      message: "सेटिंग्ज यशस्वीरित्या अपडेट झाल्या!",
      settings: updatedUser
    });
  } catch (error) {
    console.error("Settings Update Error:", error);
    res.status(500).json({ error: "सेटिंग्ज जतन करताना तांत्रिक अडचण आली." });
  }
};