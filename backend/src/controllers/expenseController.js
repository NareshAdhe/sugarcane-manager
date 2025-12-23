const prisma = require('../utils/prismaClient');

const addExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, type, date, description } = req.body;
  const userId = req.userId;

  try {
    if (!amount || !type) {
      return res.status(400).json({ error: "रक्कम आणि प्रकार आवश्यक आहेत." });
    }

    const tractor = await prisma.tractor.findFirst({
      where: { 
        id: Number(id),
        userId: userId
      },
      include: { driver: true, mukadam: true }
    });

    if (!tractor) {
      return res.status(404).json({ error: "ट्रॅक्टर सापडला नाही किंवा तुम्हाला परवानगी नाही." });
    }

    const expenseType = type.toUpperCase();

    const data = {
      amount: parseFloat(amount),
      type: expenseType,
      description,
      date: date ? new Date(date) : new Date(),
      tractor: { connect: { id: Number(id) } },
      user: { connect: { id: userId } },
      ...(tractor.driver && { driver: { connect: { id: tractor.driver.id } } }),
      ...(tractor.mukadam && { mukadam: { connect: { id: tractor.mukadam.id } } })
    };

    const newExpense = await prisma.expense.create({ 
      data,
      include: {
        driver: true,
        mukadam: true,
        tractor: true
      }
    });

    res.status(201).json(newExpense);

  } catch (error) {
    console.error("CRITICAL EXPENSE ERROR:", error);
    res.status(500).json({ error: "खर्च जतन करताना तांत्रिक अडचण आली." });
  }
};

const removeExpense = async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.userId;

  try {
    const result = await prisma.expense.deleteMany({
      where: { 
        id: Number(expenseId),
        userId: userId
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ 
        error: "खर्च सापडला नाही किंवा तुम्हाला तो हटवण्याचा अधिकार नाही" 
      });
    }

    res.json({ message: "खर्च यशस्वीरित्या हटवला" });
  } catch (error) {
    console.error("Remove Expense Error:", error);
    res.status(500).json({ error: "खर्च हटवता आला नाही" });
  }
};

module.exports = { addExpense, removeExpense };