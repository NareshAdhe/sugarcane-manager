const express = require('express');
const router = express.Router();
const karkhanaController = require('../controllers/karkhanaController');

router.post('/', karkhanaController.createKarkhana);
router.get('/', karkhanaController.getAllKarkhanas);
router.put('/:id', karkhanaController.updateKarkhana);
router.delete('/:id', karkhanaController.deleteKarkhana);

module.exports = router;