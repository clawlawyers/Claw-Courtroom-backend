
const express = require('express');
const router = express.Router();
const { CaseFinderController } = require('../../controllers');
const { checkClientAuth } = require('../../middlewares/auth-middleware');

router.get('/:id', checkClientAuth, CaseFinderController.getCase);

module.exports = router;