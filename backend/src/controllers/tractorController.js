const prisma = require('../utils/prismaClient');

const getAllTractors = async (req, res) => {
  try {
    const userId = req.userId;

    const tractors = await prisma.tractor.findMany({
      where: {
        userId: userId,
      },
      include: {
        driver: {
          where: { userId: userId }
        },
        mukadam: {
          where: { userId: userId }
        },
        trips: { 
          where: { userId: userId },
          orderBy: { date: "desc" } 
        },
        expenses: { 
          where: { userId: userId },
          orderBy: { date: "desc" } 
        }
      },
    });

    const formattedData = tractors.map((t) => {
      const lastTrip = t.trips.length > 0 ? t.trips[0] : null;
      const lastExpense = t.expenses.length > 0 ? t.expenses[0] : null;

      return {
        id: t.id,
        plateNumber: t.plateNumber,
        modelName: t.modelName,
        driver: t.driver, 
        mukadam: t.mukadam,
        trips: t.trips,
        expenses: t.expenses,
        driverName: t.driver ? t.driver.name : 'No Driver',
        mukadamName: t.mukadam ? t.mukadam.name : 'No Mukadam',
        lastTrip: lastTrip ? {
          id: lastTrip.id,
          weight: lastTrip.netWeight,
          date: lastTrip.date,
          profit: lastTrip.netTripProfit
        } : null,
        lastExpense: lastExpense ? {
          id: lastExpense.id,
          amount: lastExpense.amount,
          type: lastExpense.type,
          date: lastExpense.date
        } : null,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching tractors:', error);
    res.status(500).json({ error: 'Failed to fetch tractors' });
  }
};

const deleteTractor = async (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);
  const userId = req.userId;

  try {
    const existingTractor = await prisma.tractor.findFirst({
      where: {
        id: targetId,
        userId: userId
      }
    });

    if (!existingTractor) {
      return res.status(404).json({ error: 'ट्रॅक्टर सापडला नाही किंवा तुम्हाला तो हटवण्याचा अधिकार नाही' });
    }

    await prisma.$transaction([
      prisma.trip.deleteMany({ where: { tractorId: targetId } }),
      prisma.expense.deleteMany({ where: { tractorId: targetId } }),

      prisma.mukadam.deleteMany({ where: { tractorId: targetId, userId: userId } }),
      prisma.driver.deleteMany({ where: { tractorId: targetId, userId: userId } }),
      
      prisma.tractor.delete({ 
        where: { 
          id: targetId 
        } 
      })
    ]);

    res.json({ message: 'यशस्वीरित्या हटवले' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'डेटा हटवता आला नाही' });
  }
};

const createTractor = async (req, res) => {
  const { plateNumber, modelName, driver, mukadam } = req.body;
  const userId = req.userId;

  try {
    const newTractor = await prisma.tractor.create({
      data: {
        plateNumber,
        modelName,
        user: {
          connect: { id: userId }
        },
        driver: {
          create: {
            name: driver.name,
            phone: driver.phone,
            user: { connect: { id: userId } }
          },
        },
        mukadam: {
          create: {
            name: mukadam.name,
            phone: mukadam.phone,
            user: { connect: { id: userId } }
          },
        },
      },
      include: {
        driver: true,
        mukadam: true,
      },
    });

    res.status(201).json(newTractor);
  } catch (error) {
    console.error("Backend Create Error:", error);
    res.status(500).json({ error: "नवीन ट्रॅक्टर तयार करताना त्रुटी आली" });
  }
};

const updateTractor = async (req, res) => {
  const { id } = req.params;
  const { plateNumber, modelName, driver, mukadam } = req.body;
  const userId = req.userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify Ownership first
      const existingTractor = await tx.tractor.findFirst({
        where: { 
          id: Number(id),
          userId: userId // Ensure User A cannot edit User B's tractor
        }
      });

      if (!existingTractor) {
        throw new Error("Unauthorized or Tractor not found");
      }

      // 2. Handle Driver Logic
      if (driver.isReplacement) {
        // Disconnect old drivers for THIS tractor
        await tx.driver.updateMany({
          where: { tractorId: Number(id) },
          data: { tractorId: null },
        });
        // Create new driver linked to User
        await tx.driver.create({
          data: {
            name: driver.name,
            phone: driver.phone,
            tractorId: Number(id),
            userId: userId, // Link to owner
          },
        });
      } else {
        // Update existing driver linked to this tractor
        await tx.driver.updateMany({
          where: { tractorId: Number(id) },
          data: { name: driver.name, phone: driver.phone },
        });
      }

      // 3. Handle Mukadam Logic
      if (mukadam.isReplacement) {
        await tx.mukadam.updateMany({
          where: { tractorId: Number(id) },
          data: { tractorId: null },
        });
        await tx.mukadam.create({
          data: {
            name: mukadam.name,
            phone: mukadam.phone,
            tractorId: Number(id),
            userId: userId, // Link to owner
          },
        });
      } else {
        await tx.mukadam.updateMany({
          where: { tractorId: Number(id) },
          data: { name: mukadam.name, phone: mukadam.phone },
        });
      }

      // 4. Update Tractor Details
      return await tx.tractor.update({
        where: { id: Number(id) },
        data: {
          plateNumber,
          modelName,
        },
        include: { driver: true, mukadam: true },
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Update Transaction Error:", error);
    if (error.message === "Unauthorized or Tractor not found") {
      return res.status(403).json({ error: "तुम्हाला ही माहिती बदलण्याचा अधिकार नाही" });
    }
    res.status(500).json({ error: "माहिती बदलताना तांत्रिक अडचण आली" });
  }
};

module.exports = { getAllTractors, deleteTractor, updateTractor, createTractor };