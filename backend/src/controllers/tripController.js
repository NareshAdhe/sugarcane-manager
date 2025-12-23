const prisma = require('../utils/prismaClient');

const createTrip = async (req, res) => {
  const {
    tractorId,
    slipNumber,
    netWeight,
    distance,
    dieselLiters,
    cuttingIncome,
    transportIncome,
    commission,
    dieselCost,
    netTripProfit,
  } = req.body;
  
  const userId = req.userId;

  try {
    const tractor = await prisma.tractor.findFirst({
      where: {
        id: tractorId,
        userId: userId
      }
    });

    if (!tractor) {
      return res.status(404).json({ error: 'ट्रॅक्टर सापडला नाही किंवा तुम्हाला परवानगी नाही.' });
    }

    const newTrip = await prisma.trip.create({
      data: {
        slipNumber,
        netWeight: parseFloat(netWeight),
        distance: parseFloat(distance),
        dieselLiters: parseFloat(dieselLiters),
        cuttingIncome: parseFloat(cuttingIncome),
        transportIncome: parseFloat(transportIncome),
        commission: parseFloat(commission),
        dieselCost: parseFloat(dieselCost),
        netTripProfit: parseFloat(netTripProfit),
        date: new Date(),
        tractor: { connect: { id: tractorId } },
        user: { connect: { id: userId } }
      },
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ error: 'ट्रिप जतन करताना तांत्रिक अडचण आली.' });
  }
};

const updateTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  const { 
    tractorId,
    slipNumber,
    netWeight, 
    distance, 
    dieselLiters, 
    cuttingIncome, 
    transportIncome, 
    commission, 
    dieselCost,
    netTripProfit 
  } = req.body;

  try {

    const result = await prisma.trip.updateMany({
      where: { 
        id: Number(id),
        userId: userId
      },
      data: {
        slipNumber: String(slipNumber),
        netWeight: Number(netWeight),
        distance: Number(distance),
        dieselLiters: Number(dieselLiters),
        cuttingIncome: Number(cuttingIncome),
        transportIncome: Number(transportIncome),
        commission: Number(commission),
        dieselCost: Number(dieselCost),
        netTripProfit: Number(netTripProfit),
        tractorId: Number(tractorId)
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ 
        error: "ट्रिप सापडली नाही किंवा तुम्हाला बदल करण्याचा अधिकार नाही." 
      });
    }

    const updatedTrip = await prisma.trip.findUnique({
      where: { id: Number(id) }
    });

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Prisma Update Error:", error);
    res.status(500).json({ error: "माहिती बदलताना तांत्रिक अडचण आली." });
  }
};

const deleteTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const result = await prisma.trip.deleteMany({
      where: {
        id: Number(id),
        userId: userId
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ 
        error: "ट्रिप सापडली नाही किंवा तुम्हाला ती हटवण्याचा अधिकार नाही." 
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "ट्रिप हटवताना तांत्रिक अडचण आली." });
  }
};

module.exports = {
  createTrip,updateTrip,deleteTrip
};