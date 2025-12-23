const prisma = require('../utils/prismaClient.js');

exports.getSettings = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        name: true,
        email: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "प्रोफाइल माहिती मिळवता आली नाही." });
  }
};

exports.updateSettings = async (req, res) => {
  const { name, email } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name: name,
        email: email,
      },
    });

    res.status(200).json({
      message: "प्रोफाइल यशस्वीरित्या अपडेट झाली!",
      user: {
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "माहिती जतन करताना तांत्रिक अडचण आली." });
  }
};