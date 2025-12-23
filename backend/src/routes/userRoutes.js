const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

module.exports = router;