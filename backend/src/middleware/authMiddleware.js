const jwt = require('jsonwebtoken');
const prisma = require("../utils/prismaClient");

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'प्रवेश नाकारला. टोकन गहाळ आहे.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'वापरकर्ता सापडला नाही.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'तुमचे खाते निष्क्रिय केले गेले आहे.' });
    }

    req.userId = user.id; 
    req.userEmail = user.email;
    
    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);
    
    let message = 'अवैध टोकन.';
    if (error.name === 'TokenExpiredError') {
      message = 'तुमचे सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'सुरक्षा त्रुटी: अवैध टोकन सिग्नेचर.';
    }
      
    res.status(401).json({ error: message });
  }
};