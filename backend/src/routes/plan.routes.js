const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const {
  getPlanes, getPlanById,
  createPlan, updatePlan, deletePlan
} = require('../controllers/plan.controller');

router.get('/',       verifyToken, getPlanes);
router.get('/:id',    verifyToken, getPlanById);
router.post('/',      verifyToken, createPlan);
router.put('/:id',    verifyToken, updatePlan);
router.delete('/:id', verifyToken, deletePlan);

module.exports = router;
