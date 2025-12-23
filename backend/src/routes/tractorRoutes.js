const express = require('express');
const router = express.Router();
const tractorController = require('../controllers/tractorController');

router.post('/',tractorController.createTractor);
router.get('/', tractorController.getAllTractors);
router.delete('/:id', tractorController.deleteTractor);
router.put('/:id',tractorController.updateTractor);

module.exports = router;