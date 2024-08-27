const {LeadController} = require('../../controllers');
const express = require('express');
const router = express.Router();


router.get('/', LeadController.getLead);
router.post('/', LeadController.createLead);
router.delete('/', LeadController.deleteLead);
module.exports = router;