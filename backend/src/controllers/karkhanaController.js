const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createKarkhana = async (req, res) => {
  try {
    const { 
      name, 
      todniRate,
      distanceThreshold,
      vahatukRateShort,
      vahatukRateLong, 
      todniCommRate, 
      vahatukCommRate, 
      dieselRate 
    } = req.body;

    const userId = req.userId; 

    const newKarkhana = await prisma.karkhana.create({
      data: {
        name,
        todniRate: parseFloat(todniRate),
        distanceThreshold: parseFloat(distanceThreshold), // ✅ Added to DB
        vahatukRateShort: parseFloat(vahatukRateShort),   // ✅ Added to DB
        vahatukRateLong: parseFloat(vahatukRateLong),     // ✅ Added to DB
        todniCommRate: parseFloat(todniCommRate),
        vahatukCommRate: parseFloat(vahatukCommRate),
        dieselRate: parseFloat(dieselRate),
        userId: userId
      },
    });

    res.status(201).json({
      success: true,
      message: "Karkhana created successfully",
      data: newKarkhana
    });
  } catch (error) {
    console.error("Error creating Karkhana:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllKarkhanas = async (req, res) => {
  try {
    const userId = req.userId;

    const karkhanas = await prisma.karkhana.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: karkhanas
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateKarkhana = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const numericFields = [
      'todniCommRate', 
      'vahatukCommRate', 
      'todniRate', 
      'dieselRate',
      'distanceThreshold',
      'vahatukRateShort', 
      'vahatukRateLong'   
    ];

    numericFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateData[field] = parseFloat(updateData[field]);
      }
    });

    const updatedKarkhana = await prisma.karkhana.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: "कारखान्याची माहिती अपडेट झाली!",
      data: updatedKarkhana
    });
  } catch (error) {
    console.error("Update Karkhana Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteKarkhana = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.karkhana.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: "Karkhana deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};