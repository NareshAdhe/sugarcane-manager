const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/tractor/:id', expenseController.addExpense);
router.delete('/:expenseId', expenseController.removeExpense);

module.exports = router;